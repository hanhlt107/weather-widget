# Setup

Widget thời tiết thuần HTML/CSS/JS — **không cần build, không cần API key**.
Dữ liệu từ [Open-Meteo](https://open-meteo.com/).

Hai cách dùng:

- **Bản web** — mở [index.html](index.html) bằng trình duyệt là chạy (không cần build).
- **Ảnh SVG** — serverless function [api/weather.ts](api/weather.ts) (TypeScript) sinh ảnh để nhúng vào README GitHub (GitHub không chạy JS trong README). Vercel tự biên dịch `api/*.ts` khi deploy.

## Tính năng

- Dự báo 24h tới (dạng slide) và 7 ngày tới
- Giao diện sáng / tối tự theo hệ thống, nền đổi màu theo thời tiết
- Tự làm mới khi quay lại tab sau hơn 10 phút
- Có ARIA, hỗ trợ `prefers-reduced-motion`

## Chạy thử

Bản web:

```bash
python -m http.server 8000   # hoặc: npx serve .
```

Rồi mở http://localhost:8000

Xem trước ảnh SVG (cả 3 mode):

```bash
npm install        # lần đầu, kéo devDeps TypeScript
npm run dev        # chạy dev-server.mjs, mở http://localhost:3000
npm run typecheck  # tsc --noEmit + kiểm tra config đồng bộ
```

Dev server nạp trực tiếp `api/weather.ts` nhờ type-stripping của Node ≥ 22.6 (repo test trên Node 24). Node cũ hơn: `npx tsx dev-server.mjs`.

## Nhúng vào README GitHub

Deploy lên Vercel ([vercel.com/new](https://vercel.com/new) → import repo → Deploy, không cần biến môi trường), rồi dán:

```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?view=all" alt="Thời tiết Hà Nội" />
```

Nếu bạn fork repo này, đổi `weather-widget-ebon` thành domain Vercel cấp cho bạn.

### Tham số

| Tham số | Giá trị | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `view` | `all` \| `1d` \| `7d` | `all` | Hiện 24h, 7 ngày, hoặc cả hai |
| `location` | `hanoi`, `saigon`, `danang`, `haiphong`, `hue`, `cantho`, `dalat`, `nhatrang` | `hanoi` | Thành phố có sẵn |
| `city` | chuỗi bất kỳ | theo `location` | Tên hiển thị trên tiêu đề |
| `lat` / `lon` | số | theo `location` | Toạ độ tuỳ ý, ghi đè `location` |
| `theme` | `auto` \| `light` \| `dark` | `auto` | `auto` = tối vào ban đêm tại địa điểm đó |
| `unit` | `celsius` \| `fahrenheit` | `celsius` | Đơn vị nhiệt độ |
| `mode` | `card` \| `chart` \| `calendar` | `card` | Kiểu hiển thị: thẻ, biểu đồ, hay lịch nhiệt độ |
| `hide_title` / `hide_pin` | `true` \| `false` | `false` | Ẩn tiêu đề / ẩn ghim vị trí |
| `*_color` | mã hex (bỏ `#`) | theo theme | `text_color`, `rain_color`, `sun_color`, `chart_color`, `accent_color`… (xem `COLOR_PARAMS` trong [api/config.ts](api/config.ts)) |

```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?view=7d&theme=dark" />
<img src="https://weather-widget-ebon.vercel.app/api/weather?view=7d&city=Tokyo&lat=35.68&lon=139.69" />
```

SVG cache 15 phút ở CDN. GitHub proxy ảnh qua Camo và cache khá lâu — khi test, thêm tham số vô nghĩa (`&v=2`) để ép làm mới.

## Cấu trúc

```
index.html               # Khung widget cho web
css/style.css            # Style + design tokens theo theme
js/config.js             # Cấu hình bản web (global, không bundler)
js/weather-codes.js      # WMO code -> mô tả + icon SVG
js/api.js                # Gọi Open-Meteo
js/app.js                # Render, slide, tự làm mới
api/config.ts            # Cấu hình serverless (TypeScript, ES module)
api/weather.ts           # Sinh SVG cho README (TypeScript)
shared/locations.json    # Nguồn sự thật: danh sách thành phố + toạ độ
scripts/check-config-sync.mjs  # Canh js/config.js khớp shared/locations.json
tsconfig.json            # Cấu hình type-check cho api/
dev-server.mjs           # Server xem trước SVG khi dev
```

Các file trong `js/` nạp theo thứ tự và giao tiếp qua `window.WeatherConfig` / `WeatherCodes` / `WeatherAPI`.
Có **hai file config** vì hai môi trường khác nhau: `api/` là TypeScript/ES module (import được `shared/locations.json`), còn bản web chạy no-build nên `js/config.js` giữ ở dạng global. Danh sách thành phố có nguồn duy nhất là `shared/locations.json`; `npm run typecheck` sẽ báo nếu `js/config.js` bị lệch.

## Tuỳ chỉnh

| Muốn đổi | Sửa ở đâu |
| --- | --- |
| Thành phố mặc định, đơn vị °F | `DEFAULTS` trong [js/config.js](js/config.js) |
| Thêm thành phố mới | Thêm vào [shared/locations.json](shared/locations.json) (nguồn cho `api/`) **và** `LOCATIONS` trong [js/config.js](js/config.js); chạy `npm run typecheck` để chắc chắn khớp |
| Số ngày dự báo | `DEFAULTS.forecastDays` — nhớ sửa `repeat(7, 1fr)` của `.ww-daily` trong CSS |
| Chữ tiếng Việt | `TEXT` trong [js/config.js](js/config.js) và [api/config.ts](api/config.ts) |
| Màu ảnh SVG | `PALETTES` trong [api/config.ts](api/config.ts) |
| Màu bản web, bo góc | Biến `--ww-*` ở đầu [css/style.css](css/style.css) |

## Nhúng bản web vào trang khác

Copy `css/` và `js/`, chép khối `<section class="weather-widget" id="widget">…</section>` từ [index.html](index.html), rồi thêm thẻ `<link>` và 4 thẻ `<script>` ở cuối `<body>`.

## Giấy phép

[MIT](LICENSE)
