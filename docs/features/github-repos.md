# GitHub: los repositorios públicos de Pol

> **Mike OS, 2026-10-21:** Miguel ha pedido mostrar **todos los repositorios públicos de su perfil**. Se elimina el requisito `showcase` y se incluyen forks y archivados; siguen excluidos los privados y los de otras cuentas. La conversión se llama `toPublicRepos`, se ha actualizado el archivo real con los cinco repositorios y se valida con `src/lib/repos.test.ts` y un recorrido local de la ventana en escritorio y móvil. El texto siguiente conserva las decisiones históricas de Pol OS.

**Estado:** Verificada
**Requisitos que cierra:** C-01 (redefinido con esta ficha)
**Fecha de acuerdo:** 2026-10-16

## Qué se construye

El icono de **GitHub** del escritorio deja de ser un acceso directo a github.com y pasa a abrir una ventana propia, como Proyectos, con **los
repositorios públicos que Pol etiqueta para enseñar**. Así los Proyectos siguen siendo la selección de trabajos terminados y con web, y lo experimental (por ejemplo, un clon de
YouTube Music) tiene su sitio sin colarse entre ellos.

Cada repositorio se ve como en el perfil de GitHub, en una tarjeta:

- El **icono de repositorio** (el libro con el marcador), el **nombre** en grande y, si es público en GitHub, la etiqueta «Public».
- La **descripción** (el «About» del repositorio) y, si tiene web (`homepage`), su **dirección**, que se abre en una pestaña nueva.
- Abajo, el **lenguaje principal** con su punto de color, las **estrellas**, los **forks** y cuándo se actualizó por última vez («hace 3 días»).
- Si el repositorio también está en Proyectos, una etiqueta **«En Proyectos»** que abre su ficha en Pol OS.
- El nombre lleva al repositorio en GitHub, en una pestaña nueva.

Arriba, el total («12 repositorios») y un botón **«Visitar mi GitHub»**. Ordenados por la última actualización, los más recientes primero. En el
móvil, una sola columna a pantalla completa, como las demás apps.

## Decisiones tomadas

- **Proyectos y GitHub son cosas distintas** (decisión de Pol): Proyectos es la selección de trabajos terminados; GitHub, lo que Pol quiera enseñar de su código,
  experimentos incluidos. No se crean proyectos solos.
- **Sale solo lo que Pol etiqueta** (decisión de Pol: crea repositorios de clase o de ejemplo que no quiere enseñar). Para que un repositorio salga, Pol le añade el
  topic **`showcase`** en GitHub (en la página del repositorio, «About» → ruedecita → «Topics»). Sin la etiqueta no sale, aunque sea público. Para quitarlo, se quita
  la etiqueta. No hay listas de ocultos que mantener ni hay que pedírselo a nadie.
- **Los datos salen de la tarea diaria que ya existe**, con un paso nuevo (`scripts/actualizar-repos.mjs`), que guarda en el repositorio un archivo
  `src/content/repos.json` con lo que enseña cada tarjeta. La ventana lo pide al abrirse como `/repos.json`. La web no llama a GitHub: no cambia la política de seguridad, no hay límites de la API que se
  agoten con las visitas, y si un día falla la tarea se ven los datos del día anterior.
- **La lista se rehace entera cada día**, no se acumula: si Pol borra un repositorio, lo pasa a privado o le quita la etiqueta, desaparece de la web en la siguiente
  ejecución (como mucho, al día siguiente; antes si lanza la tarea a mano en GitHub Actions). Lo mismo con los cambios de nombre, descripción o estrellas. El
  commit automático de la tarea publica la web solo.
- **Solo repositorios públicos.** De los privados no se guarda nada, como ahora en el Stack (solo los recuentos).
- **Fuera, aunque lleven la etiqueta:** los privados y los forks. Los archivados salen si llevan la etiqueta, con una marca «Archivado».
- **Los enlaces van a pestaña nueva**, no al Navegador de Pol OS: el Navegador solo carga los proyectos de la colección (regla de `CLAUDE.md`) y GitHub no se
  deja incrustar.
- **El icono del escritorio sigue siendo el de GitHub** (es un acceso con su propia identidad, como ya se decidió con C-03), pero sin la flecha de enlace
  externo, porque ahora abre una ventana. El icono de repositorio de las tarjetas es propio, dibujado con trazos, no copiado de GitHub.
- **Los colores de los lenguajes** son los habituales de GitHub para los más comunes (TypeScript, JavaScript, Python, Rust, Swift, HTML, CSS, Astro, Svelte…) y
  un gris para el resto.
