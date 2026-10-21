import { describe, expect, test } from 'vitest';
import { LINKS } from '../../content/links';
import { COMPLETABLE_COMMANDS, GAME_IDS, MAX_INPUT, VISIBLE_COMMANDS, closest, complete, normalize, run, type Line, type TerminalContext } from './commands';
import { PERSONA } from '../../content/persona';

const ctx = (over: Partial<TerminalContext> = {}): TerminalContext => ({
  projects: [
    { id: 'mitienda', name: 'Mi Tienda', summary: 'Una tienda online de ejemplo.' },
    { id: 'estudio', name: 'Estudio', summary: 'Web de un estudio.' },
    { id: 'pol-os', name: 'Pol OS', summary: 'Este portfolio.' },
  ],
  notes: [
    { id: 'de-frankenstein-a-sistema', title: 'De Frankenstein a sistema: cómo dejé el vibe coding' },
    { id: 'por-que-hice-local-whisper', title: 'Por qué hice Local Whisper (y por qué es gratis)' },
  ],
  theme: 'auto',
  wallpaper: 'atardecer',
  uptimeMs: 75_000,
  now: new Date('2026-10-10T18:42:00'),
  viewport: { width: 1280, height: 800 },
  history: ['help'],
  ...over,
});

const flat = (lines: Line[]) => lines.map((l) => l.map((s) => s.text).join('')).join('\n');
const text = (input: string, c = ctx()) => flat(run(input, c).lines);

describe('help', () => {
  test('lista los comandos visibles y avisa de que hay otros', () => {
    const t = text('help');
    for (const name of VISIBLE_COMMANDS) expect(t, name).toContain(name);
    expect(t).toContain('Hay otros comandos que no salen en esta lista');
    expect(t).toContain('Tab completa');
  });

  test('no revela los comandos escondidos', () => {
    const t = text('help');
    for (const hidden of ['sudo', 'rm ', 'vim', 'nano', 'emacs', 'catan', 'cowsay', 'make']) expect(t, hidden).not.toContain(hidden);
  });
});

describe('about, projects, ls y social', () => {
  test('about da el nombre y los tres enlaces, sin correo', () => {
    const r = run('about', ctx());
    const t = flat(r.lines);
    expect(t).toContain(PERSONA.name);
    expect(t).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+|mailto:/i);
    const hrefs = r.lines.flat().filter((s) => s.href).map((s) => s.href);
    expect(hrefs).toEqual(LINKS.map((l) => l.url));
  });

  test('projects lista un proyecto por cada uno de la colección con su descripción', () => {
    const t = text('projects');
    for (const p of ctx().projects) {
      expect(t).toContain(p.id);
      expect(t).toContain(p.summary);
    }
  });

  test('projects alinea la columna de ids aunque haya uno muy largo', () => {
    const wide = ctx({ projects: [...ctx().projects, { id: 'project-template', name: 'project-template', summary: 'Una plantilla.' }] });
    const rows = run('projects', wide).lines.filter((l) => l.length === 3);
    const idCells = rows.map((l) => l[1].text);
    expect(new Set(idCells.map((c) => c.length)).size).toBe(1);
    expect(idCells[0].length).toBeGreaterThanOrEqual('project-template'.length + 2);
    for (const l of rows) expect(l[1].text.endsWith(' ')).toBe(true);
  });

  test('projects sin proyectos lo dice', () => {
    expect(text('projects', ctx({ projects: [] }))).toContain('No hay proyectos');
  });

  test('ls lista los proyectos, el CV, las notas, el libro de visitas, el stack y los enlaces', () => {
    const t = text('ls');
    for (const s of ['Mi Tienda', 'Pol OS', 'Mi CV.pdf', 'Notas/', 'Libro de visitas', 'Stack', 'Cómo está hecho', 'GitHub ↗']) expect(t, s).toContain(s);
  });

  test('social muestra los tres enlaces como enlaces https', () => {
    const links = run('social', ctx()).lines.flat().filter((s) => s.href);
    expect(links.map((s) => s.href)).toEqual(LINKS.map((l) => l.url));
    for (const l of links) expect(l.href).toMatch(/^https:\/\//);
  });
});

