# Contenido de Mike OS

Migración local realizada el 21 de octubre de 2026. Las fuentes proporcionadas por Miguel son `content/madmike_vercel/` y `CV MIGUEL FOMBUENA TEXTO 2026.pdf`, conservadas sin cambios. Este documento describe la adaptación actual; el PRD, la arquitectura y el diseño históricos de Pol OS se conservan como referencia de la plantilla.

## Identidad acordada

- Nombre público: Miguel Fombuena. Nombre completo en el CV: Miguel Fombuena Llorens.
- Nombre del sistema: **Mike OS**, elegido por Miguel.
- Ubicación: Valencia, España.
- Dirección pública: `https://migueos.vercel.app`. Proyecto Vercel `mike-os` y repositorio público `miguefomb/mike-os`. El desarrollo conserva `http://localhost:4321`.
- GitHub: `miguefomb`; LinkedIn: `miguelfombuena`; marca creativa: Mad Mike Prods.
- Sin newsletter ni número de WhatsApp: no hay datos confirmados para esos accesos.

## Fuentes y destino

| Fuente dentro de `content/madmike_vercel/` | Destino en Mike OS |
| --- | --- |
| `public/ia/index.html` | Presentación, áreas digitales, metodología y herramientas |
| `public/prod/sobre-mi.html` | Nombre completo, trayectoria audiovisual, formación y colaboraciones |
| `public/ia/project-*.html` | Herramientas y disciplinas en `src/content/skills.json` |
| `public/ia/recursos.html` y guías | Fichas de proyectos y notas sobre los cinco recursos |
| `public/prod/index.html` y páginas de servicios | Ficha de Mad Mike Prods y especialidades del CV |
| `public/index.html` y pies de IA/PROD | Perfiles sociales y enlaces del escritorio |
| `public/ia/img/hero_antes.png` | Retrato original optimizado en `src/assets/foto.webp` |
| Logos y recursos gráficos locales | Favicon, iconos y portadas de proyectos |
| `CV MIGUEL FOMBUENA TEXTO 2026.pdf` | Experiencia con cargos, organizaciones y fechas; estudios, certificaciones, competencias e idiomas |

El CV no atribuye puestos, empleadores, fechas de contratación, idiomas ni resultados cuantitativos que no estén documentados. Los logos de clientes del sitio de origen no se convierten en una relación laboral ni en testimonios.

## Proyectos y notas

Nueve proyectos: Zenkora APP, Macaré, Facturas & Presupuestos, Zoom a Gamma, Prompt Images, Códigos para ChatGPT, Papercraft Dog, Mikeflix y Mike OS. Mad Mike Prods y Mi pagina web son accesos externos en el escritorio y el móvil, por petición de Miguel. Conservan los enlaces originales: `/prod` y `/` en `madmikeprods.vercel.app`. El primero tiene un icono naranja; el segundo, azul.

Los once elementos tienen iconos de la misma familia visual: degradado de la ficha, silueta redondeada y símbolo legible. Zenkora usa una mancuerna y un rayo; Macaré adapta su isotipo original al formato del sistema. Las fuentes SVG están en `src/assets/project-icons/`; `scripts/generar-iconos-proyectos.mjs` genera los PNG usados por el sistema. El isotipo original de Macaré se conserva en `src/assets/project-icons/source/`.

