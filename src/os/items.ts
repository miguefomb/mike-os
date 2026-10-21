/**
 * Qué aparece en el escritorio (pantallas anchas) y en la pantalla de inicio (móvil).
 * El contenido llega desde las colecciones de Astro; aquí solo se decide cómo se presenta.
 */
import { LINKS } from '../content/links';
import type { AppId, OpenTarget } from './apps/registry';
import { glyphIcon, tileIcon, type IconSpec } from './icons';

/** El documento Sobre mí (M-06): el texto ya convertido a HTML al compilar, la foto y, si existe, el PDF. */
export interface AboutData {
  html: string;
  tagline: string;
  hook: string;
  photo: { src: string; width: number; height: number };
  /** Dirección del PDF; null si no hay y entonces no se enseña el botón. */
  pdf: string | null;
}

export interface ProjectData {
  id: string;
  name: string;
  domain: string;
  description: string;
  summary: string;
  details: string[];
  stack: string[];
  screenshots: { src: string; alt: string; still?: string }[];
  repo?: string;
  github?: { languages: { name: string; bytes: number }[]; topics: string[]; license: string | null };
  colors: { from: string; to: string };
  /** Icono propio del proyecto (/projects/…); sin él, la inicial sobre su degradado. */
  icon?: string;
  url: string;
  embeddable: boolean;
  /** `folder`: dentro de la carpeta Proyectos; `desktop`: icono propio en el escritorio. */
  placement: 'folder' | 'desktop';
  /** El detalle ofrece abrir «Cómo está hecho». */
  howto: boolean;
  example: boolean;
}

export interface NoteData {
  id: string;
  title: string;
  description: string;
  /** Fecha ISO. */
  date: string;
  tags: string[];
}

export interface Item {
  id: string;
  label: string;
  icon: IconSpec;
  /** Lo que abre dentro de Pol OS. */
  open?: OpenTarget;
  /** Enlace externo: se abre en una pestaña nueva. */
  href?: string;
  /** Solo en móvil: carpeta con más elementos. */
  children?: Item[];
}

/** Icono de cada app: el del dock, el de la ventana minimizada y el de los marcadores de posición. */
export const APP_ICONS: Record<AppId, IconSpec> = {
  browser: tileIcon('safari'),
  mail: tileIcon('gmail'),
  about: { kind: 'art', art: 'pdf' },
  notes: { kind: 'art', art: 'folder' },
  note: { kind: 'art', art: 'notefile' },
  guestbook: tileIcon('guestbook'),
  howto: tileIcon('blueprint'),
  favorites: tileIcon('favorites'),
  stack: tileIcon('stack'),
  projects: { kind: 'art', art: 'folder' },
  terminal: tileIcon('terminal'),
  settings: tileIcon('settings'),
  help: glyphIcon('help'),
  memory: glyphIcon('cards'),
  checkers: glyphIcon('checkers'),
  github: { kind: 'image', src: '/links/github.png' },
};

export interface DockItem {
  app: AppId;
  label: string;
  icon: IconSpec;
}

/** El icono de un proyecto: su imagen si la tiene y, si no, su inicial sobre su degradado. */
export const projectIcon = (p: Pick<ProjectData, 'name' | 'colors' | 'icon'>): IconSpec =>
  p.icon ? { kind: 'image', src: p.icon } : { kind: 'monogram', letter: p.name.charAt(0).toUpperCase(), from: p.colors.from, to: p.colors.to };

const projectItem = (p: ProjectData): Item => ({
  id: `project-${p.id}`,
  label: p.name,
  icon: projectIcon(p),
  open: { app: 'projects', arg: p.id },
});

const noteItem = (n: NoteData): Item => ({
  id: `note-${n.id}`,
  label: n.title,
  icon: { kind: 'art', art: 'notefile' },
  open: { app: 'note', arg: n.id },
});

const aboutItem: Item = { id: 'about', label: 'Mi CV.pdf', icon: { kind: 'art', art: 'pdf' }, open: { app: 'about' } };
const guestbookItem: Item = { id: 'guestbook', label: 'Libro de visitas', icon: tileIcon('guestbook'), open: { app: 'guestbook' } };
const favoritesItem: Item = { id: 'favorites', label: 'Favoritos', icon: tileIcon('favorites'), open: { app: 'favorites' } };
const howtoItem: Item = { id: 'howto', label: 'Cómo está hecho', icon: tileIcon('blueprint'), open: { app: 'howto' } };
const stackItem: Item = { id: 'stack', label: 'Stack', icon: tileIcon('stack'), open: { app: 'stack' } };
// GitHub abre su ventana con los repositorios públicos (C-01). Los demás accesos siguen abriendo una pestaña nueva.
const linkItems: Item[] = LINKS.map((l) =>
  l.id === 'github' ? { id: l.id, label: l.label, icon: { kind: 'image', src: l.icon }, open: { app: 'github' } } : { id: l.id, label: l.label, icon: { kind: 'image', src: l.icon }, href: l.url },
);

/** Los proyectos que viven dentro de la carpeta Proyectos y los que tienen su propio icono (los que solo están en GitHub). */
export const inFolder = (projects: readonly ProjectData[]) => projects.filter((p) => p.placement === 'folder');
const onDesktop = (projects: readonly ProjectData[]) => projects.filter((p) => p.placement === 'desktop');

export function desktopItems(projects: ProjectData[]): Item[] {
  return [
    // La carpeta abre la vista general de los proyectos que contiene; los de GitHub se quedan fuera, con su icono (M-04, S-08).
    { id: 'projects', label: 'Proyectos', icon: folderIcon(inFolder(projects).map(projectItem)), open: { app: 'projects' } },
    ...onDesktop(projects).map(projectItem),
    aboutItem,
    { id: 'notes', label: 'Notas', icon: { kind: 'art', art: 'folder' }, open: { app: 'notes' } },
    favoritesItem,
    guestbookItem,
    stackItem,
    howtoItem,
    ...linkItems,
  ];
}

const folderIcon = (children: Item[]): IconSpec => ({ kind: 'folder', children: children.slice(0, 4).map((c) => c.icon) });

function folder(id: string, label: string, children: Item[]): Item {
  return { id, label, icon: folderIcon(children), children };
}

export function mobileItems(projects: ProjectData[], notes: NoteData[]): Item[] {
  return [
    folder('folder-projects', 'Proyectos', inFolder(projects).map(projectItem)),
    ...onDesktop(projects).map(projectItem),
    aboutItem,
    folder('folder-notes', 'Notas', notes.map(noteItem)),
    favoritesItem,
    guestbookItem,
    stackItem,
    howtoItem,
    ...linkItems,
  ];
}

export const DOCK: DockItem[] = [
  { app: 'browser', label: 'Navegador', icon: tileIcon('safari') },
  { app: 'mail', label: 'Correo', icon: tileIcon('gmail') },
  { app: 'notes', label: 'Notas', icon: tileIcon('notes') },
  { app: 'terminal', label: 'Terminal', icon: tileIcon('terminal') },
  { app: 'settings', label: 'Ajustes', icon: tileIcon('settings') },
];

/** En móvil, Notas vive como carpeta en la pantalla de inicio y no se repite en el dock. */
export const MOBILE_DOCK = DOCK.filter((d) => d.app !== 'notes');
