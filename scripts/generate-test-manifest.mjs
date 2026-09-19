import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const testsRoot = join(root, 'tests');
const outputPath = join(root, 'test-dashboard', 'tests.json');

async function collectTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const tests = [];

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      tests.push(...await collectTests(filePath));
      continue;
    }
    if (!entry.name.endsWith('.spec.ts')) continue;

    const source = await readFile(filePath, 'utf8');
    const names = [...source.matchAll(/test\(\s*['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
    tests.push({ file: relative(root, filePath).split(sep).join('/'), names });
  }

  return tests.sort((a, b) => a.file.localeCompare(b.file));
}

const tests = await collectTests(testsRoot);
await writeFile(outputPath, `${JSON.stringify({ tests }, null, 2)}\n`);
console.log(`Generated ${tests.length} test specs at ${relative(root, outputPath)}`);
