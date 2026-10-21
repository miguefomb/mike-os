import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { NETWORKS, RELATIONS, normalizeLink, LIMITS as GUESTBOOK_LIMITS } from './lib/guestbook';
import { COVER_PATH, DURATION, ITEM_ID, YOUTUBE_ID } from './lib/favorites';
import { isSafeProjectUrl } from './lib/project-url';

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

const shot = z
  .object({
    /** Imagen WebP o GIF animado en /public/projects/<proyecto>/. */
    src: z.string().regex(/^\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|gif)$/, 'La captura debe estar en /public/projects/<proyecto>/ como .webp o .gif'),
    /** Texto alternativo: obligatorio, es lo que oye quien usa un lector de pantalla. */
    alt: z.string().min(1),
    /** Imagen fija de un GIF, para quien tiene activado el movimiento reducido. */
    still: z
      .string()
      .regex(/^\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/)
      .optional(),
  })
  .refine((s) => !s.src.endsWith('.gif') || !!s.still, { message: 'Un GIF necesita su imagen fija (still)' });

/** Copia de lo que dice GitHub de un repositorio público. La rellena scripts/actualizar-proyectos.mjs. */
const github = z.object({
  languages: z.array(z.object({ name: z.string(), bytes: z.number().int().positive() })),
  topics: z.array(z.string()),
  license: z.string().nullable(),
});

/** Un archivo JSON por proyecto. Aparece como icono en el escritorio y en los favoritos del Navegador. */
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    domain: z.string(),
    description: z.string(),
    /** Una frase para la tarjeta de la vista general de Proyectos. */
    summary: z.string().min(1),
    /** Qué es, en párrafos de texto (nunca HTML). */
    details: z.array(z.string().min(1)).default([]),
    stack: z.array(z.string()),
    screenshots: z.array(shot).default([]),
    /** `usuario/nombre` de su repositorio PÚBLICO. Los privados no se ponen aquí. */
    repo: z
      .string()
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
      .optional(),
    github: github.optional(),
    colors: z.object({ from: hexColor, to: hexColor }),
    /** Lo que carga el Navegador: una URL https o una ruta local (páginas de demostración). */
    url: z.string().refine(isSafeProjectUrl, 'La url debe ser https:// o una ruta local que empiece por /'),
    /** false si el sitio no permite cargarse dentro de Pol OS (cabecera frame-ancestors). */
    embeddable: z.boolean(),
    /** Icono propio (por ejemplo, el favicon del proyecto) en /public/projects/. Sin él, sale la inicial. */
    icon: z
      .string()
      .regex(/^\/projects\/[a-z0-9-]+\.(png|webp)$/, 'El icono debe estar en /public/projects/ como .png o .webp')
      .optional(),
    /** Dónde aparece: dentro de la carpeta Proyectos (lo normal) o como icono propio en el escritorio (los que viven solo en GitHub). */
    placement: z.enum(['folder', 'desktop']).default('folder'),
    /** Si el detalle ofrece abrir «Cómo está hecho», el documento que explica cómo funciona Pol OS (S-10). */
    howto: z.boolean().default(false),
    order: z.number().int(),
    /** Contenido de ejemplo, pendiente de sustituir por el real. */
    example: z.boolean().default(false),
  }),
});

/** Una nota por archivo Markdown. Cada una tiene su URL pública, `/notas/<nombre>/` (S-01). */
const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().min(1),
    /** El subtítulo: se ve bajo el título y es también la descripción para Google (160 caracteres como mucho). */
    description: z.string().min(20).max(160),
    date: z.coerce.date(),
    /** Desempata las notas de una misma fecha: la de número menor sale primero. */
    order: z.number().int().default(0),
    tags: z.array(z.string().min(1)).default([]),
  }),
});

const networkIds = NETWORKS.map((n) => n.id) as [(typeof NETWORKS)[number]['id'], ...(typeof NETWORKS)[number]['id'][]];
const relationIds = RELATIONS.map((r) => r.id) as [(typeof RELATIONS)[number]['id'], ...(typeof RELATIONS)[number]['id'][]];

/** Una reseña aprobada del Libro de visitas por archivo JSON (S-09). Nunca lleva el correo de su autor. */
const guestbook = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/guestbook' }),
  schema: z.object({
    name: z.string().min(1).max(GUESTBOOK_LIMITS.name),
    /** Cargo o lugar, opcional. */
    detail: z.string().min(1).max(GUESTBOOK_LIMITS.detail).optional(),
    relation: z.enum(relationIds),
    text: z.string().min(GUESTBOOK_LIMITS.textMin).max(GUESTBOOK_LIMITS.text),
    links: z
      .array(
        z
          .object({ network: z.enum(networkIds), url: z.string() })
          .refine((l) => normalizeLink(l.network, l.url) === l.url, 'La dirección debe ser la canónica del perfil (https://…)'),
      )
      .max(GUESTBOOK_LIMITS.links)
      .default([]),
    /** `AAAA-MM-DD`. Las reseñas heredadas de la web antigua no la tienen. */
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    order: z.number().int().default(0),
  }),
});

const itemId = z.string().regex(ITEM_ID);
const cover = z.string().regex(COVER_PATH, 'La portada debe estar en /public/favoritos/<sección>/<nombre>.jpg');
const youtubeId = z.string().regex(YOUTUBE_ID, 'Un identificador de YouTube tiene once caracteres');
const httpsUrl = z.string().refine((u) => u.startsWith('https://') && URL.canParse(u), 'La dirección debe ser https://');
const link = z.object({ label: z.string().min(1), url: httpsUrl });

/** Un archivo por sección, sin limitar la selección personal a diez entradas. */
const favorites = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/favorites' }),
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('games'),
      title: z.string().min(1),
      credit: link.optional(),
      items: z.array(z.object({ id: itemId, title: z.string().min(1), year: z.number().int().optional(), cover, url: httpsUrl, edition: z.string().optional() })),
    }),
    z.object({
      kind: z.literal('movies'),
      title: z.string().min(1),
      items: z.array(z.object({ id: itemId, title: z.string().min(1), year: z.number().int().optional(), synopsis: z.string().min(20).max(240).optional(), category: z.enum(['Película', 'Serie', 'Saga']).optional(), cover, trailer: youtubeId.optional() })),
    }),
    z.object({
      kind: z.literal('books'),
      title: z.string().min(1),
      link: link.optional(),
      items: z.array(z.object({ id: itemId, title: z.string().min(1), author: z.string().min(1), cover })),
    }),
    z.object({
      kind: z.literal('music'),
      title: z.string().min(1),
      items: z.array(z.union([
        z.object({ type: z.literal('artist'), id: itemId, title: z.string().min(1), cover, url: httpsUrl }),
        z.object({ id: itemId, title: z.string().min(1), artist: z.string().min(1), cover, video: youtubeId, duration: z.string().regex(DURATION).optional() }),
      ])),
    }),
  ]),
});

export const collections = { projects, notes, guestbook, favorites };
