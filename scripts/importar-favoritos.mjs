#!/usr/bin/env node
/** Selección de Miguel. Descarga las imágenes una vez; la web solo sirve archivos locales. */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { default: sharp } = await import(pathToFileURL(astroRequire.resolve('sharp')).href);
const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
const slug = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dirs = { movies: 'peliculas', music: 'musica', books: 'libros', games: 'juegos' };
const titles = { movies: 'Películas y series', music: 'Música', books: 'Libros', games: 'Videojuegos' };
const entries = [];
const movie = (title, page) => entries.push({ kind: 'movies', title, page, provider: 'wikipedia' });
const series = (title, query) => entries.push({ kind: 'movies', title, query, provider: 'tvmaze', category: 'Serie' });

movie('8 millas', '8_Mile_(film)');
movie('Aladdin', 'Aladdin_(1992_Disney_film)');
movie('Avatar', 'Avatar_(2009_film)');
movie('Coach Carter', 'Coach_Carter');
movie('Contratiempo', 'The_Invisible_Guest');
movie('Cómo entrenar a tu dragón', 'How_to_Train_Your_Dragon_(2010_film)');
movie('Shrek', 'Shrek');
movie('El rey león', 'The_Lion_King');
movie('El libro de la selva', 'The_Jungle_Book_(1967_film)');
movie('Hércules', 'Hercules_(1997_film)');
movie('Inside Out', 'Inside_Out_(2015_film)');
movie('El planeta del tesoro', 'Treasure_Planet');
series('Juego de Tronos', 'Game of Thrones');
series('Breaking Bad', 'Breaking Bad');
series('Stranger Things', 'Stranger Things');
movie('Mindscape', 'Mindscape_(2013_film)');
movie('Luces rojas', 'Red_Lights_(2012_film)');
movie('Shutter Island', 'Shutter_Island_(film)');
movie('Harry Potter', "Harry_Potter_and_the_Philosopher%27s_Stone_(film)");
movie('El señor de los anillos', 'The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring');
movie('El libro de la vida', 'The_Book_of_Life_(2014_film)');
movie('El club de la lucha', 'Fight_Club');
movie('El código Da Vinci', 'The_Da_Vinci_Code_(film)');
movie('El caballero oscuro', 'The_Dark_Knight');
movie('El efecto mariposa', 'The_Butterfly_Effect');
movie('Interstellar', 'Interstellar_(film)');
movie('Coco', 'Coco_(2017_film)');
movie('Matrix', 'The_Matrix');
movie('La espada mágica (En busca de Camelot)', 'Quest_for_Camelot');
movie('Toy Story', 'Toy_Story');
movie('Lilo & Stitch', 'Lilo_%26_Stitch');
movie('Origen', 'Inception');
movie('Oldboy', 'Oldboy_(2003_film)');
movie('Mulán', 'Mulan_(1998_film)');
movie('Piratas del Caribe', 'Pirates_of_the_Caribbean:_The_Curse_of_the_Black_Pearl');
movie('Memento', 'Memento_(film)');
movie('Seven', 'Seven_(1995_film)');
movie('Space Jam', 'Space_Jam');
movie('Vaiana', 'Moana_(2016_film)');
movie('Trainspotting', 'Trainspotting_(film)');
series('El juego del calamar', 'Squid Game');
series('Digimon', 'Digimon Adventure');
series('Black Mirror', 'Black Mirror');
series('La casa de papel', 'La casa de papel');
series('Rick & Morty', 'Rick and Morty');

for (const title of ['Estopa', 'Melendi', 'Michael Jackson', 'Fondo Flamenco', 'Eminem', 'Twista', 'Smash Mouth', 'Quevedo', 'Plan B', 'Cocco Lexa', 'LE SSERAFIM', 'aespa', 'Rels B', 'Raul Clyde', 'Myke Towers', 'Duki', 'iann dior', 'Stromae', 'Juan Luis Guerra', 'Eladio Carrión', 'Álex Ubago', 'Alejandro Sanz']) {
  entries.push({ kind: 'music', title, provider: 'deezer', ...(title === 'Plan B' ? { artistId: 65838 } : {}) });
}

