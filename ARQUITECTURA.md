# Ajustes, login y asistente — ¿Qué cocino?

## Ampliación actual: cocinas por UID, borrado y respaldo

Implementada separación local de invitado y cada UID, copia explícita desde Perfil y eliminación de cuenta con confirmación y reautenticación de la misma identidad. Los registros activos son sobres versión 2; `kitchen-v1` queda intacto como respaldo, no se atribuye automáticamente a la cuenta iniciada. El plan previo y las ventanas de recuperación están en `MIGRACION.md`. Apariencia y apodo siguen por dispositivo.

Cliente Firestore REST implementado usando el token Firebase del SDK nativo existente, sin biblioteca nativa nueva. `firestoreReady: false` mantiene desactivado el respaldo hasta crear la base y publicar reglas. Instrucciones en `FIRESTORE.md`. No se ha creado una base ni desplegado reglas desde el agente. No es un listener en tiempo real ni una integración remota ya validada.

Una instantánea pendiente local y el `updateTime` de Firestore permiten escrituras con precondiciones. Ante cambios distintos en ambos dispositivos se comparan contenidos y se pide confirmar cuál copia completa conservar. Se validan formatos antes de sustituir datos. Una escritura remota exitosa con respuesta perdida se reconoce comparando el estado, sin duplicar operaciones. Los errores detienen el reintento automático hasta una acción manual o retorno a primer plano; no hay sondeo continuo.

Si Firestore está configurado, borrar una cuenta primero crea una marca técnica irreversible por UID y elimina su cocina en un commit, luego borra la identidad Firebase y retira el espacio local. La marca no guarda nombre ni correo y las reglas bloquean tokens antiguos; la cocina invitada y otras cuentas se conservan. La eliminación entre servicios no es atómica: si falla la identidad después del commit, hay que reintentar y la cocina remota queda bloqueada. Las pruebas de API son controladas, no prueban el compilador de reglas ni el servicio real. Recorrido móvil nuevo, reglas y sincronización con dos dispositivos siguen pendientes.

Las secciones siguientes detallan las decisiones vigentes y el plan de producto.

Decisiones del 5 de octubre de 2026: la persona quiere login con Google y Firebase, un chatbot para dudas de cocina y de la app y un menú de ajustes. Eligió preparar primero la app y las instrucciones y luego creó el proyecto Firebase.

Estado de Firebase: proyecto `que-cocino-6377a`, Google habilitado y Android `com.quecocino.app` registrado. Certificado EAS `que-cocino-development` generado por la persona; archivo `google-services.json` actualizado y comprobado con cliente OAuth Android tipo 1, huella correspondiente y cliente web tipo 3. Expo vinculado a `@ilhamelin/que-cocino`, ID `f5ce58cf-347b-4d79-92a2-491afcbc66ca`. APK de desarrollo Android compilado e instalado; login confirmado por la persona en el POCO X7 Pro. La persona confirmó restauración tras cierre, cierre de sesión, cancelación y nuevo acceso. Pendiente probar el error de red. Pendientes: identificador, registro, plist y configuración nativa de iOS.

## Lo que ya funciona

Ajustes desde el engranaje: nombre de perfil local, tema (sistema, claro, oscuro), fuente (sistema o serif), tamaño de texto, seguridad y privacidad, ayuda e información. Los cambios de apariencia se aplican a las pantallas y respetan también la escala del sistema. Las pestañas conservan su fuente de navegación nativa; su altura se adapta a la escala de lectura.

SQLite conserva `kitchen-v1` como respaldo y usa los sobres `kitchen-v2:guest` y `kitchen-v2:user:<UID codificado>` para el estado activo. Los ajustes se guardan como `preferences-v1` en la misma tabla `settings`. En web las claves llevan prefijo `que-cocino:` en Local Storage. La migración conserva el modelo interno de ingredientes y compras versión 1; añade espacio por usuario y metadatos. Un formato inválido muestra error y reintento, sin reemplazarlo por valores vacíos.

El login utiliza Firebase Auth nativo y `react-native-nitro-google-signin` con Credential Manager en Android, sin licencia de pago. Está integrado con módulos cargados únicamente en Android fuera de Expo Go. Google detecta el cliente web desde la configuración nativa; el ID token se intercambia con Firebase y no se almacena en nuestros adaptadores SQLite. Firebase gestiona la persistencia de su sesión. El perfil presenta identidad, espera, cancelación, reintento y cierre de sesión. La cancelación no genera una sesión falsa ni un error alarmante. Expo Go, web y iOS sin configurar mantienen el modo local sin cargar estas bibliotecas en tiempo de ejecución.

