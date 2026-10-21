# Publicar Mike OS en Vercel

Proyecto: **mike-os**. Repositorio público: [miguefomb/mike-os](https://github.com/miguefomb/mike-os). Dirección principal: [migueos.vercel.app](https://migueos.vercel.app).

El dominio inicialmente solicitado, `portfoliomigue.vercel.app`, estaba asignado a otra cuenta. Miguel autorizó elegir una alternativa corta y se asignó `migueos.vercel.app` al proyecto.

## Compilación

- Astro 7 con `@astrojs/vercel`, Svelte 5 y Node.js 24.
- Instalar: `pnpm install --frozen-lockfile`.
- Validar: `pnpm check`, `pnpm test` y los E2E afectados contra localhost.
- Compilar: `pnpm build`. El adaptador escribe la salida de Vercel en `.vercel/output/`.
- Las páginas y el contenido se generan al compilar. Solo los tres endpoints de formularios son funciones de servidor.
- `vercel.json` define las cabeceras de seguridad y evita cachear el PDF del CV. La CSP del contenido permanece en las etiquetas meta generadas por Astro.

El repositorio no incluye el material de referencia de `content/`, entornos locales, cachés ni las credenciales de Vercel. `.vercelignore` también los excluye de las subidas desde la CLI.

## Despliegue desde GitHub

El proyecto de Vercel se conecta a `https://github.com/miguefomb/mike-os`, rama de producción `main`. Las siguientes subidas a esa rama generan un nuevo despliegue.

En el panel de Vercel: framework **Astro**, Node.js **24.x**, build `pnpm build` e instalación `pnpm install --frozen-lockfile`. El archivo `package.json` fija pnpm 11.2.2.

La CLI también permite publicar desde la carpeta vinculada:

```powershell
pnpm dlx vercel --prod --yes --scope miguel-fombuena
```

La carpeta local se vincula con `pnpm dlx vercel link --yes --project mike-os --scope miguel-fombuena`. Su estado `.vercel/` y los entornos descargados no se suben a Git.

## Formularios opcionales

El portfolio funciona sin configurar los servicios de envío. Hasta completar la configuración, Correo y Libro de visitas devuelven `503 not_configured` y no envían mensajes. No se copian credenciales de la web anterior.

En Vercel > Settings > Environment Variables se configuran las variables descritas en `.env.example`:

| Variable | Uso |
| --- | --- |
| `RESEND_API_KEY` | Enviar con Resend |
| `CONTACT_FROM` | Remitente de un dominio verificado |
| `CONTACT_TO` | Destino fijo de los mensajes y reseñas |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clave pública del widget, disponible al compilar |
| `TURNSTILE_SECRET_KEY` | Verificación anti-bots en el servidor |
| `GUESTBOOK_SECRET` | Clave aleatoria de al menos 32 caracteres para confirmar reseñas |
| `SITE_URL` | `https://migueos.vercel.app`, también usado como valor por defecto |
| `UPSTASH_REDIS_REST_URL` | Endpoint de los contadores compartidos |
| `UPSTASH_REDIS_REST_TOKEN` | Credencial del límite distribuido |

Los límites conservan 3 envíos/minuto por IP en Correo, 5 peticiones/minuto por IP en reseñas y una petición/minuto por correo/token. Los contadores son atómicos, caducan al minuto y usan huellas de las claves en lugar de IP o correos en texto claro. Un fallo del proveedor del límite bloquea los envíos.

El widget debe autorizar `migueos.vercel.app`. Después de configurar las variables se necesita una nueva compilación para incorporar su clave pública. En desarrollo se puede usar `.env.local`, que está ignorado por Git; `.dev.vars` y Wrangler pertenecen a la plantilla anterior y ya no se utilizan.

## Contenido y mantenimiento

- Dominio canónico: `src/content/persona.ts`; robots: `public/robots.txt`.
- CV: editar `src/content/sobre-mi.md` y ejecutar `node scripts/generar-cv.mjs`.
- Imagen social: ejecutar `node scripts/generar-imagenes.mjs` si cambia la identidad, la foto o el dominio.
- Repositorios públicos: `node scripts/actualizar-repos.mjs`.
- La guía original de Cloudflare se conserva en `docs/legacy/despliegue-cloudflare.md` como referencia histórica.
