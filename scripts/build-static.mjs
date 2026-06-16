import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const customDomain = 'anvaya.muhamadfikri.com';

const entries = [
  'index.html',
  'demo.html',
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

await writeFile(path.join(dist, 'CNAME'), customDomain);
await writeFile(path.join(dist, '.nojekyll'), '');

await mkdir(path.join(dist, 'demo'), { recursive: true });
await writeFile(
  path.join(dist, 'demo', 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0; url=/demo.html">
<link rel="canonical" href="/demo.html">
<title>Request a Demo - Anvaya</title>
</head>
<body>
<p>Redirecting to <a href="/demo.html">/demo.html</a>.</p>
</body>
</html>
`,
);

console.log(`Built static site in ${path.relative(root, dist)}`);
