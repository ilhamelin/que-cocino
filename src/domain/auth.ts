export type Account = { uid: string; displayName: string | null; email: string | null };
export type AuthAdapter = {
  unavailableReason: string | null;
  subscribe: (next: (account: Account | null) => void, error: (error: unknown) => void) => () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: (uid: string) => Promise<string>;
  deleteAccount: (beforeIdentityDelete: (uid: string) => Promise<void>) => Promise<boolean>;
};

export function authErrorMessage(error: unknown): string | null {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (['SIGN_IN_CANCELLED', 'ERR_CANCELED', 'auth/user-cancelled'].includes(code)) return null;
  if (code === 'auth/network-request-failed') return 'No pudimos conectar. Comprueba tu conexión y vuelve a intentarlo.';
  if (code === 'auth/too-many-requests') return 'Hay demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  if (code === 'auth/user-disabled') return 'Esta cuenta está deshabilitada. Prueba con otra cuenta de Google.';
  if (code === 'auth/user-mismatch') return 'Selecciona la misma cuenta de Google que deseas eliminar.';
  if (code === 'auth/requires-recent-login') return 'Vuelve a verificar tu cuenta con Google antes de eliminarla.';
  if (code === 'cloud/delete-failed') return 'No se pudo borrar la copia en la nube. Tu cuenta se conserva; revisa la conexión y vuelve a intentarlo.';
  if (code === 'local/delete-failed') return 'La cuenta fue eliminada, pero falta limpiar su copia en este dispositivo. Reintenta la limpieza desde Seguridad.';
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE') return 'Actualiza los servicios de Google Play y vuelve a intentarlo.';
  if (['DEVELOPER_ERROR', 'auth/invalid-credential', 'auth/operation-not-allowed'].includes(code)) return 'No se pudo validar el acceso con Google. Revisa la configuración de Firebase y el certificado de esta compilación.';
  return 'No se pudo completar la operación con tu cuenta. Vuelve a intentarlo.';
}
