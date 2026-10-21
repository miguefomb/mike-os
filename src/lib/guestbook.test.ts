import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { LIMITS, NETWORKS, RELATIONS, normalizeLink, slugify, sortEntries, toEntry, validateGuestbook } from './guestbook';

const valid = {
  kind: 'new',
  name: 'Ana Pérez',
  detail: 'Diseñadora | Madrid',
  relation: 'cliente',
  text: 'Trabajar con Pol fue muy fácil y el resultado superó lo que esperaba.',
  email: 'ana@ejemplo.com',
  links: [{ network: 'linkedin', value: 'ana-perez' }],
  consent: true,
};

const errorsOf = (raw: unknown) => {
  const v = validateGuestbook(raw);
  return v.ok ? {} : v.errors;
};

describe('normalizeLink', () => {
  test('acepta el usuario, con o sin arroba, y devuelve la dirección canónica', () => {
    expect(normalizeLink('linkedin', 'ana-perez')).toBe('https://www.linkedin.com/in/ana-perez');
    expect(normalizeLink('github', '@tu-usuario')).toBe('https://github.com/tu-usuario');
    expect(normalizeLink('x', '@ana_1')).toBe('https://x.com/ana_1');
    expect(normalizeLink('instagram', 'ana.perez')).toBe('https://www.instagram.com/ana.perez');
    expect(normalizeLink('youtube', '@anaperez')).toBe('https://www.youtube.com/@anaperez');
  });

  test('acepta la dirección completa de esa red y la deja canónica (https, sin parámetros)', () => {
    expect(normalizeLink('linkedin', 'http://linkedin.com/in/ana-perez/?utm=1#x')).toBe('https://www.linkedin.com/in/ana-perez');
    expect(normalizeLink('linkedin', 'es.linkedin.com/in/ana-perez')).toBe('https://www.linkedin.com/in/ana-perez');
    expect(normalizeLink('x', 'https://twitter.com/ana_1')).toBe('https://x.com/ana_1');
    expect(normalizeLink('youtube', 'https://www.youtube.com/@anaperez')).toBe('https://www.youtube.com/@anaperez');
    expect(normalizeLink('github', 'https://github.com/tu-usuario/pol-os')).toBe('https://github.com/tu-usuario');
  });

  test('rechaza otras redes, otros dominios, protocolos raros, credenciales y puertos', () => {
    for (const bad of [
      'https://evil.example/in/ana',
      'https://www.linkedin.com.evil.example/in/ana',
      'https://evil.example/https://www.linkedin.com/in/ana',
      'javascript:alert(1)',
      'data:text/html,<script>1</script>',
      'ftp://www.linkedin.com/in/ana',
      'https://user:pass@www.linkedin.com/in/ana',
      'https://www.linkedin.com:8080/in/ana',
      'https://www.linkedin.com/company/acme',
      'https://www.linkedin.com/in/',
      '',
      '   ',
    ]) {
      expect(normalizeLink('linkedin', bad), bad).toBeNull();
    }
    expect(normalizeLink('github', 'https://x.com/ana')).toBeNull();
    expect(normalizeLink('mastodon', 'ana')).toBeNull();
    // Nombres de red que existen en todo objeto: se rechazan, no rompen.
    for (const network of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) expect(normalizeLink(network, 'ana'), network).toBeNull();
  });

  test('rechaza usuarios con caracteres que la red no admite', () => {
    expect(normalizeLink('x', 'esto es demasiado largo para x')).toBeNull();
    expect(normalizeLink('github', '-empieza-con-guion')).toBeNull();
    expect(normalizeLink('instagram', 'a b')).toBeNull();
    expect(normalizeLink('linkedin', 'a<b>')).toBeNull();
  });
});