Zenkora APP y Macaré se incorporan por petición de Miguel. Las webs [zenkora.vercel.app](https://zenkora.vercel.app/) y [macarecafe.vercel.app](https://macarecafe.vercel.app/) aportan descripciones y capturas reales; la captura de rutinas de Zenkora procede de `/img/rutinas_2.jpg`. La atribución de la tienda Shopify, la identidad visual y la tipografía Macaré creada desde cero procede de Miguel. Su lámina tipográfica adjunta se optimiza como `public/projects/macare/tipografia.webp` sin alterar el original. La web de Macaré es una vista previa: no se atribuyen ventas, pagos activos ni reseñas reales. No se copian las cifras promocionales de usuarios o valoraciones de Zenkora.

Mikeflix se incorpora por petición de Miguel: servidor personal de Plex con más de 2.000 películas y más de 300 series (cifras aportadas por él). Su [web pública](https://plexmike.netlify.app/) aporta la descripción del panel de catálogo, búsquedas, filtros, almacenamiento, calidad y copias de seguridad. La ficha usa una captura real de su portada, un icono propio de pantalla y servidor, y enlaza al panel en otra pestaña. El stack se limita a Plex y a las tecnologías observadas en esa web: HTML, CSS, JavaScript y Netlify.

Las cinco notas son resúmenes adaptados de los recursos existentes y enlazan a sus guías completas. Conservan las fechas de publicación documentadas en el README de la web anterior: 18 y 19 de octubre de 2026. No se presentan las guías como aplicaciones con demo pública. Las páginas externas se abren en otra pestaña; no se presupone permiso de incrustación.

Las portadas son recursos del sitio de origen. La captura de Mike OS se obtiene del escritorio local ya personalizado.

## Datos vacíos y pendientes

- **Favoritos:** selección aportada por Miguel: 44 películas y series (Matrix aparece una sola vez), 22 artistas, 7 libros y 8 videojuegos/sagas. Todas las listas se ordenan por el título completo con `Intl.Collator('es')`, sin distinguir mayúsculas ni acentos y con orden numérico. No hay límite de diez entradas. Música muestra perfiles de artistas con fotos, sin atribuir canciones favoritas. Las imágenes son locales y están optimizadas; sus fuentes están en `favoritos-fuentes.json`. Se pueden regenerar con `node scripts/importar-favoritos.mjs`.
- **Portadas representativas:** las sagas Harry Potter, El señor de los anillos y Piratas del Caribe usan el primer filme; Harry Potter en Libros usa La piedra filosofal. Los clásicos Disney se interpretan como las versiones animadas, Avatar como la película de James Cameron, Oldboy como la de 2003 y Digimon como la serie de 1999. Los videojuegos conservan los nombres de las sagas pedidos y aclaran la entrega de su portada. Plan B es el dúo puertorriqueño.
- **Carpetas en móvil:** fondo opaco con los colores del tema, etiquetas sin sombra y oscurecimiento del escritorio para mejorar la lectura de Proyectos y Notas.
- **Libro de visitas:** sin reseñas hasta recibir y aprobar testimonios reales.
- **Stack:** muestra las herramientas declaradas en el material de Miguel. Se eliminan los recuentos y años de la plantilla; no hay estadísticas calculadas de sus repositorios. El componente conserva los gráficos para futuras estadísticas verificadas. El juego Memory usa herramientas documentadas y las tecnologías de Mike OS para funcionar sin estadísticas.
- **GitHub:** muestra todos los repositorios públicos de `miguefomb`, sin filtrar por `showcase` ni excluir forks o archivados. El script consulta el perfil y sustituye la copia local en cada actualización. Incluye seis repositorios tras crear `mike-os`.
- **Dominio:** `migueos.vercel.app`, elegido como alternativa corta porque `portfoliomigue.vercel.app` estaba ocupado fuera de esta cuenta. Se actualizan `persona.ts`, `robots.txt`, el CV y la imagen social.
- **Correo:** adaptado a Vercel con Resend y límites distribuidos mediante contadores temporales de Upstash Redis. Las claves no se han configurado ni copiado de la web anterior: los endpoints devuelven 503 hasta completar las variables de `.env.example`. La verificación anti-bots y la aprobación de reseñas se conservan.
- **Formación y experiencia:** el PDF aportado completa cinco puestos, tres titulaciones, tres certificaciones de 2026 y los idiomas (castellano y valenciano nativos, inglés B1). Se conserva además la trayectoria creativa de la web anterior. El CV público indica Llíria/Valencia y los canales profesionales; no incorpora domicilio completo ni fecha de nacimiento.
- **Descarga del CV:** el mismo Markdown genera la vista y el PDF. Tras editarlo, se regenera el archivo y su huella; el enlace usa `?v=<huella>` y `/cv.pdf` lleva `Cache-Control: no-store` en la compilación. Un test descarga el archivo y compara sus bytes con el PDF vigente.

## Validación

El PDF y la imagen social se regeneran desde los datos actuales. Se comprueban tipos, compilación, pruebas unitarias y recorridos de personalización en escritorio y móvil. Los tests de contenido verifican la selección completa, su orden y la carga de cada imagen. Los tests de funcionalidad que necesitan repositorios, GIF o proyectos incrustables deben usar fixtures, no imponer datos ficticios al portfolio.