const book = (title, author, source) => entries.push({ kind: 'books', title, author, source, provider: 'publisher' });
book('Un curso de milagros', 'Fundación para la Paz Interior', 'https://shop.acim.org/products/spanish');
book('Padre rico, padre pobre', 'Robert T. Kiyosaki', 'https://www.penguinlibros.com/es/economia-politica-y-actualidad/324279-libro-padre-rico-padre-pobre-edicion-actualizada-9788466373005');
book('El monje que vendió su Ferrari', 'Robin Sharma', 'https://www.penguinlibros.com/es/libros-autoayuda/20122-ebook-el-monje-que-vendio-su-ferrari-9788425345388');
book('Harry Potter (saga)', 'J. K. Rowling', 'https://www.penguinlibros.com/es/libros-ninos-9-anos/37676-libro-harry-potter-y-la-piedra-filosofal-harry-potter-1-9788478884452');
book('El imperio de la IA', 'Karen Hao', 'https://www.planetadelibros.com/libro-el-imperio-de-la-ia/428132');
book('Cointeligencia: Vivir y trabajar con la IA', 'Ethan Mollick', 'https://www.penguinlibros.com/es/ciencia-y-tecnologia/348600-libro-cointeligencia-9788418053214');
book('La hostIA que viene', 'Jon Hernández', 'https://www.planetadelibros.com/libro-la-hostia-que-viene/448686');

for (const [title, page, edition] of [
  ['GTA', 'Grand_Theft_Auto_V', 'Grand Theft Auto V'],
  ['Minecraft', 'Minecraft', null],
  ['FIFA', 'FIFA_23', 'FIFA 23'],
  ['Need for Speed', 'Need_for_Speed:_Most_Wanted_(2005_video_game)', 'Most Wanted (2005)'],
  ['Forza', 'Forza_Horizon_5', 'Forza Horizon 5'],
  ['Spyro', 'Spyro_Reignited_Trilogy', 'Reignited Trilogy'],
  ['Pokémon', 'Pokémon_Red,_Blue,_and_Yellow', 'Pokémon Rojo, Azul y Amarillo'],
  ['Dragon Ball', 'Dragon_Ball_FighterZ', 'Dragon Ball FighterZ'],
]) entries.push({ kind: 'games', title, page, edition, ...(title === 'Minecraft'
  ? { provider: 'publisher', source: 'https://www.minecraft.net/en-us/article/key-art-update' }
  : { provider: 'wikipedia' }) });

// Selecciones revisadas visualmente: retratos (en vez de logotipos), carteles verticales y Digimon de 1999.
const overrides = {
  'music/estopa': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Estopa_2008.06.13_007.jpg/330px-Estopa_2008.06.13_007.jpg', 'https://en.wikipedia.org/wiki/Estopa'],
  'music/cocco-lexa': ['https://image-cdn-fa.spotifycdn.com/image/ab67616100005174e4a23c0f3a9ac76128bf7a8a', 'https://open.spotify.com/artist/5WMoWNq8DuL9pob4qu7mau'],
  'movies/harry-potter': ['https://media.fathomentertainment.com/image/826249444369/image_vigd4b6lh97hd0uns3pfgcd57g/-S1200-Fwebp', 'https://www.fathomentertainment.com/releases/harry-potter-and-the-philosophers-stone/media-kit/'],
  'movies/trainspotting': ['https://www.miramax.com/assets/Trainspotting2.png', 'https://www.miramax.com/movie/trainspotting/'],
  'movies/digimon': ['https://static.tvmaze.com/uploads/images/original_untouched/8/21271.jpg', 'https://www.tvmaze.com/shows/1517/digimon-digital-monsters'],
};

