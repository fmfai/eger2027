#!/usr/bin/env node
// Local development server: serves the static site from the repository root and forwards /api/* to the
// registration backend, the same way the university web server does.
//
//   node scripts/dev-server.mjs                                  # http://localhost:3000, backend http://localhost:8080
//   node scripts/dev-server.mjs --port 3001 --proxy https://dev.fmfai2027.uni-eszterhazy.hu
//
// No dependencies; needs Node 18 or newer.
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
function option(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const port = Number(option('--port', process.env.PORT || 3000));
const proxyTarget = new URL(option('--proxy', process.env.API_PROXY || 'http://localhost:8080'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function proxy(req, res) {
  const client = proxyTarget.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: proxyTarget.host };
  const upstream = client.request(
    { protocol: proxyTarget.protocol, hostname: proxyTarget.hostname, port: proxyTarget.port, method: req.method, path: req.url, headers },
    (response) => { res.writeHead(response.statusCode || 502, response.headers); response.pipe(res); },
  );
  upstream.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'proxy', error_description: `Backend not reachable at ${proxyTarget.origin}: ${error.message}` }));
  });
  req.pipe(upstream);
}

function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400); res.end('Bad request'); return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.join(root, pathname);
  // Stay inside the repository, and do not serve dot files (.git, .github) or the backend / scripts folders.
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some((part) => part.startsWith('.'))
      || /^(backend|scripts)(\/|\\|$)/.test(relative)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer((req, res) => {
  if (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?')) { proxy(req, res); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end('Method not allowed'); return; }
  serveStatic(req, res);
}).listen(port, () => {
  console.log(`FMF-AI 2027 site: http://localhost:${port}/  (/api -> ${proxyTarget.origin})`);
});