describe('validateGuestbook', () => {
  test('una reseña correcta es válida y se limpia (espacios, saltos de línea de Windows)', () => {
    const v = validateGuestbook({ ...valid, name: '  Ana Pérez  ', text: `${valid.text}\r\nSegunda línea`, email: ' ana@ejemplo.com ' });
    expect(v).toMatchObject({ ok: true, value: { kind: 'new', name: 'Ana Pérez', email: 'ana@ejemplo.com', relation: 'cliente' } });
    if (v.ok) {
      expect(v.value.text).toContain('\nSegunda línea');
      expect(v.value.text).not.toContain('\r');
      expect(v.value.links).toEqual([{ network: 'linkedin', url: 'https://www.linkedin.com/in/ana-perez' }]);
    }
  });

  test('sin campos opcionales también es válida', () => {
    expect(validateGuestbook({ ...valid, detail: '', links: [] }).ok).toBe(true);
    const { links: _links, ...sinRedes } = valid;
    expect(validateGuestbook(sinRedes).ok).toBe(true);
  });

  test('cada campo obligatorio vacío da su propio error', () => {
    expect(Object.keys(errorsOf({})).sort()).toEqual(['consent', 'email', 'kind', 'name', 'relation', 'text']);
    expect(errorsOf({ ...valid, name: '' })).toHaveProperty('name');
    expect(errorsOf({ ...valid, text: '' })).toHaveProperty('text');
    expect(errorsOf({ ...valid, relation: 'jefe' })).toHaveProperty('relation');
    expect(errorsOf({ ...valid, kind: 'borrar' })).toHaveProperty('kind');
    expect(errorsOf({ ...valid, consent: false })).toHaveProperty('consent');
    expect(errorsOf({ ...valid, consent: 'true' })).toHaveProperty('consent');
  });

  test('respeta los límites de longitud', () => {
    expect(errorsOf({ ...valid, text: 'a'.repeat(LIMITS.textMin - 1) })).toHaveProperty('text');
    expect(validateGuestbook({ ...valid, text: 'a'.repeat(LIMITS.text) }).ok).toBe(true);
    expect(errorsOf({ ...valid, text: 'a'.repeat(LIMITS.text + 1) })).toHaveProperty('text');
    expect(errorsOf({ ...valid, name: 'a'.repeat(LIMITS.name + 1) })).toHaveProperty('name');
    expect(errorsOf({ ...valid, detail: 'a'.repeat(LIMITS.detail + 1) })).toHaveProperty('detail');
    expect(errorsOf({ ...valid, email: `${'a'.repeat(LIMITS.email)}@x.com` })).toHaveProperty('email');
  });

  test('el correo debe parecer un correo y no admite saltos de línea', () => {
    for (const email of ['sin-arroba', 'a@b', 'a b@c.com', 'a@b.com\nBcc: otro@x.com']) {
      expect(errorsOf({ ...valid, email }), email).toHaveProperty('email');
    }
  });

  test('el nombre y el detalle van en una línea, sin caracteres de control ni de inversión de texto', () => {
    expect(errorsOf({ ...valid, name: 'Ana\nPérez' })).toHaveProperty('name');
    expect(errorsOf({ ...valid, name: 'Ana‮Pérez' })).toHaveProperty('name');
    expect(errorsOf({ ...valid, detail: 'a\r\nb' })).toHaveProperty('detail');
    expect(errorsOf({ ...valid, text: `${valid.text}\u0000` })).toHaveProperty('text');
    expect(errorsOf({ ...valid, text: `${valid.text}‮` })).toHaveProperty('text');
  });

  test('el HTML se acepta como texto plano, sin transformarlo: nunca se interpreta', () => {
    const v = validateGuestbook({ ...valid, text: 'Una reseña con <script>alert(1)</script> y <b>negrita</b> dentro.' });
    expect(v.ok && v.value.text).toBe('Una reseña con <script>alert(1)</script> y <b>negrita</b> dentro.');
  });

  test('admite hasta tres redes, ignora las filas vacías y quita duplicados', () => {
    const many = [{ network: 'linkedin', value: 'a-b-c' }, { network: 'github', value: 'abc' }, { network: 'x', value: 'abc' }, { network: 'instagram', value: 'abc' }];
    expect(errorsOf({ ...valid, links: many })).toHaveProperty('links');
    const v = validateGuestbook({ ...valid, links: [{ network: 'github', value: '' }, { network: 'github', value: 'abc' }, { network: 'github', value: '@abc' }] });
    expect(v.ok && v.value.links).toEqual([{ network: 'github', url: 'https://github.com/abc' }]);
  });

  test('una red con una dirección que no es suya, o no admitida, se rechaza', () => {
    expect(errorsOf({ ...valid, links: [{ network: 'linkedin', value: 'https://evil.example/in/ana' }] })).toHaveProperty('links');
    expect(errorsOf({ ...valid, links: [{ network: 'tiktok', value: 'ana' }] })).toHaveProperty('links');
    expect(errorsOf({ ...valid, links: 'ana' })).toHaveProperty('links');
    for (const network of ['constructor', '__proto__']) expect(errorsOf({ ...valid, links: [{ network, value: 'ana' }] }), network).toHaveProperty('links');
  });

  test('retirar solo pide nombre, correo y aceptación: no hace falta texto ni relación, y lo demás se ignora', () => {
    const v = validateGuestbook({ kind: 'remove', name: 'Ana', email: 'ana@ejemplo.com', consent: true, text: 'esto se ignora', links: 'basura' });
    expect(v).toMatchObject({ ok: true, value: { kind: 'remove', text: '', links: [], relation: 'otro' } });
  });

  test('editar exige el texto nuevo', () => {
    expect(validateGuestbook({ ...valid, kind: 'edit' }).ok).toBe(true);
    expect(errorsOf({ ...valid, kind: 'edit', text: '' })).toHaveProperty('text');
  });

  test('un cuerpo que no es un objeto no rompe nada', () => {
    for (const raw of [null, undefined, 'texto', 42, []]) expect(validateGuestbook(raw).ok).toBe(false);
  });
});

