/** Catálogo de apps de Pol OS: título, nombre en la barra de menú y tamaño inicial de la ventana. */
import { PERSONA } from '../../content/persona';

export type AppId = 'browser' | 'mail' | 'about' | 'notes' | 'note' | 'guestbook' | 'howto' | 'favorites' | 'stack' | 'projects' | 'terminal' | 'settings' | 'help' | 'memory' | 'checkers' | 'github';

export interface AppDef {
  title: string;
  /** Nombre que aparece en negrita en la barra de menú cuando la app tiene el foco. */
  menu: string;
  width: number;
  height: number;
}

export const APPS: Record<AppId, AppDef> = {
  browser: { title: 'Navegador', menu: 'Navegador', width: 900, height: 600 },
  mail: { title: 'Correo', menu: 'Correo', width: 600, height: 540 },
  about: { title: 'Mi CV.pdf', menu: 'Vista previa', width: 720, height: 660 },
  notes: { title: 'Notas', menu: 'Escritorio', width: 580, height: 380 },
  note: { title: 'Nota', menu: 'Notas', width: 580, height: 520 },
  favorites: { title: 'Favoritos', menu: 'Favoritos', width: 640, height: 560 },
  howto: { title: 'Cómo está hecho', menu: 'Cómo está hecho', width: 700, height: 640 },
  guestbook: { title: 'Libro de visitas', menu: 'Libro de visitas', width: 560, height: 560 },
  projects: { title: 'Proyectos', menu: 'Proyectos', width: 760, height: 560 },
  stack: { title: 'Stack', menu: 'Stack', width: 620, height: 600 },
  terminal: { title: `Terminal — ${PERSONA.terminalUser}`, menu: 'Terminal', width: 660, height: 420 },
  settings: { title: 'Ajustes', menu: 'Ajustes', width: 580, height: 540 },
  help: { title: `Cómo usar ${PERSONA.osName}`, menu: 'Ayuda', width: 520, height: 560 },
  memory: { title: 'Memory', menu: 'Memory', width: 480, height: 600 },
  checkers: { title: 'Damas', menu: 'Damas', width: 640, height: 640 },
  github: { title: 'GitHub', menu: 'GitHub', width: 720, height: 560 },
};

/** Lo que se abre: una app y, opcionalmente, qué contenido (un proyecto, una nota). */
export interface OpenTarget {
  app: AppId;
  arg?: string;
}
