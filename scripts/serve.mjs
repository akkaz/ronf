import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost'), name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    if (name.split('/').some(p => p.startsWith('.')) || !types[path.extname(name)]) throw Error();
    const file = path.resolve(root, '.'+name);
    if (!file.startsWith(root + path.sep)) throw Error();
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(name)], 'X-Content-Type-Options':'nosniff'});res.end(data);
  } catch {res.writeHead(404);res.end('Non trovato');}
});
const port = Number(process.env.PORT || 4198);
server.listen(port, '127.0.0.1', () => console.log(`Ronf: http://127.0.0.1:${port}`));
