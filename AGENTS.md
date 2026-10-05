# Guía del proyecto

Aplicación móvil en español con TypeScript, React Native y Expo Router. La persona utiliza Antigravity como editor. Mantener la lógica de negocio en `src/domain` y las pantallas en `src/app`.

- Mantener compatibilidad con Android e iOS; la web sirve como vista de desarrollo.
- Instalar bibliotecas nativas con `npx expo install` para respetar el SDK instalado.
- Evitar dependencias y servicios externos si no hacen falta para la funcionalidad solicitada.
- Guardar datos con los adaptadores de `src/storage`; nunca guardar secretos en el cliente.
- Mantener el formato persistido versionado y planificar migraciones antes de cambiarlo.
- Mantener accesibilidad, estados vacíos y errores visibles con reintento.
- Ejecutar `npm run typecheck` y `npm test` después de cambios de lógica. Ejecutar `npm run export:check` para cambios de navegación o dependencias.
- No tratar una exportación de Metro como un APK/IPA ni como prueba en dispositivo físico.
- Las cuentas, identificadores de publicación e iconos de lanzamiento aún deben definirse.
