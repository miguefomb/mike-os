/**
 * Comandos de la Terminal (S-04). Es una terminal de mentira: nada de esto ejecuta código ni toca la
 * red. Cada comando es una función pura que recibe el texto y el estado y devuelve las líneas de salida
 * y las acciones que provoca (abrir una app, cambiar el tema). El componente solo pinta.
 *
 * La salida son segmentos de texto, nunca HTML: un `echo <img onerror=…>` se ve como texto. Los
 * enlaces son segmentos con `href` y solo se construyen aquí, a partir de la lista de enlaces del sitio.
 */
import { LINKS } from '../../content/links';
import { WALLPAPERS, type ThemePref, type WallpaperId } from '../../lib/prefs';
import type { AppId } from '../apps/registry';
import type { Action } from '../menus';
import { PERSONA } from '../../content/persona';

export type Tone = 'accent' | 'muted' | 'error' | 'hit' | 'near';
export interface Segment {
  text: string;
  tone?: Tone;
  /** Solo para la vista (por ejemplo, el dibujo del ahorcado): los lectores de pantalla lo saltan. */
  hidden?: boolean;
  /** Solo para lectores de pantalla: no se ve. */
  sr?: boolean;
  /** Solo https, de la lista de enlaces del sitio. */
  href?: string;
}
export type Line = Segment[];

export interface TerminalContext {
  projects: { id: string; name: string; summary: string }[];
  notes: { id: string; title: string }[];
  theme: ThemePref;
  wallpaper: WallpaperId;
  /** Milisegundos desde que se cargó la página. */
  uptimeMs: number;
  now: Date;
  viewport: { width: number; height: number };
  /** Los comandos ejecutados, el actual incluido. */
  history: readonly string[];
}

/** Los minijuegos (S-04). Su código está en `games/` y la Terminal lo carga al pedir uno. */
export const GAME_IDS = ['wordle', 'hangman', 'guess'] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface Result {
  lines: Line[];
  actions: Action[];
  clear?: boolean;
  /** Empieza una partida de este juego, o enseña la lista (`menu`). */
  game?: GameId | 'menu';
}

export const MAX_INPUT = 200;
export const MAX_HISTORY = 100;
export const MAX_LINES = 500;

// ─── Utilidades ───────────────────────────────────────────────────────────────────────────────
const seg = (text: string, tone?: Tone): Segment => (tone ? { text, tone } : { text });
const text = (s: string, tone?: Tone): Line => [seg(s, tone)];
const blank: Line = [seg('')];
const out = (lines: Line[], actions: Action[] = []): Result => ({ lines, actions });

/** Minúsculas, sin acentos y solo letras y números: "Sobre mí" y "sobremi" son lo mismo. */
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** La opción más parecida, si lo es de verdad (a dos letras como mucho). */
export function closest(word: string, options: readonly string[]): string | null {
  let best: { option: string; d: number } | null = null;
  for (const option of options) {
    const d = distance(word, option);
    if (d <= 2 && d < Math.max(word.length, option.length) && (!best || d < best.d)) best = { option, d };
  }
  return best?.option ?? null;
}

// ─── Aplicaciones a las que se puede ir con `open` ──────────────────────────────────────────────
const APPS: { names: string[]; app: AppId; label: string; arg?: string }[] = [
  { names: ['about', 'cv', 'micv', 'sobremi'], app: 'about', label: 'Mi CV' },
  { names: ['mail', 'correo', 'contacto'], app: 'mail', label: 'Correo' },
  { names: ['browser', 'navegador'], app: 'browser', label: 'Navegador' },
  { names: ['projects', 'proyectos'], app: 'projects', label: 'Proyectos' },
  { names: ['notes', 'notas'], app: 'notes', label: 'Notas' },
  { names: ['favorites', 'favoritos', 'conoceme'], app: 'favorites', label: 'Favoritos' },
  { names: ['juegos', 'videojuegos', 'games'], app: 'favorites', label: 'Favoritos: videojuegos', arg: 'games' },
  { names: ['peliculas', 'series', 'cine', 'movies'], app: 'favorites', label: 'Favoritos: películas y series', arg: 'movies' },
  { names: ['libros', 'books'], app: 'favorites', label: 'Favoritos: libros', arg: 'books' },
  { names: ['memory'], app: 'memory', label: 'Memory' },
  { names: ['checkers', 'damas'], app: 'checkers', label: 'Damas' },
  { names: ['github', 'repos', 'repositorios'], app: 'github', label: 'GitHub' },
  { names: ['musica', 'canciones', 'music'], app: 'favorites', label: 'Favoritos: música', arg: 'music' },
  { names: ['readme', 'como', 'comoestahecho', 'howto', 'documentacion'], app: 'howto', label: 'Cómo está hecho' },
  { names: ['guestbook', 'libro', 'librodevisitas', 'visitas', 'resenas'], app: 'guestbook', label: 'Libro de visitas' },
  { names: ['stack', 'herramientas', 'tools'], app: 'stack', label: 'Stack' },
  { names: ['settings', 'ajustes'], app: 'settings', label: 'Ajustes' },
  { names: ['help', 'ayuda'], app: 'help', label: `Cómo usar ${PERSONA.osName}` },
];
const APP_COMPLETIONS = ['about', 'cv', 'mail', 'browser', 'projects', 'notes', 'favoritos', 'musica', 'guestbook', 'readme', 'stack', 'settings', 'help'];

