# Product Requirements Document (PRD)

> **Adaptación Mike OS (2026-10-21):** portfolio de Miguel Fombuena Llorens / Mad Mike Prods. Mantiene las apps y flujos de la plantilla. M-05 muestra herramientas profesionales sin estadísticas hasta disponer de datos calculados; M-07 utiliza sus perfiles confirmados (GitHub, LinkedIn, Instagram, YouTube y Spotify), sin WhatsApp ni newsletter. Favoritos y reseñas empiezan vacíos. Detalles en [contenido-mike.md](contenido-mike.md).

> **Ajustes acordados el mismo día:** C-01 muestra todos los repositorios públicos del perfil, sin topics obligatorios. M-07 añade accesos externos a Mad Mike Prods y la web de Miguel, que se retiran de Proyectos. S-08 utiliza iconos propios para cada proyecto. M-06 amplía la trayectoria con el CV aportado y descarga el PDF actual con un enlace versionado.

> **Plantilla:** este documento es el de Pol OS, el portfolio de Pol Marzà del que nace esta plantilla. Déjalo como ejemplo del método o reescríbelo para tu proyecto.

<!-- Fuente de verdad sobre qué construimos y por qué.
     Actualizar este archivo cuando cambie el alcance, las funcionalidades o el usuario objetivo.
     Si algo se mueve a "fuera de alcance", no borrar: mover a la sección correspondiente. -->

---

## Resumen ejecutivo

**Pol OS** es el portfolio personal de Pol Marzà, presentado como un sistema operativo de escritorio
en el navegador, inspirado en macOS. El visitante llega a una pantalla de acceso con la foto y el
nombre de Pol, entra con un clic y se encuentra un escritorio con ventanas, dock y barra de menú. Cada
elemento del escritorio enseña una parte de su trabajo y de su vida: cada proyecto es un icono que
se abre en un navegador interno, el currículum es un documento, las notas son una carpeta y el
contacto es un cliente de correo.

El sitio es de lectura: no hay cuentas ni área privada. El contenido vive en el repositorio y se
actualiza con commits, no desde la interfaz. Lo único que escribe el visitante es un mensaje en la app
de Correo, que llega al correo de Pol, y, si quiere, una reseña en el Libro de visitas, que solo se
publica cuando Pol la aprueba. Cada visitante puede personalizar su propia sesión (tema
claro/oscuro, fondo de pantalla), y esa preferencia se guarda solo en su navegador.

Existe porque un portfolio genérico (lista de proyectos con tarjetas) no se recuerda. El formato de
sistema operativo es en sí mismo una demostración de criterio de producto y de pericia técnica en
frontend, y da una estructura natural para crecer: añadir una app nueva (navegador interno,
reproductor de música, un juego) no obliga a rediseñar nada.

---

## Problema que resuelve

Quien evalúa a una persona que desarrolla (para contratarla, encargarle un trabajo o seguir su
trabajo) ve decenas de portfolios casi idénticos y no tiene forma rápida de distinguir quién sabe
construir producto y quién solo ha rellenado una plantilla. Además, la información útil está
repartida: el código en GitHub, el criterio en la newsletter, la trayectoria en LinkedIn.

Pol necesita un único sitio que (1) lo diferencie, (2) reúna todo lo anterior con un solo punto de
entrada y (3) pueda crecer con sus proyectos sin tener que mantener una infraestructura pesada.

---

## Usuario objetivo

El sitio tiene un único propietario (Pol) y tres perfiles de visitante. Ninguno inicia sesión.

**Reclutador / responsable de contratación.** Llega con poco tiempo desde un enlace en un CV o en
LinkedIn. Quiere saber en un minuto qué sabe hacer Pol, qué ha construido y cómo contactarle. Su
frustración: portfolios que no dicen nada concreto o que tardan en cargar.

