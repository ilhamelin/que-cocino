# Asistente con Gemini

**Guía vigente: [CLOUDFLARE.md](CLOUDFLARE.md).** El Worker gratuito está preparado en `worker/`. La persona creó `que-cocino-chat`, confirmó el secreto guardado y el Nivel gratuito en Gemini. Falta autorizar UID, publicar el código y probar respuestas reales. El resto del documento conserva la propuesta inicial de Functions como referencia; no ejecutar sus pasos de publicación ni secretos.

## Decisión vigente: sin facturación ni secretos en Firebase

La persona exige mantener los servicios sin facturación y no guardar la clave Gemini en Firebase. El comando Secret Manager falló al exigir Blaze; no se confirmó creación del secreto. **No ejecutar los pasos de Secret Manager ni despliegue Firebase de este documento**: quedan como referencia de la implementación inicial, no como instrucciones vigentes.

Investigación del 5 de octubre de 2026: Gemini Developer API tiene Free Tier para ciertos modelos sin vincular facturación. Comprobar que el proyecto de la clave indica Free Tier y elegir un modelo con cuota gratuita disponible. No activar Cloud Billing, créditos de prueba ni planes de pago para este flujo. La disponibilidad y cuota reales dependen del proyecto/modelo.

Implementación vigente para disponer del chatbot en internet: Cloudflare Workers Free, con clave cifrada como secreto de Cloudflare, validación del ID token Firebase y cuotas persistentes en Durable Objects con SQLite (disponibles en Free). Al exceder las cuotas gratuitas, Workers/DO rechazan operaciones; mantener el plan Free. La app sigue usando Firebase Auth y Firestore para cocina, no para guardar la clave. El adaptador está en `worker/`; `functions/` queda como referencia y se retiró su entrada de `firebase.json` para evitar publicarlo por accidente.

Alternativa local: servidor en el PC y clave en archivo local ignorado por Git; el computador debe estar encendido para atender al celular. Tampoco requiere Secret Manager, pero necesita configurar el servidor y conexión local.

