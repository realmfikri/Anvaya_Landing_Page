import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const DEFAULT_CUSTOM_DOMAIN = 'anvaya.co.id';
const customDomain = (process.env.CUSTOM_DOMAIN || DEFAULT_CUSTOM_DOMAIN)
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '');

if (!customDomain) {
  throw new Error('CUSTOM_DOMAIN cannot be empty.');
}

const entries = [
  'index.html',
  'demo.html',
  'hire.html',
  'style.css',
  'main.js',
  'agents.js',
  'contours.js',
  'earth-data.js',
  'globe.js',
  'assets',
  'fonts',
];

async function exists(source) {
  try {
    await stat(source);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!(await exists(source))) {
    console.warn(`Skipping missing entry: ${entry}`);
    continue;
  }

  await cp(source, path.join(dist, entry), {
    recursive: true,
    force: true,
    errorOnExist: false,
    verbatimSymlinks: true,
  });
}

const redirects = [
  `https://www.${customDomain}/* https://${customDomain}/:splat 301`,
];

await writeFile(path.join(dist, '_redirects'), `${redirects.join('\n')}\n`);

console.log(`Built static site in ${path.relative(root, dist)} for ${customDomain}`);