**Cliente potencial.** Busca a alguien que le construya algo. Quiere ver trabajo parecido a lo que
necesita y un modo directo de escribir. Su frustración: no saber si la persona está disponible ni
cómo se le contacta.

**Otra persona desarrolladora.** Curiosea por interés técnico. Quiere ver el código en GitHub,
las herramientas que usa Pol y sus notas técnicas. Su frustración: portfolios sin código ni
criterio explicado.

Los tres usan tanto móvil como escritorio; el enlace suele abrirse desde una app de mensajería o
desde LinkedIn en el teléfono.

---

## Funcionalidades core (MoSCoW)

<!-- Cada funcionalidad lleva un ID estable y un criterio de aceptación comprobable.
     Los IDs no se reutilizan ni se renumeran. -->

### MUST
- **[M-01] Pantalla de acceso** — Dado un visitante que abre la home, cuando la página carga, entonces
  ve la foto y el nombre de Pol y un campo de contraseña ya relleno con puntos; y cuando hace clic en
  el campo o pulsa Enter, entonces entra al escritorio sin escribir nada.
  *Negativo:* dado que el visitante intenta escribir en el campo, entonces el campo no acepta texto
  (es decorativo) y no aparece ningún mensaje de error.
- **[M-02] Escritorio de iconos en pantallas anchas** — Dado un visitante en una pantalla de escritorio,
  cuando ha entrado, entonces ve barra de menú superior, dock inferior con las apps del sistema
  (Navegador, Correo, Terminal si existe, Ajustes), un fondo de pantalla y los iconos de contenido sobre el
  escritorio; y cuando hace doble clic en un icono, entonces se abre en una ventana que se puede
  mover, redimensionar, cerrar y traer al frente al hacer clic en ella.
  *Negativo:* dado que arrastra una ventana fuera de la pantalla, entonces la barra de título
  siempre queda visible y alcanzable.
- **[M-03] Modo móvil** — Dado un visitante en una pantalla estrecha (menos de 768 px), cuando ha
  entrado, entonces ve una pantalla de inicio con una rejilla de iconos; y cuando toca un icono
  (un solo toque), entonces el contenido se abre a pantalla completa con un botón visible para volver
  a la pantalla de inicio. Los proyectos y las notas aparecen agrupados en una carpeta cada uno.
  *Negativo:* dado que gira el dispositivo o cambia el ancho, entonces no se pierde lo abierto.
- **[M-04] Proyectos en el escritorio** — Dado un visitante en escritorio, cuando mira el escritorio,
  entonces ve una carpeta Proyectos que agrupa los proyectos de Pol (sin un icono suelto por cada uno, para no
  recargarlo), y los proyectos que viven solo en GitHub como un icono propio con su nombre; y cuando abre la
  carpeta o hace doble clic en ese icono, entonces se abre la app Proyectos con la vista general o con el detalle
  de ese proyecto (ver [S-08]), desde donde puede abrirlo en el Navegador.
  *Negativo:* dado un proyecto cuyo sitio no puede cargarse dentro de la ventana, entonces su detalle le
  ofrece "Visitar sitio" en una pestaña nueva y no una ventana en blanco; y si lo abre en el Navegador por
  otra vía, ve el aviso de [M-10].
  *(Reescrito el 2026-10-10: antes el doble clic abría el Navegador directamente.)*
- **[M-05] Stack** — Dado un visitante, cuando abre Stack, entonces ve las herramientas de desarrollo que
  usa Pol en forma de gráficos, por este orden: unas cifras de resumen, cómo fue creciendo año a año, el reparto
  por categoría y, al final, el detalle por herramienta con en cuántos de sus repositorios aparece y desde qué
  año la usa; y una explicación de cómo se obtienen esos datos. Esos datos se actualizan solos cada día a partir de sus
  repositorios de GitHub. Los detalles están en `docs/features/stack.md` y `docs/features/stack-graficos.md`.
  *Negativo:* nada de la ventana es clicable, lleva a otra parte, cambia de vista ni sugiere que las herramientas se
  puedan usar desde Pol OS; cada gráfico tiene su equivalente en
  texto; y ningún dato publicado revela el nombre de un repositorio privado.
  *(Reescrito el 2026-10-10: antes era "Herramientas", una lista que parecía de utilidades que se podían usar.)*
