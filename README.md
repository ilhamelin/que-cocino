# ¿Qué cocino?

Una aplicación móvil en español para decidir qué cocinar con lo que tienes, organizar tu despensa y preparar las compras de la semana. Puedes usarla como invitado, sin crear una cuenta, y consultar su catálogo local sin conexión.

Desarrollada con **TypeScript, React Native y Expo Router**, con almacenamiento local en SQLite y funciones opcionales de Google, Firebase y Gemini.

## Funciones

- **Despensa:** 40 ingredientes del catálogo, búsqueda, ingredientes personalizados y cantidades con unidades.
- **Recetas locales:** 30 recetas ordenadas por ingredientes faltantes y tiempo, con favoritos y filtro de recetas rápidas.
- **Tus recetas:** crea y edita recetas propias o guarda una respuesta del asistente después de revisar sus ingredientes y pasos.
- **Porciones y modo cocina:** ajusta cantidades compatibles, sigue la preparación paso a paso y utiliza un temporizador.
- **Compras:** lista sin duplicados, casillas de comprado y traslado a la despensa.
- **Plan semanal:** organiza un plato principal por día y genera una lista de ingredientes para revisar.
- **Historial:** registra lo que cocinaste y añade notas.
- **Deshacer:** recupera hasta cinco cambios recientes durante la sesión de tu cocina.
- **Cuentas independientes:** cada cuenta Google y el invitado tienen su propia cocina. Copiar datos del invitado requiere confirmación.
- **Respaldo opcional:** guarda tu cocina en Firestore, conserva cambios locales sin conexión y permite resolver conflictos explícitamente.
- **Asistente de cocina:** consultas a Gemini con consentimiento, contexto opcional de la despensa y límites de uso.
- **Accesibilidad y apariencia:** tema claro u oscuro, tamaño de texto y fuente ajustables; estados vacíos y errores con reintento.
- **Eliminación de cuenta:** confirmación y reautenticación con Google, conservando las cocinas del invitado y de otras cuentas.

Las recomendaciones comparan la **presencia** de ingredientes. Las cantidades se pueden registrar, pero todavía no se comprueba si alcanzan ni se descuentan automáticamente al cocinar. El temporizador no genera una alarma si cierras la app. El chat conserva la conversación mientras su pantalla está abierta y no modifica tu cocina automáticamente.

## Android: APK autónomo

La versión **0.1.0, compilación 2** fue instalada y abrió en un teléfono físico con Metro detenido y el túnel al computador retirado.

