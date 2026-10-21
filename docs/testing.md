# Estrategia de testing

> **Mike OS:** `tests/e2e/m-06-mike-content.spec.ts` verifica perfiles y accesos web reales, herramientas sin cifras ficticias, los 81 favoritos ordenados con sus imágenes, reseñas vacías y las siete fichas de proyectos en escritorio y móvil. `m-03-movil.spec.ts` comprueba carpetas y accesos con el contenido actual. `m-06-sobre-mi.spec.ts` comprueba el enlace versionado y descarga el PDF para compararlo con los bytes del archivo vigente. Las pruebas de geometría usan fixtures independientes del contenido publicado. `splitFrontmatter` se verifica también con cabeceras CRLF para que el PDF de Windows no incluya restos del frontmatter. La validación de la migración ejecuta los recorridos afectados; no presupone que todos los E2E históricos, que dependen de los ejemplos de la plantilla, sean aplicables sin adaptar sus fixtures.

> **Plantilla:** este documento es el de Pol OS, el portfolio de Pol Marzà del que nace esta plantilla. Déjalo como ejemplo del método o reescríbelo para tu proyecto.

<!-- Documento vivo. Actualizar cuando cambie el stack o las convenciones de testing.
     Los cambios deben registrarse también en changelog/. -->

---

## Filosofía

Pol OS es sobre todo interfaz, así que el valor está en que los flujos funcionen de punta a punta
(entrar, abrir un proyecto, mandar un mensaje), no en funciones sueltas. Por eso:

- **Pocos tests unitarios, solo donde hay lógica de verdad:** el gestor de ventanas, la validación
  del formulario y el catálogo de comandos de la terminal.
- **Tests de extremo a extremo para cada criterio de aceptación del PRD** que se pueda comprobar
  mirando la pantalla.
- **Lo visual no se testea con aserciones frágiles.** El aspecto lo revisa Pol contra el prototipo.
  Si algo es puramente visual y no se puede comprobar por la interfaz, la ficha de la feature lo
  dice con `no verificable por interfaz: <razón>`.

Todo se ejecuta contra `localhost` (límite 1 de `CLAUDE.md`). Ningún test envía un correo real ni
llama a Turnstile en producción.

---

## Cuándo se escriben los tests

**Después de implementar, en una pasada propia.** No durante la planificación, y no a la vez que
el código.

El compromiso de que un requisito se va a validar se adquiere antes: es la tercera columna de la
tabla de cobertura de `docs/features/`. Pero el test en sí se escribe cuando el código ya existe,
leyéndolo. Es una diferencia de calendario pequeña con una consecuencia grande: un test escrito
antes que el código apunta a selectores, rutas y respuestas *imaginados*. Cuando luego no
coinciden con la realidad, casi nadie reescribe el test — se le van quitando aserciones hasta que
pasa, y acaba siendo un test que no comprueba nada pero que da luz verde. Escrito después, apunta
a lo que hay.

Reglas que se derivan de eso:

- **Antes de escribir una aserción, verifica que el selector existe en el código.** No lo
  supongas por el nombre del componente.
- **Si un elemento no tiene selector estable, añádele uno.** Meter un `data-testid` en el código
  es un cambio mínimo aceptable y preferible a colgar el test de una clase de estilos o de un
  texto que cambiará con el próximo ajuste de copy.
- **Cada "entonces" del criterio de aceptación necesita al menos una aserción.** Si el criterio
  define caso negativo, va su propio test.
- **Un test que falla no se arregla quitándole aserciones.** Si falla, o el código está mal o el
  criterio estaba mal escrito. Ambas cosas se corrigen donde toca; degradar el test para forzar el
  verde convierte la suite en decoración.
- **Los datos que crea un test los borra ese test.** Prefija lo que insertes para poder
  identificarlo y limpia al terminar, aunque el test falle a mitad.

---

## Stack de testing