- **[M-06] Sobre mí como documento (CV)** — Dado un visitante, cuando hace doble clic en el icono de
  documento "Mi CV" (antes "Sobre mí"), entonces se abre una ventana con la presentación y el currículum de Pol con
  aspecto de documento, con su foto, y un botón para descargar el PDF, generado a partir del mismo texto.
  Los detalles están en `docs/features/sobre-mi.md`.
  *Negativo:* dado que el PDF no está disponible, entonces el texto sigue visible y el botón de
  descarga no aparece.
- **[M-07] Accesos directos externos** — Dado un visitante, cuando mira el escritorio, entonces ve un icono
  para la newsletter (concriterio.blog), otro para GitHub (github.com/polmarza), otro para LinkedIn
  (linkedin.com/in/polmarza) y otro para WhatsApp (el icono de la app); y cuando hace doble clic en uno (o
  un toque en el móvil), entonces se abre su web en una pestaña nueva. El de WhatsApp abre una conversación
  con Pol, con un primer mensaje que dice que llega desde el portfolio.
  *Negativo:* el enlace de WhatsApp no figura entre los perfiles públicos de los datos estructurados: ni su
  dirección ni el número salen en ellos.
- **[M-08] Correo (Contacto)** — Dado un visitante, cuando abre el icono de correo, entonces ve un cliente
  de correo con el campo "Para" relleno y no editable; y cuando introduce su correo, un asunto y un
  mensaje válidos y envía, entonces ve una confirmación y el mensaje llega al correo de Pol.
  *Negativo:* dado un correo con formato inválido o un campo obligatorio vacío, cuando envía,
  entonces ve el error junto al campo y no se envía nada. Dado un envío que supera el límite
  de frecuencia o falla la verificación anti-bots, entonces ve un mensaje claro y no se envía nada.
- **[M-09] Ajustes de sesión** — Dado un visitante con la app Ajustes abierta, cuando cambia entre tema
  claro y oscuro, elige un fondo de pantalla de los disponibles o uno de los tres tamaños de texto (Normal,
  Grande y Muy grande, también desde el menú Visualización), entonces el escritorio cambia al
  momento; y cuando recarga la página o vuelve otro día en el mismo navegador, entonces se
  mantiene su elección.
  *Negativo:* dado un navegador que bloquea el almacenamiento local, entonces la app funciona con
  los valores por defecto y no muestra errores.
- **[M-10] Navegador con favoritos de proyectos** — Dado un visitante con el Navegador abierto, cuando lo
  ve, entonces la barra de favoritos contiene todos los proyectos de Pol; y cuando hace clic en uno,
  entonces el sitio se carga dentro de la ventana.
  *Negativo:* dado un sitio marcado como no incrustable, cuando lo elige, entonces ve un aviso y un
  botón "Abrir en pestaña nueva" en lugar de una ventana en blanco. El navegador solo carga los
  sitios de su lista de favoritos, no direcciones arbitrarias.

- **[M-11] Cabeceras de seguridad** — Dado un visitante que carga cualquier página de Pol OS, cuando el
  navegador la recibe, entonces la respuesta limita con una política de seguridad de contenido (CSP)
  qué scripts, estilos, imágenes, conexiones y marcos puede usar la página (solo Pol OS, Turnstile y
  los proyectos incrustables), impide que otra web incruste Pol OS y no envía la dirección completa
  como referencia al salir; y cuando usa todas las apps (abrir ventanas, cambiar tema y fondo, abrir
  un proyecto en el Navegador y enviar un mensaje), entonces el navegador no registra ninguna
  violación de la política.
  *Negativo:* dado un script en línea sin autorizar, un recurso de un dominio no permitido o una
  página de otro origen que intenta incrustar Pol OS, entonces el navegador lo bloquea.

