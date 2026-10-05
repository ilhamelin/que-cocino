# Verificación de la primera versión

Fecha: 5 de octubre de 2026.

## Comprobaciones realizadas

- TypeScript estricto: sin errores.
- 7 pruebas de dominio: aprobadas. Cubren ranking, filtro de tiempo, favoritos, compras sin duplicados, traslado a despensa y validación de datos persistidos.
- Exportación de Metro para Android, iOS y web: generada correctamente.
- Recorrido en navegador con ancho móvil: estado vacío, ingredientes de ejemplo, apertura de receta, favorito, añadido a compras, compra confirmada y actualización de despensa.
- La receta favorita y la despensa se conservan al recargar la vista web.
- Consola del navegador: sin errores durante el recorrido funcional inicial. Al actualizar dependencias y reiniciar Metro apareció un error transitorio de red al cargar recursos; la recarga con el servidor listo restauró la interfaz y los iconos.

## Límites de esta verificación

La verificación técnica inicial no incluyó teléfonos físicos ni instalación de APK/IPA. El 5 de octubre de 2026 la persona confirmó que la app funciona mediante Expo Go en un POCO X7 Pro con Android y que los cambios de despensa, favoritas y compras persisten tras cerrar y reabrir el proyecto en el celular. La versión indicada es posiblemente Android 16, pendiente de confirmar en el dispositivo. Este resultado es reportado por la persona; no es una prueba ejecutada por el agente. Quedan pendientes los demás casos del recorrido y la validación en iOS. La vista web utiliza el almacenamiento del navegador.

## Registro pendiente de validación móvil

Completar esta tabla siguiendo el recorrido definido en `PLAN.md`. «Pendiente» significa que no existe aún un resultado registrado, no que la función haya fallado.

| Caso | Android | iOS |
| --- | --- | --- |
| Dispositivo, versión del sistema y fecha | POCO X7 Pro; Android 16 por confirmar; 5 de octubre de 2026 | Pendiente |
| Arranque, pestañas, detalle y regreso | Pendiente | Pendiente |
| Coincidencias y filtro de 15 minutos | Pendiente | Pendiente |
| Guardar y quitar favoritas | Pendiente | Pendiente |
| Compras sin duplicados | Pendiente | Pendiente |
| Traslado de compras a despensa | Pendiente | Pendiente |
| Persistencia tras cerrar completamente Expo Go | Aprobada según la persona: despensa, favoritas y compras conservadas al cerrar y reabrir; 5 de octubre de 2026 | Pendiente |
| Teclado, áreas seguras y pantalla pequeña | Pendiente | Pendiente |
| Texto grande y lector de pantalla | Pendiente | Pendiente |
| Errores de almacenamiento y reintento controlados | Pendiente | Pendiente |

## Pulido de interfaz — 5 de octubre de 2026

- Corregidos singular/plural de ingredientes y el contador de recetas de la sección «Más ideas».
- Tarjetas e ingredientes del detalle se distribuyen en vertical en pantallas menores de 360 puntos o con escala de texto superior a 1,3. Controles con mayor área táctil, etiquetas accesibles de ingredientes y pasos, espacio inferior seguro y ajustes de teclado y pestañas.
- TypeScript sin errores, 7 pruebas de dominio aprobadas y exportación de Android, iOS y web completada después de los cambios. El runner de pruebas falló inicialmente en el sandbox con `uv_os_get_passwd`; la ejecución fuera del sandbox terminó correctamente.
- Vista web revisada a 340 × 780: Inicio, filtro de 15 minutos, singular de faltantes, contador de más ideas, etiquetas completas de pestañas y apertura del detalle de receta. Sin errores registrados en la consola durante esta revisión.
- Pendiente verificar estas mejoras con texto grande, TalkBack y teclado nativo en el POCO. Esta revisión web no equivale a prueba física de los cambios.
- Instrucciones para consultar SQLite desde el inspector integrado de Expo añadidas al README. Se comprobó que la biblioteca instalada incluye el inspector; no se abrió ni modificó la base del celular desde el agente.

