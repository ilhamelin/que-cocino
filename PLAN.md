# Plan de producto — ¿Qué cocino?

## Objetivo

Ayudar a una persona a encontrar una comida posible con los ingredientes disponibles, guardar recetas y organizar lo que le falta comprar.

## Primera versión implementada

Inicio orientado a una idea para hoy, despensa editable, detalle de receta, favoritas y compras. La mejor coincidencia prioriza ingredientes faltantes y usa tiempo como desempate. La app funciona sin cuenta y guarda datos en el dispositivo.

### Criterios de aceptación

1. Abrir la app por primera vez muestra una despensa vacía y permite elegir ingredientes o cargar un ejemplo explícitamente.
2. Cambiar ingredientes cambia las coincidencias de las recetas.
3. Abrir una receta muestra cantidades, tiempo, porciones, básicos y pasos.
4. Guardar y quitar una receta actualiza Favoritas.
5. Añadir ingredientes faltantes no crea duplicados en Compras.
6. Marcar una compra y confirmar la lleva a la despensa y la retira de Compras.
7. Cerrar y reabrir conserva datos; se debe comprobar también en teléfonos físicos.
8. Los errores de guardado tienen un mensaje y reintento, sin reemplazar silenciosamente los datos.

## Siguiente etapa: validar en dispositivos

Estado al 5 de octubre de 2026: la persona confirma que la app funciona mediante Expo Go en su POCO X7 Pro con Android y continúa el desarrollo en Antigravity. Android 16 es la versión indicada, pendiente de confirmar. También confirma que despensa, favoritas y compras persisten tras cerrar y reabrir el proyecto en el celular. El resultado está registrado en `VERIFICACION.md`; quedan pendientes los demás casos del recorrido y la validación en iOS.

### 1. Completar un recorrido móvil reproducible

Registrar en `VERIFICACION.md` el dispositivo, sistema operativo, fecha y resultado de cada caso:

- Abrir la app y navegar por las cuatro pestañas; abrir una receta y volver con la navegación del sistema cuando corresponda.
- Cambiar ingredientes y comprobar que cambian las coincidencias; activar y desactivar el filtro de 15 minutos.
- Guardar y quitar una favorita.
- Añadir dos veces los faltantes de una receta y comprobar que Compras no contiene duplicados.
- Marcar una compra, confirmar el traslado y comprobar que aparece en Despensa y desaparece de Compras.
- Cerrar completamente Expo Go y reabrir el proyecto; comprobar que se conservan despensa, favoritas y compras, incluidos sus estados marcados.
- Repetir el recorrido en Android e iPhone cuando haya acceso a ambos, dejando explícito cuál falta.

### 2. Corregir problemas de uso detectados

- Revisar teclado, áreas seguras, pantallas pequeñas y texto grande, incluyendo botones y contenido que pueda quedar oculto.
- Revisar lector de pantalla, contraste, etiquetas y estado de controles seleccionados.
- Comprobar estados vacíos y mensajes de error con reintento; reproducir fallos de almacenamiento de forma controlada en desarrollo.
- Mantener las correcciones dentro de la estructura actual: reglas en `src/domain`, pantallas en `src/app` y persistencia mediante `src/storage`.

### 3. Preparar una ampliación pequeña del catálogo

Después de resolver los problemas que bloqueen el recorrido, elegir recetas e ingredientes a partir de las comidas habituales de la persona. Revisar cantidades, porciones, pasos y básicos de cada receta antes de incorporarla. Mantener por ahora las coincidencias por presencia de ingredientes.

### Criterio de cierre de esta etapa

El recorrido completo y la persistencia están registrados por plataforma probada; no quedan problemas que impidan usar las funciones principales. Los cambios de lógica pasan `npm run typecheck` y `npm test`; los de navegación o dependencias pasan también `npm run export:check`. La exportación no sustituye el recorrido físico.

Las pruebas de interfaz con React Native Testing Library y un recorrido automático con Maestro quedan como trabajo posterior, según los fallos observados y el entorno disponible. Los iconos definitivos y la decisión entre fotografía e ilustración se resolverán antes de la distribución.

## Segunda etapa: despensa más precisa

- Ingredientes personalizados, cantidades y unidades.
- Fechas de vencimiento introducidas por el usuario y recordatorios opcionales.
- Porciones ajustables y escalado de cantidades.
- Restricciones alimentarias y etiquetas comprobadas en el catálogo.
- Migración versionada del almacenamiento al cambiar el modelo.

## Tercera etapa: cuentas y sincronización

- Login con Google mediante Firebase Authentication: proyecto `que-cocino-6377a`, Android registrado, firma EAS y OAuth configurados. APK compilado e instalado; la persona confirmó inicio, restauración tras cierre, cierre de sesión, cancelación y nuevo acceso en el POCO X7 Pro. Pendientes: errores de red e iOS.
- Conservar SQLite para datos locales; evaluar Firestore para sincronización por usuario. Supabase deja de ser el plan vigente.
- Política de acceso por usuario y eliminación de cuenta y datos.
- Sincronización con cola local y resolución explícita de conflictos.
- Catálogo remoto y copias descargadas para uso sin conexión.