describe('open', () => {
  test('abre un proyecto por id, por nombre y con otras mayúsculas o espacios', () => {
    for (const input of ['open mitienda', 'open Mi Tienda', 'open MI TIENDA', 'open mi-tienda', 'open pol-os', 'open Pol OS']) {
      const r = run(input, ctx());
      expect(r.actions, input).toHaveLength(1);
      expect(r.actions[0]).toMatchObject({ type: 'open', target: { app: 'browser' } });
    }
    expect(run('open Mi Tienda', ctx()).actions[0]).toEqual({ type: 'open', target: { app: 'browser', arg: 'mitienda' } });
  });

  test('abre las apps por su nombre y por sus alias en español', () => {
    const app = (input: string) => (run(input, ctx()).actions[0] as { target: { app: string } }).target.app;
    expect(app('open mail')).toBe('mail');
    expect(app('open correo')).toBe('mail');
    expect(app('open cv')).toBe('about');
    expect(app('open sobre mí')).toBe('about');
    expect(app('open Ajustes')).toBe('settings');
    expect(app('open stack')).toBe('stack');
    expect(app('open herramientas')).toBe('stack');
    expect(app('open ayuda')).toBe('help');
    for (const alias of ['guestbook', 'libro', 'visitas', 'Libro de visitas']) expect(app(`open ${alias}`), alias).toBe('guestbook');
    for (const alias of ['readme', 'como', 'howto', 'Cómo está hecho']) expect(app(`open ${alias}`), alias).toBe('howto');
  });

  test('sin argumento da el uso y no abre nada', () => {
    const r = run('open', ctx());
    expect(flat(r.lines)).toContain('Uso: open');
    expect(r.actions).toEqual([]);
  });

  test('con algo que no existe da error, sugiere el parecido y no abre nada', () => {
    const r = run('open mitiend', ctx());
    expect(r.actions).toEqual([]);
    expect(flat(r.lines)).toContain('no encuentro «mitiend»');
    expect(flat(r.lines)).toContain('¿Quisiste decir mitienda?');
    expect(flat(run('open zzzzzzzz', ctx()).lines)).toContain('Prueba projects o ls');
  });

  test('no se puede abrir nada que no sea un proyecto o una app (ni direcciones)', () => {
    for (const input of ['open https://malo.test', 'open javascript:alert(1)', 'open //malo.test', 'open ../etc']) {
      expect(run(input, ctx()).actions, input).toEqual([]);
    }
  });
});

describe('notes y open <nota>', () => {
  test('notes lista una línea por nota, con su nombre y su título', () => {
    const t = text('notes');
    expect(t).toContain('de-frankenstein-a-sistema');
    expect(t).toContain('De Frankenstein a sistema: cómo dejé el vibe coding');
    expect(t).toContain('Léela con open');
  });

  test('notes sin notas lo dice', () => {
    expect(text('notes', ctx({ notes: [] }))).toContain('Todavía no hay notas');
  });

  test('open abre una nota por su nombre, por su título completo o por un trozo que solo encaje con una', () => {
    const open = (input: string) => run(input, ctx()).actions;
    const frank = { type: 'open', target: { app: 'note', arg: 'de-frankenstein-a-sistema' } };
    expect(open('open de-frankenstein-a-sistema')).toEqual([frank]);
    expect(open('open De Frankenstein a sistema: cómo dejé el vibe coding')).toEqual([frank]);
    expect(open('open frankenstein')).toEqual([frank]);
    expect(open('open whisper')).toEqual([{ type: 'open', target: { app: 'note', arg: 'por-que-hice-local-whisper' } }]);
  });

  test('un trozo que encaja con varias notas, o demasiado corto, no abre ninguna', () => {
    expect(run('open por', ctx()).actions).toEqual([]);
    expect(run('open qu', ctx()).actions).toEqual([]);
    expect(run('open e', ctx()).actions).toEqual([]);
  });

  test('las apps y los proyectos mandan sobre las notas: open notes abre la carpeta', () => {
    expect(run('open notes', ctx()).actions).toEqual([{ type: 'open', target: { app: 'notes' } }]);
    expect(run('open mitienda', ctx()).actions[0]).toMatchObject({ target: { app: 'browser' } });
  });

  test('Tab completa el nombre de una nota', () => {
    expect(complete('open de-fr', { projects: ctx().projects, notes: ctx().notes }).value).toBe('open de-frankenstein-a-sistema ');
  });
});