## Ajustes y preparación de Firebase — 5 de octubre de 2026

- Implementados menú de ajustes y pantallas de perfil local, seguridad y privacidad, apariencia, ayuda e información. Acceso desde un engranaje en las pantallas principales.
- Preferencias con formato `version: 1`, guardadas como `preferences-v1` mediante los adaptadores actuales. El registro `kitchen-v1` conserva su formato y contenido; no se migra la despensa.
- TypeScript sin errores y 10 pruebas de dominio aprobadas, incluyendo valores iniciales de ajustes, lectura/escritura del formato y rechazo de datos corruptos o incompatibles. Pruebas ejecutadas fuera del sandbox por la limitación de `uv_os_get_passwd` previamente identificada.
- Exportación de Metro para Android, iOS y web completada correctamente después de los cambios finales. No genera un APK/IPA ni verifica los nuevos ajustes en un teléfono físico.
- Revisión web a 390 × 844: apertura del menú y perfil, guardado de nombre y persistencia tras recarga; cambio a oscuro, fuente clásica y texto más grande, con persistencia tras recarga. Preferencias y nombre de prueba restaurados al terminar. Selección de opciones accesible en el DOM. Sin errores de consola durante este recorrido.
- Captura de revisión en `ajustes-preview.jpg`. Pendiente verificar los nuevos ajustes en el POCO y en iOS, incluyendo TalkBack/VoiceOver y persistencia móvil de las preferencias.
- Login de Google, Firebase, sincronización y chatbot aún no implementados ni conectados. La persona eligió preparar la app y las instrucciones antes de crear Firebase. Ayuda muestra preguntas frecuentes fijas, no respuestas de IA. Plan y controles de servidor en `ARQUITECTURA.md`.

## Login Google Android — 5 de octubre de 2026

- Verificado el archivo reemplazado: proyecto `que-cocino-6377a`, paquete `com.quecocino.app`, cliente OAuth Android tipo 1 y SHA-1 `3B:10:B5:EA:B0:79:DF:16:B3:FE:7D:DD:DC:E2:98:20:EF:4F:65:F7`, más cliente web tipo 3. No se han generado ni incorporado claves privadas a la app.
- Bibliotecas instaladas con `npx expo install`: expo-dev-client, Firebase App/Auth nativo, Nitro Google Sign-In y Nitro Modules. Plugins configurados por Expo; cliente Android en `src/services/auth.native.ts`, estado en AuthProvider y controles en Perfil y Seguridad. Uso modular de Firebase, sin sesiones ficticias ni tokens en SQLite.
- TypeScript aprobado y 12 pruebas de dominio aprobadas (incluyen cancelación/errores y ausencia de detalles sensibles en mensajes). Exportación de Metro Android, iOS y web aprobada. Revisión React: suscripción con limpieza, bloqueo de solicitudes repetidas, sin iniciar login desde efectos, controles accesibles, errores visibles y reintento.
- Prebuild Android con plugins completado: paquete y complemento Google Services comprobados. La carpeta nativa temporal se retiró después del chequeo para que EAS genere el proyecto desde la configuración. No se compiló Gradle ni se generó un APK local.
- La introspección conjunta falló en iOS por falta de `ios.googleServicesFile`, coherente con su configuración pendiente. La exportación JS de iOS aprobada no implica que se pueda compilar su binario todavía.
- Compilación EAS `83b1b01f-d38a-416c-ac6b-fee736366f50` completada con estado Succeeded según captura de la persona. APK instalado en el POCO X7 Pro; servidor de desarrollo iniciado con `npm run start:dev`. La persona confirmó login con Google y aportó captura de Perfil con identidad autenticada y botón Cerrar sesión. No se reproduce aquí el correo personal.
- La persona confirmó los cuatro casos de sesión en el POCO X7 Pro: cerrar completamente y reabrir conserva la cuenta; Cerrar sesión vuelve a mostrar Continuar con Google; cancelar el selector mantiene el estado sin sesión; iniciar nuevamente funciona. Capturas adicionales muestran Ajustes con cuenta y Perfil sin sesión en tema oscuro y fuente clásica. Resultados reportados por la persona, no ejecutados por el agente.
- Pendientes físicos: error de red y comprobación explícita de que los datos locales no cambian al autenticar. La nueva instalación tiene su propia base independiente de Expo Go; sin importación automática ni espacios privados por cuenta todavía. La confirmación de sesión no cubre esos casos ni iOS.
- Pendientes antes de distribuir: eliminación de cuenta con reautenticación, configuración iOS y recorridos físicos por plataforma. Sincronización y chatbot siguen sin implementar.
- Tras instalar las dependencias, npm reporta 36 avisos (26 altos y 10 moderados); no se aplicaron actualizaciones forzadas del SDK. Revisar avisos concretos antes de distribución.

