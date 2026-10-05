# ¿Qué cocino?

Primera versión funcional de una aplicación móvil para decidir qué cocinar con los ingredientes que tienes. Interfaz en español, con apariencia clara u oscura según el dispositivo.

## Abrir en Antigravity

Abre **esta carpeta completa** como proyecto: `outputs/que-cocino`. Abre su terminal integrada y ejecuta:

```powershell
npm install
npm start
```

Las dependencias ya están instaladas en el equipo donde se creó el proyecto. Al copiarlo a otro equipo, usa `npm ci` para reproducir las versiones del archivo de bloqueo.

Instala Expo Go en un Android o iPhone compatible con el SDK del proyecto. Conecta el teléfono y el computador a la misma red y abre el QR que muestra Expo. En Android usa el lector de Expo Go; en iPhone, la cámara. Si Expo Go no admite aún el SDK instalado, utiliza una compilación de desarrollo compatible; no cambies versiones individuales al azar.

Para una vista en navegador:

```powershell
npm run web
```

La vista web es una herramienta de desarrollo. La aplicación móvil usa SQLite; la vista web usa almacenamiento local del navegador.

## Qué funciona

- Despensa con selección y búsqueda entre 12 ingredientes.
- Catálogo de 8 recetas con cantidades para 2 porciones e instrucciones.
- Recetas ordenadas por menos ingredientes faltantes y luego menor tiempo.
- Filtro de recetas de hasta 15 minutos.
- Favoritos persistentes.
- Lista de compras sin duplicados, con casillas y eliminación individual.
- Traslado de ingredientes comprados a la despensa.
- Persistencia local y mensajes con reintento si la lectura o escritura falla.
- Estado vacío inicial y botón explícito para probar ingredientes de ejemplo.
- Menú de ajustes desde el engranaje: perfil, seguridad y privacidad, apariencia, ayuda e información.
- Login real con Google/Firebase preparado para la compilación de desarrollo Android: identidad en Perfil, restauración por el SDK nativo, cancelación, errores con reintento y cierre de sesión. Inicio, restauración tras cierre, cierre de sesión, cancelación y nuevo acceso confirmados por la persona en el POCO; pendiente error de red.
- Tema del dispositivo, claro u oscuro; tamaño de texto y fuente clásica o del dispositivo, con persistencia local.
- Cocinas independientes para invitado y cada UID de Firebase, con copia explícita del invitado desde Perfil. Los datos anteriores se conservan como invitado y en el registro original de respaldo.
- Eliminación de cuenta desde Seguridad, con confirmación y reautenticación de la misma cuenta de Google. Invitado y otros UID se conservan. Pendiente probar el borrado real en el celular.
- Pantalla Respaldo y sincronización y cliente Firestore REST preparados; desactivados hasta crear la base y publicar las reglas. Cola de instantáneas local, revisión remota, conflictos con elección explícita y reintento.

Las coincidencias comparan presencia de ingredientes: todavía no gestionan existencias por cantidad ni fechas de vencimiento. Los básicos como aceite y sal se muestran dentro de cada receta. Las ilustraciones usan emojis y los iconos de lanzamiento son provisionales.

## Consultar la base de datos del celular

La app móvil guarda el estado en SQLite, en `que-cocino.db`, tabla `settings` con columnas `key` y `value`. La fila anterior `kitchen-v1` se conserva como respaldo. El estado activo usa `kitchen-v2:guest` y `kitchen-v2:user:<UID codificado>`; cada JSON versión 2 contiene `kitchen` (estado versión 1), `importDecision` y `sync` (activación, cambios pendientes, revisión remota y última sincronización). El catálogo sigue en `src/data/catalog.ts`. El plan previo de migración y recuperación está en `MIGRACION.md`.

Con `npm start` ejecutándose y el proyecto abierto en Expo Go en el POCO:

1. En la terminal donde está Expo, pulsa **Shift + M**.
2. Selecciona **Open expo-sqlite** para abrir el inspector en el navegador.
3. Selecciona el dispositivo conectado si hay varios, la base `que-cocino.db` y la tabla `settings`.
4. Consulta los espacios actuales y el respaldo antiguo:

```sql
SELECT key, value FROM settings WHERE key LIKE 'kitchen-v2:%' OR key = 'kitchen-v1';
```

El inspector está incluido en la versión instalada de `expo-sqlite`; no hace falta añadir paquetes. Si la base no aparece, mantén Expo Go abierto y conectado al mismo servidor, recarga la app y actualiza el inspector. Actualiza la consulta después de cambiar datos en el celular. Editar la fila manualmente no actualiza el estado que React tiene en memoria y un guardado posterior puede sobrescribirla.

La vista web usa otro almacenamiento: en las herramientas de desarrollo del navegador, abre **Application → Local Storage** y busca `que-cocino:kitchen-v2:guest`. Sus datos son independientes de los del celular; el registro antiguo `que-cocino:kitchen-v1` queda como respaldo de migración.

Los ajustes están en otra fila, `preferences-v1` (en web, `que-cocino:preferences-v1`). Su JSON incluye `version`, `displayName`, `theme`, `font` y `textSize`; no transforma ni reemplaza los datos de la despensa.

