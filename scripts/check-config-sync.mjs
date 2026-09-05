// Nguồn sự thật cho danh sách thành phố là shared/locations.json.
// Cả hai nơi chép tay đều phải khớp:
//   - js/config.js   (bản web no-build, global IIFE)
//   - api/config.ts  (serverless, nhúng thẳng để không phụ thuộc file JSON lúc chạy)
// Chạy trong `npm run typecheck` / CI để bắt lệch tay.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const shared = JSON.parse(await readFile(join(root, 'shared/locations.json'), 'utf8'));

const targets = [
  ['js/config.js', await readFile(join(root, 'js/config.js'), 'utf8')],
  ['api/config.ts', await readFile(join(root, 'api/config.ts'), 'utf8')],
];

const errors = [];

for (const [file, source] of targets) {
  for (const [key, loc] of Object.entries(shared.locations)) {
    const re = new RegExp(
      `${key}\\s*:\\s*\\{\\s*name\\s*:\\s*["']([^"']+)["']\\s*,\\s*latitude\\s*:\\s*([-\\d.]+)\\s*,\\s*longitude\\s*:\\s*([-\\d.]+)`,
    );
    const m = re.exec(source);
    if (!m) {
      errors.push(`${file}: thiếu "${key}"`);
      continue;
    }
    if (m[1] !== loc.name) errors.push(`${file}: "${key}".name lệch: file="${m[1]}" json="${loc.name}"`);
    if (Number(m[2]) !== loc.latitude) errors.push(`${file}: "${key}".latitude lệch: file=${m[2]} json=${loc.latitude}`);
    if (Number(m[3]) !== loc.longitude) errors.push(`${file}: "${key}".longitude lệch: file=${m[3]} json=${loc.longitude}`);
  }
}

if (errors.length) {
  console.error('LOCATIONS lệch so với shared/locations.json:');
  for (const e of errors) console.error('  - ' + e);
  console.error('\nSửa file cho khớp nguồn shared/locations.json.');
  process.exit(1);
}

console.log('config-sync: js/config.js + api/config.ts khớp shared/locations.json (' +
  Object.keys(shared.locations).length + ' thành phố).');