| Tipo | Herramienta |
|------|-------------|
| Unitario | Vitest |
| Integración (endpoint de contacto) | Vitest con los bindings de Cloudflare simulados |
| E2E | Playwright contra `pnpm dev` en local. Con el Google Chrome instalado (`channel: 'chrome'`): proyectos `escritorio` (1280 × 800) y `movil` (390 × 844). Con los navegadores de Playwright: `safari` (WebKit, 1280 × 800), `safari-movil` (WebKit con pantalla y toque de iPhone, 390 × 844) y `firefox` (1280 × 800; Firefox no admite simular un móvil) |
| Accesibilidad | `@axe-core/playwright` dentro de los e2e |

Para el formulario, Turnstile usa las claves de prueba publicadas por Cloudflare y el binding de
correo se sustituye por un doble que guarda el mensaje en memoria; el test lo lee para comprobarlo.

---

## Qué testear

### Sí testear
- Gestor de ventanas: abrir, cerrar, traer al frente, ampliar y que la barra de título no salga
  de la pantalla.
- Validación del formulario de contacto (cliente y servidor): correo inválido, campos vacíos,
  límites de longitud.
- Endpoint `/api/contact`: método no permitido, límite de frecuencia, token inválido, envío correcto
  y que el destino sale siempre de la configuración, nunca de la petición.
- Preferencias: guardar y recuperar tema y fondo, y que funcionan sin `localStorage`.
- Catálogo de comandos de la terminal: cada comando y sus acciones, `open` por id, nombre y alias, Tab, sugerencias
  (`projcts` → `projects`), límites y que ninguna salida lleva HTML ni enlaces que no sean `https://`.
- Contenido de los proyectos (`projects-content.test.ts`): iconos que existen, direcciones seguras, dominio coherente con la
  dirección, orden único, y que una dirección de GitHub nunca figura como incrustable.
- Stack (M-05): qué cuenta como cada herramienta (dependencia, prefijo, archivo, carpeta, lenguaje con su umbral y Cargo),
  que el año nunca es anterior al lanzamiento, el orden y el agrupado, y la guarda del archivo generado (forma, catálogo,
  recuentos coherentes y **ningún nombre de repositorio**); que el workflow solo se dispara por calendario o a mano, solo
  escribe contenido y pasa los tests antes de publicar; en el navegador, el resumen, las categorías, el recuento y el año de
  cada fila, y que la ventana no tiene nada clicable.
- Sobre mí (M-06): el texto (secciones, sin correos ni nombres de terceros ni lo acordado no publicar), que el PDF
  corresponde al texto actual (huella), que sin PDF no hay botón y las utilidades de enlaces; en el navegador, el documento
  con su foto, el PDF servido como PDF, los enlaces a otras apps y los externos. Una guarda impide importar módulos de
  Node desde la interfaz.
- Proyectos (S-08): el reparto de lenguajes en porcentajes (suma 100, agrupa los pequeños), el botón principal según
  se pueda incrustar, qué apartados del detalle se enseñan, y la conversión de la respuesta de GitHub; en el navegador,
  la vista general, el detalle, la galería con su ampliación (teclado incluido), un GIF con y sin movimiento reducido,
  y que un proyecto sin repositorio o que no se deja incrustar no enseña botones ni apartados vacíos.
- Mosaico de ventanas (S-07): el rectángulo de cada mitad para varios anchos de pantalla (sin huecos ni solapes), que el
  tamaño anterior sobrevive a encadenar mitades y ampliar, y que arrastrar suelta la mitad; en el navegador, el cuadro del
  botón verde con ratón y teclado, las dos mitades a la vez, la ventana colocada tras minimizar y al cambiar la pantalla.
- Gráficos del Stack (M-05): el rosco (porciones proporcionales que suman la vuelta), el acumulado año a año (sin saltar años, nunca baja
  y termina en el total) y el contraste de los colores de categoría en las dos paletas; en el navegador, las cifras, el orden de las secciones
  (cifras, año a año, por categoría, detalle), la explicación de cómo se obtienen los datos, el rosco y su leyenda, una columna por año con su
  total, el detalle siempre visible con los títulos de categoría en mayúsculas y de su color, que no hay nada clicable y que no se desborda ni
  con el texto más grande.
