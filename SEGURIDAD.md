# Seguridad del repositorio

## Qué mantener fuera de Git

- Claves de Gemini y de otros proveedores, tokens de acceso y archivos `.env` reales.
- Cuentas de servicio de Google/Firebase y sus claves privadas.
- Keystores, contraseñas de firma, certificados privados y `credentials.json`.
- Bases SQLite, registros y capturas que muestren cuentas, correos o datos de usuarios. Guarda las capturas privadas en `private/`.
- `worker/wrangler.jsonc`: configuración local que contiene los UID autorizados del piloto. Comparte `worker/wrangler.example.jsonc` como plantilla.

Estas categorías están cubiertas por `.gitignore`. Un archivo privado con otro nombre o datos personales dentro de un documento necesita revisión antes de subirlo. No añadas archivos ignorados con `git add -f`.

## Qué es público

`google-services.json` contiene configuración de una aplicación Firebase cliente: identificadores, clave API cliente y clientes OAuth. No es una cuenta de servicio. Se conserva para que Android pueda compilar. Las URLs del servidor, identificadores EAS y reglas Firestore también son públicos; no conceden permisos administrativos.

La clave Gemini permanece exclusivamente como Secret en Cloudflare. Nunca debe entrar en código móvil, variables `EXPO_PUBLIC_*`, documentación, capturas ni ejemplos. Los UID de prueba no son contraseñas, pero se mantienen en la configuración local por privacidad.

## Antes de publicar

```sh
git status --short
git diff --cached --stat
git check-ignore .env.local worker/wrangler.jsonc
```

Revisa también el contenido de los cambios preparados antes de hacer commit. Mantén las reglas Firestore y los controles de autenticación del Worker: ocultar la configuración del cliente no reemplaza el control de acceso.

## Si una credencial ya se publicó

`.gitignore` no elimina archivos ya versionados ni borra el historial de GitHub. Revoca o rota la credencial en el proveedor, deja de versionar el archivo y limpia el historial afectado cuando corresponda. La limpieza remota debe coordinarse con quienes utilizan el repositorio.

La revisión del 6 de octubre de 2026 comprobó los archivos publicables del árbol local y sus dos commits alcanzables con patrones para claves privadas, cuentas de servicio, tokens y asignaciones de claves Gemini, sin encontrar coincidencias de esas credenciales. La configuración local del Worker contenía el UID del piloto y ahora está excluida. Esta comprobación no cubre ramas o archivos remotos que no estén disponibles localmente ni garantiza detectar cualquier tipo de secreto.
