import type { AuthAdapter } from '../domain/auth';

// The browser remains a local development preview; no simulated sessions.
export const authAdapter: AuthAdapter = {
  unavailableReason: 'El acceso con Google se prueba en la app instalada en Android. Puedes seguir usando esta vista sin cuenta.',
  subscribe(next) { next(null); return () => {}; },
  async signIn() { throw new Error('Acceso no disponible en esta plataforma.'); },
  async signOut() {},
  async getIdToken() { throw new Error('No hay una sesión disponible.'); },
  async deleteAccount() { return false; },
};
