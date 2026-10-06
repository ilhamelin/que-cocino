import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type { AuthAdapter } from '../domain/auth';

const reason = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ? 'Para entrar con Google, instala la versión de desarrollo de ¿Qué cocino?. Puedes seguir usando Expo Go sin cuenta.'
  : Platform.OS !== 'android'
    ? 'El acceso con Google en iPhone está pendiente de configurar. Puedes seguir usando la app sin cuenta.'
    : null;

function nativeAuth() {
  // Do not evaluate native libraries in Expo Go or unconfigured iOS builds.
  const firebase = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
  const google = require('react-native-nitro-google-signin') as typeof import('react-native-nitro-google-signin');
  google.GoogleOneTapSignIn.configure({ webClientId: 'autoDetect' });
  return { firebase, google, auth: firebase.getAuth() };
}

export const authAdapter: AuthAdapter = {
  unavailableReason: reason,
  subscribe(next, error) {
    if (reason) { next(null); return () => {}; }
    try {
      const { firebase, auth } = nativeAuth();
      return firebase.onAuthStateChanged(auth, user => next(user ? {
        uid: user.uid, displayName: user.displayName, email: user.email,
      } : null), error);
    } catch (cause) { error(cause); return () => {}; }
  },
  async signIn() {
    if (reason) throw new Error(reason);
    const { firebase, google, auth } = nativeAuth();
    await google.GoogleOneTapSignIn.checkPlayServices();
    // A deliberate button press must allow choosing another account.
    // signIn() filters to previously authorized accounts on Android.
    const response = await google.GoogleOneTapSignIn.presentExplicitSignIn();
    if (response.type === 'cancelled') return;
    if (!google.isSuccessResponse(response)) throw new Error('Google no encontró una cuenta disponible.');
    const token = response.data.idToken;
    if (!token) throw new Error('Google no devolvió un token de identidad.');
    await firebase.signInWithCredential(auth, firebase.GoogleAuthProvider.credential(token));
  },
  async signOut() {
    if (reason) return;
    const { firebase, google, auth } = nativeAuth();
    // Firebase is the source of truth. Google cleanup must never restore a Firebase session.
    await firebase.signOut(auth);
    await google.GoogleOneTapSignIn.signOut();
  },
  async getIdToken(uid) {
    if (reason) throw new Error(reason);
    const { firebase, auth } = nativeAuth();
    const user = auth.currentUser;
    if (!user || user.uid !== uid) throw Object.assign(new Error('Sesión cambiada.'), { code: 'auth/user-mismatch' });
    await firebase.reload(user);
    const token = await firebase.getIdToken(user);
    if (auth.currentUser?.uid !== uid) throw Object.assign(new Error('Sesión cambiada.'), { code: 'auth/user-mismatch' });
    return token;
  },
  async deleteAccount(beforeIdentityDelete) {
    if (reason) throw new Error(reason);
    const { firebase, google, auth } = nativeAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No hay una cuenta iniciada.');
    const uid = user.uid;
    await google.GoogleOneTapSignIn.checkPlayServices();
    const response = await google.GoogleOneTapSignIn.presentExplicitSignIn();
    if (response.type === 'cancelled') return false;
    if (!google.isSuccessResponse(response)) throw new Error('No se pudo verificar tu cuenta.');
    // Reauthenticate, never signInWithCredential: a different selection must not switch accounts.
    await firebase.reauthenticateWithCredential(user, firebase.GoogleAuthProvider.credential(response.data.idToken));
    if (auth.currentUser?.uid !== uid) throw Object.assign(new Error('Sesión cambiada.'), { code: 'auth/user-mismatch' });
    await beforeIdentityDelete(uid);
    await firebase.deleteUser(user);
    // Failure clearing Google's picker cache must not imply that Firebase deletion failed.
    await google.GoogleOneTapSignIn.signOut().catch(() => {});
    return true;
  },
};
