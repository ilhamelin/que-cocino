import { useState } from 'react';
import { TextInput } from 'react-native';
import { readingMultiplier } from '../../domain/preferences';
import { usePreferences } from '../../state/PreferencesProvider';
import { useAuth } from '../../state/AuthProvider';
import { useKitchen } from '../../state/KitchenProvider';
import { Confirmation } from '../../ui/Confirmation';
import { AppText as Text } from '../../ui/AppText';
import { Action, Notice, Section, usePalette } from '../../ui/common';
import { SettingsPage } from '../../ui/settings';

export default function ProfileScreen() {
  const { preferences, update, saveError, saving } = usePreferences();
  const [name, setName] = useState(preferences.displayName);
  const c = usePalette();
  const auth = useAuth();
  const kitchen = useKitchen();
  const [confirmImport, setConfirmImport] = useState(false);
  const changed = name.trim() !== preferences.displayName;
  return <SettingsPage title="Mi perfil" subtitle="Un nombre para sentir esta cocina como tuya.">
    <Section title="Cuenta de Google">
      {auth.loading ? <Text accessibilityLiveRegion="polite" style={{ color: c.muted }}>Comprobando tu sesión…</Text> : auth.account ? <>
        <Text style={{ color: c.text, fontSize: 18, fontWeight: '600' }}>{auth.account.displayName || 'Cuenta de Google'}</Text>
        <Text style={{ color: c.muted, fontSize: 15 }}>{auth.account.email}</Text>
        <Action label={auth.busy ? 'Cerrando sesión…' : 'Cerrar sesión'} disabled={auth.busy} onPress={auth.signOut} secondary />
      </> : auth.unavailableReason ? <Notice>{auth.unavailableReason}</Notice> : <>
        <Text style={{ color: c.muted, fontSize: 15 }}>Puedes entrar con Google o continuar cocinando sin cuenta.</Text>
        <Action label={auth.busy ? 'Conectando…' : 'Continuar con Google'} icon="logo-google" disabled={auth.busy} onPress={auth.signIn} />
      </>}
      {auth.error ? <><Notice error>{auth.error}</Notice><Action label="Reintentar sesión" onPress={auth.retrySession} disabled={auth.busy} secondary /></> : null}
      <Notice>{auth.account ? 'Estás usando la cocina de tu cuenta. Al salir volverás a la cocina del invitado. Cada cuenta tiene sus propios ingredientes, favoritas y compras.' : 'Estás usando la cocina del invitado, guardada en este dispositivo. Iniciar sesión abrirá una cocina separada.'}</Notice>
    </Section>
    {auth.account && kitchen.guestAvailable ? <Section title="Tu cocina de invitado">
      <Text style={{ color: c.muted, fontSize: 15 }}>Los datos anteriores están conservados. Puedes copiarlos a esta cuenta sin borrar el original ni reemplazar lo que ya tienes.</Text>
      {kitchen.importDecision === 'copied' ? <Notice>Ya copiaste la cocina del invitado. Puedes volver a copiarla si has añadido nuevos datos allí.</Notice> : null}
      <Action label="Copiar cocina de invitado" disabled={auth.busy || kitchen.syncing} onPress={() => setConfirmImport(true)} />
      {kitchen.importDecision === 'pending' ? <Action label="Continuar sin copiar" onPress={kitchen.skipImport} secondary /> : null}
    </Section> : null}
    <Section title="¿Cómo te llamamos?">
      <TextInput accessibilityLabel="Nombre del perfil local" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words" returnKeyType="done" placeholder="Tu nombre o apodo" placeholderTextColor={c.muted} style={{ minHeight: 52, padding: 14, borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, color: c.text, fontSize: 16 * readingMultiplier(preferences.textSize) }} />
      <Text style={{ color: c.muted, fontSize: 13 }}>Hasta 60 caracteres. Puedes dejarlo vacío.</Text>
      <Text style={{ color: c.muted, fontSize: 13 }}>Este apodo y los ajustes de apariencia son del dispositivo; no se sincronizan entre cuentas.</Text>
      <Action label="Guardar nombre" disabled={!changed} onPress={() => update({ displayName: name.trim() })} />
      {!changed ? <Text accessibilityLiveRegion="polite" style={{ color: saveError ? c.danger : c.muted, fontSize: 13 }}>{saving ? 'Guardando…' : saveError ? 'No se pudo guardar. Usa Reintentar ajustes.' : 'Nombre guardado en este dispositivo.'}</Text> : null}
    </Section>
    <Confirmation visible={confirmImport} title="¿Copiar tu cocina de invitado?" message="Añadiremos sus ingredientes, favoritas y compras a la cuenta actual sin duplicados. La cocina del invitado seguirá intacta. Si activaste el respaldo, la copia se enviará a tu cuenta en Firestore." confirmLabel="Sí, copiar a mi cuenta" onCancel={() => setConfirmImport(false)} onConfirm={() => { setConfirmImport(false); kitchen.importGuest(); }} />
  </SettingsPage>;
}
