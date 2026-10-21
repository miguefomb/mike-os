# Personalización de Mike OS con el contenido real de Miguel

**Fecha:** 2026-10-21 11:04 (Europe/Madrid)
**Tipo:** Migración / Fix
**Requisitos:** M-01, M-05, M-06, M-07, S-01, S-03, S-04, S-06, S-08, S-09, S-10, C-05

## Qué se hizo

Se sustituyó el contenido ficticio por el perfil de Miguel Fombuena Llorens / Mad Mike Prods, usando los archivos proporcionados en `content/madmike_vercel/`. El sistema se llama Mike OS; el dominio sigue siendo localhost y los favoritos quedan vacíos, según las respuestas de Miguel.

Se incorporaron ocho proyectos y cinco notas, el retrato, las herramientas profesionales y cinco perfiles sociales. El CV, la imagen social y los iconos se regeneraron. Las reseñas ficticias se retiraron y no se copiaron los recuentos de repositorios ni los años de la plantilla. Los ejemplos se conservan en el historial y en una copia local bajo `.cache/plantilla-original/`.

Stack muestra el catálogo profesional sin cifras inventadas; Memory mantiene un conjunto de herramientas documentadas para seguir funcionando sin estadísticas. La Terminal y el avatar de reserva usan la identidad de Miguel. Se corrigió la separación del frontmatter CRLF para evitar restos de la cabecera en el PDF de Windows. El PDF ocupa dos páginas y Proyectos empieza en la segunda.

La consulta de GitHub encontró cinco repositorios públicos y ninguno con `showcase`; el listado destacado permanece vacío. La importación de `persona.ts` incluye su extensión para que el script funcione directamente con Node.

## Qué se modificó

- `src/content/`: identidad, enlaces, CV, proyectos, notas, favoritos, reseñas, estadísticas y documento técnico.
- `src/assets/`, `public/links/`, `public/projects/`, iconos, imagen social, manifiesto y PDF.
- Apps de Stack, Favoritos, Memory y Terminal; avatar de acceso; metadatos de la home.
- Generación de imágenes y plantilla del CV; parser de frontmatter y script de repositorios.
- Tests afectados por la identidad real, las listas vacías y las diferencias de rutas o saltos de línea de Windows. La geometría de los gráficos usa fixtures.
- Documentación, configuración local y exclusión de `content/` y `.cache/` del análisis TypeScript. La referencia original no se modifica ni se publica.

## Por qué

Convertir la instalación de la plantilla en un portfolio coherente con las áreas reales de Miguel: IA aplicada, automatización, desarrollo web y producción audiovisual y musical. Las fuentes, lo confirmado y lo pendiente se documentan en `docs/contenido-mike.md`.

## Validación

`pnpm check`: `0 errors`, `0 warnings`, `1 hint` (variable sin uso en un test histórico). `pnpm build`: `[build] Complete!`. Astro avisa de que `guestbook` está vacío, de acuerdo con el contenido acordado. `git diff --check` termina sin errores de whitespace.

Salida real de las pruebas unitarias:

```text
Test Files  32 passed (32)
     Tests  525 passed (525)
```

Acceso, CV y migración de contenido en Chrome, escritorio y móvil:

```text
46 passed (2.3m)
```

Memory en Chrome, escritorio y móvil, después de reiniciar el servidor para limpiar el estado de desarrollo:

```text
1 skipped
15 passed (30.7s)
```

La omisión corresponde al caso de teclado en móvil, ya excluido por el test original.

Se generó y revisó visualmente el PDF de dos páginas, el retrato, el escritorio, los proyectos y la imagen social. La compilación local se recorrió en Chrome: acceso, Proyectos, CV, Stack, Favoritos, documento técnico, Memory y una nota pública, sin errores de JavaScript ni eventos de violación CSP. No se ejecutó toda la suite histórica de E2E/CSP, que contiene supuestos sobre los proyectos de ejemplo, newsletter y favoritos.

El verificador de cobertura terminó con `Sin fallos. 3 aviso(s) que no bloquean.`: C-02, C-03 y C-04 ya no tenían ficha en la plantilla.

No se despliega. Dominio y envío real de correo quedan pendientes de configurar.
