import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authErrorMessage } from '../src/domain/auth';

test('cancelar Google no muestra un fallo y los errores de red permiten reintentar', () => {
  assert.equal(authErrorMessage({ code: 'SIGN_IN_CANCELLED' }), null);
  assert.match(authErrorMessage({ code: 'auth/network-request-failed' })!, /conexión/);
  assert.match(authErrorMessage({ code: 'auth/too-many-requests' })!, /Espera/);
});

test('los errores desconocidos no exponen tokens ni detalles del proveedor', () => {
  assert.equal(authErrorMessage(new Error('token privado')), authErrorMessage(undefined));
  assert.doesNotMatch(authErrorMessage(new Error('token privado'))!, /token privado/);
});
