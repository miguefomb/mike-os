/**
 * Lógica pura de Sobre mí (M-06): el texto vive en `src/content/sobre-mi.md` y de él salen el documento de la
 * ventana y el PDF. Se usa también desde scripts/generar-cv.mjs y desde los tests, así que solo usa lo que Node
 * ejecuta tal cual. Es seguro para el navegador (la ventana lo importa): la huella, que necesita `node:crypto`, está
 * aparte en `cv-hash.ts`.
 */

export const CV_PDF_PATH = '/cv.pdf';

/** Sin PDF no hay botón (el negativo de M-06). */
export const pdfHref = (exists: boolean, href: string = CV_PDF_PATH): string | null => (exists ? href : null);

/** Separa el bloque `---` del principio (solo pares `clave: valor`) del resto del texto. */
export function splitFrontmatter(markdown: string): { data: Record<string, string>; body: string } {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) return { data: {}, body: markdown };
  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: normalized.slice(match[0].length) };
}

/** Los enlaces `https://` del texto se abren en una pestaña nueva y sin dar acceso a Pol OS. */
export const externalLinks = (html: string) =>
  html.replace(/<a href="(https:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');

/** Los enlaces a apps (`#abrir-…`) solo tienen sentido dentro del escritorio: en el PDF queda su texto. */
export const withoutAppLinks = (html: string) => html.replace(/<a href="#abrir-[a-z]+">([\s\S]*?)<\/a>/g, '$1');

/** A qué app lleva cada enlace `#abrir-…`. */
export const APP_LINKS = { 'abrir-proyectos': 'projects', 'abrir-correo': 'mail', 'abrir-stack': 'stack', 'abrir-visitas': 'guestbook' } as const;
export type AppLinkTarget = (typeof APP_LINKS)[keyof typeof APP_LINKS];

export function appLinkTarget(href: string | null | undefined): AppLinkTarget | null {
  if (!href?.startsWith('#')) return null;
  const key = href.slice(1);
  return Object.hasOwn(APP_LINKS, key) ? APP_LINKS[key as keyof typeof APP_LINKS] : null;
}