// Un Map y no un objeto plano: con un objeto, `theme constructor` o `theme __proto__` encontrarían propiedades heredadas.
const THEMES = new Map<string, ThemePref>([
  ['claro', 'light'],
  ['light', 'light'],
  ['oscuro', 'dark'],
  ['dark', 'dark'],
  ['auto', 'auto'],
  ['automatico', 'auto'],
]);
const THEME_NAMES: Record<ThemePref, string> = { light: 'claro', dark: 'oscuro', auto: 'automático' };

// ─── Definición de comandos ──────────────────────────────────────────────────────────────────────
interface Command {
  /** Si falta, el comando no sale en `help` ni se completa con Tab. */
  usage?: string;
  summary?: string;
  run(args: string[], rest: string, ctx: TerminalContext): Result;
}

const cmd = new Map<string, Command>();
const add = (name: string, c: Command) => cmd.set(name, c);

add('help', {
  usage: 'help',
  summary: 'esta lista',
  run: () => {
    const rows = [...cmd.entries()].filter(([, c]) => c.usage && c.summary);
    const width = Math.max(...rows.map(([, c]) => c.usage!.length)) + 2;
    return out([
      text('Comandos disponibles:'),
      ...rows.map(([, c]): Line => [seg('  '), seg(c.usage!.padEnd(width), 'accent'), seg(c.summary!)]),
      [seg('  '), seg('history clear date whoami echo exit lock', 'accent')],
      text('Hay otros comandos que no salen en esta lista.', 'muted'),
      text('Tab completa · ↑ y ↓ recorren el historial · Ctrl+L limpia.', 'muted'),
    ]);
  },
});

add('about', {
  usage: 'about',
  summary: `quién es ${PERSONA.firstName}`,
  run: () =>
    out([
      text(PERSONA.name, 'accent'),
      text(PERSONA.whoami),
      blank,
      ...LINKS.map((l): Line => [seg('  '), seg(l.label.padEnd(14), 'muted'), { text: l.url.replace(/^https:\/\/(www\.)?/, ''), href: l.url }]),
      blank,
      text('Más en el escritorio: escribe open cv.', 'muted'),
    ]),
});

add('projects', {
  usage: 'projects',
  summary: 'lista de proyectos',
  run: (_a, _r, ctx) => {
    // El ancho de la columna sale del id más largo: con uno fijo, `project-template` se pegaba a su nombre.
    const idWidth = Math.max(0, ...ctx.projects.map((p) => p.id.length)) + 2;
    return out(
      ctx.projects.length === 0
        ? [text('No hay proyectos todavía.', 'muted')]
        : [
            ...ctx.projects.map((p): Line => [seg('  '), seg(p.id.padEnd(idWidth), 'accent'), seg(`${p.name} · ${p.summary}`)]),
            blank,
            text('Ábrelo con open <nombre>, por ejemplo open ' + ctx.projects[0].id + '.', 'muted'),
          ],
    );
  },
});

add('notes', {
  usage: 'notes',
  summary: 'lista de notas',
  run: (_a, _r, ctx) => {
    const idWidth = Math.max(0, ...ctx.notes.map((n) => n.id.length)) + 2;
    return out(
      ctx.notes.length === 0
        ? [text('Todavía no hay notas.', 'muted')]
        : [
            ...ctx.notes.map((n): Line => [seg('  '), seg(n.id.padEnd(idWidth), 'accent'), seg(n.title)]),
            blank,
            text('Léela con open <nombre>, por ejemplo open ' + ctx.notes[0].id + '.', 'muted'),
          ],
    );
  },
});

