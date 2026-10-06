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

## Activación de Firestore — 5 de octubre de 2026

- La persona confirmó la publicación de `firestore.rules`; la captura muestra revisión publicada y reglas de propietario, formato y marca de eliminación correspondientes al archivo preparado.
- Se cambió `firestoreReady` a true. Esto habilita el botón de respaldo, pero no activa el envío automáticamente: cada cuenta debe confirmar desde Ajustes → Respaldo y sincronización.
- Primera sincronización real confirmada por la persona y captura del documento `users/<UID>/kitchens/current`: despensa, favoritas y compras visibles. Después de marcar tomate en la app, la persona confirmó su incorporación a `pantry` en Firestore.
- Prueba sin conexión reportada como aprobada: modificar la despensa sin Wi-Fi ni datos móviles, recuperar internet y sincronizar; la persona confirmó el ingrediente en Firestore. Este recorrido incluye sincronización manual y no demuestra por sí solo reintento automático al recuperar conexión.
- Separación invitado/cuenta reportada como aprobada: cerrar sesión, modificar la cocina del invitado y volver a la misma cuenta de Google sin importar. La persona confirmó que no se mezclan los datos. Resultados físicos reportados por la persona; no ejecutados por el agente.
- La persona confirmó en el POCO que los datos se conservan separados al alternar entre dos cuentas de Google. Esta prueba funcional no demuestra por sí sola que las reglas rechacen una petición directa al UID de otra cuenta.
- La persona confirmó el recorrido de eliminación: retorno al invitado, cuenta retirada de Authentication y cocina `kitchens/current` eliminada de Firestore. Resultado reportado por la persona, no ejecutado por el agente; no se infiere que haya probado cancelación o selección de una cuenta equivocada durante la reautenticación.
- Pendientes: recuperación en otro dispositivo (la persona no dispone de otro Android), conflictos, importación explícita y controles negativos de eliminación. La publicación y estas pruebas funcionales no equivalen a una prueba completa de seguridad.

## Selector de cuentas Google — 5 de octubre de 2026

- La persona mostró que, después del primer acceso, el selector solo ofrecía la cuenta autorizada. El login llamaba primero a `signIn()`, documentado en la biblioteca instalada como filtrado a cuentas previamente autorizadas en Android; el selector completo solo se abría si no encontraba credenciales.
- El botón ahora llama directamente a `presentExplicitSignIn()`, ya incluido en el APK actual. Se conserva cancelación sin autenticación y el intercambio de credenciales con Firebase. No se modifican datos, dependencias ni reautenticación para eliminar cuenta.
- Tras la corrección, la persona confirmó que pudo probar dos cuentas y que sus datos se conservan separados. TypeScript y las 22 pruebas automatizadas pasaron después del cambio; la selección y separación físicas fueron verificadas por la persona.

## Preparación del chatbot Gemini — 5 de octubre de 2026

- Pantalla en Ajustes y enlace desde Ayuda, consentimiento de envío, despensa opcional, espera, errores y reintento del mismo ID. Historial solo en memoria, desmontado por UID; desactivar contexto de despensa limpia la conversación. Sin URL configurada se muestra preparación y no permite enviar. No hay respuestas simuladas.
- Backend Firebase HTTP con Gemini REST, contrato compartido con catálogo, validación de sesión/revocación, App Check o piloto de UID permitido, marcador de eliminación, transacción de reservas por usuario/global, lease, deduplicación y timeout. Clave por Secret Manager, nunca en el cliente. No se han desplegado servicios, creado claves ni activado facturación. App Check cliente aún pendiente.
- Compilación TypeScript del servidor y de la app aprobadas; 27 pruebas aprobadas. Nuevos casos: acceso sin sesión/revocado/App Check/piloto, formato/contexto/tamaños, cuotas y cambio de día, reintento del mismo ID, cabecera secreta solo de servidor, bloqueo/alcance y ausencia de herramientas. Peticiones controladas; no son pruebas reales de Gemini ni de transacciones concurrentes Firestore.
- Exportación Metro Android/iOS/web aprobada con `npm run export:check -- --max-workers 1`. Primer intento concurrente falló en el compilador Hermes de Windows; la repetición con un worker completó también bytecode. No se generó APK/IPA ni se cambió una biblioteca nativa.
- Revisión React: bloqueo de doble envío con ref, AbortController al desmontar, resultados tardíos descartados, conversación separada por UID, controles accesibles y colores de tema. El navegador integrado falló con timeout en navegación y recuperación del tab; no se afirma revisión visual web ni física de la nueva pantalla. Pendientes teclado/texto grande/TalkBack, respuestas reales, pruebas de cuotas concurrentes, TTL, presupuesto y configuración de producción. Dependencias del servidor instaladas y lockfile separado; runtime destino Node 22, entorno local Node 24.

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
# Worker Cloudflare: verificación local del 5 de octubre de 2026

