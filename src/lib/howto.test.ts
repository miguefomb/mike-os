import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { APP_LINKS, splitFrontmatter } from './cv';
import { HOWTO_DATA_PATH, HOWTO_PATH, TECH_MARKER, addHeadingIds, prepareHowTo, slugifyHeading, splitAtMarker, tableOfContents } from './howto';
import { TECHS, initials } from './tech-logos';

describe('slugifyHeading', () => {
  test('minúsculas, sin acentos y solo letras, números y guiones', () => {
    expect(slugifyHeading('Cómo funciona por dentro')).toBe('como-funciona-por-dentro');
    expect(slugifyHeading('Limitaciones: los bloqueos de LaLiga')).toBe('limitaciones-los-bloqueos-de-laliga');
    expect(slugifyHeading('  ¿Qué es?  ')).toBe('que-es');
    expect(slugifyHeading('El «Stack» y el <b>Libro</b>')).toBe('el-stack-y-el-b-libro-b');
  });

  test('un título sin letras ni números da un id válido', () => {
    expect(slugifyHeading('¡¡¡')).toBe('seccion');
    expect(slugifyHeading('')).toBe('seccion');
  });
});

describe('addHeadingIds y tableOfContents', () => {
  const html = '<h2>Uno</h2><p>a</p><h2>Uno</h2><h2 id="fijo">Dos &amp; tres</h2><h3>No cuenta</h3><h2><em>Cuatro</em> y <code>cinco</code></h2>';

  test('pone un id a cada título de segundo nivel, sin repetir ninguno y sustituyendo el que ya tuviera', () => {
    const out = addHeadingIds(html);
    expect(out).toContain('<h2 id="uno">Uno</h2>');
    expect(out).toContain('<h2 id="uno-2">Uno</h2>');
    expect(out).toContain('<h2 id="dos-tres">Dos &amp; tres</h2>');
    expect(out).not.toContain('id="fijo"');
    expect(out).toContain('<h2 id="cuatro-y-cinco"><em>Cuatro</em> y <code>cinco</code></h2>');
    expect(out).toContain('<h3>No cuenta</h3>');
    const ids = [...out.matchAll(/<h2[^>]* id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('el índice tiene un elemento por título, con su texto limpio de etiquetas', () => {
    expect(tableOfContents(addHeadingIds(html))).toEqual([
      { id: 'uno', title: 'Uno' },
      { id: 'uno-2', title: 'Uno' },
      { id: 'dos-tres', title: 'Dos & tres' },
      { id: 'cuatro-y-cinco', title: 'Cuatro y cinco' },
    ]);
    expect(tableOfContents('<p>sin títulos</p>')).toEqual([]);
  });
});

describe('splitAtMarker', () => {
  test('parte el texto por el párrafo de las tecnologías', () => {
    expect(splitAtMarker(`<p>antes</p><p>${TECH_MARKER}</p><p>después</p>`)).toEqual({ before: '<p>antes</p>', after: '<p>después</p>' });
  });

  test('sin marca, todo va en la primera mitad', () => {
    expect(splitAtMarker('<p>solo</p>')).toEqual({ before: '<p>solo</p>', after: '' });
  });
});

describe('direcciones', () => {
  test('son las de la página pública y el archivo de datos', () => {
    expect(HOWTO_PATH).toBe('/como-esta-hecho/');
    expect(HOWTO_DATA_PATH).toBe('/como-esta-hecho.json');
  });
});

describe('tecnologías', () => {
  test('cada una tiene nombre, qué hace y un logo (un trazo SVG) o, si la colección no lo tiene, ninguno', () => {
    expect(TECHS.length).toBeGreaterThanOrEqual(10);
    for (const t of TECHS) {
      expect(t.name.length, t.id).toBeGreaterThan(1);
      expect(t.role.length, t.id).toBeGreaterThan(10);
      if (t.logo !== null) {
        expect(t.logo, t.id).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\- \n]+$/);
        expect(t.logo, t.id).toMatch(/^[Mm]/);
      }
    }
  });

  test('los ids no se repiten y hay tecnologías con y sin logo (la sin logo se ve igual)', () => {
    const ids = TECHS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TECHS.some((t) => t.logo === null)).toBe(true);
    expect(TECHS.some((t) => t.logo !== null)).toBe(true);
  });

  test('las iniciales de reserva son de una o dos letras en mayúsculas', () => {
    expect(initials('Cloudflare Turnstile')).toBe('CT');
    expect(initials('Playwright')).toBe('P');
    expect(initials('GitHub Actions')).toBe('GA');
    expect(initials('Cloudflare Workers Platform Plus')).toBe('CW');
    for (const t of TECHS) expect(initials(t.name), t.id).toMatch(/^[A-Z0-9]{1,2}$/);
  });
});

// Guardas sobre el texto real del documento.
const raw = readFileSync(join(process.cwd(), 'src/content/como-esta-hecho.md'), 'utf8');
const { data, body } = splitFrontmatter(raw);

describe('src/content/como-esta-hecho.md', () => {
  test('tiene título y descripción', () => {
    expect(data.title?.length).toBeGreaterThan(5);
    expect(data.description?.length).toBeGreaterThan(40);
  });

  test('tiene las secciones acordadas, en este orden', () => {
    const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headings).toEqual([
      'Qué es',
      'Tecnologías',
      'Cómo funciona por dentro',
      'El contenido y las herramientas',
      'El formulario de Correo y el Libro de visitas',
      'Cómo se trabaja',
      'Estado local y publicación',
    ]);
  });

  test('el índice enlaza cada sección con un id distinto', () => {
    const html = body.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    const toc = prepareHowTo(html, data).toc;
    expect(toc).toHaveLength(7);
    expect(new Set(toc.map((t) => t.id)).size).toBe(7);
  });

  test('la lista de tecnologías tiene su sitio marcado, una sola vez', () => {
    expect(body.split(TECH_MARKER)).toHaveLength(2);
  });

  test('cada tecnología de la lista se nombra también en el texto o en su descripción', () => {
    for (const t of TECHS) expect(t.name.length).toBeGreaterThan(0);
    for (const name of ['Astro', 'Svelte', 'Cloudflare', 'GitHub Actions', 'Claude Code']) expect(raw, name).toContain(name);
  });

  test('no hay ninguna clave, token, correo, identificador de cuenta ni nombre de secreto', () => {
    expect(raw).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+|mailto:/);
    expect(raw).not.toMatch(/\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{10,}/);
    expect(raw).not.toMatch(/\b[A-Fa-f0-9]{32,}\b/); // ni cadenas hexadecimales largas (identificadores de cuenta, claves)
    expect(raw).not.toMatch(/\bsk-[A-Za-z0-9]{10,}|\bxox[abp]-|AKIA[0-9A-Z]{12,}/);
    for (const secret of ['STACK_GITHUB_TOKEN', 'GUESTBOOK_SECRET', 'TURNSTILE_SECRET_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'SITE_URL', 'wrangler secret']) {
      expect(raw, secret).not.toContain(secret);
    }
  });

  test('no da los límites exactos de frecuencia ni los números internos de la cuenta', () => {
    expect(raw).not.toMatch(/\b\d+ (envíos|peticiones) por minuto/i);
    expect(raw).not.toMatch(/namespace|account[_ ]?id|1000 (mensajes|correos)/i);
  });

  test('los enlaces son https:// o enlaces a apps del escritorio conocidos', () => {
    for (const [, href] of body.matchAll(/\]\(([^)]+)\)/g)) {
      if (href.startsWith('#')) expect(Object.keys(APP_LINKS), href).toContain(href.slice(1));
      else expect(href, href).toMatch(/^https:\/\//);
    }
  });

  test('no se nombra a ninguna persona ni empresa concreta de las que han hablado con Pol', () => {
    for (const name of ['Lucía', 'Marcos']) expect(raw, name).not.toContain(name);
  });
});
