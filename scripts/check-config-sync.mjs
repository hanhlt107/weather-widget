// Xác nhận LOCATIONS trong js/config.js (bản web no-build, chép tay) khớp với
// nguồn sự thật shared/locations.json. Chạy trong `npm run typecheck` / CI.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const shared = JSON.parse(await readFile(join(root, 'shared/locations.json'), 'utf8'));
const webSource = await readFile(join(root, 'js/config.js'), 'utf8');

const errors = [];

for (const [key, loc] of Object.entries(shared.locations)) {
  const re = new RegExp(
    `${key}\\s*:\\s*\\{\\s*name\\s*:\\s*["']([^"']+)["']\\s*,\\s*latitude\\s*:\\s*([-\\d.]+)\\s*,\\s*longitude\\s*:\\s*([-\\d.]+)`,
  );
  const m = re.exec(webSource);
  if (!m) {
    errors.push(`Thiếu "${key}" trong js/config.js`);
    continue;
  }
  if (m[1] !== loc.name) errors.push(`"${key}".name lệch: js="${m[1]}" json="${loc.name}"`);
  if (Number(m[2]) !== loc.latitude) errors.push(`"${key}".latitude lệch: js=${m[2]} json=${loc.latitude}`);
  if (Number(m[3]) !== loc.longitude) errors.push(`"${key}".longitude lệch: js=${m[3]} json=${loc.longitude}`);
}

if (errors.length) {
  console.error('LOCATIONS lệch giữa shared/locations.json và js/config.js:');
  for (const e of errors) console.error('  - ' + e);
  console.error('\nSửa js/config.js cho khớp nguồn shared/locations.json.');
  process.exit(1);
}

console.log('config-sync: js/config.js khớp shared/locations.json (' +
  Object.keys(shared.locations).length + ' thành phố).');