describe('theme y wallpaper', () => {
  test('theme acepta claro, oscuro y auto, y sus equivalentes en inglés', () => {
    const value = (input: string) => (run(input, ctx()).actions[0] as { value: string } | undefined)?.value;
    expect(value('theme claro')).toBe('light');
    expect(value('theme oscuro')).toBe('dark');
    expect(value('theme AUTO')).toBe('auto');
    expect(value('theme dark')).toBe('dark');
  });

  test('theme no resuelve nombres heredados del objeto (constructor, toString, __proto__)', () => {
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
      const r = run(`theme ${name}`, ctx());
      expect(r.actions, name).toEqual([]);
      expect(flat(r.lines), name).toContain('no es un tema');
    }
  });

  test('theme sin argumento enseña el actual y con uno inválido da error sin acción', () => {
    expect(text('theme', ctx({ theme: 'dark' }))).toContain('Tema: oscuro');
    const bad = run('theme rosa', ctx());
    expect(bad.actions).toEqual([]);
    expect(flat(bad.lines)).toContain('«rosa» no es un tema');
  });

  test('wallpaper acepta los cuatro fondos y rechaza los demás', () => {
    for (const id of ['atardecer', 'mar', 'grafito', 'alba']) expect(run(`wallpaper ${id}`, ctx()).actions[0]).toEqual({ type: 'wallpaper', value: id });
    expect(run('wallpaper ../x', ctx()).actions).toEqual([]);
    expect(text('wallpaper')).toContain('Opciones: atardecer, mar, grafito, alba');
  });
});

describe('comandos de sistema', () => {
  test('clear limpia la pantalla', () => expect(run('clear', ctx()).clear).toBe(true));
  test('exit cierra la ventana y lock bloquea la pantalla', () => {
    expect(run('exit', ctx()).actions).toEqual([{ type: 'window', op: 'close' }]);
    expect(run('lock', ctx()).actions).toEqual([{ type: 'lock' }]);
  });
  test('contact abre Correo', () => expect(run('contact', ctx()).actions).toEqual([{ type: 'open', target: { app: 'mail' } }]));
  test('whoami y date responden', () => {
    expect(text('whoami')).toContain('invitado');
    expect(text('date')).toContain('2026');
  });
  test('history numera lo ejecutado', () => {
    const t = text('history', ctx({ history: ['help', 'about', 'history'] }));
    expect(t).toMatch(/1\s+help/);
    expect(t).toMatch(/3\s+history/);
  });
  test('neofetch enseña el logo y los datos del estado', () => {
    const t = text('neofetch');
    expect(t).toContain(PERSONA.terminalUser);
    expect(t).toContain('1280×800');
    expect(t).toContain('1 min 15 s');
    expect(t).toContain('Astro · Svelte · Cloudflare');
  });
});

