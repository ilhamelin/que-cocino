# Cocinas por cuenta: migración y recuperación

Plan previo a cambiar la persistencia, 5 de octubre de 2026.

- `kitchen-v1` se conserva sin modificar como respaldo de los datos anteriores. Se valida y copia una sola vez a `kitchen-v2:guest`. Nunca se atribuye automáticamente a la cuenta que esté iniciada al actualizar.
- Cada UID tiene `kitchen-v2:user:<UID codificado>`. El sobre tiene `version: 2`, estado de cocina validado con su formato interno versión 1, decisión de importación y metadatos de sincronización. Los ajustes de apariencia y el apodo del dispositivo siguen en `preferences-v1`.
- La lectura inválida o una escritura fallida no se reemplaza por estado vacío. Una cola de persistencia serializa cambios. Cambiar de sesión espera el guardado; la pantalla de cocina se desmonta inmediatamente al cambiar UID para no mostrar el espacio anterior.
- Importar es una copia explícita de ingredientes, favoritas y compras; elimina duplicados y conserva la cocina original del invitado. Se puede rechazar y copiar más tarde. No se importa un estado corrupto.
- El respaldo en Firestore es opcional y por UID, en `users/<UID>/kitchens/current`. Se guarda una instantánea pendiente localmente antes de subirla. La revisión remota es el `updateTime` del servidor; las escrituras usan precondiciones. Si hay cambios en ambos dispositivos se pide elegir la copia; no se unen silenciosamente ni reaparecen compras eliminadas. Una respuesta perdida se recupera comparando la instantánea remota.
- La eliminación requiere confirmación explícita y reautenticación de la misma cuenta. Un registro local pendiente permite retomar limpieza si la app se cierra entre borrado remoto y borrado de identidad. La cuenta no se elimina si falla el borrado remoto cuando Firestore está activado. Tras borrar la identidad se retira solo la cocina de ese UID; invitado y otras cuentas se conservan. Las escrituras tardías de un UID retirado se rechazan.
- La API REST de Firestore usa el token Firebase del SDK ya instalado y reglas por UID. No se añade una biblioteca nativa ni se necesita recompilar el APK para esta entrega. No hay listener en tiempo real: sincroniza al activar, al volver al primer plano, después de cambios con espera y mediante botón; los errores tienen reintento.
- El borrado remoto escribe de forma atómica una marca irreversible `users/<UID> {deleted: true}` y elimina `kitchens/current`. Las reglas bloquean lecturas y escrituras de cocina de sesiones antiguas. Solo queda ese identificador técnico; no contiene correo, nombre ni cocina. Las marcas locales también impiden escrituras tardías. No se promete invalidación inmediata de un APK antiguo que no tenga estos controles.
- No se considera validada la migración móvil, borrado ni sincronización hasta probarlos en dispositivos. Las reglas y la base remota deben configurarse antes de activar el respaldo.


Actualización del 5 de octubre: cantidades y recetas propias usan Kitchen v2, compatible con lectura v1. Reglas compiladas/publicadas; ver MEJORAS.md para migración, límites, TheMealDB, temporizador y comprobaciones. Las 31 pruebas app, 4 Worker y exportación all pasaron; las nuevas interacciones físicas siguen pendientes.


Actualización 2026-10-06: Kitchen v3 migra v1/v2 sin perder listas, cantidades ni recetas. Añade ingredientes personalizados, plan semanal e historial con notas; Deshacer es solo memoria por sesión. Catálogo local: 40 ingredientes y 30 recetas. Sin API de recetas ni nuevas bibliotecas nativas. Detalles y límites en MEJORAS.md.