- Favoritos (S-03): las direcciones de YouTube y los identificadores (once caracteres), el nombre y la portada de cada elemento, el orden de reproducción
  (la siguiente, y ninguna tras la última), la carga de la API de YouTube con un `window` de mentira (una sola vez, con reintento si falla o tarda) y guardas sobre
  el contenido real (un top 10 por sección, portadas que existen, juegos en Shelvid, vídeos que no se repiten, ningún correo ni teléfono); la política de seguridad
  (YouTube solo en `script-src` y `frame-src`). En el navegador, con YouTube simulado: las cuatro secciones y sus elementos, las portadas cargan, antes de pulsar
  play no se pide nada a YouTube, el mini reproductor (se abre, sustituye, pasa a la siguiente, avanza al acabar, se cierra y se destruye, mide al menos 200 × 200 y
  cabe en la pantalla), el aviso si el vídeo o YouTube fallan, la Terminal y el teclado. Controles del reproductor (`s-03-reproductor`): anterior, reproducir/pausar y siguiente
  (también en los extremos de la lista y en un tráiler), el botón que sigue el estado real del vídeo, la posición y la fila marcada, los tamaños táctiles (se miden en móvil y en escritorio), que la última
  canción no queda tapada y el teclado. Contra la compilación, que la política real deja ejecutar el script de la API
  y bloquea cualquier otro marco.
- Cómo está hecho (S-10): los títulos de sección y el índice (ids únicos y sin acentos), el reparto del texto en dos mitades por la lista de
  tecnologías, que cada tecnología tiene logo o iniciales, y guardas sobre el texto real (las siete secciones en orden, ningún correo, clave,
  token ni nombre de secreto ni límite exacto, enlaces seguros, ninguna persona concreta); en el navegador, que se abre desde el escritorio, el
  detalle de Pol OS (y solo de él) y la Terminal, que cada punto del índice lleva a su sección, que cada tecnología sale con su logo o sus
  iniciales, que los enlaces externos son seguros y los de apps abren la app, el aviso si no carga y que no se desborda con el texto más grande;
  contra la compilación, la página pública (título, descripción, canónica, legible sin JavaScript, en el mapa del sitio, sin violaciones).
- Libro de visitas (S-09): la validación (longitudes, relación, texto plano, caracteres de control y de inversión de texto, el
  correo sin saltos de línea, tres redes como máximo y cada red con sus formas válidas y su rechazo: otro dominio, protocolo,
  credenciales, puerto), el formato del archivo de la reseña (sin correo, con la fecha de hoy), el orden, y guardas sobre las
  reseñas reales; el enlace cifrado (se recupera, caduca a las 48 horas, manipulado, cortado o con otra clave se rechaza, no deja ver
  nada); y el flujo de los dos pasos con dobles (orden de comprobaciones, destino fijo, dirección del enlace desde la configuración,
  límites por IP y por correo, que no se manda nada ante un fallo y que el registro no lleva el texto ni el correo). En el navegador:
  la lista, el estado vacío y el de error, el HTML escrito que se ve como texto, el formulario (errores junto al campo sin perder lo
  escrito, redes, editar y retirar, contador, aviso de privacidad, campo trampa, teclado) y la página de confirmación (no confirma
  hasta pulsar). Contra los endpoints reales, solo las ramas que no mandan correo. Contra la compilación, la página de confirmación
  bajo la política real y que el fragmento no llega al servidor.
- Notas (S-01): el orden por fecha, número y nombre; el nombre y el enlace directo `?nota=` (un nombre desconocido, vacío o
  con caracteres raros se ignora); la fecha larga sin depender de la zona horaria; los datos estructurados `BlogPosting`;
  y guardas sobre el contenido real (nombre válido, descripción de hasta 160 caracteres, fecha, etiquetas, cuerpo, ningún
  correo ni nombre de tercero, enlaces seguros). En el navegador: la carpeta, abrir una nota, la invitación a Con Criterio,
  el aviso si el texto no carga, la selección frente a abrir, el enlace directo (también tras recargar), `notes` y
  `open <nota>` en la Terminal, y los enlaces sin JavaScript. Contra la compilación: cada página pública con su título,
  descripción, dirección canónica, Open Graph de artículo y JSON-LD, legible con JavaScript desactivado, el JSON de cada
  nota, el mapa del sitio y que una dirección inexistente devuelve 404 con la página propia.
