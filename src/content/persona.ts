/**
 * Quién eres. Todo lo que la interfaz dice de ti sale de aquí: es lo primero que se cambia al usar la plantilla,
 * junto con el resto de src/content/ (CV, proyectos, notas, favoritos, enlaces) y la foto de src/assets/.
 *
 * Solo sintaxis «borrable» de TypeScript: los scripts de Node (scripts/*.mjs) importan este archivo directamente.
 */
export const PERSONA = {
  /** Nombre completo: pantalla de acceso, CV, Correo, datos para buscadores. */
  name: 'Miguel Fombuena',
  /** Cómo te llama la interfaz en frases cortas («Escribir a Miguel…»). */
  firstName: 'Miguel',
  /** Dos letras para el avatar del Correo. */
  initials: 'MF',
  /** El nombre del sistema: barra de menú, título de la Terminal, correos. */
  osName: 'Mike OS',
  /** Identidad de la Terminal. */
  terminalUser: 'mike@mike-os',
  /** Tu línea: título de la página y vista previa al compartir. */
  tagline: 'IA, automatización y producción audiovisual',
  /** Lo que responde `whoami` en la Terminal. */
  whoami: 'Conecto tecnología y creatividad: IA aplicada, automatización, desarrollo web, cine y música desde Valencia.',
  /** Dirección pública y canónica del portfolio (sin barra final). */
  siteUrl: 'https://migueos.vercel.app',
  /** Tu usuario de GitHub: la ventana GitHub, sus repositorios públicos y el Stack. */
  github: 'miguefomb',
  /** Nombre del PDF que se descarga desde Mi CV. */
  cvFileName: 'Miguel-Fombuena-CV.pdf',
  /** Tu newsletter, si tienes: sale al final de cada nota y como acceso directo. `null` para quitarla. */
  newsletter: null as { name: string; url: string; pitch: string } | null,
};