## Cocinas por cuenta, eliminación y respaldo — 5 de octubre de 2026

- Plan de migración escrito antes de cambiar persistencia (`MIGRACION.md`). Original `kitchen-v1` conservado; sobres versión 2 para invitado y cada UID. Importación desde Perfil exige confirmación y conserva el original.
- Cambiar la sesión espera el guardado y la sincronización en curso; la cocina se desmonta por UID. Fallos de lectura o escritura no se sustituyen por un estado vacío. La cola de almacenamiento y las marcas de retirada impiden reescribir cuentas eliminadas.
- Seguridad ofrece confirmación y reautenticación de la misma cuenta mediante `reauthenticateWithCredential`, seguida de borrado de identidad y limpieza local. Cancelación y cuenta equivocada no borran datos. Registro pendiente para recuperación de una limpieza confirmada; ventana entre servicios documentada.
- Firestore REST preparado con token Firebase del SDK existente, sin librerías nativas añadidas. `firestoreReady: false`: no se ha creado la base, publicado reglas ni enviado cocinas remotas. Nueva pantalla de respaldo, consentimiento de envío, cambios pendientes, última sincronización, reintento y conflictos de copia completa con contenidos visibles. Precondiciones `updateTime` o `exists=false`; no hay mezcla automática ni sondeo continuo.
- Reglas escritas para dueño por UID, formato/catálogo válido, sin acceso público ni listado. Commit de borrado remoto incluye marca técnica irreversible y eliminación de cocina para bloquear sesiones antiguas. No se han probado en el compilador/emulador ni publicado en Firebase; no se afirma validación de acceso remoto.
- TypeScript aprobado, 22 pruebas aprobadas: migración, aislamiento entre dos UID, importación sin duplicados, fallos de persistencia, retirada y limpieza interrumpida, cancelación/cuenta incorrecta, orden de borrado y bloqueo ante fallo remoto, formato REST, precondiciones y conflictos. Respuestas REST controladas; no son llamadas a Firestore real.
- Exportación Metro Android, iOS y web aprobada. Un intento anterior falló porque se añadió un módulo durante la exportación; se repitió tras terminar los cambios y pasó. No se generó otro APK ni se cambió la configuración nativa.
- Revisión web: datos anteriores siguen visibles como Invitado y navegación a Ajustes/Respaldo con estado sin cuenta. Login web sigue desactivado; no se fabricaron sesiones para revisar pantallas. Pendiente recorrer importación y borrado en el POCO, migración móvil, dos cuentas, dos dispositivos, modo sin conexión, reglas y sincronización real. iOS nativo permanece pendiente.
- El APK Android actual sirve para estos cambios de TypeScript. Recargar desde Metro con `r`; si la recarga conserva un error de módulo añadido, reiniciar con `npm run start:dev -- --clear`. Creación y configuración externa de Firestore descritas en `FIRESTORE.md`.