/** La nota que pide el visitante: por su nombre o su título completo y, si no, por un trozo del nombre que solo encaje con una. */
function findNote(wanted: string, notes: TerminalContext['notes']) {
  const exact = notes.find((n) => normalize(n.id) === wanted || normalize(n.title) === wanted);
  if (exact) return exact;
  if (wanted.length < 4) return undefined;
  const partial = notes.filter((n) => normalize(n.id).includes(wanted));
  return partial.length === 1 ? partial[0] : undefined;
}

add('open', {
  usage: 'open <algo>',
  summary: 'abre un proyecto, una nota o una app (open planito, open mail…)',
  run: (args, _r, ctx) => {
    if (args.length === 0) return out([text('Uso: open <proyecto o app>. Prueba projects o ls.', 'muted')]);
    const wanted = normalize(args.join(' '));
    const app = APPS.find((a) => a.names.includes(wanted));
    if (app) return out([text(`Abriendo ${app.label}…`)], [{ type: 'open', target: { app: app.app, ...(app.arg ? { arg: app.arg } : {}) } }]);
    const project = ctx.projects.find((p) => normalize(p.id) === wanted || normalize(p.name) === wanted);
    if (project) return out([text(`Abriendo ${project.name}…`)], [{ type: 'open', target: { app: 'browser', arg: project.id } }]);
    const note = findNote(wanted, ctx.notes);
    if (note) return out([text(`Abriendo «${note.title}»…`)], [{ type: 'open', target: { app: 'note', arg: note.id } }]);
    const hint = closest(wanted, [...ctx.projects.map((p) => normalize(p.id)), ...ctx.notes.map((n) => normalize(n.id)), ...APPS.flatMap((a) => a.names)]);
    return out([text(`open: no encuentro «${args.join(' ')}».`, 'error'), text(hint ? `¿Quisiste decir ${hint}?` : 'Prueba projects o ls.', 'muted')]);
  },
});

add('ls', {
  usage: 'ls',
  summary: 'qué hay en el escritorio',
  run: (_a, _r, ctx) =>
    out([
      [seg('Proyectos    ', 'muted'), seg(ctx.projects.map((p) => p.name).join('   '))],
      [seg('Documentos   ', 'muted'), seg('Mi CV.pdf')],
      [seg('Carpetas     ', 'muted'), seg('Notas/')],
      [seg('Otros        ', 'muted'), seg(['Favoritos', 'Libro de visitas', 'Stack', 'Cómo está hecho', ...LINKS.map((l) => `${l.label} ↗`)].join('   '))],
    ]),
});

add('social', {
  usage: 'social',
  summary: `dónde encontrar a ${PERSONA.firstName}`,
  run: () => out(LINKS.map((l): Line => [seg('  '), seg(l.label.padEnd(14), 'muted'), { text: l.url, href: l.url }])),
});

add('contact', {
  usage: 'contact',
  summary: 'escribirle un mensaje',
  run: () => out([text('Abriendo Correo…')], [{ type: 'open', target: { app: 'mail' } }]),
});

add('theme', {
  usage: 'theme <modo>',
  summary: 'claro, oscuro o auto',
  run: (args, _r, ctx) => {
    if (args.length === 0) return out([text(`Tema: ${THEME_NAMES[ctx.theme]}. Usa theme claro, oscuro o auto.`, 'muted')]);
    const value = THEMES.get(normalize(args[0]));
    if (!value) return out([text(`theme: «${args[0]}» no es un tema.`, 'error'), text('Prueba claro, oscuro o auto.', 'muted')]);
    return out([text(`Tema: ${THEME_NAMES[value]}.`)], [{ type: 'theme', value }]);
  },
});

add('wallpaper', {
  usage: 'wallpaper <fondo>',
  summary: 'atardecer, mar, grafito o alba',
  run: (args, _r, ctx) => {
    const names = WALLPAPERS.map((w) => w.id).join(', ');
    if (args.length === 0) return out([text(`Fondo: ${ctx.wallpaper}. Opciones: ${names}.`, 'muted')]);
    const found = WALLPAPERS.find((w) => w.id === normalize(args[0]));
    if (!found) return out([text(`wallpaper: «${args[0]}» no existe.`, 'error'), text(`Opciones: ${names}.`, 'muted')]);
    return out([text(`Fondo: ${found.label}.`)], [{ type: 'wallpaper', value: found.id }]);
  },
});