### SHOULD
- **[S-01] Notas (blog)** — Dado un visitante, cuando abre la carpeta Notas, entonces ve las entradas como
  iconos de nota ordenadas por fecha; y cuando hace doble clic en una, entonces la lee en una ventana.
  Cada nota tiene además su propia URL pública, con título y descripción propios, que carga el
  contenido completo sin ejecutar JavaScript, de forma que los buscadores la indexan. Cada nota lleva
  título, subtítulo, fecha y etiquetas, y termina invitando a suscribirse a Con Criterio. Los detalles
  están en `docs/features/notas.md`.
  *Negativo:* dada una URL de nota que no existe, entonces se muestra una página 404 dentro del
  mismo entorno.
- **[S-03] Favoritos (para conocer a Pol)** — Dado un visitante, cuando abre la carpeta Favoritos, entonces
  ve cuatro secciones (Juegos, Películas y series, Libros y Música), cada una con el top 10 de Pol; y cuando
  pulsa un elemento, entonces llega a su ficha (los juegos, a Shelvid; los libros y las películas, a su enlace;
  las canciones, a YouTube). Las canciones y los tráilers se reproducen en un mini reproductor de YouTube, con
  el vídeo a la vista, que se abre al pulsar play. Los detalles están en `docs/features/favoritos.md`.
  *Negativo:* dado un visitante que no ha pulsado play, entonces no se carga nada de YouTube; y dado un
  vídeo que no se puede cargar, entonces el elemento sigue enlazando a YouTube y no queda un reproductor roto.
  *(Reescrito el 2026-10-12: antes era un reproductor de música; pasa a ser una carpeta con más cosas de Pol.)*
- **[S-04] Terminal con comandos y huevos de Pascua** — Dado un visitante con la Terminal abierta, cuando
  escribe `help`, entonces ve la lista de comandos disponibles; y cuando ejecuta uno (por ejemplo
  `about` o `projects`), entonces ve su salida.
  *Negativo:* dado un comando que no existe, entonces ve "comando no encontrado" y una pista para
  usar `help`; la terminal nunca ejecuta nada en el servidor. Los detalles (qué comandos hay, el
  historial, el autocompletado) están en `docs/features/terminal.md`.

- **[S-05] Menús de la barra de menú** — Dado un visitante en escritorio, cuando hace clic en Archivo,
  Edición, Visualización, Ventana o Ayuda, entonces se abre un menú con acciones que funcionan (las
  de la ficha `docs/features/menus.md`); y cuando elige una, entonces se ejecuta y el menú se
  cierra. Se puede recorrer con el teclado y se cierra con Escape o con un clic fuera.
  *Negativo:* dada una acción que no aplica ahora (por ejemplo "Cerrar ventana" sin ninguna ventana
  abierta), entonces aparece desactivada y elegirla no hace nada.

- **[S-08] Proyectos: vista general y detalle** — Dado un visitante con la app Proyectos abierta, cuando la
  mira, entonces ve los proyectos de la carpeta como una cuadrícula con su icono, su nombre y una frase (los que tienen icono propio en el escritorio no salen aquí); y cuando
  pulsa uno, entonces ve su detalle: qué es, con qué está hecho (tecnologías y, si el repositorio es público, sus
  lenguajes y etiquetas), capturas de pantalla y los botones para abrirlo en el Navegador o en una pestaña nueva
  y para ver su repositorio. Los detalles están en `docs/features/proyectos.md`.
  *Negativo:* dado un proyecto sin repositorio público o sin capturas, entonces su detalle no muestra esos apartados
  ni botones rotos; dado un proyecto cuyo sitio no se puede incrustar, entonces el botón es "Visitar sitio" en una
  pestaña nueva en lugar de abrir una ventana en blanco.