## Etapa actual: ajustes, cuentas y asistente

- Implementados ajustes desde el botón de engranaje: perfil local, seguridad y privacidad, apariencia, ayuda e información de la app.
- Tema del dispositivo, claro u oscuro; tamaños estándar, grande y más grande; fuente del dispositivo o clásica. Preferencias persistidas en un registro independiente `preferences-v1`, sin cambiar `kitchen-v1`.
- Identificador Android `com.quecocino.app`; Expo vinculado a `@ilhamelin/que-cocino`. Compilación EAS y recorrido básico de sesión confirmados en el POCO. Separación invitado/cuenta confirmada sin mezcla de datos. La persona confirmó eliminación con retorno al invitado, retirada de Authentication y borrado de cocina remota. Importación y controles negativos de eliminación pendientes. Plan de migración en `MIGRACION.md`.
- Respaldo/sincronización por Firestore REST activo, sin dependencias nativas nuevas. Base y reglas publicadas; primera copia, actualización de despensa, envío manual de cambios guardados sin conexión y separación entre dos cuentas de Google confirmados por la persona. Recuperación y conflictos pendientes de otro dispositivo o emulador. Configuración iOS pendiente. Siguiente desarrollo: preparar chatbot y servidor de cupos; elegir proveedor y presupuesto antes de activar servicios facturables.
- Chatbot Gemini preparado: pantalla con consentimiento y despensa opcional; servidor HTTP con sesión Firebase, cupos atómicos por UID/globales, deduplicación y límite de respuesta. Sin clave, modelo, URL ni despliegue, por lo que aún no ofrece respuestas reales. Siguiente paso: crear clave en AI Studio, elegir modelo y presupuesto, configurar un piloto privado y probar servicio/concurrencia real. App Check móvil y distribución pública pendientes. Instrucciones en `CHATBOT.md`.
- Diseño, requisitos, límites propuestos y criterios de aceptación en `ARQUITECTURA.md`.
- Restricción vigente del chatbot: sin facturación y sin guardar clave Gemini en Firebase. Secret Manager exigió Blaze y el comando se detuvo. Alternativa investigada: Gemini Free Tier y Cloudflare Workers Free con secreto cifrado y Durable Objects SQLite para cupos. Backend actual de `functions/` requiere adaptación; no hay despliegue ni cuenta Cloudflare configurada. Opción local en PC también viable. No seguir el despliegue Firebase previo; decisión y fuentes en `CHATBOT.md`.

## Posibles ampliaciones a validar

Menú semanal, despensa compartida y reconocimiento de ingredientes mediante fotografía. La IA requiere un servicio de servidor para proteger credenciales y controlar costos; no es necesaria para el ranking actual.

## Publicación

Definir marca, identificador iOS, política de privacidad según las funciones reales y cuentas de tiendas. EAS ya está vinculado y Android tiene certificado de desarrollo. Generar una versión de prueba interna antes de publicar. No hay publicación en tiendas.
# Actualización: Worker gratuito preparado (5 de octubre de 2026)

Actualización posterior: Worker publicado y URL pública conectada. Se corrigió la incompatibilidad `redirect: error` del runtime con una prueba de regresión Miniflare; 4 pruebas Worker y 28 app pasan. Gemini 2.5 rechazó el proyecto nuevo con 404; se publicó Gemini 3.5 Flash-Lite manteniendo Nivel gratuito. La persona confirmó una respuesta real en su Android a «¿Cómo cocino arroz?» a las 18:24. Próximas comprobaciones opcionales: contexto de despensa, conversación posterior y limpieza del historial al cambiar cuenta. No se recompiló el APK.

Cloudflare `que-cocino-chat` creado por la persona; secreto Gemini guardado según su confirmación y AI Studio en Nivel gratuito. Backend adaptado en `worker/` con JWT Firebase, comprobación online del usuario/marcador y cuotas SQLite atómicas. UID de prueba autorizado. Compilación simulada y 3 pruebas del Worker pasan; 27 pruebas de la app pasan. No se ha publicado este código ni probado una respuesta real. Próximo paso: login Wrangler, publicar al Worker existente, conectar URL pública y probar en POCO. Mantener Free; sin Secret Manager ni Cloud Functions. Guía vigente: CLOUDFLARE.md.


Actualización del 5 de octubre: cantidades y recetas propias usan Kitchen v2, compatible con lectura v1. Reglas compiladas/publicadas; ver MEJORAS.md para migración, límites, TheMealDB, temporizador y comprobaciones. Las 31 pruebas app, 4 Worker y exportación all pasaron; las nuevas interacciones físicas siguen pendientes.


Actualización 2026-10-06: Kitchen v3 migra v1/v2 sin perder listas, cantidades ni recetas. Añade ingredientes personalizados, plan semanal e historial con notas; Deshacer es solo memoria por sesión. Catálogo local: 40 ingredientes y 30 recetas. Sin API de recetas ni nuevas bibliotecas nativas. Detalles y límites en MEJORAS.md.
