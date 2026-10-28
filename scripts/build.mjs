import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url), output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'gioca.html', 'landing.css', 'app.js', 'game-data.js', 'mascot-frames.js', 'lesson-clock.js', 'backup.js', 'setup-flow.js', 'entry.js', 'board.css', 'lesson-board.css', 'ronf.css', 'assets', 'LICENSE']) {
  await cp(new URL(name, root), new URL(name, output), { recursive: true });
}
console.log('Ronf pronto: ' + fileURLToPath(output));