- **[S-10] Cómo está hecho (el README del proyecto)** — Dado un visitante, cuando abre «Cómo está hecho» (desde el
  escritorio, desde el detalle de Pol OS en Proyectos o desde la Terminal), entonces lee un documento con un índice
  que explica cómo está montado Pol OS: las tecnologías, cada una con su logo; cómo funciona por dentro (el sitio, las
  ventanas, el formulario de Correo, el Libro de visitas y la actualización automática del Stack con el token de
  GitHub); y las limitaciones por los bloqueos de LaLiga a Cloudflare, las ideas para resolverlas y por qué no se han
  aplicado. Los detalles están en `docs/features/como-esta-hecho.md`.
  *Negativo:* dado un logo que no se puede mostrar, entonces la tecnología sigue apareciendo con su nombre; y ningún
  texto del documento contiene una clave, un token, un correo ni un dato de una cuenta.

- **[S-06] Vista previa al compartir y SEO técnico** — Dado un enlace a example.com pegado en una red
  social o una mensajería, cuando esta lee la página, entonces obtiene el título, la descripción y una
  imagen de 1200 × 630 con la foto y el nombre de Pol, con su dirección canónica; y cuando un buscador
  la rastrea, entonces encuentra `robots.txt`, un `sitemap.xml` con la home y datos estructurados de
  persona; y cuando el navegador la carga, entonces muestra el icono de la pestaña y cumple el
  presupuesto de rendimiento (LCP bajo 2,5 s en local, CLS bajo 0,1 y un tope de JavaScript).
  *Negativo:* dado un buscador, entonces no indexa `/api/`; y ningún metadato contiene
  el correo de Pol ni ningún dato privado.

- **[S-07] Mosaico de ventanas** — Dado un visitante en escritorio con una ventana abierta, cuando deja el
  ratón sobre su botón verde, entonces aparece un cuadro con "Mitad izquierda", "Mitad derecha" y "Ampliar";
  y cuando elige una mitad, entonces la ventana pasa a ocupar esa mitad de la pantalla. También se hace
  desde el menú Ventana y con el teclado. Los detalles están en `docs/features/mosaico-ventanas.md`.
  *Negativo:* dada una ventana colocada en una mitad, cuando la arrastra, entonces se suelta de esa mitad y
  recupera su tamaño anterior (mientras está colocada no tiene tirador de tamaño); dada una pantalla sin ratón, entonces sigue
  pudiendo colocarla desde el menú Ventana.

- **[S-09] Libro de visitas** — Dado un visitante, cuando abre la app Libro de visitas, entonces lee las
  reseñas que Pol ha aprobado (nombre visible, relación con Pol, texto y, si las dio, sus redes) y puede
  escribir la suya: texto, nombre visible, relación con Pol, correo y redes opcionales. Una reseña solo se
  publica si su autor confirma el correo desde un enlace que recibe y Pol la aprueba después. El correo
  nunca se muestra ni se guarda en el repositorio. Por el mismo formulario se puede pedir editar o retirar una
  reseña ya publicada, y también pasa por Pol. Los detalles están en `docs/features/libro-de-visitas.md`.
  *Negativo:* dado un enlace de confirmación caducado o manipulado, entonces no se envía nada a Pol y se
  explica el motivo; y dada una reseña con HTML, con una dirección que no es de una red admitida o con
  más texto del permitido, entonces se rechaza o se muestra solo como texto.

