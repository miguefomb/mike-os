# Repositorios públicos, iconos propios, accesos web y CV ampliado

**Fecha:** 2026-10-21 11:23 (Europe/Madrid)
**Tipo:** Feature / Fix / Contenido
**Requisitos:** C-01, M-06, M-07, S-08

## Qué se hizo

- GitHub muestra todos los repositorios públicos de `miguefomb`, sin exigir `showcase`. Incluye forks y archivados del perfil, y sigue excluyendo privados y otras cuentas. Se actualizó la copia local con los cinco repositorios reales.
- Se dibujaron ocho iconos propios en la familia visual de Mike OS: claqueta, factura, presentación, imagen, código, perro de papel, web y escritorio. Se guardan en SVG editable y PNG de 256 px.
- Mad Mike Prods y Miguel Fombuena · Web se retiraron de Proyectos y pasaron a ser enlaces directos en escritorio y móvil, con apertura en otra pestaña. Proyectos conserva seis fichas.
- Se amplió el CV con el PDF proporcionado por Miguel: cinco experiencias laborales fechadas, tres titulaciones, tres certificaciones de 2026, competencias e idiomas. Se mantiene la información creativa de la web anterior.
- Se regeneró el PDF de dos páginas a partir del mismo Markdown que se muestra en Mi CV. La descarga incluye su huella en el enlace y una cabecera `no-store`, para evitar que se reutilice una versión anterior.

## Qué se modificó

`src/lib/repos.ts`, script y datos de GitHub; fichas y enlaces; `src/assets/project-icons/`, PNG y generador de iconos; CV, catálogo de herramientas, plantilla y PDF; enlace de descarga en `index.astro`, `_headers`, pruebas y documentación.

## Por qué

Solicitudes expresas de Miguel durante la personalización: mostrar sus repositorios públicos, crear iconos coherentes, separar las dos webs como accesos externos, ampliar la trayectoria con su CV y asegurar la descarga de la versión vigente.

## Validación

Pruebas de repositorios y workflow:

```text
Test Files  2 passed (2)
     Tests  13 passed (13)
```

Pruebas unitarias tras la ampliación:

```text
Test Files  32 passed (32)
     Tests  525 passed (525)
```

Recorridos de CV, descarga, proyectos, iconos y accesos en escritorio y móvil:

```text
28 passed (36.7s)
```

Se comprobó además la ventana GitHub con una tarjeta por cada repositorio real en ambos tamaños. Las descargas de Chrome coinciden byte por byte con el PDF vigente. Se renderizaron y revisaron visualmente las dos páginas y los ocho iconos. Las fuentes originales permanecen intactas y no se despliega.

Comprobaciones finales: `pnpm check` termina con 0 errores, 0 advertencias y 1 sugerencia histórica; `pnpm build` termina con `[build] Complete!`. En la compilación local se verifican el enlace con la huella actual, los bytes del PDF, la cabecera `Cache-Control: no-store` y los cinco repositorios, sin errores JavaScript ni violaciones CSP. `git diff --check` no presenta errores de whitespace.