- **La app se carga al abrirla** y su hoja de estilos se enlaza al abrir la ventana (como las damas), así la home no suma peso ni peticiones.
- **Terminal:** `open github` abre la ventana; el comando `social` sigue enlazando al perfil.

## Cobertura

| Requisito | Se implementa en | Se valida con |
|-----------|------------------|---------------|
| C-01 | Guardar en la tarea diaria los repositorios públicos con el topic `showcase` (sin privados ni forks): `scripts/actualizar-repos.mjs`, `.github/workflows/actualizar-datos.yml`, `src/content/repos.json`, `src/pages/repos.json.ts`, `src/lib/repos.ts` | `src/lib/repos.test.ts` |
| C-01 | La ventana GitHub con sus tarjetas, el total, el orden y «Visitar mi GitHub»: `src/os/apps/github/Github.svelte`, `src/os/apps/github/github.css`, `src/os/apps/registry.ts`, `src/os/items.ts`, `src/os/apps/AppView.svelte` | `tests/e2e/c-01-github.spec.ts`, `tests/e2e/m-07-accesos.spec.ts` |
| C-01 | «En Proyectos» abre la ficha del proyecto en Pol OS | `tests/e2e/c-01-github.spec.ts` |
| C-01 | `open github` en la Terminal | `src/os/terminal/commands.test.ts`, `tests/e2e/c-01-github.spec.ts` |
| C-01 | La home no carga la app ni su CSS, y la política de seguridad no cambia | `tests/csp/s-06-rendimiento.spec.ts`, `tests/csp/m-11-csp.spec.ts` |
| C-01 | Que la tarea diaria los actualice en GitHub Actions | no verificable por interfaz: se ejecuta en GitHub con el token de Pol; se comprueba en la primera ejecución tras fusionar (el commit automático debe tocar `repos.json`) |

Qué comprobará cada test, según el criterio del PRD:

- **Unitarios (`repos.test.ts`):** de una respuesta de la API de GitHub de ejemplo, quedan solo los públicos con el topic `showcase`, sin forks (los archivados, marcados);
  cada tarjeta tiene nombre, enlace `https://github.com/…` y, si la hay, una web `https://`; el orden por fecha; «hace 3 días» y similares; los colores de lenguaje.
  Guardas sobre el archivo real: ningún repositorio privado, ningún enlace que no sea `https://`.
  - *Negativo:* un repositorio sin el topic, con `private: true` o con `fork: true` no entra, y una web que no sea `https://` se descarta (entra sin web).
- **e2e (escritorio y móvil, con axe en claro y oscuro):** el icono de GitHub abre la ventana; salen todas las tarjetas del archivo, en orden; cada enlace va a pestaña nueva
  con `noopener`; «En Proyectos» abre la ficha; «Visitar mi GitHub» apunta al perfil; `open github`; antes de abrirla no se pide su código.

## Hallazgos al construir

- **Un script aparte**, no un paso más del del Stack: el del Stack se niega a escribir si aparece un nombre de repositorio en su archivo (para que no se cuele
  ninguno privado), y aquí los nombres son justo lo que se guarda. El nuevo solo lee la lista pública y funciona incluso sin token.
- **El nombre enlaza a GitHub, no la tarjeta entera:** dentro hay otros enlaces (la web) y un botón («En Proyectos»), y un enlace no puede contener otros.
- **Sin repositorios etiquetados**, la ventana lo dice y deja el botón al perfil. Los tests del navegador usan repositorios de ejemplo servidos en
  lugar de `/repos.json` (también una lista vacía) y, aparte, comprueban que el archivo real sale con una tarjeta por repositorio. Desde el
  2026-10-16 hay seis etiquetados.
- **En desarrollo, Vite pide `github.css?url` al cargar la home**; en la compilación la home no la enlaza (sigue con sus 6 hojas). El test del navegador comprueba
  que el código de la ventana no se pide antes de abrirla, y `s-06` vigila las peticiones de la home compilada.
- **«En Proyectos» tenía poco contraste en oscuro** (axe): pasa a llevar solo un filo de acento.
- **Accesos directos (M-07):** GitHub deja de ser un enlace del escritorio; sus tests pasan a los otros tres, y el menú Ayuda sigue enlazando al perfil.

## Fuera de esta feature

- Crear proyectos automáticamente a partir de los repositorios.
- Buscar, filtrar por lenguaje o paginar (con unos 40 repositorios no hace falta; se reconsidera si pasan de 100).
- Leer el README de cada repositorio dentro de Pol OS.
- Repositorios privados o de organizaciones.
- Llamar a la API de GitHub desde el navegador del visitante.
