# APK autónomo de Android

Perfil EAS `preview`: `developmentClient: false`, distribución interna, Android `buildType: apk`, credenciales remotas existentes y versión de compilación incremental. Incluye la URL pública del Worker en el perfil; no depende de `.env.local` para la nube ni contiene la clave de Gemini.

La compilación incluye JavaScript, imágenes y fuentes. Para abrir la app no se necesita Metro ni un computador. Despensa, recetas locales/guardadas, cantidades, plan semanal e historial funcionan localmente. Google, respaldo y Gemini necesitan internet.

Comando desde la carpeta del proyecto:

```powershell
npx eas-cli@latest build --platform android --profile preview
```

No publica en tiendas. No cambiar las credenciales `que-cocino-development`: se conserva `com.quecocino.app` y la firma, para instalar como actualización. Si Android rechaza la actualización por firma, detenerse; no desinstalar ni borrar datos para forzarla.

Cuando el APK esté disponible, descargarlo e instalarlo sobre la app actual. Comprobar apertura con Metro detenido y USB desconectado. Después comprobar despensa sin internet y, con internet, sesión Google, respaldo y una respuesta del asistente. No confundir exportaciones Metro con el APK ni con estas pruebas físicas.

`.easignore` conserva las exclusiones de Git y excluye Worker, Functions y tests del archivo enviado. `google-services.json` es configuración pública necesaria para Android; la clave Gemini permanece solo en Cloudflare.

Referencias: https://docs.expo.dev/build-reference/apk/ y https://docs.expo.dev/eas/environment-variables/

Compilación del 2026-10-06 terminada: https://expo.dev/accounts/ilhamelin/projects/que-cocino/builds/5c190997-c095-4fcf-83fa-6bc2fa4aa94c . APK: https://expo.dev/artifacts/eas/day0aOKagJEGigMSBBASQohmlkeAzaGlj1_JPr4BUmo.apk . Copia local .expo/que-cocino-preview-v2.apk (114.841.256 bytes); SHA-256 ab37c7abba8459d87fa7efddad3b4fce405760942e7acc1cdd0c0ec6483df41a. Archivo ZIP validado, contiene assets/index.android.bundle y URL pública del chat. Instalado con adb install -r: Success; Android reporta versión 0.1.0, versionCode 2 y sin DEBUGGABLE. Metro 8082 detenido y túnel USB retirado.

Arranque físico confirmado en POCO con el APK release v2: Metro 8082 sin listener, túnel retirado, cierre completo y apertura desde MainActivity/lanzador. Pantalla Inicio visible en .expo/que-cocino-apk-autonomo.png; se mantiene apariencia local. La primera captura negra correspondía a dispositivo Dozing, no a una excepción de la app; tras despertar se ve la cocina. No se modificaron WiFi/datos móviles ni se hizo una consulta Gemini para esta prueba. Google/respaldo/chat del APK release siguen pendientes de prueba manual con la cuenta.
