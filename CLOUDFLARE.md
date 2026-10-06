# Chat gratuito en Cloudflare

**Estado verificado:** la persona recibió en su Android una respuesta real de Gemini a «¿Cómo cocino arroz?» el 5 de octubre de 2026 a las 18:24, con consentimiento activo y sin compartir despensa. Worker vigente: Gemini 3.5 Flash-Lite, despliegue `d46de90c-7d5e-4350-8dd5-dec633fffe28`. La guía de publicación siguiente sirve para futuras actualizaciones; el servidor ya está publicado y `.env.local` conectado.

Implementación vigente: `worker/`. El Worker creado por la persona es `que-cocino-chat`, con URL `https://que-cocino-chat.benjaigancioreyes56.workers.dev`. La persona confirmó que su clave Gemini figura en **Nivel gratuito** y que guardó el secreto en Cloudflare. No se leyó ni verificó su valor. Mantener Workers Free y Gemini Free Tier; no activar facturación. No desplegar `functions/` ni usar Firebase Secret Manager.

## Publicar

La persona publicó el Worker el 5 de octubre de 2026, versión `2f2ecf20-2bb2-49b1-86ba-895fe9c2d700`, según la salida de Wrangler compartida. `.env.local` ya contiene la URL pública terminada en `/chat`. Reiniciar Metro y probar desde la cuenta autorizada; todavía no se confirmó una respuesta real de Gemini.

1. El secreto `GEMINI_API_KEY` debe estar en el Worker, tipo Secret. No introducirlo en el cliente ni enviarlo al chat. Wrangler conserva los secretos existentes durante el despliegue.
2. En `worker/wrangler.jsonc`, `CHAT_PILOT_UIDS` contiene los UID de prueba, separados por comas. Se obtienen en Firebase → Authentication → Usuarios. Sin UID autorizado se deniega el acceso. Cambiar `CHAT_ENABLED` a `true` solo cuando el piloto esté configurado.
3. Modelo vigente: `gemini-3.5-flash-lite`, documentado con texto gratuito y recomendado por Google para proyectos nuevos. El anterior `gemini-2.5-flash-lite` respondió 404; Google limita el acceso a 2.5 a proyectos con uso previo. Mantener el proyecto de la clave en Nivel gratuito. La disponibilidad y cuota se verifican con una consulta real; no hay cambio automático a modelos de pago. `FIREBASE_API_KEY` es el identificador **público** del proyecto Firebase, obtenido de `google-services.json`; no es la clave de Gemini ni una cuenta de servicio.
4. Desde la raíz del proyecto:

```powershell
npm --prefix worker run login
npm --prefix worker run deploy
```

El primer comando abre Cloudflare en el navegador para autorizar la herramienta. El segundo reemplaza Hello World y configura el Durable Object con SQLite. Si pregunta por conservar secretos, conservarlos. No pegar la clave en la terminal ni añadir un método de pago. Si Cloudflare pide pasar a Paid, detener ese paso y revisar el error: esta configuración utiliza `new_sqlite_classes`, disponible en Free.

5. Crear `.env.local` en la raíz con **solo la URL pública**:

```dotenv
EXPO_PUBLIC_CHAT_URL=https://que-cocino-chat.benjaigancioreyes56.workers.dev/chat
```

Reiniciar la terminal de Metro que atiende el teléfono: Ctrl+C y `npm run start:usb` si se usa el servidor USB 8082, o `npm run start:dev` si se usa la red local. El reinicio permite leer la variable. La app debe reconectar a esa misma instancia. No es necesario otro APK para estos cambios TypeScript.

6. En el celular: Ajustes → Asistente de cocina. Iniciar sesión con una cuenta autorizada, aceptar enviar las consultas y probar «¿Cómo cocino arroz?». Compartir despensa es opcional. Comprobar errores, cupos y que cerrar o cambiar cuenta borra el historial de pantalla.

## Seguridad y límites

Las llamadas del servidor usan `redirect: manual` y rechazan respuestas 3xx, para conservar las credenciales en su destino original. El runtime utilizado rechazó `redirect: error`; la incompatibilidad se reprodujo y quedó cubierta por una prueba en Miniflare.

El servidor valida firma RS256, emisor, audiencia, caducidad y tiempos del ID token Firebase con `jose` y claves públicas de Google. Comprueba el usuario con Firebase Auth REST (`accounts:lookup`), estado deshabilitado y `validSince`, y consulta el marcador Firestore de cuenta eliminada. Repite esas comprobaciones antes de devolver la respuesta. Los errores no exponen tokens, mensajes o claves; no hay credenciales Admin ni cuentas de servicio en Cloudflare.

Piloto privado por lista de UID: aún no se integra App Check móvil ni se abre a todos los usuarios. La clave Gemini solo se usa en la cabecera de la llamada del Worker a Google. No se cambia la cocina desde el chat.

Un único Durable Object con SQLite reserva cuotas de forma atómica: 10 intentos diarios por UID, 2 por minuto UTC, una consulta simultánea por UID y 20 intentos globales diarios. Intentos fallidos consumen cupo. El lease dura 120 segundos. IDs repetidos no vuelven a llamar a Gemini durante su retención de 48 horas. SQLite guarda hashes del UID/cuerpo, IDs de petición, contadores y estado; no guarda consultas, respuestas, correos ni tokens. Una alarma limpia metadatos expirados; en una interrupción del servicio la ejecución de la alarma puede demorarse.

No hay historial persistente de conversación: no se cambia el formato de la cocina. Se comparte con Google el historial corto visible y la despensa solo con consentimiento. Gemini Free Tier puede usar el contenido para mejorar productos de Google. El alcance culinario depende del modelo y debe probarse, no se considera una garantía infalible.

El cliente espera hasta 65 segundos; Gemini aborta a los 25 segundos y cada comprobación remota a los 8 segundos. Los cupos son de llamadas, no un corte de dinero: la ausencia de facturación depende de **mantener ambos proyectos en los niveles gratuitos**. Si se agotan cuotas de Gemini/Workers/SQLite, se muestra error; no hay un proveedor de pago alternativo.

## Comprobaciones locales

```powershell
npm --prefix worker run typecheck
npm --prefix worker run build
npm --prefix worker test
npm run typecheck
npm test
```

`build` es un despliegue simulado local, no publica. Las pruebas usan SQLite de Miniflare para concurrencia, deduplicación, cupo global y persistencia tras reinicio; firma JWT local y mocks de Auth/Firestore. No llaman a Gemini ni validan un despliegue real. La comprobación en el teléfono sigue pendiente hasta publicar.

Fuentes: [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), [SQLite Durable Objects Free](https://developers.cloudflare.com/durable-objects/platform/pricing/), [secretos](https://developers.cloudflare.com/workers/configuration/secrets/), [validación Firebase](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [precios Gemini](https://ai.google.dev/gemini-api/docs/pricing).