### COULD
- **[C-01] Repositorios de GitHub** — Dado un visitante, cuando abre GitHub en el escritorio, entonces ve
  una ventana con los repositorios públicos de Pol (nombre, descripción, web si la tienen, lenguaje
  principal, estrellas y forks), que se actualiza sola cada día, y un botón para ir a su perfil. Los
  Proyectos siguen siendo una selección hecha a mano (redefinido el 2026-10-16: antes decía que cada
  repositorio público aparecía como proyecto).
  Solo salen los que Pol etiqueta con el topic `showcase` en GitHub.
  *Negativo:* dado un repositorio sin esa etiqueta, privado o fork, entonces no aparece; y si los
  datos no se han podido actualizar, se ven los del último día que se pudo.
- **[C-03] Iconos de aplicación con la identidad de cada enlace** — Dado un enlace externo, cuando
  se muestra, entonces usa el icono de su servicio (por ejemplo el de la newsletter).
  *(Hecho el 2026-10-10: Con Criterio, LinkedIn y GitHub llevan su icono, en `public/links/`.)*
- **[C-04] Chatbot para hablar con Pol** — Dado un visitante, cuando escribe una pregunta, entonces recibe una
  respuesta basada en el contenido del portfolio. Requiere decidir antes coste, límites de uso y
  protección frente a abuso; no se empieza sin documentarlo en `architecture.md`.
  *En espera (Pol, 2026-10-16):* falta material para que conteste como él. Se retoma cuando estén el libro
  que está escribiendo y una recopilación de su newsletter Con Criterio (MEJORA-09).
- **[C-05] Memory con las herramientas del Stack** — Dado un visitante, cuando escribe `memory` en la Terminal
  (o lo elige en `minigames`), entonces se abre una ventana con 16 cartas boca abajo (8 parejas de logos de
  herramientas que Pol usa de verdad, sacadas del Stack); al encontrar una pareja, queda a la vista con su
  nombre, y al completarlas ve cuántos movimientos ha necesitado y puede jugar otra.
  *Negativo:* dado que ya hay dos cartas levantadas que no son pareja, cuando pulsa una tercera, entonces
  no se levanta hasta que las dos anteriores se han vuelto a tapar; el juego no carga nada hasta abrirlo.

- **[C-06] Damas en 3D** — Dado un visitante, cuando escribe `checkers` en la Terminal (o lo elige en
  `minigames`), entonces se abre una partida de damas españolas contra la máquina (el color se sortea), con el tablero en
  3D en el escritorio (se gira y se inclina con el ratón) y visto desde arriba en el móvil; puede mover con el ratón, con
  el dedo o con el teclado, y al acabar ve quién ha ganado y puede jugar otra.
  *Negativo:* dado un movimiento que no permite el reglamento (por ejemplo, no capturar cuando es
  obligatorio), entonces no se hace y se marca qué fichas pueden mover; el juego no carga nada hasta abrirlo.

### WON'T (esta versión)
- **[C-02] Juego de tablero inspirado en Catán** — descartado el 2026-10-12: a un visitante le interesa conocer a Pol, no jugar; su sitio lo ocupan los Favoritos (S-03).
- Inicio de sesión real, cuentas de usuario o modo invitado diferenciado.
- Edición de contenido desde la propia interfaz. El contenido se cambia en el repositorio.
- Base de datos o almacenamiento de archivos subidos por el visitante.
- Guardar los mensajes de contacto en el servidor: solo se reenvían por correo.
- Idiomas distintos del español.
- Proxy para incrustar sitios que prohíben aparecer en un iframe.
- Contenido enviado por los visitantes que se publique sin que Pol lo apruebe. *(El Libro de visitas, con
  aprobación manual, entró como S-09 el 2026-10-11.)*

<!-- El ID S-02 queda vacante: el navegador pasó a MUST como M-10. -->

---

## Flujos de usuario principales

**Primera visita en escritorio.** El visitante llega a la home y ve la pantalla de acceso con la
foto y el nombre de Pol. Hace clic en el campo de contraseña (decorativo) y el escritorio aparece.
Hace doble clic en el icono de un proyecto: se abre el Navegador con ese proyecto cargado y
los demás en la barra de favoritos. Después abre el documento "Mi CV" y descarga el CV.