const cached = JSON.parse(await readFile(new URL('docs/favoritos-fuentes.json', root), 'utf8').catch(() => '[]'));
const provenance = new Map(cached.map((e) => [`${e.kind}/${e.id}`, e]));
const get = async (url, json = true) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'MikeOS-Portfolio/1.0 (personal favorites artwork)' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status}: ${url}`);
  return json ? res.json() : res.text();
};
const normalize = (s) => slug(s).replaceAll('-', '');
async function resolve(entry) {
  if (entry.provider === 'wikipedia') {
    const data = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${entry.page}`);
    if (!data.thumbnail) throw new Error(`Sin imagen: ${entry.page}`);
    const image = new URL(data.thumbnail.source);
    image.search = '';
    return { image: image.href, source: data.content_urls.desktop.page.replace('http:', 'https:'), description: data.description };
  }
  if (entry.provider === 'tvmaze') {
    const data = await get(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(entry.query)}`);
    if (!data.image?.original) throw new Error(`Sin imagen: ${entry.query}`);
    return { image: data.image.original, source: data.url, description: data.name };
  }
  if (entry.provider === 'deezer') {
    let artist;
    if (entry.artistId) artist = await get(`https://api.deezer.com/artist/${entry.artistId}`);
    else {
      const data = await get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(entry.title)}&limit=100`);
      artist = data.data?.filter((a) => normalize(a.name) === normalize(entry.title)).sort((a, b) => b.nb_fan - a.nb_fan)[0];
    }
    if (!artist?.picture_big || artist.picture_big.includes('/artist//')) throw new Error(`Sin foto: ${entry.title}`);
    return { image: artist.picture_big, source: artist.link, description: artist.name, artistId: artist.id };
  }
  const html = await get(entry.source, false);
  if (entry.source.includes('www.planetadelibros.com/')) {
    const image = html.match(/https:\/\/proassetspdlcom\.cdnstatics2\.com\/[^"<>\s\\]+\/d_360_620\/portada_[^"<>\s\\]+/)?.[0];
    if (!image) throw new Error(`Sin portada editorial: ${entry.title}`);
    return { image, source: entry.source };
  }
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const tag = tags.find((t) => /(?:property|name)=["']og:image["']/.test(t));
  const value = tag?.match(/content=["']([^"']+)["']/)?.[1];
  if (!value) throw new Error(`Sin portada: ${entry.title}`);
  return { image: new URL(value.replaceAll('&amp;', '&'), entry.source).href, source: entry.source };
}

const sections = Object.fromEntries(Object.keys(dirs).map((kind) => [kind, { kind, title: titles[kind], items: [] }]));
const errors = [];
let cursor = 0;
async function worker() {
  while (cursor < entries.length) {
    const entry = entries[cursor++];
    const id = slug(entry.title);
    const cover = `/favoritos/${dirs[entry.kind]}/${id}.jpg`;
    try {
      let info = provenance.get(`${entry.kind}/${id}`);
      const override = overrides[`${entry.kind}/${id}`];
      const refresh = info?.image.includes('/assets/images/logos/') || (override && info?.image !== override[0]);
      if (!info || refresh) {
        const resolved = await resolve(entry);
        info = { kind: entry.kind, id, title: entry.title, ...resolved, ...(override ? { image: override[0], source: override[1], ...(entry.kind === 'music' ? { profile: resolved.source } : {}) } : {}), retrievedAt: new Date().toISOString().slice(0, 10) };
        provenance.set(`${entry.kind}/${id}`, info);
      }
      const output = new URL(`public${cover}`, root);
      if (refresh || !(await access(output).then(() => true).catch(() => false))) {
        // Evita ráfagas contra los servidores de las imágenes.
        await new Promise((r) => setTimeout(r, 750));
        let response;
        for (let attempt = 0; attempt < 4; attempt++) {
          response = await fetch(info.image, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'MikeOS-Portfolio/1.0 (personal favorites artwork)' } });
          if (response.status !== 429) break;
          if (attempt < 3) await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
        }
        if (!response.ok) throw new Error(`Imagen ${response.status}: ${info.image}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await mkdir(new URL(`public/favoritos/${dirs[entry.kind]}/`, root), { recursive: true });
        await sharp(buffer).rotate().resize({ width: entry.kind === 'music' ? 320 : 360, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(fileURLToPath(output));
      }
      const item = { id, title: entry.title, cover };
      if (entry.kind === 'games') Object.assign(item, { url: info.source, ...(entry.edition ? { edition: entry.edition } : {}) });
      if (entry.kind === 'movies') Object.assign(item, { category: entry.category ?? (['Harry Potter', 'El señor de los anillos', 'Piratas del Caribe'].includes(entry.title) ? 'Saga' : 'Película') });
      if (entry.kind === 'books') item.author = entry.author;
      if (entry.kind === 'music') Object.assign(item, { type: 'artist', url: info.profile ?? info.source });
      sections[entry.kind].items.push(item);
      console.log(`OK ${entry.kind}: ${entry.title}`);
    } catch (error) { errors.push(`${entry.title}: ${error.message}`); }
  }
}
await worker();
await writeFile(new URL('docs/favoritos-fuentes.json', root), `${JSON.stringify([...provenance.values()].sort((a, b) => collator.compare(a.kind + a.title, b.kind + b.title)), null, 2)}\n`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else for (const section of Object.values(sections)) {
  section.items.sort((a, b) => collator.compare(a.title, b.title));
  await writeFile(new URL(`src/content/favorites/${section.kind}.json`, root), `${JSON.stringify(section, null, 2)}\n`);
  console.log(`${section.kind}: ${section.items.length}`);
}
