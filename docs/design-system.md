# Design System

> **Mike OS:** se conserva este diseño de escritorio. La identidad usa el retrato y logo aportados por Miguel; se añaden iconos locales de Instagram, YouTube y Spotify. Stack presenta herramientas por disciplina en etiquetas con los tokens existentes. Favoritos incluye un estado vacío. Fuentes en [contenido-mike.md](contenido-mike.md).

Los seis proyectos y los accesos web de Mad Mike Prods y Miguel Fombuena tienen iconos propios de 256 px: degradado de su ficha, esquinas del 23 %, símbolos claros y una iluminación sutil. Las fuentes SVG se guardan en `src/assets/project-icons/` y el generador exporta PNG compatibles con `AppIcon`. Las webs conservan la flecha de acceso externo.

> **Plantilla:** este documento es el de Pol OS, el portfolio de Pol Marzà del que nace esta plantilla. Déjalo como ejemplo del método o reescríbelo para tu proyecto.

<!-- Fuente de verdad visual del proyecto.
     Consultar antes de crear cualquier componente nuevo.
     Actualizar cuando se añadan nuevos patrones, componentes o se modifique la identidad visual. -->

Aprobado a partir del prototipo interactivo v0.1 (artefacto privado de Claude:
https://claude.ai/artifact/9xTgccyeywL5cHQyADHtuF). El prototipo es la referencia visual; este
documento fija los valores. Si alguno difiere, manda este documento y se corrige el prototipo.

---

## Paleta de colores

Todos los colores se definen como variables CSS en `:root` (tema claro) y se redefinen para el tema
oscuro con `[data-theme="dark"]` y con `prefers-color-scheme: dark` cuando no hay preferencia
guardada. Ningún componente usa un color literal: siempre una variable.

| Rol | Variable | Claro | Oscuro |
|-----|----------|-------|--------|
| Acento (selección, botón principal) | `--accent` | `#0a6cff` | `#3b8cff` |
| Acento para texto (enlaces y etiquetas sobre fondos claros o grises) | `--accent-text` | `#0058d6` | `#5ca0ff` |
| Acento para fondos con texto blanco (botones, elemento resaltado de un menú; 4,5:1) | `--accent-solid` | `#0a6cff` | `#2a6fdb` |
| Acento suave (fondos de selección) | `--accent-soft` | `rgba(10,108,255,.14)` | `rgba(59,140,255,.24)` |
| Texto principal | `--fg` | `#1d1d1f` | `#f2f2f5` |
| Texto secundario | `--muted` | `#636368` | `#a3a3aa` |
| Fondo de ventana | `--win-bg` | `#f7f7f9` | `#232328` |
| Superficie (listas, campos) | `--surface` | `#ffffff` | `#2c2c32` |
| Barra de título y barras de herramientas | `--chrome` | `rgba(236,236,241,.9)` | `rgba(46,46,52,.92)` |
| Cristal (barra de menú, dock) | `--glass` | `rgba(246,246,250,.55)` | `rgba(32,32,38,.52)` |
| Cristal opaco (menús, tooltips) | `--glass-strong` | `rgba(250,250,252,.78)` | `rgba(40,40,46,.8)` |
| Línea | `--line` | `rgba(0,0,0,.09)` | `rgba(255,255,255,.08)` |
| Error | `--danger` | `#d0372a` | `#ff6b5e` |
| Éxito | `--ok` | `#1b9446` | `#4cd17e` |
| Texto sobre el fondo de pantalla | `--on-wall` | `#ffffff` | `#ffffff` |

**Semáforos de ventana** (fijos en ambos temas): cerrar `#ff5f57`, minimizar `#febc2e`,
ampliar `#28c840`. En una ventana inactiva se ven grises hasta pasar el ratón por encima.

**Terminal** (siempre oscura, tokens `--term-*`): fondo `#17171b`, texto `#e6e6ea`, acento `#7ee2a8`,
apagado `#9a9aa5`, error `#ff8f85` y enlaces `#8ab8ff`. Todos superan 4,5:1 sobre el fondo.

**Fondos de pantalla** (degradados de malla, sin imágenes): Atardecer (por defecto), Mar, Grafito y
Alba. Cada uno es una variable CSS (`--wall-<id>`) y el elegido se aplica con `data-wall` en `<html>`. En tema oscuro se les superpone una capa negra al 30 % para bajar el brillo.

**Iconos de aplicación:** cada uno lleva un degradado vertical de dos tonos (`--c1` arriba, `--c2`
abajo). Notas (carpeta del escritorio) azul de carpeta.
Las apps principales llevan un dibujo completo a sangre dentro de la casilla (`TILE_SVG` en `src/os/icons.ts`,
colores planos y sin `id`): Navegador (el logo de Safari sobre blanco), Correo (el de Gmail, centrado sobre blanco), Notas del
dock (papel con banda amarilla), Terminal (`>_` sobre negro de borde a borde, `#232328 → #0b0b0d`), Libro de visitas (libro
abierto con firma, `#ff9f7a → #e0553f`), Stack (tres capas, `#8a8cff → #4a4bd6`), Cómo está hecho (plano azul
con `</>`, `#3a7cf0 → #1a3f9e`) Favoritos (corazón con destello, `#ff7aa8 → #e0306a`) y Ajustes (rueda dentada, `#e4e4e9 → #9a9aa3`). Los accesos externos y algunos proyectos llevan su propio icono (imagen). Los proyectos sin
icono propio definen sus dos tonos en su ficha de contenido.

---

## Tipografía

- **Interfaz:** la fuente del sistema (`-apple-system, BlinkMacSystemFont, "SF Pro Text",
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`). En Mac e iPhone se ve la fuente de
  Apple, que es lo que buscamos; en otros sistemas cae a su fuente nativa. No se carga ninguna
  fuente web para la interfaz.
- **Monoespaciada (terminal y código):** `ui-monospace, "SF Mono", Menlo, Consolas, monospace`, la del
  sistema (en Mac, la de Apple). No se carga ninguna fuente web: ahorra una petición y no obliga a
  ampliar la CSP.

| Uso | Tamaño | Peso |
|-----|--------|------|
| Hora de la pantalla de acceso | `clamp(80px, 13vw, 148px)` | 700, interletrado −0,035 em |
| Fecha de la pantalla de acceso | `clamp(16px, 1.8vw, 21px)` | 600 |
| Nombre en la pantalla de acceso | 19px | 600 |
| Título de nota | 24px | 700 |
| Título del documento (CV) | 26px | 700 |
| Interfaz general (menús, ventanas) | 14px | 400, 600 para títulos |
| Etiquetas de icono de escritorio | 13px | 500, con sombra de texto |
| Texto de lectura (notas) | 15px, interlineado 1,65, máximo 65 caracteres | 400 |
| Terminal | 13,5px, interlineado 1,6 | 400 |
| Etiquetas de sección en mayúsculas | 12px, interletrado 0,1 em | 600 |

Las cifras alineadas (reloj, fechas) usan `font-variant-numeric: tabular-nums`.

**Tamaño del texto elegible (2026-10-11):** todos los `font-size` en px se escriben como `calc(Npx * var(--text-scale))`. Los pasos son
Normal (×1), Grande (×1,1) y Muy grande (×1,2), y no hay un valor libre. Se guarda en el navegador (`data-text` en `<html>`, que
el script de arranque pone antes de pintar). Lo que mide en `rem` o `em` o se dimensiona de otra forma (la hora de la pantalla de
acceso) no cambia.

**Escala (2026-10-11):** la base subió de 13 a 14px porque se leía pequeña. Todo texto de 14px o menos subió 1px (el texto secundario pasa de 12 a 13px y los rótulos de 11 a 12px); los títulos y tamaños de 15px o más no cambiaron, así que la jerarquía se conserva.

---

## Espaciado y grid

- **Escala:** base de 4px (4, 8, 12, 16, 20, 24, 32, 48).
- **Barra de menú:** 32px de alto (antes 28: con la letra mayor el texto iba pegado a los bordes) más el área segura superior en iPhone.
- **Dock (escritorio):** iconos de 52px, separación de 6px, margen inferior de 8px. Reserva 84px de
  alto para las ventanas ampliadas.
- **Iconos de escritorio:** celdas de 96 × 98px, en columnas desde el borde derecho, como en macOS.
  El icono mide 56px.
- **Ventanas:** tamaño inicial por app (Navegador 900 × 600, Correo 600 × 540, Mi CV 720 × 660,
  Notas 580 × 380, Stack 620 × 600, Terminal 660 × 420, Ajustes 580 × 540), mínimo 320 × 220,
  nunca más grandes que la pantalla. La primera ventana se abre centrada entre la barra de menú y el dock; cada
  ventana nueva, escalonada 26–30px hacia abajo a la derecha respecto a la anterior.
- **Punto de corte:** `max-width: 767px` es móvil. A partir de 768px es escritorio.
- **Móvil:** rejilla de 4 columnas, iconos de 62px como máximo, margen lateral de 16px. Respeta las
  áreas seguras de iPhone (`env(safe-area-inset-*)`).

---

## Estilo de componentes

- **Radios:** ventanas 12px; iconos de aplicación 23 % de su lado (silueta de macOS); dock 22px;
  campos y botones 7px; menús 10px; píldoras totalmente redondas.
- **Cristal:** barra de menú, dock, menús y tooltips usan `backdrop-filter: blur(30px)
  saturate(1.7)` sobre `--glass`, con un borde de 0,5px. Las ventanas y su contenido son
  opacos para que se lea bien; el cristal solo va en el marco del sistema.
- **Sombras:** ventana activa con sombra grande y difusa; ventana inactiva con una más suave. Las
  sombras indican profundidad y foco, nunca decoran.
- **Iconos:** glifos de trazo (24 × 24, grosor 1,8–2,4, extremos redondeados) dentro de un
  contenedor con degradado, o un dibujo completo a sangre en las apps principales. Los iconos de documento y
  carpeta son dibujos completos propios. En las apps no se usan logos de otras marcas, salvo Gmail (Correo) y
  Safari (Navegador), decisión de Pol del 2026-10-17. Otra excepción, decidida por Pol: los accesos directos externos (LinkedIn, GitHub,
  Con Criterio) y los proyectos llevan su propio icono, una imagen cuadrada de 256 px que la interfaz recorta
  con la silueta de macOS. El de GitHub es la marca en blanco sobre fondo oscuro, para que se vea en ambos temas. El de WhatsApp es el de la app: el símbolo blanco sobre una casilla verde con degradado (`#61fd7d` a `#25cf43`), como se ve en el dock de macOS.
- **Accesos directos externos** (Newsletter, GitHub, LinkedIn y WhatsApp): llevan una pequeña flecha en la
  esquina inferior izquierda, como los alias de macOS, para indicar que salen del sistema.
- **Selección:** un clic en un icono lo resalta con el color de acento; doble clic abre. En
  pantallas táctiles basta un toque.
- **Ventanas:** se mueven por la barra de título, se redimensionan desde la esquina inferior
  derecha, se amplían con doble clic en la barra y la barra nunca puede salir de la pantalla. La
  ventana activa va al frente.
- **Movimiento:** entrada de ventana de 220ms con un ligero rebote, salida de 160ms, dock que se
  eleva y crece al pasar el ratón, pantalla de acceso que se desenfoca y amplía al entrar. Con
  `prefers-reduced-motion` todo se reduce a casi cero.
- **Formularios:** errores en rojo (`--danger`) debajo del campo concreto, con texto que dice qué
  corregir. Un campo bloqueado (como "Para") muestra un candado.
- **Foco visible:** contorno de 2px en color de acento en todo elemento interactivo.
- **Accesibilidad:** todo se opera con teclado; botones con `aria-label` cuando son solo icono; los
  contrastes se comprueban en ambos temas.

---

## Tono visual

Un macOS moderno que cualquiera reconoce al instante: cristal, desenfoque, esquinas redondeadas y
mucho aire. La persona que lo abre debe sentirse en su propio ordenador, no en una página web
diseñada para sorprender. Cálido y cuidado, con humor discreto en los detalles (los comandos de la
terminal, los textos de ejemplo).

No debe parecer una copia pixel a pixel de Apple, ni un tema retro, ni un portfolio de tarjetas
con degradados morados. La personalidad está en el contenido y en el fondo de pantalla, no en
inventar una interfaz nueva.

La pantalla de acceso es el momento más expresivo (hora enorme, avatar, fondo a pantalla completa).
El resto es contenido y debe quedarse en segundo plano.

---

## Componentes definidos

### Pantalla de acceso (`LockScreen`)
Fecha y hora grandes arriba; en el espacio libre de debajo, centrado y algo por encima del centro
exacto, el bloque de acceso: avatar con la foto de Pol (92 px, redondo), nombre y campo de contraseña
decorativo con ocho puntos. La foto es `src/assets/pol.webp`, se reduce al compilar a 276 px (hasta 3x
de densidad) y es decorativa (`alt` vacío) porque el nombre está justo debajo. Si no carga, quedan las
iniciales "PM". Se entra con clic o Enter, con animación breve de giro en el botón y transición de
desenfoque. No acepta texto.

### Barra de menú (`MenuBar`)
Logo de Pol OS (menú con Acerca de, Ajustes y Bloquear pantalla), nombre de la app activa en negrita,
los menús Archivo, Edición, Visualización, Ventana y Ayuda, conmutador de tema (sol con tema oscuro,
luna con claro) y reloj. Solo escritorio.

Los menús son desplegables de cristal (`--glass-strong`, radio `--r-menu`): se abren con un clic, con
otro menú abierto el ratón los cambia, y se cierran con Escape o un clic fuera. Las entradas
desactivadas van al 45 % de opacidad; las de elección (apariencia, fondo, ventana activa, pantalla
completa) llevan una marca a la izquierda y los grupos un título pequeño en `--muted`. El contenido
de cada menú sale de `src/os/menus.ts` (función pura): ahí se decide qué hay y qué está desactivado.
Roles: `menubar`, `menu`, `menuitem`, `menuitemradio` y `menuitemcheckbox`. Con teclado: flechas, Inicio,
Fin, Enter y Escape. Los menús no quitan el foco al campo de texto, para que Edición actúe sobre él.

### Cómo usar Pol OS (`Help`)
Ventana de texto con la guía corta que abre Ayuda: abrir con doble clic, ventanas, proyectos, escribir a
Pol y ajustes. Sin datos ni enlaces. No está en el dock ni en el escritorio.

### Icono de escritorio (`DesktopIcon`)
Icono de 56px y etiqueta. Props: `art`, `label`, `href` (si es acceso directo externo) o `open`
(si abre una ventana). Estados: reposo, seleccionado, enfocado.

**Qué hay en el escritorio:** la carpeta **Proyectos** (que abre la vista general de los proyectos que contiene), los proyectos que
viven solo en GitHub como icono propio (campo `placement: desktop`; hoy `project-template`, con una estrella amarilla sobre fondo
oscuro), Mi CV (antes «Sobre mí»), Notas, Libro de visitas, Stack y los accesos directos. Los demás proyectos no tienen icono suelto: viven dentro de
la carpeta. En móvil pasa igual: la carpeta Proyectos y, suelto en la pantalla de inicio, el de GitHub.

### Ventana (`Window`)
Barra de título con semáforos, título centrado, cuerpo con scroll propio y tirador de tamaño.
Estados: activa, inactiva, ampliada, colocada en una mitad, cerrándose. Una ventana por app; las notas abren una por nota.

**Botón verde (`TileMenu`):** un clic amplía o restaura. Con el ratón encima medio segundo (o con el foco
del teclado) se abre debajo un cuadro de cristal, como un menú de la barra, con "Mitad izquierda", "Mitad
derecha" y "Ampliar"/"Restaurar", cada una con un dibujo propio. La ventana colocada ocupa la mitad del
ancho y el alto útil (de la barra de menú al dock) con una transición de 240 ms, sin ella con movimiento
reducido, y no tiene tirador de tamaño; arrastrarla la suelta y recupera su tamaño anterior.

### Dock (`Dock`)
Apps del sistema: Navegador, Correo, Notas, Terminal y Ajustes (separado). Muestra un punto bajo las
apps abiertas y un tooltip al pasar el ratón.
Las ventanas minimizadas pasan a un apartado a la derecha, tras un separador, con el icono de su app y su
título como tooltip; un clic las recupera. Relleno 10/14px y hueco de 10px entre iconos.

### Libro de visitas (`Guestbook`)
Ventana de 560 × 560 con barra superior (título "Libro de visitas", una línea de apoyo y el botón principal "Dejar
reseña"). Debajo, una columna de tarjetas (`--surface`, radio 12, borde fino `--line`): el texto de la reseña (con sus saltos
de línea, siempre texto plano) y, al pie, el nombre en negrita, la relación con Pol y el detalle (cargo o lugar) en `--muted`, la
fecha si la hay y los enlaces a sus redes (`--accent-text`, con el icono de enlace externo) alineados a la derecha. Los enlaces se
abren en pestaña nueva con `rel="nofollow noopener noreferrer ugc"`. Sin reseñas, un aviso centrado que invita a escribir la
primera; mientras carga, "Cargando las reseñas…"; si falla, un aviso con `role="alert"`.

**Formulario:** mismo marco, con "‹ Volver" y "Enviar" en la barra. Campos en columna con su etiqueta encima, el error en
`--danger` bajo el campo y el foco en el primer error: tipo de petición (nueva, editar, retirar), nombre visible, cargo o lugar
(opcional), relación (lista), reseña con contador `n / 600`, hasta tres redes (una fila de red + usuario o dirección, con "Añadir
otra red" y una cruz para quitar), correo con la nota "Solo sirve para comprobar que es tuyo. No se publica." y la casilla del aviso
de privacidad, con el texto desplegable. Retirar solo deja nombre, correo y aceptación. Un campo trampa fuera de pantalla y el
widget de Turnstile al pie. Tras enviar, una pantalla con la marca de verificación que explica que hay que abrir el correo y pulsar
«Confirmar» (caduca en 48 horas).

**Página de confirmación (`/libro-de-visitas/confirmar`):** la misma hoja blanca de Sobre mí y de las notas (`--paper-*`), centrada,
con el título "Confirma tu correo", el botón "Confirmar" y un mensaje por cada resultado (hecho, caducado, no válido, repetido, error).
No se indexa.

### Stack (`Stack`)
Una **ficha técnica con gráficos**, de 620 × 600: solo se lee (no hay nada clicable), sin pestañas ni cambio de vista, en una sola columna que se desplaza
(región con foco para usar las flechas). De arriba abajo:

1. Título, de dónde salen los datos y **cómo se obtienen** (una tarea de GitHub Actions con un permiso de solo lectura).
2. **Tres cifras** en tarjetas (`--surface`, radio 12): herramientas, repositorios y el año desde el que construye.
3. **Año a año:** una línea con área bajo ella con las herramientas acumuladas, y bajo cada año su total, el año y las herramientas
   que entraron (o "Sin altas").
4. **Por categoría:** un rosco (SVG, con el total en el centro) y su leyenda con el número de herramientas de cada categoría.
5. **Detalle por herramienta**, siempre a la vista: una sección por categoría, con el título (h4) en **mayúsculas, en negrita y sobre una
   pastilla del color de la categoría** (el mismo de sus barras y del rosco), y una fila por herramienta: una barra de ese color, el recuento
   exacto y el «desde».
6. La nota de que los recuentos incluyen proyectos que nacieron de un generador.

**Colores de categoría:** `--cat-1` a `--cat-8`, en el orden del catálogo (Lenguajes, Interfaz, Escritorio, Datos y servidor, IA, Servicios,
Publicación y Calidad), con `--cat-fg` para el texto sobre ellos. En claro son tonos oscuros con texto blanco y en oscuro tonos claros
con texto casi negro; todos con al menos 4,5:1 de contraste (un test lo comprueba). Los gráficos no tienen animación. En móvil las cifras
se encogen y las filas del detalle pasan a dos líneas.

### Favoritos (`Favorites`, `CoverGrid`, `MusicList`) y mini reproductor (`MiniPlayer`)
Una carpeta con la forma de Proyectos: la ventana de 640 × 560 abre en **cuatro tarjetas** (`--surface`, radio 12) — Videojuegos, Películas y series,
Libros y Música — cada una con tres miniportadas, su nombre y «Top 10». Al pulsar una, la misma ventana pasa a la sección, con una barra «‹ Favoritos»
para volver. No hay textos de gusto ni notas: solo el contenido.

- **Videojuegos, películas y libros** son una cuadrícula de portadas (`minmax(120px, 1fr)`, esquinas de 8px y un filete fino): 3 / 4 los juegos, 2 / 3
  los libros y las películas, que además llevan una ficha más ancha (póster a la izquierda; título, año, sinopsis y el botón «Ver tráiler» a la
  derecha). Los juegos son enlaces a su ficha en Shelvid (pestaña nueva), con una línea al pie que nombra Shelvid como el proyecto de un amigo.
  Los libros llevan, si existe, un enlace final (Yoleo).
- **Música** es una lista como una biblioteca: número, portada cuadrada de 52px, título y artista, duración (si la hay), un enlace a YouTube Music y el
  botón de play (círculo con `--accent-solid`). La que suena queda marcada con `--accent-soft`.
- Cada región con desplazamiento se puede enfocar con el teclado (`role="region"`).
- **Portadas:** archivos `.jpg` de `public/favoritos/<sección>/`. Mientras Pol no sube la real, hay una de ejemplo, con rayas y el texto «Portada de ejemplo».

**Mini reproductor:** una tarjeta fija abajo a la derecha, encima del dock (`z-index` 7900, por debajo de los menús), de 356 px de ancho con el vídeo de
YouTube en 16:9 y nunca por debajo de 200 px de alto (el mínimo de YouTube). Arriba, una cabecera con el título, el artista y la posición en la lista
(«Plini · 3 de 10», o «Tráiler · año») y el botón «Cerrar». **Debajo del vídeo** va la barra de controles, centrada: **anterior**, **reproducir/pausar**
(círculo con `--accent-solid`, es el principal) y **siguiente**. Anterior y siguiente solo salen si es una lista de varias canciones (un tráiler solo
lleva reproducir/pausar) y, en el primer o el último elemento, quedan atenuados con `aria-disabled` (siguen enfocables). El icono de reproducir/pausar
sale del estado que cuenta YouTube, no de lo último pulsado. **Tamaños táctiles:** botones de 36 px en el escritorio; con pantalla táctil o menos de 768 px,
48 px los de la barra (con 24 px entre ellos) y 44 px el de cerrar y los de cada fila de la lista de Música. En móvil el reproductor ocupa el ancho de la
pantalla, sobre el dock, y la región de la lista deja un margen inferior de 460 px mientras suena algo para poder llegar a las últimas filas. En la lista, la
canción que suena lleva la fila marcada y su botón cambia a un icono de sonido («sonando ahora»). Es único: reproducir otra cosa lo sustituye. El vídeo
siempre está a la vista y no se reproduce en segundo plano; no hay botón para plegarlo. Si no carga, un aviso con el enlace a YouTube y sin controles.

### Cómo está hecho (`HowTo`)
Un documento largo, de 700 × 640, con el aspecto de Sobre mí: la hoja blanca (`--paper-*`, igual en los dos temas) sobre el escritorio gris, con la
barra superior «Cómo está hecho.md». Sin foto. Arriba, el título (h1), la descripción y un **índice** («En este documento», en un recuadro gris con
los títulos numerados como botones): al pulsar uno, el documento se desplaza a esa sección y le da el foco (el desplazamiento es suave salvo con
movimiento reducido, y no toca la dirección de la página). Después, el texto con títulos de sección (h2, con línea fina debajo), párrafos,
listas, `código` y enlaces: los externos abren pestaña nueva y los que van a otra app del escritorio (Stack, Libro de visitas) la abren en
Pol OS. A mitad del texto, la **lista de tecnologías**: una cuadrícula de recuadros (`minmax(220px, 1fr)`) con el logo en una casilla de 34px
(un SVG monocromo, del color del texto) y a su lado el nombre en negrita y para qué se usa. Una tecnología sin logo en la colección usa sus
iniciales en la misma casilla, nunca un hueco. El texto sale de `src/content/como-esta-hecho.md` y se pide al abrir la app.

**Página pública (`/como-esta-hecho/`):** la misma hoja, sin la isla del escritorio, con una barra superior (**Pol OS** a la izquierda y **Abrir Pol OS**
a la derecha), el índice con enlaces normales y se desplaza con normalidad. Se lee sin JavaScript.

### Proyectos (`Projects`, `ProjectDetail`)
**Vista general:** una cuadrícula de tarjetas con el icono (52px), el nombre y una frase del proyecto. **Detalle**,
con "‹ Proyectos" para volver: cabecera con icono grande (76px), nombre y dirección; botón principal ("Abrir en el
Navegador" si el sitio se deja incrustar; si no, "Visitar sitio ↗" o "Ver en GitHub ↗" en una pestaña nueva) y, si
el repositorio es público y distinto de esa dirección, "Ver repositorio ↗". Después, solo los apartados que tienen
contenido: **Qué es** (párrafos), **Hecho con** (tecnologías en etiquetas y, con repositorio público, una barra de
lenguajes con su leyenda en texto, las etiquetas del repositorio y la licencia) y **Capturas** (miniaturas 16:10).
Una captura se amplía dentro de la ventana, con anterior, siguiente y cerrar; Escape la cierra y no la ventana, y
las flechas pasan de una a otra. Los GIF se animan y, con movimiento reducido, se ve su imagen fija. Los colores de
la barra de lenguajes son los tokens `--lang-1` a `--lang-7`.

### Navegador (`Browser`)
Barra de navegación (atrás, adelante, recargar, dirección de solo lectura con candado si es HTTPS,
Favoritos y "Abrir en pestaña nueva"), barra de favoritos con los proyectos y página. Abierto sin
proyecto muestra la página de Favoritos, como la de Safari: una cuadrícula con solo el icono de cada proyecto (el suyo, o su inicial sobre un degradado) y su nombre debajo. El detalle de cada proyecto
no vive aquí. Una página incrustable se muestra dentro, con "Cargando…" mientras llega; una no incrustable muestra el aviso "no se puede
abrir dentro de Pol OS" con un botón para abrirla en una pestaña nueva. Solo carga sitios de la
lista de favoritos.

### Correo (`Mail`)
Barra "Mensaje nuevo" con el botón Enviar. Campos Para (una ficha con el nombre de Pol, un candado y
la etiqueta "Fijo"; no enseña la dirección), De, Asunto y mensaje, y debajo el widget de Turnstile.
Cada error sale junto a su campo, con `aria-invalid` y `aria-describedby`, y el primer campo con
error recibe el foco. Los errores del servidor (demasiados envíos, verificación fallida, fallo del
correo) salen en un aviso rojo al pie, y los datos escritos se conservan. Si el widget no carga, un
aviso lo dice y el botón queda desactivado. Al enviar, una pantalla de confirmación con "Escribir
otro". Lleva un campo trampa fuera de pantalla y de la tabulación.

### Documento (`PaperDoc`)
Hoja blanca sobre fondo gris con barra superior y botón de descarga. Se usa para Sobre mí. **La hoja es blanca en los
dos temas**, como un papel de verdad (tokens `--paper-*`); lo único que cambia con el tema es el escritorio gris que la
rodea (`--paper-desk`). Arriba, la foto en círculo (84px), el título "Hola, soy Pol" (26px, 700) y la línea de
presentación en negrita; después el gancho en cursiva y las secciones con su título y una línea fina. Los enlaces
a otras apps (Proyectos, Correo) abren esa app en el escritorio; los externos, una pestaña nueva. El botón
"Descargar PDF" solo aparece si el PDF existe. En móvil, la hoja ocupa todo el ancho con un relleno menor.

### Carpeta de notas y nota (`NotesFolder`, `Note`)
**Carpeta:** rejilla de botones (`minmax(112px, 1fr)`) con el icono de nota (52px), el título (12px, hasta tres líneas) y
la fecha (11px, `--muted`), de la nota más reciente a la más antigua. Un clic selecciona (`--accent-soft`; la fecha pasa a
`--fg` para conservar el contraste en oscuro), doble clic o Enter abre. En móvil, la carpeta de inicio abre la nota con un
toque.

**Nota:** misma hoja que Sobre mí (`--paper-*`, blanca en los dos temas) sobre el escritorio gris, con la columna limitada a
640px. Arriba el título (h1), el subtítulo, y una línea con la fecha y las etiquetas (pastillas pequeñas, no clicables). El
texto lleva encabezados, listas, citas, enlaces (pestaña nueva), imágenes y bloques de código **sin colorear**
(monoespaciado, fondo de papel más oscuro). Al final, la invitación a **Con Criterio** (botón con enlace externo) y, en la
ventana, un enlace a la página pública de la nota. Mientras el texto se pide, "Cargando la nota…"; si falla, un aviso con
`role="alert"`. El título de la ventana es el de la nota.

**Página pública (`/notas/<nombre>/`):** la misma hoja, sin la isla del escritorio, con una barra superior (**Pol OS** a la
izquierda y **Abrir en Pol OS** a la derecha). Se desplaza con normalidad (el escritorio no). Se lee sin JavaScript.

**404:** número grande en `--accent-text`, "Esta página no existe" y un enlace al escritorio, centrado y con los tokens del
tema.

### Terminal (`Terminal`)
Siempre oscura, con el aviso `pol@pol-os ~ %` y la línea de comandos enfocada al abrirla. Flechas
arriba y abajo recorren el historial, Tab completa, Ctrl+L limpia y Ctrl+C cancela la línea. Los errores
salen en `--term-error`, lo secundario en `--term-muted` y los enlaces subrayados. La salida es una
región `role="log"` (`aria-live="polite"`) y la línea lleva la etiqueta "Comando". Solo ejecuta comandos
locales del catálogo; nunca nada en el servidor, y lo que escribe el visitante se pinta siempre como texto.
Sus estilos están en `global.css` bajo `.term` (la Terminal se carga bajo demanda). La salida es enfocable para desplazarla con el teclado.

**Minijuegos (`minigames`, `wordle`, `hangman` —el ahorcado—, `guess` —adivina el número—, y `memory` y `checkers`, que abren su ventana; los comandos van en inglés como el resto de la Terminal, y `ahorcado` y `adivina` siguen funcionando escondidos):** durante una partida el aviso cambia al nombre del juego (`wordle>`) y la línea pasa a
llamarse «Jugada». `salir` o Ctrl+C la terminan. En Wordle, cada letra lleva color y marca de texto: `[A]` en su sitio (`--term-hit`, verde),
`(A)` en otro sitio (`--term-near`, amarillo) y `·a·` no está (`--term-muted`). La fila se lee además con palabras, solo para lectores de
pantalla, y las marcas visuales llevan `aria-hidden`. El dibujo del ahorcado también es solo visual; el número de fallos se da en texto.

### Memory (`Memory`)
Ventana de 480 × 600 (pantalla completa en móvil), sin icono en el escritorio: se abre con `memory` en la Terminal. Arriba, «Movimientos» y
«Parejas: n de 8» en `--muted`. Debajo, una cuadrícula de 4 × 4 cartas cuadradas (mínimo 44 px, esquinas de 14 px) con el estilo **«Línea»**, elegido por
Pol entre tres propuestas el 2026-10-16. Boca abajo, `--accent-soft` con una trama de puntos de acento y un filo `--line`. Levantada, **sin fondo**, solo
un filo de 1,5 px en `--line-strong` y el logo monocromo (del color del texto, al 56 % de la carta). Emparejada, el filo pasa a `--accent` y aparece el
nombre debajo, en `--muted`. Los nombres largos del Stack se acortan («Anthropic», «Cloudflare»). Bajo la cuadrícula, una línea con «Pareja: Svelte.» o
«No son pareja.», sin nombres de cartas sin pareja (el lector de pantalla sí los oye). Al terminar, esa línea desaparece y queda solo el aviso
«¡Completado en N movimientos!» con «Jugar otra». Con movimiento reducido, sin transición.

### Damas (`Checkers`)
Ventana de 640 × 640 (pantalla completa en móvil), sin icono en el escritorio: se abre con `checkers` en la Terminal. Arriba, el turno (un punto del color
que mueve y «Tu turno · blancas», «Piensa la máquina…» o «Partida terminada»), las fichas que quedan y el nivel (Fácil / Normal, control segmentado).
En el centro, el tablero en 3D: casillas claras (`#e7e2d8`) y negras (`#1c1c20`) dentro de un marco de madera (`#7a4f2e`) con canto y sombra, y fichas
blancas y rojas con brillo suave; la dama lleva dos fichas apiladas. Se gira y se inclina arrastrando (y con botones ⟲ ⟳ ▲ ▼ y «Restablecer»), entre 28° y
82°, sin cambiar de tamaño, y la vista se guarda. En el móvil, el tablero desde arriba con casillas de 44 px o más. Marcas: anillo de acento en la ficha
elegida, puntos de acento en los destinos, anillo rojo discontinuo (`--danger`) en las fichas que pueden capturar cuando es obligatorio y amarillo en las
casillas de la última jugada. Abajo, la pista (en `--danger` si es un aviso), «Deshacer» y «Rendirse», que al acabar pasa a «Jugar otra». El final sale en
una tarjeta sobre el tablero con el resultado, el motivo y «Jugar otra». Los colores del tablero y de las fichas son propios del juego, iguales en los dos
temas (en oscuro, casillas algo más suaves). Con movimiento reducido, las fichas no se deslizan.

### GitHub (`Github`)
Ventana de 720 × 560 (pantalla completa en móvil) que abre el icono de GitHub del escritorio (ya sin la flecha de enlace externo). Arriba, el total
(«6 repositorios») en `--muted` y el botón «Visitar mi GitHub ↗» (`--accent-solid`). Debajo, tarjetas en rejilla (`minmax(260px, 1fr)`, una columna en móvil)
sobre `--surface` con filo `--line` y esquinas de 10 px, como en el perfil de GitHub: un icono de repositorio propio (libro con marcador, de trazo), el nombre
en `--accent-text` y negrita, la etiqueta «Público» o «Archivado» (píldora con filo), la descripción en `--muted`, la web si la tiene y una línea con el
lenguaje (punto con su color de GitHub), estrellas, forks, «Actualizado hace…» y, si el repositorio está en Proyectos, la píldora «En Proyectos» (filo de
acento), que abre su ficha. Sin repositorios, un aviso y el botón al perfil.

### Ajustes (`Settings`)
Selector de apariencia (claro, oscuro, automático), de fondo de pantalla y de **tamaño del texto** (Normal, Grande y Muy grande; una
miniatura «Aa» con el tamaño real de cada paso), con una nota de que se guarda solo en este navegador. Los mismos tamaños están en
el menú Visualización. Se abre desde el dock y desde el menú de Pol OS. Las miniaturas de
apariencia usan colores fijos para enseñar cada tema sea cual sea el actual.

### Modo móvil (`MobileHome`, `MobileSheet`, `MobileFolder`)
Pantalla de inicio con rejilla de iconos y dock inferior de cristal. Cada app se abre como una hoja
a pantalla completa con botón "‹ Inicio". Proyectos y Notas se agrupan en carpetas.

---

## Pendiente de decidir

- **Fondo de pantalla definitivo:** los cuatro degradados son provisionales.
- **Contenido real:** los proyectos, Sobre mí y el Stack ya son reales; faltan las notas.

---

## Referencias visuales

- macOS actual (Sequoia/Tahoe): barra de menú, dock, ventanas, pantalla de acceso y los alias con
  flecha.
- iOS: pantalla de inicio con carpetas para el modo móvil.
- Prototipo v0.1 de Pol OS, enlazado al principio de este documento.
