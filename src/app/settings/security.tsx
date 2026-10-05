import { AppText as Text } from '../../ui/AppText';
import { Notice, Section, usePalette } from '../../ui/common';
import { SettingsPage } from '../../ui/settings';
import { useAuth } from '../../state/AuthProvider';
import { router } from 'expo-router';
import { Action } from '../../ui/common';
import { useState } from 'react';
import { Confirmation } from '../../ui/Confirmation';

export default function SecurityScreen() {
  const c = usePalette();
  const auth = useAuth();
  const { account, loading } = auth;
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <SettingsPage title="Seguridad y privacidad" subtitle="Información sobre tus datos en esta versión.">
    <Section title="Tu cuenta"><Notice>{loading ? 'Comprobando tu sesión…' : account ? `Sesión de Google: ${account.email || account.displayName || 'cuenta conectada'}.` : 'No has iniciado sesión. Puedes usar la app sin cuenta.'}</Notice><Action label="Gestionar sesión en Perfil" onPress={() => router.push('/settings/profile')} secondary /></Section>
    <Section title="Datos en tu dispositivo"><Text style={{ fontSize: 15, lineHeight: 24, color: c.text }}>La cocina del invitado y la de cada cuenta se guardan por separado. La cuenta ve solo sus ingredientes, favoritas y compras. Los ajustes de apariencia y el apodo son del dispositivo. Google y Firebase reciben los datos de identidad al iniciar sesión; la cocina solo se sube si activas el respaldo.</Text></Section>
    <Section title="Protege tu cocina"><Text style={{ fontSize: 15, lineHeight: 24, color: c.text }}>Usa el bloqueo de pantalla del celular. Borrar los datos o desinstalar puede eliminar la cocina local. Una cuenta de Google por sí sola no es un respaldo: revisa el estado en Respaldo y sincronización. Esta separación de pantallas no cifra la base ante acceso físico al dispositivo.</Text></Section>
    <Section title="Inicio de sesión con Google"><Text style={{ fontSize: 15, lineHeight: 24, color: c.text }}>Google gestiona tu contraseña; esta app no te la pide ni la guarda. Puedes cerrar la sesión desde Perfil.</Text></Section>
    {account ? <Section title="Eliminar mi cuenta">
      <Notice>Elimina tu cuenta de ¿Qué cocino? y su cocina local y remota. No elimina tu cuenta de Google, la cocina del invitado ni otras cuentas. Es irreversible. Si Firestore está activo, conserva solo una marca técnica con el identificador eliminado para bloquear sesiones antiguas, sin nombre, correo ni cocina.</Notice>
      <Action label={auth.deleting ? 'Verificando y eliminando…' : 'Eliminar mi cuenta'} disabled={auth.busy} onPress={() => setConfirmDelete(true)} secondary />
    </Section> : null}
    {auth.error ? <Notice error>{auth.error}</Notice> : null}
    {auth.deletionPending ? <Section title="Eliminación pendiente"><Notice>Una eliminación no terminó de confirmarse o falta limpiar el dispositivo. Si tu cuenta sigue activa, vuelve a iniciar sesión y repite la eliminación. No borraremos datos por deducir que cerraste sesión.</Notice><Action label="Reintentar limpieza confirmada" onPress={auth.retryCleanup} disabled={auth.busy} secondary /></Section> : null}
    <Confirmation visible={confirmDelete} title="¿Eliminar tu cuenta?" message="Se eliminarán tu identidad de ¿Qué cocino? y la cocina de esta cuenta, incluida su copia en Firestore si está configurado. Invitado y otras cuentas se conservarán. Después deberás seleccionar esta misma cuenta en Google para confirmar tu identidad. Tu cuenta de Google no se elimina." confirmLabel="Verificar con Google y eliminar" onCancel={() => setConfirmDelete(false)} onConfirm={() => { setConfirmDelete(false); auth.deleteAccount(); }} />
  </SettingsPage>;
}
