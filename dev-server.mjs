import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import handler from './api/weather.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const PAGE = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Weather widget — preview</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; background: #f4f6fa; color: #0f2a54; }
  header { padding: 20px 24px; background: #fff; border-bottom: 1px solid #e4e9f2; }
  h1 { margin: 0 0 4px; font-size: 18px; }
  .controls { padding: 16px 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  select, input { padding: 6px 8px; border: 1px solid #cdd6e5; border-radius: 8px; font-size: 13px; }
  .grid { padding: 8px 24px 40px; display: grid; gap: 20px; grid-template-columns: 1fr; max-width: 720px; }
  .card { background: #fff; border: 1px solid #e4e9f2; border-radius: 14px; padding: 18px; }
  .card h2 { margin: 0 0 12px; font-size: 13px; color: #5a6b86; text-transform: uppercase; letter-spacing: .5px; }
  img { width: 100%; display: block; }
  code { background: #eef1f6; padding: 1px 6px; border-radius: 5px; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Weather widget — xem trước</h1>
  <div>Ba mode: <code>card</code>, <code>chart</code>, <code>calendar</code></div>
</header>
<div class="controls">
  <label>Thành phố
    <select id="loc">
      <option value="hanoi">Hà Nội</option>
      <option value="saigon">TP. Hồ Chí Minh</option>
      <option value="danang">Đà Nẵng</option>
      <option value="haiphong">Hải Phòng</option>
      <option value="hue">Huế</option>
      <option value="dalat">Đà Lạt</option>
      <option value="nhatrang">Nha Trang</option>
      <option value="cantho">Cần Thơ</option>
    </select>
  </label>
  <label>Theme
    <select id="theme">
      <option value="auto">auto</option>
      <option value="light">light</option>
      <option value="dark">dark</option>
    </select>
  </label>
</div>
<div class="grid">
  <div class="card"><h2>mode = card</h2><img id="card" alt="card"></div>
  <div class="card"><h2>mode = chart</h2><img id="chart" alt="chart"></div>
  <div class="card"><h2>mode = calendar</h2><img id="calendar" alt="calendar"></div>
</div>
<script>
  function refresh() {
    const loc = document.getElementById('loc').value;
    const theme = document.getElementById('theme').value;
    const t = Date.now();
    for (const mode of ['card', 'chart', 'calendar']) {
      document.getElementById(mode).src =
        '/api/weather?location=' + loc + '&mode=' + mode + '&theme=' + theme + '&_=' + t;
    }
  }
  document.getElementById('loc').onchange = refresh;
  document.getElementById('theme').onchange = refresh;
  refresh();
</script>
</body>
</html>`;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(PAGE);
  }

  if (url.pathname === '/api/weather') {
    const query = Object.fromEntries(url.searchParams.entries());
    res.status = (code) => { res.statusCode = code; return res; };
    res.send = (body) => { res.end(body); return res; };
    return handler({ query }, res);
  }

  res.statusCode = 404;
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`Preview chạy tại http://localhost:${PORT}`);
});