describe('echo y seguridad de la salida', () => {
  test('echo devuelve el texto tal cual, como texto', () => {
    expect(text('echo hola   mundo')).toBe('hola mundo');
  });

  test('HTML y scripts en la entrada salen como texto, no como enlaces ni acciones', () => {
    const attack = 'echo <img src=x onerror=alert(1)><script>alert(2)</script> javascript:alert(3)';
    const r = run(attack, ctx());
    expect(flat(r.lines)).toContain('<img src=x onerror=alert(1)>');
    expect(r.actions).toEqual([]);
    expect(r.lines.flat().every((s) => !s.href)).toBe(true);
  });

  test('ningún enlace de ninguna salida es distinto de https', () => {
    for (const name of [...COMPLETABLE_COMMANDS, 'sudo', 'rm', 'catan', 'cowsay hola', 'make coffee']) {
      for (const s of run(name, ctx()).lines.flat()) if (s.href) expect(s.href, name).toMatch(/^https:\/\//);
    }
  });
});

describe('errores', () => {
  test('un comando que no existe da "comando no encontrado" y la pista de help', () => {
    const t = text('patata');
    expect(t).toContain('zsh: comando no encontrado: patata');
    expect(t).toContain('Escribe help');
  });

  test('un comando parecido a uno real sugiere cuál', () => {
    expect(text('projcts')).toContain('¿Quisiste decir projects?');
    expect(text('helo')).toContain('¿Quisiste decir help?');
  });

  test('los comandos escondidos no se sugieren', () => {
    expect(text('sud')).not.toContain('sudo');
  });

  test('no se resuelven nombres heredados del objeto (constructor, toString, __proto__)', () => {
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(text(name), name).toContain('comando no encontrado');
    }
  });

  test('una línea de más de 200 caracteres se rechaza sin ejecutar nada', () => {
    const r = run('echo ' + 'a'.repeat(MAX_INPUT), ctx());
    expect(flat(r.lines)).toContain('demasiado larga');
    expect(r.actions).toEqual([]);
  });

  test('una línea vacía no hace nada', () => {
    expect(run('   ', ctx())).toEqual({ lines: [], actions: [] });
  });
});

describe('comandos escondidos', () => {
  test('sudo, rm, vim, catan, cowsay y make responden sin hacer nada', () => {
    for (const input of ['sudo rm -rf /', 'rm -rf /', 'vim', 'nano', 'emacs', 'catan', 'cowsay hola', 'make coffee', 'make']) {
      const r = run(input, ctx());
      expect(r.lines.length, input).toBeGreaterThan(0);
      expect(r.actions, input).toEqual([]);
    }
    expect(text('sudo ls')).toContain('sudoers');
    expect(text('rm -rf /')).toContain('Buen intento');
    expect(text('catan')).toContain('Todavía no hay Catán');
    expect(text('make coffee')).toContain('«coffee»');
  });

  test('cowsay envuelve el texto largo y lo mete en el globo', () => {
    const t = text('cowsay ' + 'palabra '.repeat(12));
    expect(t.split('\n').filter((l) => l.startsWith('<')).length).toBeGreaterThan(1);
    expect(t).toContain('(oo)');
  });
});

describe('Tab', () => {
  const c = { projects: ctx().projects, notes: ctx().notes };

  test('completa un comando único y deja un espacio', () => {
    expect(complete('proj', c)).toEqual({ value: 'projects ', options: [] });
    expect(complete('neo', c).value).toBe('neofetch ');
  });

  test('avanza hasta el prefijo común y con varias opciones las lista', () => {
    const a = complete('s', c); // social
    expect(a.value).toBe('social ');
    const b = complete('c', c); // clear, contact
    expect(b.options).toEqual(['clear', 'contact']);
    expect(b.value).toBe('c');
    expect(complete('w', c)).toEqual({ value: 'w', options: ['wallpaper', 'whoami'] });
  });

  test('completa los argumentos de open, theme y wallpaper', () => {
    expect(complete('open mit', c).value).toBe('open mitienda ');
    expect(complete('open ', c).options).toEqual(expect.arrayContaining(['mitienda', 'mail', 'about']));
    expect(complete('theme os', c).value).toBe('theme oscuro ');
    expect(complete('wallpaper ma', c).value).toBe('wallpaper mar ');
  });

  test('no completa nada que no exista ni revela los escondidos', () => {
    expect(complete('zzz', c)).toEqual({ value: 'zzz', options: [] });
    expect(complete('su', c).value).toBe('su');
    expect(complete('cats', c).value).toBe('cats');
    expect(complete('echo ho', c).value).toBe('echo ho');
  });

  test('no devuelve nunca algo que no se pueda ejecutar', () => {
    for (const word of ['pro', 'ope', 'the', 'wall', 'hist', 'soc']) {
      const v = complete(word, c).value.trim();
      expect(COMPLETABLE_COMMANDS, word).toContain(v);
    }
  });
});

