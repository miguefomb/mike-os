import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// La tarea diaria tiene permiso de escritura y un secreto: estas guardas impiden que alguien la abra a algo peligroso.
const yml = readFileSync(join(process.cwd(), '.github/workflows/actualizar-datos.yml'), 'utf8').replace(/\r\n/g, '\n');
const code = yml
  .split('\n')
  .filter((l) => !l.trim().startsWith('#'))
  .join('\n');

describe('.github/workflows/actualizar-datos.yml', () => {
  // En la plantilla el horario viene comentado (se activa al poner tu usuario): sin comentarios, solo queda «a mano».
  test('solo se dispara a mano (o por calendario, si se activa), nunca por un pull request ni un push', () => {
    const on = /^on:\n((?: {2}.*\n|\n)+)/m.exec(code)![1];
    expect(on).toMatch(/workflow_dispatch:/);
    expect(on).not.toMatch(/pull_request|push|issue|workflow_run/);
  });

  test('sus únicos permisos son escribir contenido', () => {
    const permissions = /^permissions:\n((?: {2}.*\n)+)/m.exec(code)![1].trim().split('\n').map((l) => l.trim());
    expect(permissions).toEqual(['contents: write']);
  });

  test('ejecuta los tests antes de publicar y publica solo si hay cambios', () => {
    expect(code.indexOf('pnpm test')).toBeGreaterThan(-1);
    expect(code.indexOf('pnpm test')).toBeLessThan(code.indexOf('git push'));
    expect(code).toMatch(/git diff --quiet/);
  });

  test('el token de Pol solo se pasa por una variable de entorno, nunca en la línea de comandos', () => {
    expect(code).not.toMatch(/run:.*secrets\./);
    expect(code.match(/secrets\.STACK_GITHUB_TOKEN/g)).toHaveLength(2);
  });

  test('solo añade al commit los datos, nada más', () => {
    expect(code).toMatch(/git add src\/content\/stack\.json src\/content\/projects src\/content\/repos\.json/);
    expect(code).not.toMatch(/git add (-A|--all|\.)/);
  });
});