Esta entrega separa las cocinas por UID y ofrece importación explícita y eliminación con reautenticación. Solo `preferences-v1` sigue por dispositivo. La sincronización está implementada y desactivada hasta configurar Firestore; el chatbot sigue pendiente. Ayuda contiene respuestas fijas y el apodo local no es una identidad autenticada. Antes de distribuir se deben validar los nuevos recorridos físicos y las reglas remotas.

## Firebase frente a SQLite

Firebase es una plataforma; su base documental es Firestore. Authentication resuelve identidad, mientras SQLite resuelve almacenamiento local: no son sustitutos directos.

| Necesidad | SQLite actual | Firebase / Firestore |
| --- | --- | --- |
| Despensa y compras en un celular | Ya funciona, sin servidor | Requiere proyecto y configuración |
| Uso local sin conexión | Disponible en la app | Depende del SDK y su caché |
| Login con Google | No es su función | Firebase Authentication |
| Compartir datos entre dispositivos | Requiere implementar sincronización | Firestore aporta almacenamiento remoto |
| Costos operativos | No genera lecturas remotas | Lecturas, escrituras y funciones deben controlarse |
| Protección por cuenta | Espacios separados por UID dentro de la app | Reglas por UID preparadas; publicación y pruebas remotas pendientes |
| Chatbot con cupos verificables | Un contador en el teléfono se puede alterar | Un servidor puede validar identidad y cupos |

Recomendación para este proyecto: conservar lo local durante la introducción del login y añadir Firebase donde hace falta. No cambiar la base existente solo para iniciar sesión. La eficacia depende de la necesidad: hoy reemplazar SQLite añade trabajo sin mejorar el flujo ya probado; Firebase aporta valor cuando se necesita recuperar o sincronizar datos entre dispositivos.