describe('utilidades', () => {
  test('normalize quita acentos, mayúsculas y símbolos', () => {
    expect(normalize('Sobre mí')).toBe('sobremi');
    expect(normalize('Pol-OS')).toBe('polos');
  });
  test('closest solo sugiere lo que se parece de verdad', () => {
    expect(closest('projcts', ['projects', 'about'])).toBe('projects');
    expect(closest('zzzz', ['projects', 'about'])).toBeNull();
    expect(closest('ab', ['cd'])).toBeNull();
  });
});

describe('minigames', () => {
  test('help enseña minigames, que pide la lista de juegos', () => {
    expect(text('help')).toContain('minigames');
    expect(run('minigames', ctx())).toEqual({ lines: [], actions: [], game: 'menu' });
  });

  test('cada juego pide empezar una partida sin escribir nada', () => {
    for (const id of GAME_IDS) expect(run(id, ctx())).toEqual({ lines: [], actions: [], game: id });
    expect(run('WORDLE', ctx()).game).toBe('wordle');
    // Los nombres en español de antes siguen funcionando.
    expect(run('ahorcado', ctx()).game).toBe('hangman');
    expect(run('adivina', ctx()).game).toBe('guess');
  });

  test('los juegos en sí no salen en help ni se completan con Tab', () => {
    for (const id of GAME_IDS) {
      expect(VISIBLE_COMMANDS).not.toContain(id);
      expect(COMPLETABLE_COMMANDS).not.toContain(id);
    }
    expect(VISIBLE_COMMANDS).toContain('minigames');
    expect(VISIBLE_COMMANDS).not.toContain('juegos');
  });

  test('memory abre su ventana (también con open memory) y no sale en help', () => {
    expect(run('memory', ctx()).actions).toEqual([{ type: 'open', target: { app: 'memory' } }]);
    expect(run('open memory', ctx()).actions).toEqual([{ type: 'open', target: { app: 'memory' } }]);
    expect(VISIBLE_COMMANDS).not.toContain('memory');
  });

  test('checkers (o open damas) abre las damas en su ventana, y no sale en help', () => {
    expect(run('checkers', ctx()).actions).toEqual([{ type: 'open', target: { app: 'checkers' } }]);
    expect(run('open damas', ctx()).actions).toEqual([{ type: 'open', target: { app: 'checkers' } }]);
    expect(VISIBLE_COMMANDS).not.toContain('checkers');
  });

  test('open github (o repos) abre la ventana de repositorios', () => {
    for (const name of ['github', 'repos', 'repositorios']) expect(run(`open ${name}`, ctx()).actions).toEqual([{ type: 'open', target: { app: 'github' } }]);
  });

  test('juegos y games siguen abriendo los videojuegos de Favoritos, sin chocar con minigames', () => {
    for (const name of ['juegos', 'games']) {
      expect(run(`open ${name}`, ctx()).actions).toEqual([{ type: 'open', target: { app: 'favorites', arg: 'games' } }]);
    }
    expect(run('juegos', ctx()).game).toBeUndefined();
  });
});
