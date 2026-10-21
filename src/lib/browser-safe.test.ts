import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, test } from 'vitest';

// La isla del escritorio (src/os) se ejecuta en el navegador, donde no existen los módulos de Node. Un solo import de
// `node:crypto` en algo que ella use rompe la hidratación de toda la web (nos pasó con la huella del PDF de Sobre mí).
const root = process.cwd();
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const lib = walk(join(root, 'src/lib')).filter((f) => /\.ts$/.test(f) && !/\.test\.ts$/.test(f));
const nodeOnly = lib.filter((f) => /from ['"]node:/.test(readFileSync(f, 'utf8'))).map((f) => relative(join(root, 'src/lib'), f).split(sep).join('/').replace(/\.ts$/, ''));
const browserCode = walk(join(root, 'src/os')).filter((f) => /\.(ts|svelte)$/.test(f) && !/\.test\.ts$/.test(f));

describe('código del navegador', () => {
  test('hay módulos solo de Node en src/lib y la guarda sabe encontrarlos', () => {
    expect(nodeOnly).toContain('cv-hash');
  });

  test('nada de src/os importa un módulo de src/lib que dependa de Node', () => {
    for (const file of browserCode) {
      const source = readFileSync(file, 'utf8');
      for (const name of nodeOnly) {
        expect(new RegExp(`from ['"][./]*(?:lib/)?${name}['"]`).test(source), `${file} importa ${name}`).toBe(false);
      }
      expect(/from ['"]node:/.test(source), `${file} importa un módulo de Node`).toBe(false);
    }
  });
});
