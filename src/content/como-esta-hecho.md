---
title: "Cómo está hecho Mike OS"
description: "Un escritorio para conectar IA, automatización, desarrollo web, cine y música: así se organiza y funciona el portfolio de Miguel Fombuena."
---

## Qué es

Mike OS es mi portfolio con forma de escritorio: ventanas, dock, proyectos, notas y una Terminal. En móvil, las mismas apps se abren a pantalla completa.

Parte de la plantilla abierta [pol-os-template](https://github.com/polmarza/pol-os-template), de Pol Marzà. La identidad y el contenido reúnen mi trabajo en tecnología y el de Mad Mike Prods, mi proyecto audiovisual y musical.

## Tecnologías

Las piezas que sostienen este escritorio:

{{tecnologias}}

La plantilla original se desarrolló con Claude Code. En esta adaptación se conserva su arquitectura y se personalizan el contenido y las apps que lo presentan.

## Cómo funciona por dentro

**Astro genera las páginas.** El contenido se prepara al compilar: los proyectos, las notas y los textos del portfolio son archivos del repositorio. Cada nota también tiene una página propia que puede leerse sin JavaScript.

**Svelte da vida al escritorio.** El gestor de ventanas mueve, amplía y minimiza cada app. Las partes más pesadas se cargan al abrirlas, y el modo móvil utiliza el mismo contenido con otra presentación.

**Los datos se validan.** Las colecciones comprueban las fichas y sus imágenes al compilar. Los enlaces de proyectos pertenecen a una lista cerrada; las páginas externas que no se incrustan se abren en otra pestaña.

**Tus preferencias se quedan en tu navegador.** El tema, el fondo y el tamaño del texto se guardan localmente. No hay cuentas de usuario ni panel de administración.

## El contenido y las herramientas

El perfil, el CV y los recursos proceden de mi web anterior. Las notas resumen las guías existentes y enlazan a ellas. Las imágenes de los proyectos y el retrato también son recursos propios de esa web.

El [Stack](#abrir-stack) muestra las herramientas que utilizo en IA, automatización, desarrollo web, imagen y música. No atribuye años ni estadísticas de repositorios sin calcularlos.

La ventana GitHub reúne todos los repositorios públicos de mi perfil, sin exigir etiquetas; incluye también los forks y los archivados. La plantilla dispone de scripts y una tarea opcional de GitHub Actions para actualizar esa copia. El contenido profesional se mantiene aparte para que herramientas como DaVinci Resolve, Make o Pro Tools también tengan su sitio.

## El formulario de Correo y el Libro de visitas

Los formularios se ejecutan en funciones de Vercel y conservan la verificación anti-bots de Cloudflare Turnstile, los límites de frecuencia y la validación en el servidor. El destino del mensaje se toma de la configuración, nunca de lo que envía el navegador.

El [Libro de visitas](#abrir-visitas) requiere confirmar el correo del autor y mi aprobación antes de publicar una reseña. Ninguna reseña de la plantilla se presenta como un testimonio real sobre mi trabajo.

El envío utiliza Resend y contadores temporales compartidos para los límites. Hasta configurar las claves de estos servicios, los formularios no envían mensajes.

## Cómo se trabaja

El contenido está separado de la interfaz para que actualizar un proyecto o el CV no requiera rehacer el escritorio. El PDF se genera desde el mismo texto que se lee en la app Mi CV. El enlace de descarga incorpora la huella de esa versión para evitar una copia antigua en caché. El retrato y la identidad alimentan la imagen para compartir.

Las comprobaciones de tipos, las pruebas unitarias y los recorridos de navegador se ejecutan contra la versión local. Se revisan tanto el escritorio como el móvil, el teclado y el respeto al movimiento reducido.

## Estado local y publicación

Mike OS se prepara para publicarse en [migueos.vercel.app](https://migueos.vercel.app), con su código en [GitHub](https://github.com/miguefomb/mike-os). Astro utiliza el adaptador de Vercel. La web anterior conserva sus enlaces como referencia de los recursos originales.

Favoritos reúne mi selección personal de películas, series, artistas, libros y videojuegos, ordenada alfabéticamente y con imágenes. El Libro de visitas espera testimonios reales.