La persona compartió capturas a las 18:26: después de preguntar por arroz, «¿Y para dos personas?» recibió una respuesta coherente con ese tema, confirmando continuidad de conversación en el dispositivo. Con compartir despensa marcado, «¿Qué puedo cocinar con lo que tengo?» recibió una respuesta de despensa vacía. Todavía hay que contrastar los ingredientes de la cuenta activa y probar una selección no vacía; esa respuesta no demuestra por sí sola que el contexto enviado sea correcto. La pantalla muestra cupo restante 4.

**Primera respuesta real confirmada en Android por la persona:** captura del 5 de octubre a las 18:24 muestra la consulta «¿Cómo cocino arroz?» y una respuesta culinaria de «Asistente · Gemini». Consentimiento marcado; compartir despensa desmarcado. El flujo móvil → Worker → validación de cuenta/cuota → Gemini 3.5 Flash-Lite → pantalla funciona con el APK de desarrollo existente. Esta prueba no confirma todavía contexto de despensa, aislamiento del historial al cambiar cuenta, límites diarios ni funcionamiento sin Metro en un APK de distribución.

Tras corregir redirect, la consulta alcanzó Gemini pero este devolvió HTTP 404 con `gemini-2.5-flash-lite`. La documentación oficial del 5 de octubre indica acceso a modelos 2.5 limitado a proyectos con uso previo y recomienda 3.5 Flash-Lite para nuevos proyectos; la tabla de precios documenta texto de entrada/salida gratuito en Free Tier. Se actualizó el modelo configurado a `gemini-3.5-flash-lite` sin activar facturación. Falta confirmar una respuesta real tras este cambio; el 404 no se atribuye a una clave inválida sin evidencia.

Causa confirmada del 503: el runtime de Workers rechaza `fetch(..., {redirect: 'error'})` con TypeError ("Invalid redirect value ... follow or manual"). Fallaba `account-before`, antes de Gemini. Se reprodujo con Miniflare y un token ficticio; la prueba falló antes del arreglo y pasa usando `manual`. Auth y Gemini rechazan respuestas no exitosas, incluidas redirecciones, sin seguirlas ni reenviar credenciales. Prueba de Gemini con Request nativo y proveedor simulado verifica opciones compatibles y rechazo de 302 en una sola llamada. Pasaron 4 pruebas Worker, 28 pruebas app y ambos typecheck. No se usó clave Gemini real en esas pruebas. Falta confirmar la consulta en el teléfono tras publicar esta corrección.

Diagnóstico de la primera consulta: la persona recibió NETWORK con sesión Google visible. El Worker sigue contestando 401 SESSION sin token; el teléfono resuelve el subdominio exacto y obtiene respuesta ICMP. Se distingue ahora una respuesta HTTP no JSON como SERVER, en vez de confundirla con un fallo de transporte. Diagnóstico de desarrollo limitado a estado HTTP, content-type y nombre de error, sin consultas/cabeceras/tokens. Typecheck y 28 pruebas pasaron. Falta capturar un intento real con el diagnóstico nuevo; no se declara resuelto el fallo de Gemini.

Reconexión Android: la captura del teléfono mostraba la dirección antigua `192.168.2.102:8081`. Se abrió el cliente con `127.0.0.1:8082` por ADB reverse, sin borrar datos. La primera instancia Metro devolvía HTTP 500 UnexpectedServerError en el manifiesto; tras reiniciarla con diagnóstico y permisos de ejecución ampliados, el manifiesto respondió HTTP 200 y el bundle Android terminó en 4377 ms. No se modificaron dependencias ni se recompiló el APK. El origen exacto del 500 no se atribuye a permisos sin evidencia adicional.

La persona publicó el Worker (versión `2f2ecf20-2bb2-49b1-86ba-895fe9c2d700`) y compartió salida de Wrangler. Se extrajo solo la URL pública de su registro para cotejar el subdominio exacto `benjaigancioreyes56`; se corrigió una letra faltante en la dirección copiada y se configuró `.env.local`. Las comprobaciones reales de Gemini y de la interfaz móvil siguen pendientes.

Una petición POST real sin Authorization a `/chat` respondió HTTP 401 con `{"code":"SESSION"}`. No llamó a Gemini ni consumió cupo del modelo. Confirma alcance del servidor y rechazo de ausencia de sesión; no confirma todavía una respuesta real del proveedor.