const LOGO = ['  ┌────────────────────┐', '  │      MIKE OS       │', '  │   FRAME × BEAT     │', '  │   CODE  ×  CREATE  │', '  └────────────────────┘'];

function uptime(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

add('neofetch', {
  usage: 'neofetch',
  summary: 'información del sistema',
  run: (_a, _r, ctx) => {
    const info: [string, string][] = [
      ['OS', PERSONA.osName],
      ['Host', 'tu navegador'],
      ['Shell', 'mike-sh (de mentira)'],
      ['Tema', `${THEME_NAMES[ctx.theme]} · fondo ${ctx.wallpaper}`],
      ['Pantalla', `${ctx.viewport.width}×${ctx.viewport.height}`],
      ['Stack', 'Astro · Svelte · Cloudflare'],
      ['Uptime', uptime(ctx.uptimeMs)],
    ];
    const rows = Math.max(LOGO.length, info.length + 2);
    const lines: Line[] = [];
    for (let i = 0; i < rows; i++) {
      const art = (LOGO[i] ?? '').padEnd(30);
      const right: Segment[] =
        i === 0 ? [seg(PERSONA.terminalUser, 'accent')] : i === 1 ? [seg('────────────', 'muted')] : info[i - 2] ? [seg(`${info[i - 2][0]}: `, 'accent'), seg(info[i - 2][1])] : [];
      lines.push([seg(art, 'accent'), ...right]);
    }
    return out(lines);
  },
});

add('history', { run: (_a, _r, ctx) => out(ctx.history.map((h, i): Line => [seg(String(i + 1).padStart(4), 'muted'), seg('  '), seg(h)])) });
add('clear', { run: () => ({ lines: [], actions: [], clear: true }) });
add('date', { run: (_a, _r, ctx) => out([text(ctx.now.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }))]) });
add('whoami', { run: () => out([text('invitado (pero aquí te tratamos como en casa)')]) });
add('echo', { run: (args) => out([text(args.join(' '))]) });
add('exit', { run: () => out([text('Cerrando sesión…', 'muted')], [{ type: 'window', op: 'close' }]) });
add('lock', { run: () => out([text('Bloqueando la pantalla…', 'muted')], [{ type: 'lock' }]) });

// ─── Juegos ──────────────────────────────────────────────────────────────────────────────────────
// Aquí solo están los nombres: la lista y los juegos están en `games/`, que la Terminal carga al pedirlos.
add('minigames', { usage: 'minigames', summary: 'minijuegos para pasar el rato', run: () => ({ lines: [], actions: [], game: 'menu' }) });
for (const id of GAME_IDS) add(id, { run: () => ({ lines: [], actions: [], game: id }) });
// Los nombres en español de antes siguen funcionando, escondidos (los comandos de la Terminal van en inglés).
add('ahorcado', { run: () => ({ lines: [], actions: [], game: 'hangman' }) });
add('adivina', { run: () => ({ lines: [], actions: [], game: 'guess' }) });
// El memory no es de texto: se abre en su propia ventana (C-05).
add('memory', { run: () => out([text('Abriendo Memory…', 'muted')], [{ type: 'open', target: { app: 'memory' } }]) });
// Las damas, igual: su propia ventana (C-06).
add('checkers', { run: () => out([text('Abriendo Damas…', 'muted')], [{ type: 'open', target: { app: 'checkers' } }]) });

