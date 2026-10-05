import { useState } from 'react';
import { useAuth } from '../../state/AuthProvider';
import { useKitchen } from '../../state/KitchenProvider';
import { firestoreReady } from '../../config/firebase';
import { AppText as Text } from '../../ui/AppText';
import { Action, Notice, Section, usePalette } from '../../ui/common';
import { Confirmation } from '../../ui/Confirmation';
import { SettingsPage } from '../../ui/settings';
import { router } from 'expo-router';
import { ingredients, recipes } from '../../data/catalog';
import type { KitchenState } from '../../domain/kitchen';

export default function BackupScreen() {
  const auth = useAuth();
  const kitchen = useKitchen();
  const c = usePalette();
  const [confirmation, setConfirmation] = useState<'enable' | 'local' | 'remote' | null>(null);
  const remote = kitchen.conflict?.remote?.kitchen;
  const summary = (pantry = 0, favorites = 0, shopping = 0) => `${pantry} ingredientes, ${favorites} favoritas y ${shopping} compras`;
  const describe = (state: KitchenState | undefined) => {
    const names = (ids: readonly string[]) => ids.map(id => ingredients.find(item => item.id === id)?.name ?? id).join(', ') || 'Vacía';
    return `Despensa: ${names(state?.pantry ?? [])}. Favoritas: ${(state?.favorites ?? []).map(id => recipes.find(item => item.id === id)?.name ?? id).join(', ') || 'Ninguna'}. Compras: ${names(state?.shopping ?? [])}. Marcadas: ${names(state?.checked ?? [])}.`;
  };
  function confirm() {
    const choice = confirmation; setConfirmation(null);
    if (choice === 'enable') kitchen.enableSync();
    else if (choice) kitchen.resolveConflict(choice);
  }
  return <SettingsPage title="Respaldo y sincronización" subtitle="Tu cocina local, con una copia opcional en tu cuenta.">
    {!auth.account ? <><Notice>La cocina del invitado se guarda solo en este dispositivo. Inicia sesión y copia sus datos a tu cuenta si deseas respaldarlos.</Notice><Action label="Ir a Perfil" onPress={() => router.push('/settings/profile')} /></> : <>
      <Section title="Estado de tu copia">
        {!firestoreReady ? <Notice>El código del respaldo está preparado. Falta crear Cloud Firestore y publicar sus reglas en Firebase antes de activarlo.</Notice> : null}
        <Text accessibilityLiveRegion="polite" style={{ color: c.text, fontSize: 16 }}>{kitchen.syncing ? 'Sincronizando…' : kitchen.syncEnabled ? kitchen.pendingSync ? 'Hay cambios locales pendientes.' : 'Respaldo activado.' : 'Respaldo desactivado; guardado local.'}</Text>
        {kitchen.lastSyncedAt ? <Text style={{ color: c.muted }}>Última sincronización: {new Date(kitchen.lastSyncedAt).toLocaleString('es-CL')}</Text> : null}
        {kitchen.syncEnabled ? <><Action label="Sincronizar ahora" disabled={kitchen.syncing || auth.busy || !firestoreReady} onPress={kitchen.synchronize} /><Action label="Pausar sincronización" disabled={kitchen.syncing || auth.busy} onPress={kitchen.disableSync} secondary /></> : <Action label="Activar respaldo en Firestore" disabled={!firestoreReady || auth.busy} onPress={() => setConfirmation('enable')} />}
        {kitchen.syncError ? <Notice error>{kitchen.syncError}</Notice> : null}
      </Section>
      {kitchen.conflict ? <Section title="Hay dos versiones de tu cocina">
        <Notice>Ambos dispositivos cambiaron datos. Elige qué copia completa conservar. No combinaremos listas automáticamente.</Notice>
        <Text style={{ color: c.text }}>Este dispositivo: {summary(kitchen.state.pantry.length, kitchen.state.favorites.length, kitchen.state.shopping.length)}</Text>
        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 22 }}>{describe(kitchen.state)}</Text>
        <Text style={{ color: c.text }}>Nube: {summary(remote?.pantry.length, remote?.favorites.length, remote?.shopping.length)}</Text>
        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 22 }}>{describe(remote)}</Text>
        <Action label="Conservar la de este dispositivo" disabled={kitchen.syncing || auth.busy} onPress={() => setConfirmation('local')} />
        <Action label="Conservar la de la nube" disabled={kitchen.syncing || auth.busy} onPress={() => setConfirmation('remote')} secondary />
      </Section> : null}
      <Notice>El respaldo incluye despensa, favoritas, compras y casillas marcadas. No incluye el apodo ni los ajustes de apariencia. Puedes trabajar sin conexión: los cambios quedan pendientes en SQLite. Sincronizamos al volver a la app, después de cambios o al pulsar el botón; no es una actualización en tiempo real.</Notice>
      <Notice>Pausar conserva la copia existente. Eliminar tu cuenta desde Seguridad elimina su cocina remota y local.</Notice>
    </>}
    <Confirmation visible={confirmation !== null} title={confirmation === 'enable' ? '¿Activar respaldo?' : '¿Conservar esta versión?'} message={confirmation === 'enable' ? 'La cocina de esta cuenta se enviará a Firestore para recuperarla en otro dispositivo. Si ya hay otra copia y hay diferencias, te pediremos elegir. Los datos del invitado no se envían.' : confirmation === 'local' ? 'La cocina de este dispositivo reemplazará la copia de la nube. Los datos que estén solo en la nube se perderán.' : 'La copia de la nube reemplazará la cocina de este dispositivo. Los cambios que existan solo aquí se perderán.'} confirmLabel={confirmation === 'enable' ? 'Sí, activar respaldo' : 'Sí, conservar esta versión'} onConfirm={confirm} onCancel={() => setConfirmation(null)} />
  </SettingsPage>;
}
