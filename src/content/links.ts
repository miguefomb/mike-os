import { PERSONA } from './persona';

/** Accesos directos externos del escritorio (M-07). Se abren siempre en una pestaña nueva. */
export interface ExternalLink {
  id: 'newsletter' | 'github' | 'linkedin' | 'whatsapp' | 'instagram' | 'youtube' | 'spotify' | 'mad-mike-prods' | 'web-madmike';
  label: string;
  url: string;
  /** Icono en /public/links/ (la marca del servicio). */
  icon: string;
  /** `false` si no es un perfil público (WhatsApp es un canal de contacto): no entra en los datos estructurados `sameAs`. */
  profile?: boolean;
}

export const LINKS: ExternalLink[] = [
  // La newsletter sale de src/content/persona.ts: si allí es `null`, este acceso no aparece.
  ...(PERSONA.newsletter ? [{ id: 'newsletter' as const, label: PERSONA.newsletter.name, url: PERSONA.newsletter.url, icon: '/links/newsletter.png' }] : []),
  { id: 'github', label: 'GitHub', url: `https://github.com/${PERSONA.github}`, icon: '/links/github.png' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/miguelfombuena/', icon: '/links/linkedin.png' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/madmikeprods/', icon: '/links/instagram.png' },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@madmikeprods', icon: '/links/youtube.png' },
  { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/artist/0YaxOlra6NE3tdsMc8MdDN', icon: '/links/spotify.png' },
  { id: 'mad-mike-prods', label: 'Mad Mike Prods', url: 'https://madmikeprods.vercel.app/prod', icon: '/links/mad-mike-prods.png', profile: false },
  { id: 'web-madmike', label: 'Mi pagina web', url: 'https://madmikeprods.vercel.app/', icon: '/links/web-madmike.png', profile: false },
];

/** Los perfiles públicos (los que van en los datos estructurados): todos menos los canales de contacto. */
export const PROFILE_LINKS = LINKS.filter((l) => l.profile !== false);
