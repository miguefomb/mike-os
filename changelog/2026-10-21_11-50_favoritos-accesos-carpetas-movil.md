# Favoritos, accesos directos y lectura en móvil

- Selección completa aportada por Miguel: 44 películas y series, 22 artistas, 7 libros y 8 videojuegos/sagas. Matrix se incluye una sola vez.
- Orden alfabético español en las colecciones y en el endpoint. Se elimina el límite de diez elementos y el rótulo de ranking.
- Galería musical de artistas, compatible con las canciones y el reproductor de la plantilla. Las películas admiten fichas sencillas sin inventar sinopsis o tráileres.
- 81 imágenes locales optimizadas. Fuentes registradas en `docs/favoritos-fuentes.json`; importador reproducible en `scripts/importar-favoritos.mjs`.
- Los retratos de Estopa y Cocco Lexa sustituyen los logotipos del proveedor. Harry Potter y Trainspotting usan carteles verticales revisados. Digimon usa la serie original de 1999. Se identifican las entregas usadas como portada de sagas de videojuegos.
- El acceso externo se llama «Mi pagina web» y tiene un icono azul; Mad Mike Prods conserva el naranja. Se actualiza también el generador de SVG/PNG.
- Las carpetas móviles usan un fondo opaco según el tema, texto sin sombra y etiquetas que admiten varias líneas. El fondo del escritorio se oscurece más.
- Validación: pruebas unitarias, comprobación de tipos, compilación y recorrido de las cuatro galerías con carga de todas sus imágenes en escritorio y móvil. Inspección visual de Proyectos y Notas en los temas claro y oscuro.