Fuentes verificadas: [Gemini Free Tier](https://ai.google.dev/gemini-api/docs/billing), [Workers Free y cuotas](https://developers.cloudflare.com/workers/platform/limits/), [secretos de Workers](https://developers.cloudflare.com/workers/configuration/secrets/), [Durable Objects Free](https://developers.cloudflare.com/durable-objects/platform/pricing/). Las consultas/respuestas del nivel gratuito Gemini pueden utilizarse para mejorar productos de Google: revisar condiciones antes de abrir a otras personas.

## Estado

Pantalla en Ajustes → Asistente de cocina, accesible también desde Ayuda. Servidor TypeScript en `functions/`, Gemini por REST `generateContent`. No se añadió una biblioteca nativa: la pantalla sirve con el APK de desarrollo actual. No está desplegado ni hay respuestas reales mientras falten clave, modelo y URL. La interfaz lo indica y deshabilita Enviar; no simula respuestas.

## Flujo y límites

La app obtiene el ID token de Firebase de la cuenta activa. El servidor verifica firma, proyecto y revocación con Admin SDK; obtiene el UID del token, nunca del cuerpo. Comprueba además la marca de cuenta eliminada antes de reservar y antes de entregar la respuesta.

En una transacción Firestore reserva 10 intentos diarios por cuenta (día UTC), 2 por minuto UTC, una solicitud simultánea por UID y un límite global diario configurable (inicialmente 20). Las reservas se realizan antes de llamar a Gemini; un fallo también consume cupo. La concurrencia tiene lease de 120 segundos; el proveedor aborta a los 25 segundos. Hay hasta 1.000 caracteres por consulta, 6 mensajes previos y 7.000 caracteres totales. La respuesta solicita como máximo 600 tokens y se valida antes de mostrarla. No hay herramientas, búsqueda, enlaces ejecutados ni cambios de cocina.

`requestId` y hash del contenido impiden volver a ejecutar el mismo intento. Si la respuesta se perdió, un reintento devuelve BUSY o DUPLICATE, sin otra llamada a Gemini. No se guardan respuestas para recuperarlas: una consulta nueva usa otro ID y consume cupo. Editar el mensaje inicia un intento nuevo. Los contadores globales limitan llamadas al modelo; **no son un corte de facturación en dinero ni limitan todos los costos de infraestructura HTTP/Firestore**. Definir presupuesto y tarifas del modelo antes del despliegue; alertas de facturación no detienen gasto por sí solas.

El servidor incluye guía de la app y catálogo vigente; el contexto de despensa solo se envía si la persona lo marca. Gemini devuelve un objeto con `inScope` y `answer`; ante tema ajeno, se muestra una respuesta fija. Se mantienen filtros de seguridad. Este control de alcance depende del modelo y requiere probar intentos de evasión: no se presenta como garantía infalible. Cupos, identidad y tamaño se aplican con código, no con el prompt.

## Datos y privacidad

El consentimiento para enviar consultas es explícito. Nombre, correo, favoritas y compras no se añaden al contexto. El usuario puede escribir datos personales: se envían como parte de su consulta. Al desactivar compartir despensa se limpia el historial de pantalla para no reenviar ese contexto. Cambiar cuenta o cerrar esta pantalla desmonta la conversación. No hay historial persistido en SQLite ni Firestore, por lo que no hace falta una migración del formato de cocina.

Firestore mantiene únicamente contadores y leases bajo UID SHA-256, huella del cuerpo, estado e ID de petición derivado. No se guardan preguntas/respuestas ni tokens en esos documentos o logs. Son metadatos seudónimos, no datos anónimos. `expiresAt` indica 48 horas: **configurar TTL** en `chatUsage` y `chatRequests` para que se eliminen; sin la política TTL no se borran automáticamente. El marcador de eliminación bloquea nuevas solicitudes aunque la limpieza TTL sea posterior. `chatControl/global` solo contiene fecha y contador agregado. Las reglas existentes deniegan todo acceso del cliente a estas colecciones; Admin SDK aplica controles en el servidor y no usa esas reglas.

Revisar las condiciones de tratamiento de datos y tarifas de la modalidad Gemini elegida antes de ofrecer el chat a terceros. La retención del proveedor no la controla el borrado del historial en la app.

## Preparar clave y modelo

1. Abrir [Google AI Studio](https://aistudio.google.com/api-keys) con tu cuenta. Importar/seleccionar el proyecto `que-cocino-6377a` si está disponible y crear una clave para la API de Gemini. No crear una cuenta de servicio.
2. No pegar la clave en el chat, en `app.json`, en `google-services.json` ni en variables `EXPO_PUBLIC_*`. Guardarla únicamente como secreto del servidor.
3. Consultar [modelos disponibles](https://ai.google.dev/gemini-api/docs/models) y [precios](https://ai.google.dev/gemini-api/docs/pricing). Elegir un modelo de texto Flash/Flash-Lite que admita `generateContent`, salida JSON estructurada y los controles configurados. `GEMINI_MODEL` se deja vacío para evitar activar por defecto un modelo de costo no aprobado. Verificar disponibilidad real con tu clave; los nombres y fechas de retiro cambian.

## Compilar localmente (sin desplegar)

Desde la raíz:

```powershell
npm --prefix functions ci
npm --prefix functions run build
npm run typecheck
npm test
npm run export:check
```

Runtime de producción Node 22. El computador actual utiliza Node 24; compilación y pruebas locales no validan por sí solas el runtime de producción. La salida `functions/lib` incluye el contrato y el catálogo compartidos, y `functions/package.json` apunta al entrypoint compilado.

## Configuración para un piloto privado

Todavía no ejecutar el despliegue sin acordar el presupuesto. Cloud Functions requiere Blaze. App Check está exigido por defecto; el cliente móvil actual aún no obtiene su token. Para probar inicialmente solo con tus cuentas, existe un piloto restringido por UID. Sin App Check y sin una lista explícita de UID, el servidor rechaza a todos. No desactivar esta protección para una distribución pública.

Tras decidir activar los servicios, iniciar sesión en Firebase CLI:

```powershell
npx firebase-tools login
npx firebase-tools functions:secrets:set GEMINI_API_KEY --project que-cocino-6377a
```

El segundo comando pide la clave de forma interactiva. No escribirla como argumento. Preparar `functions/.env.que-cocino-6377a` (ignorado por Git):

```dotenv
CHAT_ENABLED=false
GEMINI_MODEL=REEMPLAZAR_POR_MODELO_ELEGIDO
CHAT_GLOBAL_DAILY_LIMIT=20
CHAT_REQUIRE_APP_CHECK=false
CHAT_PILOT_UIDS=UID_DE_TU_CUENTA_DE_PRUEBA
```

Obtener UID en Firebase → Authentication → Usuarios. No usar el correo en esa lista. Cambiar `CHAT_ENABLED=true` solo cuando estén revisados modelo, presupuesto y piloto. Desplegar exclusivamente esta función:

```powershell
npx firebase-tools deploy --only functions:cookingChat --project que-cocino-6377a
```

Copiar la URL exacta que entrega Firebase CLI. Crear `.env.local` en la raíz:

```dotenv
EXPO_PUBLIC_CHAT_URL=https://URL_REAL_DE_COOKINGCHAT
```

La URL es pública, la clave no. Reiniciar Metro para leerla. Si usas USB, detener la instancia 8082 antes de `npm run start:usb`, mantener `adb reverse tcp:8082 tcp:8082` y abrir el proyecto. No hace falta compilar APK para la pantalla, el endpoint y el piloto privado.

Configurar TTL de `expiresAt` en Firestore para los grupos `chatUsage` y `chatRequests`. Puede generar costos de borrado: revisar antes de activarlo. No crear documentos a mano ni abrir reglas públicas.

## Antes de publicar

Integrar App Check móvil con Play Integrity/servicios de iOS, enviar el token en `X-Firebase-AppCheck` y poner `CHAT_REQUIRE_APP_CHECK=true`. Esa integración podría añadir configuración/biblioteca nativa y exigir otro APK. Hoy solo está preparado el verificador del servidor, no el cliente. Configurar iOS Google/Firebase antes de probarlo allí.

Comprobar con servicio real/emulador: token ausente, revocado, cuenta eliminada, UID fuera del piloto, token App Check inválido, llamadas paralelas (mismo ID y distintos ID), cambio de día, fallo de Gemini y timeout, lease interrumpido, límite global e interruptor. Las pruebas unitarias de reserva no sustituyen probar transacciones concurrentes en Firestore. Añadir protección contra tráfico abusivo al endpoint y revisar costos de infraestructura antes de abrir a otros usuarios.

Pruebas de respuesta: arroz/técnicas, funciones de compras y login, receta del catálogo, despensa no compartida, consultas ajenas, instrucciones para saltarse las reglas, alimentos dudosos y alergias. La app no debe afirmar que ha cambiado datos ni garantizar seguridad médica. Verificar teclado, TalkBack, texto grande y desconexión en el POCO.

## Referencias

- [Gemini generateContent](https://ai.google.dev/api/generate-content)
- [Clave Gemini](https://ai.google.dev/gemini-api/docs/api-key)
- [Verificar ID tokens Firebase](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Secretos de Cloud Functions](https://firebase.google.com/docs/functions/config-env)
- [App Check en servidor](https://firebase.google.com/docs/app-check/custom-resource-backend)
- [Inicio de Cloud Functions y Blaze](https://firebase.google.com/docs/functions/get-started)
