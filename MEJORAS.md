# Cocina local, recetas, planificación e historial

- Inicio: catálogo local de 40 ingredientes y 30 recetas, con buscador de nombres en español sin conexión. TheMealDB fue retirado por petición de la persona; no hay consultas a esa API.
- Despensa: cantidades positivas hasta 100.000, con unidad explícita. Quitar un ingrediente retira su cantidad. El sistema aún compara presencia, no calcula suficiencia ni descuenta existencias al cocinar.
- Asistente: preguntas sugeridas, borrador en memoria de la cocina activa al salir, limpieza al cambiar de cuenta/cerrar la app. Desactivar compartir borra conversación y borrador; las cantidades no se envían. Las conversaciones no se respaldan.
- Guardar una respuesta: revisión explícita en editor. Se reconocen las secciones Ingredientes y Pasos cuando existen; si la respuesta es libre se conserva como borrador de preparación y hay que completar los ingredientes. No se realiza una segunda llamada a Gemini para convertirla.
- Favoritas → Mis recetas: hasta 30 recetas propias por cocina, editar/eliminar con confirmación, fuente original y modo cocina. La selección para Compras es explícita y limitada al catálogo; ingredientes externos desconocidos permanecen en la receta.
- Modo cocina: pasos grandes, anterior/siguiente y temporizador por hora objetivo. Se recupera el tiempo al volver desde segundo plano mientras la receta siga abierta. No hay audio/alarma/notificaciones con la app cerrada; salir de la receta cancela el temporizador.

## Mejoras añadidas el 6 de octubre

- Porciones: de 1 a 20. Se ajustan cantidades explícitas iniciales (incluidas fracciones y decimales); rangos, textos libres, básicos y tiempos quedan sin modificar. Recetas antiguas sin porciones de base requieren editar ese dato antes de escalar.
- Ingredientes personalizados: hasta 100 por cocina; nombre único, presencia, cantidad, compras y casilla comprado. Comprar traslada los marcados conservando los demás. También se comparten sus nombres con Gemini solo al marcar Compartir ingredientes; no se envían cantidades, plan ni notas.
- Plan semanal en Inicio: un plato principal por día, semanas de lunes a domingo, catálogo y recetas propias, porciones por día. Puede abrirse el detalle con esas porciones. Hasta 84 días planificados. Reúne faltantes por presencia sin duplicados; ingredientes de recetas propias no reconocidos se muestran para revisión, nunca se omiten silenciosamente.
- Historial en Inicio: últimas 100 preparaciones con fecha, porciones y notas de hasta 500 caracteres. Conserva nombre/fecha aunque la receta se elimine; se puede editar la nota o borrar el registro.
- Deshacer: hasta cinco cambios en memoria de la cocina actual, mediante el botón inferior. Revierte la cocina completa, incluidas cantidades, listas, planes e historial. Se borra al cerrar, cambiar cuenta, importar invitado o descargar otra copia remota; no deshace eliminar una cuenta. No se permite deshacer durante sincronización/conflictos.
- Catálogo propio ampliado: 40 ingredientes y 30 recetas en español, sin API de recetas ni dependencias nativas adicionales.

## Migración y respaldo

El sobre Workspace sigue en versión 2 y conserva sus claves por invitado/UID. El estado interno Kitchen migra v1/v2 a v3, conservando listas, cantidades y recetas. Se añaden `customIngredients`, `mealPlan` y `cookHistory` vacíos. Se leen copias remotas v1, v2 y v3. La escritura remota es v3; un campo `extras` JSON acotado a 120.000 caracteres contiene las tres colecciones nuevas; cantidades y recetas se serializan en campos JSON string acotados (8.000/180.000 caracteres), validados rigurosamente al leer en el cliente. Las reglas mantienen propietario, cuenta activa, catálogo y límites. El invitado nunca se sube automáticamente. Importar copia también cantidades/recetas; una cantidad ya definida en la cuenta tiene prioridad. Si la combinación excede los límites se rechaza completa sin reemplazar datos.

Las reglas actualizadas fueron compiladas y publicadas en `que-cocino-6377a` sin activar facturación. Las versiones anteriores de la app rechazan la copia v3: usar esta versión para probar sincronización.

## TheMealDB retirado (historial)

La integración anterior utilizaba su clave pública de prueba `1`, permitida para desarrollo/educación. [La documentación oficial](https://www.themealdb.com/api.php) exige hacerse colaborador para publicar en una tienda; no se contrató un plan. El contenido original puede estar en inglés, sin traducción automática ni consumo de Gemini. Se preserva fuente, cantidades e instrucciones. Antes de publicar un APK para distribución pública, retirar/desactivar esta integración o resolver el permiso de producción con el proveedor.

## Verificación

Typecheck de app y Worker: pasaron. 31 pruebas de app y 4 de Worker: pasaron. Exportación de Metro para Android/iOS/web: pasó, sin generar APK. Consulta pública real: filtro Rice devolvió 30 resultados; detalle 52771 validó 8 ingredientes y 3 pasos. No se invocó Gemini para estas comprobaciones. Quedan pruebas manuales de las nuevas pantallas y persistencia en Android; no confundirlas con los flujos anteriores ya comprobados.

Comprobación visual en Android: Inicio muestra Revuelto de champiñones del catálogo ampliado; enlace que-cocino://explore abre Recetas del mundo con búsqueda y selector. Capturas locales .expo/que-cocino-mejoras.png y .expo/que-cocino-explore.png. No se probaron todavía guardado/edición/cantidad/temporizador mediante interacción física. Worker publicado: 8897032b-31d0-40e5-b889-f94e56baa5b9.

Estado actual: retirado src/services/meals.ts; /explore es catálogo local. Se conserva el formato de las recetas externas previamente guardadas para no borrar datos. Gemini y Firestore siguen habilitados según la configuración previa.
