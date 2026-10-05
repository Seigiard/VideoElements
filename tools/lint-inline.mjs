import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'parse5';

const html = readFileSync('index.html', 'utf8');

const document = parse(html, { sourceCodeLocationInfo: true });

const directory = mkdtempSync(resolve('.anti-slop-inline-'));

const files = [];

function visit(node) {
  if (node.tagName === 'script' && !node.attrs.some(attribute => attribute.name === 'src')) {
    const type = node.attrs.find(attribute => attribute.name === 'type')?.value.trim().toLowerCase() ?? '';

    if (['', 'text/javascript', 'application/javascript', 'module'].includes(type)) {
      const location = node.sourceCodeLocation;
      const start = location.startTag.endOffset;
      const end = location.endTag?.startOffset ?? html.length;
      const prefix = html.slice(0, start).replace(/[^\n]/g, ' ');
      const file = resolve(directory, `index.html.inline-${files.length + 1}.${type === 'module' ? 'mjs' : 'cjs'}`);
      writeFileSync(file, prefix + html.slice(start, end));
      files.push(file);
    }
  }

  for (const child of node.childNodes ?? []) visit(child);
}

try {
  visit(document);

  if (files.length === 0) throw new Error('No JavaScript found in index.html. Check lint coverage.');

  console.log('Linting inline scripts from index.html; extracted files preserve HTML line numbers.');
  const result = spawnSync(process.execPath, [resolve('node_modules/oxlint/bin/oxlint'), '--config', resolve('.oxlintrc.json'), '.', ...files], { stdio: 'inherit' });

  if (result.error) throw result.error;

  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
