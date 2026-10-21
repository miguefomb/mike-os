# Publicación de Mike OS en GitHub y Vercel

- Repositorio público `miguefomb/mike-os`; la plantilla original se conserva como remoto `upstream` y mantiene su licencia MIT.
- Proyecto Vercel `mike-os` en la cuenta de Miguel Fombuena. Dominio `migueos.vercel.app`, autorizado como alternativa corta al dominio inicialmente solicitado, que estaba ocupado.
- Sustitución del adaptador de Cloudflare por `@astrojs/vercel`, Node.js 24 y Sharp explícito. Configuración de cabeceras y caché del CV en `vercel.json`.
- Los tres endpoints de formularios usan un servicio para Resend y contadores atómicos temporales en Upstash; el envío permanece desactivado hasta completar sus variables. Se conservan Turnstile, validación, cifrado y aprobación de reseñas.
- Dominio actualizado en identidad, robots, proyecto del portfolio, CV e imagen social.
- Material de referencia, secretos locales y cachés excluidos de Git y Vercel. No se transfieren credenciales de la web anterior.
- Documentación de despliegue actualizada; la guía original de Cloudflare queda archivada como referencia.
- Validación local: 531 pruebas unitarias, comprobación de tipos sin errores, compilación de Vercel y 36 recorridos de escritorio/móvil. Las tres APIs responden 405 a GET y 503 a POST sin configuración; no se envían mensajes. Se verifican también el dominio del PDF y las cabeceras de la salida compilada.
