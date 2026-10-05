# Activar respaldo de cocina en Firebase

La persona creó la base `(default)` y confirmó la publicación de las reglas con una captura el 5 de octubre de 2026. Se habilitó `firestoreReady` en el código. Cada cuenta debe activar su respaldo desde la app; todavía falta confirmar la primera lectura/escritura real y las pruebas de acceso entre usuarios. El agente no creó la base ni publicó las reglas.

## Consola

1. Abre el proyecto `que-cocino-6377a` en Firebase.
2. En Bases de datos y almacenamiento, entra a Cloud Firestore. Si aparece Crear base de datos, aún no existe. Si ya ves Datos y Reglas, revisa la base existente antes de crear otra.
3. Para una base nueva, elige edición Standard e identificador `(default)`. Selecciona `southamerica-west1` (Santiago) si está disponible y el uso previsto es principalmente Chile. La ubicación no puede cambiarse después sin migrar a otra base; confirma la región antes de crearla. Consulta las [ubicaciones oficiales](https://firebase.google.com/docs/firestore/locations).
4. Usa modo de producción, para empezar con acceso cerrado. Mantén el plan Spark; esta base inicial no requiere habilitar Cloud Functions ni facturación. Consulta las [cuotas](https://firebase.google.com/docs/firestore/quotas).
5. En Reglas, pega el contenido completo de `firestore.rules` y pulsa Publicar. No uses reglas de acceso público. Estas reglas cubren solo la cocina y la marca de eliminación; cualquier otro documento queda denegado.
6. Verifica en el simulador de reglas de la consola que una solicitud sin autenticación y un UID distinto al de la ruta son rechazados. Prueba el documento `users/<tu UID>/kitchens/current` con el UID obtenido de Authentication. Comprueba que el propietario puede escribir el formato válido y que una cuenta marcada `deleted: true` no puede recuperar ni modificar su cocina.
7. Tras confirmar base y reglas, cambia `firestoreReady` a `true` en `src/config/firebase.ts`. Es TypeScript: el APK instalado sirve y basta recargar Metro. No incorpores claves de cuentas de servicio.

## En el teléfono

1. Ajustes → Respaldo y sincronización → Activar respaldo en Firestore. Confirma el envío de la cocina de tu cuenta.
2. Cambia un ingrediente y revisa última sincronización. En Firestore → Datos aparecerá `users/<UID>/kitchens/current` con `version`, `pantry`, `favorites`, `shopping` y `checked`.
3. En otro dispositivo con la misma cuenta, activa respaldo para descargar la cocina. Si ambos dispositivos hicieron cambios, aparecerá una elección de copia completa, con confirmación. No se combinan automáticamente las compras.
4. Sin conexión, realiza cambios; quedan en el registro local con `sync.dirty: true`. Al volver a primer plano con conexión o pulsar Sincronizar ahora se reintenta. No hay sondeo continuo ni sincronización en segundo plano.
5. Pausar no borra la nube. Eliminar cuenta desde Seguridad pide reautenticación; borra el documento de cocina, deja una marca técnica que bloquea las sesiones antiguas y elimina la identidad Firebase y el espacio local de ese UID. Invitado y otras cuentas se conservan.

## Límites de esta entrega

- Las pruebas de API usan respuestas controladas; no constituyen una prueba del servicio remoto ni del compilador de reglas. Base, reglas publicadas y recorrido con dos dispositivos siguen pendientes.
- El respaldo es una copia de recuperación actual, sin historial de versiones ni copias programadas/PITR. Resuelve conflictos mediante elección explícita; no realiza mezcla campo por campo.
- La eliminación Auth + Firestore + SQLite no puede ser una única transacción. Si falla después de la marca remota, la cocina queda bloqueada y la identidad puede seguir existiendo: hay que reintentar la eliminación. El registro local permite retomar una limpieza confirmada; no deduce borrado de cuenta por un simple cierre de sesión. Si la app se cierra exactamente después del borrado de identidad y antes de registrar su confirmación local, la copia anterior se conserva inaccesible hasta resolver la limpieza; no se afirma que esa ventana sea atómica.
- La cocina queda separada por cuenta dentro de la app, pero no se cifra frente a acceso físico al almacenamiento. Los ajustes y el apodo permanecen por dispositivo. La exportación Metro no valida teléfonos ni iOS nativo.
- Firestore REST utiliza el token del usuario y aplica reglas: [documentación oficial](https://firebase.google.com/docs/firestore/use-rest-api). Nunca utiliza credenciales administrativas para saltarlas.
