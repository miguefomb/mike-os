# Despliegue

> **Plantilla:** guía general para publicar tu copia en Cloudflare. La de Pol OS era la de su propio dominio; esta sirve para cualquiera.

Pol OS se publica como un Worker de Cloudflare con activos estáticos. El agente prepara el despliegue, pero lo lanzas tú.

## 0. Antes de empezar

- Una cuenta de Cloudflare y tu repositorio en GitHub (público o privado).
- Tu dominio con los DNS en Cloudflare. Hace falta para el envío de correo (Email Sending exige Cloudflare DNS).
  Sin dominio puedes probar en la dirección `workers.dev`, pero el Correo y el Libro de visitas no enviarán nada.
- Tus datos ya cambiados: `src/content/persona.ts` (con `siteUrl`), `src/content/`, la foto de `src/assets/`, y
  `SITE_URL` y `CONTACT_FROM` en `wrangler.jsonc`.

## 1. Envío de correo (Email Sending)

Cloudflare → **Email** → **Email Sending**:

1. Da de alta un **subdominio** para enviar, por ejemplo `m.tudominio.com`. Así la reputación de envío queda separada
   de la raíz. Cloudflare añade solo sus registros DNS.
2. Verifica la **dirección de destino**: tu correo, donde quieres recibir los mensajes. Se hace en Email Routing →
   Destination addresses.
3. En `wrangler.jsonc` pon el remitente en `CONTACT_FROM` y en `allowed_sender_addresses`, por ejemplo
   `contacto@m.tudominio.com`.

## 2. Widget de Turnstile (anti-bots)

Cloudflare → **Turnstile** → **Add widget**, en modo **Managed**. En **Hostnames** añade tu dominio, `www` si lo usas y,
mientras pruebas, la dirección `workers.dev` del Worker (la tendrás en el paso 3). Copia la **clave pública** (Site Key)
y la **secreta** (Secret Key).

## 3. Crear el Worker conectado a GitHub

Cloudflare → **Workers & Pages** → **Create** → **Import a repository** (Workers Builds).

1. Autoriza la app de GitHub de Cloudflare para tu repositorio.
2. El **nombre del Worker** tiene que coincidir con el `name` de `wrangler.jsonc` (`pol-os-template`, o el que pongas).
   Si no, la compilación falla con "The name in your Wrangler configuration file must match".
3. Rama de producción: `main`.
4. Comandos:

   | Campo | Valor |
   |-------|-------|
   | Build command | `pnpm build` |
   | Deploy command | `npx wrangler deploy` |
   | Root directory | (vacío) |

5. En **Build variables and secrets** (las de compilación) añade `PUBLIC_TURNSTILE_SITE_KEY` con la **clave pública**.
   Se compila dentro de la página: si falta, el formulario dirá que la verificación anti-bots no está configurada.
6. **Save and Deploy**, y espera a que la compilación termine en verde.

## 4. Secretos de ejecución

Worker → **Settings** → **Variables and Secrets** → **Add**, con tipo **Secret**:

| Nombre | Valor |
|--------|-------|
| `TURNSTILE_SECRET_KEY` | La clave secreta del widget |
| `CONTACT_TO` | Tu correo de destino (el verificado en el paso 1) |
| `GUESTBOOK_SECRET` | Una clave aleatoria que cifra los enlaces de confirmación del Libro de visitas. Genérala con `openssl rand -base64 32` y no la guardes en el repositorio |

Pulsa **Deploy**. No añadas `CONTACT_FROM` ni `SITE_URL` (están en `wrangler.jsonc`) ni la clave pública (es de
compilación). Van como **Secret** porque un despliegue con Wrangler borra las variables normales que no estén en
`wrangler.jsonc`, pero conserva los secretos.

## 5. Prueba en `workers.dev`

Abre la dirección `workers.dev` con la consola del navegador abierta (F12):

- [ ] Ves la pantalla de acceso y entras con un clic.
- [ ] La consola no muestra ningún error de "Content Security Policy" ni "Refused to…".
- [ ] Ajustes cambia el tema y el fondo, y al recargar se mantienen.
- [ ] Los proyectos con `embeddable: true` se abren dentro del Navegador; los demás enseñan el aviso de "no se puede abrir".
- [ ] Correo: el widget de Turnstile se pone en verde y el mensaje te llega.