[Descargar APK de Android](https://expo.dev/artifacts/eas/day0aOKagJEGigMSBBASQohmlkeAzaGlj1_JPr4BUmo.apk)

El APK incluye el código y los recursos: puedes abrirlo sin Metro ni un computador. Las funciones locales funcionan sin internet; Google, el respaldo y Gemini necesitan conexión. El asistente está limitado a cuentas autorizadas del piloto.

La app aún no está publicada en las tiendas. La configuración nativa de iOS está pendiente; la vista web sirve para desarrollo. La prueba de arranque del APK no sustituye la verificación de Google, respaldo y chat en esa compilación.

## Desarrollo local

Requisitos: Node.js y npm compatibles con el SDK instalado, y una compilación de desarrollo para probar la autenticación nativa. Abre la carpeta del repositorio en tu editor, por ejemplo Antigravity.

```sh
npm ci
npm run start:dev
```

Instala el APK de desarrollo generado con el perfil `development`, conecta teléfono y computador a la misma red y abre el proyecto desde el QR de Metro. Expo Go permite probar el modo local, pero no incluye las bibliotecas nativas de autenticación de este proyecto.

```sh
# Modo local con Expo Go
npm run start:go

# Vista de desarrollo en navegador
npm run web
```

Para generar una compilación propia con EAS:

```sh
# APK para desarrollo, conectado a Metro
npx eas-cli@latest build --platform android --profile development

# APK autónomo, con recursos incluidos
npx eas-cli@latest build --platform android --profile preview
```

El repositorio conserva los identificadores públicos del proyecto original. Para una instalación independiente, configura tu propio proyecto Firebase, aplicación Android y proyecto EAS, y sustituye los identificadores y URLs correspondientes. Mantén las credenciales de firma fuera de Git. Los cambios llegan mediante Metro al cliente de desarrollo; el APK autónomo necesita una nueva compilación para incorporarlos. EAS Update todavía no está configurado.

## Servicios opcionales

La cocina local no necesita servicios externos ni una API de recetas.

| Servicio | Uso | Configuración |
| --- | --- | --- |
| Firebase Authentication | Sesión con Google y eliminación de cuenta | Configuración pública Android y certificados de firma |
| Cloud Firestore | Respaldo voluntario por cuenta | Base de datos y reglas de `firestore.rules` |
| Cloudflare Worker | Servidor del asistente, validación de sesión y cupos | Configuración local del Worker y secreto de Gemini |
| Gemini | Respuestas del asistente | Clave exclusivamente en el servidor |

Para conectar un servidor propio del asistente, copia `.env.example` a `.env.local` y completa **solo la URL pública**. Las variables `EXPO_PUBLIC_*` se incluyen en la aplicación: nunca pongas una clave secreta en ellas. Si generas un APK, configura también su URL pública en el perfil EAS correspondiente.

Para preparar el Worker:

```sh
npm --prefix worker ci
```

Copia `worker/wrangler.example.jsonc` a `worker/wrangler.jsonc`, completa los identificadores de tu proyecto y los UID autorizados, y guarda `GEMINI_API_KEY` como **Secret en Cloudflare**. La plantilla deja el chat desactivado hasta terminar la configuración. Sigue [CLOUDFLARE.md](CLOUDFLARE.md) para publicar.

La implementación utiliza los niveles gratuitos configurados de Firebase, Cloudflare y Gemini, con cupos de consultas. La disponibilidad depende de los límites de cada proveedor; no hay un cambio automático a servicios de pago. `functions/` se conserva como referencia de una implementación anterior y no es el servidor vigente.

## Datos y privacidad

Los datos se guardan mediante adaptadores de `src/storage`: SQLite en móvil y almacenamiento del navegador en web. El formato está versionado y migra los estados anteriores; la cocina actual usa versión 3 dentro del contenedor de espacios versión 2.

Cada cuenta tiene un espacio separado por UID. El respaldo incluye la cocina y se activa explícitamente; el apodo y la apariencia permanecen en el dispositivo. El asistente envía las consultas y el contexto reciente a Gemini a través del Worker. Compartir ingredientes es opcional. Revisa el aviso de consentimiento antes de utilizarlo.

Los archivos `.env`, claves privadas, cuentas de servicio, credenciales de firma, bases de datos, registros y configuración privada del Worker están excluidos de Git. `google-services.json`, los identificadores Firebase y las URLs públicas son configuración del cliente, **no credenciales administrativas**. Las reglas de Firestore y la validación del servidor controlan el acceso a los datos.

Consulta [SEGURIDAD.md](SEGURIDAD.md) antes de compartir archivos o publicar cambios.

## Estructura

```text
src/app/        Pantallas y navegación con Expo Router
src/data/       Catálogo local de ingredientes y recetas
src/domain/     Reglas de negocio, validación y migraciones
src/state/      Estado, sesiones y coordinación del guardado
src/storage/    Adaptadores de persistencia móvil y web
src/services/   Autenticación, respaldo y cliente del chat
src/ui/         Componentes, editores y modo cocina
worker/         Servidor Cloudflare del asistente
tests/         Pruebas de lógica y persistencia
```

## Verificación

```sh
npm run typecheck
npm test
npm run export:check

npm --prefix worker run typecheck
npm --prefix worker test
npm --prefix worker run build
```

La exportación verifica los paquetes de Metro para Android, iOS y web; **no genera un APK/IPA ni demuestra su funcionamiento en un teléfono**. El build del Worker es una comprobación local sin publicación. Las pruebas realizadas y las pendientes están en [VERIFICACION.md](VERIFICACION.md).

## Documentación

- [Mejoras y límites funcionales](MEJORAS.md)
- [Arquitectura](ARQUITECTURA.md)
- [Persistencia y migraciones](MIGRACION.md)
- [Respaldo y reglas de Firestore](FIRESTORE.md)
- [Asistente en Cloudflare](CLOUDFLARE.md)
- [Compilación e instalación del APK](APK.md)
- [Seguridad del repositorio](SEGURIDAD.md)
- [Plan del proyecto](PLAN.md)

Algunas guías conservan el historial de implementación y pruebas. Este README presenta el estado actual del proyecto.

## Licencia

El repositorio incluye una [licencia MIT](LICENSE).