- `npm --prefix worker run typecheck`: pasó.
- `npm --prefix worker run build`: pasó; `wrangler deploy --dry-run`, sin publicación.
- `npm --prefix worker test`: 3 pruebas pasaron. Firma/claims JWT y estado de usuario con mocks; Miniflare con SQLite real verifica seis reservas simultáneas, deduplicación, límite global y persistencia tras cerrar/reiniciar el runtime.
- `npm test`: 27 pruebas pasaron tras ajustar el código Gemini compartido.
- `npm run typecheck`: pasó. `npm run export:check -- --max-workers 1`: pasó para Android, iOS y web; es una exportación de Metro, no un APK ni una prueba física.
- Instalación actual de herramientas Worker: audit reportó 0 vulnerabilidades tras actualizar Miniflare. No se alteraron dependencias nativas móviles.
- No se leyó la clave Gemini. La persona confirmó guardarla en Cloudflare y usar Nivel gratuito; no hubo llamada real al modelo ni despliegue del nuevo backend. Autorización de Wrangler y prueba en teléfono pendientes.
- `wrangler whoami` confirmó que la terminal no está autenticada; la persona debe completar el login en el navegador antes de publicar en su cuenta existente.

Confirmación física del 5 de octubre a las 18:28: con compartir despensa activado, la consulta sobre ingredientes recibió una respuesta que identifica tomate, arroz y huevos y propone arroz con tomate y huevo. La persona compartió la captura del Android. Queda verificado el envío y uso de una despensa no vacía de la cuenta activa; la respuesta anterior de despensa vacía no reproduce un fallo en esta prueba. Cupo restante mostrado: 3. No se modificó lógica ni se recompiló el APK.


Actualización del 5 de octubre: cantidades y recetas propias usan Kitchen v2, compatible con lectura v1. Reglas compiladas/publicadas; ver MEJORAS.md para migración, límites, TheMealDB, temporizador y comprobaciones. Las 31 pruebas app, 4 Worker y exportación all pasaron; las nuevas interacciones físicas siguen pendientes.

Comprobación visual en Android: Inicio muestra Revuelto de champiñones del catálogo ampliado; enlace que-cocino://explore abre Recetas del mundo con búsqueda y selector. Capturas locales .expo/que-cocino-mejoras.png y .expo/que-cocino-explore.png. No se probaron todavía guardado/edición/cantidad/temporizador mediante interacción física. Worker publicado: 8897032b-31d0-40e5-b889-f94e56baa5b9.

TheMealDB retirado por petición expresa de continuar sin esa API ni pago. Se eliminó el servicio de red; /explore usa únicamente el catálogo local y sus enlaces se renombraron. Se preservan fuentes y recetas antiguas para evitar pérdida de datos. Typecheck y 31 pruebas pasaron, incluidas lectura de recetas antiguas y borradores Gemini. No cambió el formato persistido ni las reglas; no requiere publicar Worker ni recompilar el APK de desarrollo.


2026-10-06: implementadas las cinco mejoras (porciones, ingredientes propios, plan, historial/notas, Deshacer) y ampliado catálogo a 40 ingredientes/30 recetas. Typecheck app/Worker pasó; 37 pruebas app y 4 Worker pasaron. Exportación Android/iOS/web pasó (Metro, no APK). Reglas v3 compiladas/publicadas sin activar facturación; Worker 621df5dc-6de0-4e5c-9de4-49c8a6f27ae0 publicado con contexto personalizado opcional. Android reconectado por USB; plan semanal visible con semana 2026-10-05 a 2026-10-11 y receta visible Para 4 personas. Aviso de claves duplicadas localizado: CookedEditor y CookingMode compartían key de receta como hermanos; se cambió la clave del primero. Contador Compras incluye personalizados. No se crearon datos de prueba en la cocina del teléfono. Persistencia/compra/registro/Deshacer nuevos se verificaron en pruebas de dominio/repositorio, pendientes de interacción física completa.

Confirmación final visual: tras recargar, .expo/que-cocino-porciones-final.png muestra Para 4 personas sin aviso de claves duplicadas. El plan se revisó en .expo/que-cocino-plan-v3.png. No se modificaron datos del teléfono para esta revisión. Typecheck final y 37 pruebas app pasaron después de la corrección; git diff --check pasó.

Arranque físico confirmado en POCO con el APK release v2: Metro 8082 sin listener, túnel retirado, cierre completo y apertura desde MainActivity/lanzador. Pantalla Inicio visible en .expo/que-cocino-apk-autonomo.png; se mantiene apariencia local. La primera captura negra correspondía a dispositivo Dozing, no a una excepción de la app; tras despertar se ve la cocina. No se modificaron WiFi/datos móviles ni se hizo una consulta Gemini para esta prueba. Google/respaldo/chat del APK release siguen pendientes de prueba manual con la cuenta.