// ─── Escondidos: no salen en `help` ni se completan ──────────────────────────────────────────────
add('sudo', { run: () => out([text('pol no está en el archivo sudoers. Este incidente será reportado (a nadie).', 'error')]) });
add('rm', { run: () => out([text('rm: aquí no se borra nada. Buen intento.', 'error')]) });
for (const editor of ['vim', 'nano', 'emacs']) {
  add(editor, { run: () => out([text(`Has abierto ${editor}. Buena suerte para salir.`), text('(Es broma: aquí no hay editor. Escribe help.)', 'muted')]) });
}
add('catan', { run: () => out([text(`Todavía no hay Catán aquí. ${PERSONA.firstName} sigue practicando a perder con dignidad.`)]) });
add('make', {
  run: (args) =>
    out([text(args[0] === 'coffee' ? 'make: *** No hay ninguna regla para construir «coffee». Alto.' : 'make: *** No se ha indicado ningún objetivo. Alto.', 'error')]),
});
add('cowsay', {
  run: (_a, rest) => {
    const words = (rest || 'muuu').split(/\s+/);
    const rows: string[] = [];
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length > 36 && current) (rows.push(current), (current = w));
      else current = (current + ' ' + w).trim();
    }
    rows.push(current);
    const width = Math.max(...rows.map((r) => r.length));
    return out([
      text(' ' + '_'.repeat(width + 2)),
      ...rows.map((r) => text(`< ${r.padEnd(width)} >`)),
      text(' ' + '-'.repeat(width + 2)),
      text('        \\   ^__^'),
      text('         \\  (oo)\\_______'),
      text('            (__)\\       )\\/\\'),
      text('                ||----w |'),
      text('                ||     ||'),
    ]);
  },
});

/** Los comandos que enseña `help` y que completa Tab. */
export const VISIBLE_COMMANDS = [...cmd.entries()].filter(([, c]) => c.usage).map(([n]) => n);
const COMMON_COMMANDS = ['history', 'clear', 'date', 'whoami', 'echo', 'exit', 'lock'];
export const COMPLETABLE_COMMANDS = [...VISIBLE_COMMANDS, ...COMMON_COMMANDS];

// ─── Ejecutar una línea ──────────────────────────────────────────────────────────────────────────
export function run(raw: string, ctx: TerminalContext): Result {
  const input = raw.trim();
  if (!input) return out([]);
  if (raw.length > MAX_INPUT) return out([text(`La línea es demasiado larga (máximo ${MAX_INPUT} caracteres).`, 'error')]);
  const [first, ...args] = input.split(/\s+/);
  const name = first.toLowerCase();
  const rest = input.slice(first.length).trim();
  const command = cmd.get(name);
  if (!command) {
    const hint = closest(name, COMPLETABLE_COMMANDS);
    return out([
      text(`zsh: comando no encontrado: ${first}`, 'error'),
      text(hint ? `¿Quisiste decir ${hint}? Escribe help para ver todos.` : 'Escribe help para ver los comandos.', 'muted'),
    ]);
  }
  return command.run(args, rest, ctx);
}

// ─── Tab ─────────────────────────────────────────────────────────────────────────────────────────
function commonPrefix(words: string[]): string {
  return words.reduce((acc, w) => {
    let i = 0;
    while (i < acc.length && i < w.length && acc[i] === w[i]) i++;
    return acc.slice(0, i);
  });
}

export interface Completion {
  /** Lo que queda escrito tras pulsar Tab. */
  value: string;
  /** Las opciones, cuando hay más de una y no se puede avanzar más. */
  options: string[];
}

export function complete(input: string, ctx: { projects: readonly { id: string }[]; notes: readonly { id: string }[] }): Completion {
  const endsWithSpace = /\s$/.test(input);
  const parts = input.trimStart().split(/\s+/).filter((p, i, all) => p !== '' || i < all.length);
  const tokens = endsWithSpace ? [...parts.filter(Boolean), ''] : parts.filter(Boolean);
  const index = Math.max(0, tokens.length - 1);
  const typed = tokens[index] ?? '';
  const head = tokens[0]?.toLowerCase() ?? '';

  let pool: string[] = [];
  if (index === 0) pool = COMPLETABLE_COMMANDS;
  else if (index === 1 && head === 'open') pool = [...ctx.projects.map((p) => p.id), ...ctx.notes.map((n) => n.id), ...APP_COMPLETIONS];
  else if (index === 1 && head === 'theme') pool = ['claro', 'oscuro', 'auto'];
  else if (index === 1 && head === 'wallpaper') pool = WALLPAPERS.map((w) => w.id);

  const matches = [...new Set(pool.filter((o) => o.startsWith(typed.toLowerCase())))].sort();
  if (matches.length === 0) return { value: input, options: [] };
  const before = tokens.slice(0, index).join(' ');
  const build = (word: string) => `${before}${before ? ' ' : ''}${word}`;
  if (matches.length === 1) return { value: build(matches[0]) + ' ', options: [] };
  const prefix = commonPrefix(matches);
  return prefix.length > typed.length ? { value: build(prefix), options: [] } : { value: build(typed), options: matches };
}