- GitHub (C-01): en unitarios (`repos.test.ts`), qué repositorios salen (públicos, con `showcase`, sin forks, de Pol), el orden, las webs que no son
  `https://`, que la fecha no cuente como cambio, «hace 3 días» y los colores de lenguaje, y guardas sobre el archivo real. En el navegador (`c-01-github`, con
  repositorios de ejemplo servidos en lugar de `/repos.json`): el icono abre la ventana, el orden, los datos y enlaces de cada tarjeta, «En Proyectos», el
  archivo vacío, el fallo de carga, `open github`, el móvil y axe.
- Terminal en el navegador (S-04): comandos, historial, autocompletado, `exit` y `lock`, HTML escrito que se ve
  como texto, y que una ventana minimizada conserva su historial. Juegos (`s-04-juegos`, con el azar fijado desde el test): `minigames` en `help`,
  que su código no se pide hasta escribir `minigames` o un juego, una partida ganada y una perdida de cada juego, las jugadas inválidas, `salir`,
  Ctrl+C, que las jugadas no entran en el historial y axe durante una partida. En unitarios (`games/games.test.ts`): las marcas de Wordle con
  letras repetidas, el ahorcado (`hangman`), adivina el número (`guess`), las listas de palabras y que los comandos no cuentan como jugada. `open juegos` y `open games` siguen
  abriendo los videojuegos de Favoritos (no chocan con `minigames`).
- Memory (C-05, `c-05-memory`, con el azar fijado y el reparto calculado desde el test): se abre con `memory`, una pareja enseña su nombre, un
  fallo se tapa solo y no deja levantar una tercera, una partida completa con «Jugar otra», el teclado (flechas, Inicio, Fin, Enter), cartas de
  44 px o más en móvil y axe. En unitarios (`memory.test.ts`): repartir, parejas, movimientos, final y que el catálogo de logos es del Stack.
- Damas (C-06, `c-06-damas`, con el azar de `crypto` fijado: color y respuestas de la máquina conocidos): abrir con `checkers`, elegir y mover con destinos
  marcados, la respuesta de la máquina, Deshacer, la captura obligatoria (la secuencia que lleva a ella la calcula el test con el propio reglamento),
  Rendirse y «Jugar otra», que cada ficha cae sobre su casilla (vista inicial, girado e inclinado, ventana ampliada), girar e inclinar arrastrando y con botones, la vista guardada al reabrir, el teclado, el móvil (desde arriba, 44 px) y jugar con
  rojas (tablero dado la vuelta). En unitarios: el reglamento (`rules.test.ts`, con posiciones dibujadas), la máquina (`ai.test.ts`, partidas enteras
  legales y con reloj de mentira) y la proyección y la vista guardada (`view.test.ts`). La CSP real se recorre abriendo las damas (`m-11`).
- Cada criterio de aceptación del PRD (M-01 a M-10, S-01, S-03, S-04, S-09, S-10) en escritorio y, donde aplique, en
  móvil.
- Que el Navegador muestra el aviso con un proyecto marcado como no incrustable.

### No testear (o mockear)
- Estilos, degradados y animaciones concretas.
- El envío real de correo y Turnstile real (se simulan; se prueban a mano una vez tras el primer
  despliegue).
- Que un proyecto externo se deje incrustar de verdad: depende de su cabecera, no de Pol OS.
- Servicios externos de música (S-03).

---

## Convenciones

- Unitarios junto al archivo: `nombre.test.ts`. E2E en `tests/e2e/<id-del-requisito>-<tema>.spec.ts`
  (por ejemplo `m-08-correo.spec.ts`), de modo que el ID del PRD aparezca en el nombre.
- `describe` y `test` en presente y en español: "muestra el error junto al campo".
- Selectores: `data-testid` estables, nunca clases de estilo ni textos de copy.
- Cada test de e2e parte de la pantalla de acceso y entra como lo haría un visitante.
- Un test por criterio, y uno propio por cada caso negativo.