**Primera visita en móvil.** Llega desde LinkedIn, toca para entrar y ve la pantalla de inicio con
iconos. Toca "Mi CV", lee el currículum a pantalla completa, vuelve con el botón de inicio y abre
la carpeta Proyectos.

**Contactar con Pol.** Abre el icono de Correo, ve el "Para" bloqueado, escribe su correo, un asunto y un mensaje, y
pulsa enviar. Ve la confirmación. Si se equivoca en el correo, el error aparece junto al campo
sin perder lo escrito.

**Dejar una reseña.** Abre el Libro de visitas, lee las que hay y pulsa "Dejar reseña". Escribe su
texto, su nombre, cómo conoce a Pol y su correo, y añade sus redes si quiere. Recibe un correo con un enlace
de confirmación, lo abre y ve que su reseña queda pendiente. Cuando Pol la aprueba, aparece en el libro.

**Personalizar la sesión.** Abre Ajustes, activa el tema oscuro y elige otro fondo. El cambio es
inmediato y, si vuelve días después desde el mismo navegador, lo encuentra igual.

**Llegar a una nota desde Google.** El visitante entra directamente a la URL de una nota. Ve la
página con el contenido completo y, al cargar el entorno, la nota se abre en una ventana
sobre el escritorio.

---

## Requisitos no funcionales

- **Rendimiento.** La pantalla de acceso debe ser ligera y cargar rápido en móvil con red normal;
  el código de cada app se carga solo cuando se abre. Objetivo: LCP por debajo de 2,5 s en la home.
- **Accesibilidad.** Todo se puede usar con teclado (abrir apps, mover foco entre ventanas, cerrar con
  Escape). Contraste suficiente en ambos temas y respeto de `prefers-reduced-motion` para las
  animaciones.
- **Responsive.** Mismo contenido y mismas apps en escritorio y móvil; solo cambia la presentación
  (ventanas flotantes frente a pantalla completa).
- **SEO.** Las notas tienen URL propia, título, descripción, etiquetas Open Graph y aparecen en el
  sitemap. La home tiene metadatos propios y describe a Pol en texto, no solo en imagen.
- **Idioma.** Solo español.
- **Seguridad.** No hay autenticación, así que no hay nada que proteger tras ella. El formulario de
  contacto valida en servidor, usa verificación anti-bots y límite de frecuencia. La dirección de
  destino y las claves viven en variables de entorno del servidor, nunca en el repositorio ni en
  el cliente. El Libro de visitas añade confirmación de correo con un enlace firmado y con caducidad,
  aprobación manual de cada reseña y texto siempre plano.
- **Privacidad.** Solo se guarda en el navegador la preferencia de tema y fondo. No se guardan los
  mensajes de contacto. En el Libro de visitas, el correo del autor solo sirve para confirmar y viaja por
  correo hasta Pol: no se publica, no se guarda en el repositorio ni se escribe en los registros del
  servidor. Lo que se publica (nombre, texto y redes) es lo que el autor escribe para que se vea, y puede
  pedir retirarlo cuando quiera. Si más adelante se añade analítica, se documenta aquí antes.

---

## Fuera de alcance (explícito)

- Login real, usuarios o roles: se descartó porque el contenido se edita desde el repositorio y
  elimina la superficie de ataque.
- Panel de administración o edición dentro de la web: se descartó por la misma razón.
- Base de datos y subida de archivos: el contenido es estático y los fondos son archivos del repo.
- Almacenar los mensajes de contacto: basta con que lleguen por correo. Las reseñas del Libro de visitas
  tampoco se guardan en el servidor: las aprobadas son archivos del repositorio.
- Inglés u otros idiomas por ahora.
- Alojar audio propio en el reproductor de música (copyright): solo se incrusta un servicio externo.
- Proxy para saltarse las restricciones de iframe de otras webs.