Referencia: [inspector SQLite de Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/#browse-an-on-device-database).

## Si el celular queda cargando o no recibe la recarga de Metro

La app debe tener abierto el proyecto servido por Metro, no solo el menú del cliente de desarrollo. Un aviso «No apps connected» significa que esa instancia de Metro no tiene una app React Native conectada. No requiere reinstalar ni borrar datos.

Para probar por el USB ya utilizado con scrcpy en este equipo Windows:

```powershell
& 'C:\Users\benja\OneDrive\Documentos\scrcpy-win64-v4.1\adb.exe' reverse tcp:8082 tcp:8082
npm run start:usb
```

Si ADB está en PATH, puedes sustituir la ruta por `adb`. En la app de desarrollo abre `http://127.0.0.1:8082` o el QR del nuevo servidor. Mantén el cable conectado. Esta modalidad usa el puerto 8082 y prioriza IPv4, porque en este equipo `--localhost` sin esa opción escuchó solo en `::1` y el túnel de Android a `127.0.0.1` falló. Si ya hay un servidor en ese puerto, utiliza su terminal para recargar o detenlo antes de iniciar otro.

Para trabajar por Wi-Fi sigue usando `npm run start:dev`, la dirección LAN que muestra Metro y la misma red en computador y teléfono. No se han cambiado las reglas del firewall ni desactivado protecciones del sistema.

## Tecnología del proyecto

TypeScript, React Native, Expo, Expo Router, `expo-sqlite`, `@expo/vector-icons` y `react-native-safe-area-context`. Estado con Context y reducer de React. Las versiones instaladas y fijadas se encuentran en `package.json` y `package-lock.json`.

## Estructura

```text
src/app/             Pantallas, pestañas y navegación
src/data/            Catálogo de ingredientes y recetas
src/domain/          Ranking, acciones y validación de datos
src/state/           Estado compartido, carga y guardado secuencial
src/storage/         Adaptadores SQLite móvil y almacenamiento web
src/ui/              Componentes y colores compartidos
tests/               Pruebas de reglas de negocio
```

## Comprobaciones

```powershell
npm run typecheck
npm test
npm run export:check
```

Las pruebas usan el runner integrado de Node y `tsx`. La exportación comprueba que Metro puede generar los paquetes de Android, iOS y web; no sustituye las pruebas en teléfonos ni genera un APK o IPA.

## Publicar más adelante

El proyecto está vinculado a `@ilhamelin/que-cocino` en EAS y tiene el paquete Android `com.quecocino.app`. Antes de distribuir: configurar iOS, probar separación/borrado/sincronización en dispositivos, validar reglas, diseñar iconos y configurar las cuentas de tiendas. En Windows puedes desarrollar y usar compilaciones iOS en la nube; el simulador iOS local requiere macOS y Xcode.

## Instalar la versión de desarrollo Android con Google

Firebase `que-cocino-6377a` tiene Google habilitado, Android registrado y el certificado EAS incorporado en el `google-services.json` actualizado. Las bibliotecas nativas y sus plugins ya están instalados; no copies los ejemplos de Gradle de Firebase en archivos TypeScript.

Desde la carpeta del proyecto, con tu cuenta Expo iniciada:

```powershell
npx eas-cli@latest build --platform android --profile development
```

Usa las credenciales existentes `que-cocino-development`. Al terminar, abre el enlace de EAS en el teléfono y descarga e instala el APK. La compilación no publica en las tiendas. Después detén el Metro anterior con Ctrl+C y ejecuta:

```powershell
npm run start:dev
```

Abre el QR con la app de desarrollo instalada, entra a Ajustes → Perfil → Continuar con Google. El recorrido básico de login ya fue confirmado por la persona. La autenticación envía identidad a Google/Firebase; la cocina solo se sube al activar respaldo después de configurar Firestore. Cada UID y el invitado tienen espacios separados. Los datos anteriores están en Invitado; Perfil ofrece copiarlos con confirmación. Apariencia y apodo siguen siendo ajustes del dispositivo.

La app instalada tiene datos independientes de Expo Go y de la web; empieza vacía. Expo Go conserva los datos anteriores. Para seguir probando el modo local con Expo Go usa `npm run start:go`; las bibliotecas de autenticación no se inicializan dentro de Expo Go ni en la vista web. iOS mantiene el modo local en Expo Go; su compilación nativa requiere antes registrar iOS y configurar su archivo plist, identificador y enlaces de frameworks. Una exportación Metro de iOS no comprueba ese proceso.

Las claves de firma y contraseñas del keystore deben permanecer fuera del repositorio. El archivo público de configuración `google-services.json` no es una cuenta de servicio.

## Documentación oficial

- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Compilaciones](https://docs.expo.dev/build/setup/)

El plan de producto y los criterios de aceptación están en `PLAN.md`.

El diseño está en `ARQUITECTURA.md`. La compilación EAS Android y el recorrido básico de sesión fueron confirmados en el POCO. Separación, importación y eliminación ya están implementadas, pendientes de prueba móvil. Firestore REST está preparado pero desactivado: sigue `FIRESTORE.md` para crear la base, publicar `firestore.rules` y activarlo. No se necesita otro APK para estos cambios de TypeScript; usa Fast Refresh o recarga con `r` en Metro. Chatbot e iOS nativo siguen pendientes.
