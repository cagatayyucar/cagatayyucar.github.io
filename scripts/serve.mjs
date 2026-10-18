// Tiny static server with on-the-fly gzip (the 8 MB skid GLB compresses to ~2 MB): node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, extname, normalize } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const port = Number(process.argv[2]) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const gz = new Map();
createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root) || /\/(scripts|node_modules|\.)/.test(p)) { res.writeHead(403).end(); return; }
    const st = await stat(file);
    const ext = extname(file);
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
    let body = await readFile(file);
    if (/gzip/.test(req.headers['accept-encoding'] || '') && ['.html', '.js', '.css', '.glb', '.svg'].includes(ext)) {
      const k = file + st.mtimeMs;
      if (!gz.has(k)) gz.set(k, gzipSync(body, { level: 9 }));
      headers['X-File-Size'] = body.length; body = gz.get(k); headers['Content-Encoding'] = 'gzip'; headers.Vary = 'Accept-Encoding';
    }
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers).end(body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`http://localhost:${port}`));