---

## Cobertura objetivo

- Lógica (gestor de ventanas, validación, endpoint, comandos): **≥ 80 %** de líneas, medido con
  Vitest. Se ignoran configuración, tipos y componentes puramente visuales.
- Interfaz: la medida es de requisitos, no de líneas. Cada requisito del PRD tiene su test o una
  nota `no verificable por interfaz`; `node scripts/verificar-cobertura.mjs` lo comprueba.

---

## Cómo correr los tests

```bash
# Todos los tests
pnpm test

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test:coverage

# E2E (levanta el sitio en local), con Chrome
pnpm test:e2e

# E2E en Safari (WebKit), Safari móvil y Firefox
pnpm test:e2e:navegadores
```

`pnpm test:e2e` arranca el servidor de desarrollo con `--ignore-lock` (Astro 7 lo mandaría a
segundo plano al detectar un agente) o reutiliza uno que ya esté en el puerto 4321. Hace falta
Google Chrome instalado.

`pnpm test:e2e:navegadores` corre los mismos tests en WebKit y Firefox. Los navegadores se instalan una vez con
`pnpm exec playwright install webkit firefox` (unos 190 MB, en la caché de Playwright del usuario). Tarda más (unos 7 minutos), así
que se lanza antes de un PR que toque la interfaz, no en cada cambio. Se añadió el 2026-10-16 porque las fichas de las damas
salían desplazadas en el navegador de Pol y Chrome no lo detectaba. Dos diferencias de Safari que los tests tienen en cuenta: con Tab
solo salta entre campos de texto (a los botones se llega con Opción+Tab: `nextControlKey` en `helpers.ts`), y espera más que
Chrome para cargar las imágenes con `loading="lazy"` (el test de las portadas baja por la lista). Los tests que dependen del reloj o
de los límites de peticiones pueden fallar de vez en cuando con tantas pruebas a la vez; si fallan, se repiten sueltos.

Los e2e de Correo no necesitan `.dev.vars` ni claves: la interfaz se prueba con el endpoint y el
script de Turnstile simulados (`stubContactApi`, `stubTurnstile`), y el endpoint real solo por las
ramas que no llaman a servicios externos, cada prueba con su propia IP en `cf-connecting-ip` para
no compartir el límite de envíos. Los análisis de accesibilidad esperan a que acaben las animaciones
(`animationsDone`) para medir el contraste con los colores finales.

**SEO y rendimiento (S-06).** También van contra la compilación, en `tests/csp/`: metadatos, imagen para
compartir (formato, medidas y peso), iconos, manifiesto, `robots.txt`, `sitemap.xml`, datos estructurados,
que ningún texto público contenga un correo, y un presupuesto de rendimiento con LCP, CLS y bytes medidos
con los observadores del propio Chrome (escritorio y móvil con la CPU 4 veces más lenta). Es un suelo
contra regresiones: en local no hay red. Si el presupuesto de JavaScript se rompe por una causa
legítima, se sube en `tests/csp/s-06-rendimiento.spec.ts` y se anota por qué.

**CSP (M-11).** `pnpm test:csp` compila (`pnpm build`) y sirve la compilación con `pnpm preview` en
el puerto 4322, porque Astro no genera la política en `astro dev`. Comprueba cabeceras, que todo
script o estilo en línea lleve su hash, que un recorrido por todas las apps no provoque ninguna
violación y que el navegador bloquee lo no autorizado. Va aparte de `pnpm test:e2e` porque tarda más
y porque `build` y `preview` comparten con `pnpm dev` la caché de Vite: **no lo ejecutes con
`pnpm dev` abierto**, o el servidor de desarrollo puede quedarse devolviendo 500 (se arregla
reiniciándolo). Playwright evalúa por el protocolo de depuración, que se salta la CSP, así que `eval`
no se prueba en vivo: basta con que la política no lo autorice.

Para medir ventanas en un e2e, espera a que termine su animación de entrada: mientras dura, la
ventana está escalada al 94 % (ver `settled()` en `tests/e2e/m-02-escritorio.spec.ts`).