El Libro de visitas construye sus enlaces con `SITE_URL`: pruébalo cuando el dominio ya apunte al Worker (paso 6), o
cambia `SITE_URL` un momento a la dirección `workers.dev`.

## 6. Tu dominio

Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**: tu dominio y, si lo usas, `www`. Cloudflare
crea los registros. Después:

- [ ] Repite las comprobaciones del paso 5 en el dominio.
- [ ] Envía una reseña de prueba al Libro de visitas y confírmala desde el correo.
- [ ] Quita la dirección `workers.dev` de los Hostnames de Turnstile.

## 7. Datos automáticos de GitHub (opcional)

La tarea **Actualizar datos** (`.github/workflows/actualizar-datos.yml`) recalcula el Stack, los datos de GitHub de cada
proyecto y la ventana GitHub (tus repositorios con el topic `showcase`). En la plantilla se lanza a mano: pestaña
**Actions → Actualizar datos → Run workflow**. Para que corra cada día, quita el comentario del horario (`schedule`) en
ese archivo.

Sin más, cuenta tus repositorios **públicos**. Para incluir los **privados**, crea un token de solo lectura:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner**: tu usuario. **Repository access → All repositories**. **Permissions → Contents: Read-only**.
3. En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**, con nombre
   `STACK_GITHUB_TOKEN`. No pegues el token en ningún chat.

La tarea publica directamente en `main` y esa fusión despliega la web. Si el token caduca, falla a propósito en lugar de
publicar números recortados.

## Si algo falla

| Síntoma | Causa más probable | Qué hacer |
|---------|--------------------|-----------|
| La web no carga desde España algunos días, pero desde otra red sí | Durante los partidos de LaLiga, algunas operadoras bloquean IPs compartidas de Cloudflare | No es un fallo de la web y se levanta al acabar el partido. Ver «Cómo está hecho» → Limitaciones |
| La compilación falla con "name … must match" | El Worker no se llama como el `name` de `wrangler.jsonc` | Renombra uno de los dos |
| El formulario dice que la verificación "no está configurada" | Falta `PUBLIC_TURNSTILE_SITE_KEY` en las variables de **compilación** | Añádela (paso 3.5) y vuelve a desplegar |
| Consola: `Turnstile Error 110200` | El dominio no está en el widget | Añádelo en Turnstile → Hostnames |
| Al enviar sale "No hemos podido verificar que eres una persona" (403) | La clave secreta no es la del widget | Revisa `TURNSTILE_SECRET_KEY` |
| Al enviar sale "No se ha podido enviar" (502) | Destino sin verificar, Email Sending sin activar o remitente distinto del de `wrangler.jsonc` | Repasa el paso 1 |
| Al enviar sale un error de configuración (500) | Faltan `CONTACT_TO` o `TURNSTILE_SECRET_KEY` | Paso 4 |
| Libro de visitas: el Worker registra `not_configured` | Falta `GUESTBOOK_SECRET` | Paso 4 |
| Libro de visitas: el enlace dice "caducado" o "no es válido" | Pasaron 48 horas, el enlace se cortó al copiarlo o cambió `GUESTBOOK_SECRET` | Que la persona envíe la reseña de nuevo |
| El mensaje no llega | Está en Spam o el destinatario figura en Suppressions | Mira Spam y Email Service → Suppressions |
| Consola con "Refused to load…" | Un recurso que la CSP no autoriza | Pásale al agente el texto exacto del error |
| El sitio falla en producción | Un despliegue con un fallo | Worker → **Deployments** → versión anterior → **Rollback** |

## Despliegues posteriores

Cada fusión en `main` compila y despliega sola, y las ramas con PR generan una URL de prueba. Antes de fusionar algo que
toque el servidor o las cabeceras: `pnpm check`, `pnpm test`, `pnpm test:e2e` y `pnpm test:csp` (sin `pnpm dev` abierto),
y `/security-review` si cambia `src/pages/api/` o `public/_headers`.
