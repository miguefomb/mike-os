/**
 * Lógica pura de Favoritos (S-03): las cuatro secciones, sus formas de dato, las direcciones de YouTube y el orden de reproducción. La usan el
 * esquema de la colección, la ventana, el mini reproductor y los tests, así que no toca red ni DOM.
 */

export const SECTIONS = [
  { id: 'games', label: 'Videojuegos', dir: 'juegos', aspect: '3 / 4' },
  { id: 'movies', label: 'Películas y series', dir: 'peliculas', aspect: '2 / 3' },
  { id: 'books', label: 'Libros', dir: 'libros', aspect: '2 / 3' },
  { id: 'music', label: 'Música', dir: 'musica', aspect: '1 / 1' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];

/** El identificador de un vídeo de YouTube: once caracteres de letras, números, guion y guion bajo. */
export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Las fichas de los videojuegos están en Shelvid, el proyecto de un amigo de Pol. */
export const SHELVID_ORIGIN = 'https://www.shelvid.com';

export const COVER_PATH = /^\/favoritos\/(juegos|peliculas|libros|musica)\/[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/;
export const ITEM_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** La dirección de una portada: en la carpeta de su sección y con el nombre del elemento. */
export const coverPath = (section: SectionId, id: string) => `/favoritos/${SECTIONS.find((s) => s.id === section)!.dir}/${id}.jpg`;

export interface GameItem {
  id: string;
  title: string;
  year?: number;
  cover: string;
  /** Ficha del juego o la saga. */
  url: string;
  /** Entrega usada como portada representativa de una saga. */
  edition?: string;
}
export interface MovieItem {
  id: string;
  title: string;
  year?: number;
  synopsis?: string;
  category?: 'Película' | 'Serie' | 'Saga';
  cover: string;
  /** El identificador del tráiler en YouTube. */
  trailer?: string;
}
export interface BookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
}
export interface SongItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  /** El identificador del vídeo en YouTube. */
  video: string;
  /** `m:ss`, opcional. */
  duration?: string;
}

export interface ArtistItem {
  type: 'artist';
  id: string;
  title: string;
  cover: string;
  url: string;
}
export const isSong = (item: SongItem | ArtistItem): item is SongItem => 'video' in item;

const alphabet = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
export const compareFavorites = (a: { title: string }, b: { title: string }) => alphabet.compare(a.title, b.title);

interface SectionBase<K extends SectionId, I> {
  kind: K;
  title: string;
  items: I[];
}
export interface GamesSection extends SectionBase<'games', GameItem> {
  /** Quién hace las fichas (Shelvid). */
  credit?: { label: string; url: string };
}
export interface BooksSection extends SectionBase<'books', BookItem> {
  /** Un enlace final, por ejemplo al perfil de Yoleo. */
  link?: { label: string; url: string };
}
export type MoviesSection = SectionBase<'movies', MovieItem>;
export type MusicSection = SectionBase<'music', SongItem | ArtistItem>;
export type FavoritesSection = GamesSection | MoviesSection | BooksSection | MusicSection;

export const songUrl = (video: string) => `https://music.youtube.com/watch?v=${video}`;
export const trailerUrl = (video: string) => `https://www.youtube.com/watch?v=${video}`;

/** Lo que el mini reproductor necesita saber de lo que suena: un vídeo, cómo llamarlo y dónde verlo en YouTube. */
export interface Track {
  id: string;
  video: string;
  title: string;
  subtitle: string;
  url: string;
}

export const songTrack = (s: SongItem): Track => ({ id: `song:${s.id}`, video: s.video, title: s.title, subtitle: s.artist, url: songUrl(s.video) });
export const trailerTrack = (m: MovieItem): Track => {
  if (!m.trailer) throw new Error('Esta película no tiene tráiler configurado');
  return { id: `trailer:${m.id}`, video: m.trailer, title: m.title, subtitle: m.year ? `Tráiler · ${m.year}` : 'Tráiler', url: trailerUrl(m.trailer) };
};

/** La canción que viene después de la actual en la lista, o null si es la última (o no está en ella). */
export function nextTrack(queue: readonly Track[], currentId: string): Track | null {
  const i = queue.findIndex((t) => t.id === currentId);
  return i >= 0 && i < queue.length - 1 ? queue[i + 1] : null;
}

/** Los números de la lista, de uno en uno: «1» a «10». */
export const rank = (index: number) => String(index + 1);

/** Un tiempo `m:ss` válido (de 0:01 a 99:59). */
export const DURATION = /^\d{1,2}:[0-5]\d$/;