describe('reseñas publicadas', () => {
  test('slugify da un nombre de archivo seguro', () => {
    expect(slugify('María José Núñez')).toBe('maria-jose-nunez');
    expect(slugify('  ¡¡Ana!! / ../../etc  ')).toBe('ana-etc');
    expect(slugify('日本語')).toBe('resena');
    expect(slugify('a'.repeat(100)).length).toBeLessThanOrEqual(40);
  });

  test('toEntry deja la reseña sin correo, con la fecha de hoy y sin detalle vacío', () => {
    const v = validateGuestbook({ ...valid, detail: '' });
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const entry = toEntry(v.value, '2026-10-11');
    expect(entry).toEqual({ name: 'Ana Pérez', relation: 'cliente', text: valid.text, links: v.value.links, date: '2026-10-11' });
    expect(JSON.stringify(entry)).not.toContain('@ejemplo');
  });

  test('sortEntries: las más recientes primero, las sin fecha al final, y por número y nombre si empatan', () => {
    const sorted = sortEntries([
      { id: 'viejo-b', order: 2 },
      { id: 'viejo-a', order: 1 },
      { id: 'reciente', date: '2026-10-12' },
      { id: 'medio', date: '2026-10-11', order: 2 },
      { id: 'medio-1', date: '2026-10-11', order: 1 },
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['reciente', 'medio-1', 'medio', 'viejo-a', 'viejo-b']);
  });
});

// Guardas sobre las reseñas reales del repositorio: lo que se publica en la ventana.
const dir = join(process.cwd(), 'src/content/guestbook');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const entries = files.map((f) => ({ id: f.replace(/\.json$/, ''), raw: readFileSync(join(dir, f), 'utf8'), data: JSON.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, unknown> }));

describe('src/content/guestbook', () => {
  test('las reseñas ficticias de la plantilla no se atribuyen a Miguel', () => {
    expect(entries.map((entry) => entry.data.name)).not.toEqual(expect.arrayContaining(['Lucía Ejemplo', 'Marcos Ejemplo']));
  });

  test('cada archivo tiene un nombre válido y los campos que la colección espera', () => {
    const relations: string[] = RELATIONS.map((r) => r.id);
    for (const e of entries) {
      expect(e.id, e.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(typeof e.data.name === 'string' && e.data.name.length >= 1 && e.data.name.length <= LIMITS.name, `${e.id}: nombre`).toBe(true);
      expect(relations, `${e.id}: relación`).toContain(e.data.relation);
      const text = e.data.text as string;
      expect(text.length, `${e.id}: texto`).toBeGreaterThanOrEqual(LIMITS.textMin);
      expect(text.length, `${e.id}: texto de ${text.length}`).toBeLessThanOrEqual(LIMITS.text);
      if (e.data.detail !== undefined) expect((e.data.detail as string).length, `${e.id}: detalle`).toBeLessThanOrEqual(LIMITS.detail);
      if (e.data.date !== undefined) expect(e.data.date, `${e.id}: fecha`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('las redes son de la lista y llevan la dirección canónica', () => {
    const networks: string[] = NETWORKS.map((n) => n.id);
    for (const e of entries) {
      const links = (e.data.links ?? []) as { network: string; url: string }[];
      expect(links.length, e.id).toBeLessThanOrEqual(LIMITS.links);
      for (const l of links) {
        expect(networks, `${e.id}: red`).toContain(l.network);
        expect(normalizeLink(l.network, l.url), `${e.id}: ${l.url}`).toBe(l.url);
      }
    }
  });

  test('ninguna reseña publicada lleva un correo', () => {
    for (const e of entries) {
      expect(e.raw, e.id).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+|mailto:/);
      expect(e.data, e.id).not.toHaveProperty('email');
    }
  });

  test('ningún texto lleva HTML ni caracteres de control', () => {
    for (const e of entries) expect(e.data.text as string, e.id).not.toMatch(/<[a-z/][^>]*>|[\u0000-\u0008\u000B\u000C\u000E-\u001F‪-‮]/i);
  });
});