El SDK JavaScript de Firestore en React Native no ofrece persistencia local, según la [matriz oficial de entornos](https://firebase.google.com/docs/web/environments-js-sdk). El SDK nativo tiene otras capacidades de caché; al pasar a una compilación de desarrollo se debe evaluar si conviene mantener SQLite con una cola explícita o simplificar hacia una caché de Firestore. No implementar dos sistemas de sincronización a la vez.

## Preparar login con Google

El login nativo de Google requiere código nativo y una compilación de desarrollo; no funciona dentro de Expo Go. Véase la [guía oficial de Expo](https://docs.expo.dev/guides/google-authentication/).

1. Crear el proyecto Firebase desde la consola, y habilitar Google en Authentication con el correo de soporte correspondiente.
2. Android ya usa `com.quecocino.app` y está registrado. Elegir y registrar el identificador iOS con la persona antes de preparar su compilación nativa.
3. Preparar la firma de desarrollo Android y registrar los fingerprints exigidos por el proveedor; preparar también los clientes OAuth y sus identificadores para Android/iOS.
4. Incorporar los archivos de configuración y el SDK escogido siguiendo la [guía Firebase de Expo](https://docs.expo.dev/guides/using-firebase/). Instalar las bibliotecas nativas con `npx expo install`, revisar compatibilidad con el SDK y generar una compilación de desarrollo. No entregar archivos de cuenta de servicio ni claves privadas al cliente.
5. Implementar inicio de sesión real, cancelación, errores con reintento, restauración de sesión y cierre de sesión. Mantener «Continuar sin cuenta».
6. Añadir gestión de cuenta y eliminación con reautenticación cuando corresponda; el perfil local no puede servir como prueba de identidad.

Android ya tiene paquete, OAuth, certificado y compilación EAS: la persona confirmó el acceso real con Google en su POCO X7 Pro. Restauración, cierre, cancelación y nuevo acceso confirmados por la persona. Pendientes: error de red; eliminación de cuenta; identificador, archivo plist y configuración nativa/firma de iOS. No se ha desplegado un backend de sincronización o chatbot.

## Datos y sincronización: antes de subir la despensa

- Separar espacio local invitado y espacio de cada UID. Al salir o cambiar de cuenta, no mostrar la caché privada de otra cuenta.
- Pedir una elección explícita antes de importar los datos actuales del invitado a una cuenta. Conservar el original hasta verificar la importación.
- Migración implementada a un sobre versión 2 con espacio por usuario, revisión remota e instantánea pendiente. `kitchen-v1` se valida, copia al invitado y conserva intacto; crear el registro nuevo es una escritura independiente recuperable. Plan y casos de recuperación en `MIGRACION.md`.
- Definir la resolución de cambios y eliminaciones antes de sincronizar: una unión de listas puede volver a introducir elementos borrados. Usar revisiones de servidor, operaciones idempotentes y marcas de eliminación.
- Aplicar reglas que permitan a cada UID acceder solo a sus documentos; nunca confiar en un UID enviado en el cuerpo de una petición.
- Probar dos cuentas, dos dispositivos, modo sin conexión y conflictos de compras antes de habilitar la sincronización.

## Chatbot de cocina y de la app

Flujo propuesto: app autenticada → función del servidor → control de cupos → proveedor del modelo → respuesta a la app. La clave del modelo se guarda en secretos del servidor. Las [funciones callable de Firebase](https://firebase.google.com/docs/functions/callable) permiten recibir identidad autenticada; el servidor debe exigirla y validarla.

El asistente debe usar la guía de uso y el catálogo vigente para explicar funciones y recetas; no inventar ingredientes disponibles ni afirmar que cambió compras o despensa. En una primera entrega será de consulta, sin herramientas que modifiquen datos. El envío del contexto de despensa debe ser opcional y visible. No dar recomendaciones médicas sobre alergias o dietas; las restricciones deben manejarse con datos comprobados.

Límites iniciales propuestos, ajustables tras medir consumo (aún no implementados):

| Control | Propuesta |
| --- | --- |
| Mensajes por persona | 10 al día y 2 por minuto |
| Solicitudes concurrentes | 1 por UID |
| Texto de entrada | Hasta 1.000 caracteres |
| Contexto de conversación | Hasta 6 mensajes, además de un límite total de tokens |
| Respuesta | Hasta 600 tokens |
| Espera | Timeout de 30 segundos; sin reintentos ilimitados |
| Presupuesto global | Cupo diario configurable por servidor con interrupción efectiva al agotarse |

El servidor debe reservar cupos de forma atómica antes de llamar al modelo, usando fecha/hora del servidor (día UTC), y liberar la concurrencia incluso si hay error. El cupo diario debe contar intentos aceptados; así los fallos no se convierten en un mecanismo de llamadas ilimitadas. Usar identificadores de petición para deduplicar reintentos y limitar tamaño del cuerpo antes de procesarlo. Los documentos de cupos no deben ser editables por clientes. Probar concurrencia, cambio de día, timeout y llamadas sin autenticación.

Añadir [App Check](https://firebase.google.com/docs/app-check/cloud-functions) para rechazar clientes no verificados antes de publicar. App Check no sustituye las cuotas ni garantiza por sí solo que no haya abuso. Añadir bloqueo de consultas fuera del alcance, moderación, límites de instancia y un interruptor global. Los límites solo en la app o en el prompt del modelo no son controles suficientes.

Desplegar Cloud Functions requiere el plan Blaze, según la [guía de inicio de Firebase](https://firebase.google.com/docs/functions/get-started). Las alertas de facturación no deben tomarse como un corte automático del consumo: el presupuesto operativo del chatbot debe imponerse en el servidor. No activar servicios facturables sin definir el presupuesto y aprobar la configuración concreta.

La pantalla de chat debe mostrar mensajes enviados y respuestas, estado de espera, falta de conexión, límite alcanzado y reintento sin duplicar solicitudes. El historial y su retención deben definirse antes de persistir conversaciones; no guardar indefinidamente conversaciones completas por defecto.

## Orden de implementación y aceptación

1. Ajustes locales: comprobar tema, fuente y tamaño en todas las pantallas, guardar nombre y cerrar/reabrir; verificar que despensa, compras y favoritas siguen intactas. Esta entrega implementa esa base.
2. Google/Firebase: autenticar en una compilación de desarrollo, conservar sesión tras cierre, cancelar y reintentar; validar cierre de sesión, modo invitado y aislamiento entre dos cuentas.
3. Sincronización: validar importación explícita y recuperación en un segundo dispositivo, con reglas de acceso probadas y sin pérdidas en conflictos.
4. Chatbot: preparar servidor y proveedor, verificar rechazo sin sesión, cupos bajo peticiones paralelas, presupuesto global y ausencia de claves en los paquetes móviles. Luego conectar la pantalla y medir consumo real.

## Otras mejoras a considerar

Porciones ajustables, recetas propias, restricciones alimentarias verificadas, exportación de respaldo y menú semanal. Son propuestas para priorizar después de la base de cuentas; no se añaden a esta entrega.