## Recuperación de pantalla blanca en POCO — 5 de octubre de 2026

- La persona mostró pantalla blanca y anteriormente Metro informó «No apps connected». El agente comprobó por ADB que el dispositivo de scrcpy estaba conectado, que Metro 8081 respondía y que la app no tenía proceso activo en la primera lectura. No se encontró un cierre de la app en el búfer de fallos.
- Al reabrir, se observó el cliente intentando cargar desde `192.168.2.102:8081`, sin errores JS en el proceso leído. Un servidor temporal USB en 8082 con `--localhost` escuchó únicamente en `[::1]`, mientras el cliente/túnel solicitaba IPv4; se reprodujo fallo de conexión/fin de flujo.
- Se reinició solo ese servidor temporal con `node --dns-result-order=ipv4first ... --localhost --port 8082`, manteniendo el servidor original del usuario. Tras reabrir el proyecto por `127.0.0.1:8082`, Metro completó el paquete Android (1555 módulos), el registro mostró `Running main` y la captura ADB confirmó Inicio, tema oscuro y fuente clásica en el POCO. No se borró almacenamiento ni se reinstaló/generó APK.
- Se añadió `npm run start:usb` como modalidad opcional con IPv4 y puerto 8082. Requiere cable y `adb reverse tcp:8082 tcp:8082`; Wi-Fi continúa usando `start:dev`. El servidor temporal permanece activo durante la sesión de diagnóstico. No se ha demostrado la causa exacta de la conexión original por Wi-Fi; la recuperación por USB sí fue verificada.
- Se envió `r` al servidor 8082 y Metro confirmó «Reloading apps» y paquete Android completado en 171 ms. La instancia anterior en 8081 no controla esta conexión.
- El APK emite además un aviso nativo de DevLauncher por ausencia de `expo.modules.splashscreen.SplashScreenManager`. El arranque exitoso posterior demuestra que ese aviso no bloqueó este recorrido; no se añadió una biblioteca nativa ni se atribuyó la pantalla blanca a ese aviso.
- Cloud Firestore `(default)` fue creado por la persona según captura anterior, pero la publicación de reglas no está confirmada y `firestoreReady` continúa en false. El diagnóstico no activó sincronización ni envió datos de cocina a Firebase.

## Dependencias anteriores (registro)

## Activación de Firestore — 5 de octubre de 2026

- La persona confirmó la publicación de `firestore.rules`; la captura muestra revisión publicada y reglas de propietario, formato y marca de eliminación correspondientes al archivo preparado.
- Se cambió `firestoreReady` a true. Esto habilita el botón de respaldo, pero no activa el envío automáticamente: cada cuenta debe confirmar desde Ajustes → Respaldo y sincronización.
- Pendiente confirmar primera sincronización real, documento `users/<UID>/kitchens/current`, acceso entre dos cuentas/dispositivos, conflictos y eliminación remota. La publicación no equivale a prueba completa de seguridad.

## Dependencias anteriores (histórico)

`npm audit` reporta 29 advertencias (19 altas y 10 moderadas), incluidas las dependencias transitivas de Expo/Metro y Expo Router. Se ejecutó `npm audit fix` sin forzar cambios incompatibles; las advertencias permanecen. Las propuestas de `--force` incluyen sustituir el SDK de Expo y versiones principales, por lo que no se aplicaron.

Antes de publicar, revisar actualizaciones compatibles y los avisos concretos de `braces`, `node-forge`, `uuid` y `decode-uri-component`, y evaluar su alcance en las herramientas de desarrollo y la aplicación. El proyecto es una base de desarrollo, no una entrega aprobada para publicación.

## Cómo repetir las comprobaciones

```powershell
npm run typecheck
npm test
npm run export:check
npm audit
```
