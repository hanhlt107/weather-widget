# Setup

Widget thời tiết thuần HTML/CSS/JS — **không cần build, không cần API key**.
Dữ liệu từ [Open-Meteo](https://open-meteo.com/).

Hai cách dùng:

- **Bản web** — mở [index.html](index.html) bằng trình duyệt là chạy.
- **Ảnh SVG** — serverless function [api/weather.js](api/weather.js) sinh ảnh để nhúng vào README GitHub (GitHub không chạy JS trong README).

## Tính năng

- Dự báo 24h tới (dạng slide) và 7 ngày tới
- Giao diện sáng / tối tự theo hệ thống, nền đổi màu theo thời tiết
- Tự làm mới khi quay lại tab sau hơn 10 phút
- Có ARIA, hỗ trợ `prefers-reduced-motion`

## Chạy thử

```bash
python -m http.server 8000   # hoặc: npx serve .
```

Rồi mở http://localhost:8000

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
api/config.js            # Cấu hình serverless (ES module)
api/weather.js           # Sinh SVG cho README
```

Các file trong `js/` nạp theo thứ tự và giao tiếp qua `window.WeatherConfig` / `WeatherCodes` / `WeatherAPI`.
Có **hai file config** vì hai môi trường khác nhau (ES module vs. global), dùng chung cùng bộ giá trị mặc định.

## Tuỳ chỉnh

| Muốn đổi | Sửa ở đâu |
| --- | --- |
| Thành phố mặc định, đơn vị °F | `DEFAULTS` trong [js/config.js](js/config.js) |
| Thêm thành phố mới | `LOCATIONS` trong [js/config.js](js/config.js) **và** [api/config.js](api/config.js) |
| Số ngày dự báo | `DEFAULTS.forecastDays` — nhớ sửa `repeat(7, 1fr)` của `.ww-daily` trong CSS |
| Chữ tiếng Việt | `TEXT` trong cả hai file config |
| Màu ảnh SVG | `PALETTES` trong [api/config.js](api/config.js) |
| Màu bản web, bo góc | Biến `--ww-*` ở đầu [css/style.css](css/style.css) |

## Nhúng bản web vào trang khác

Copy `css/` và `js/`, chép khối `<section class="weather-widget" id="widget">…</section>` từ [index.html](index.html), rồi thêm thẻ `<link>` và 4 thẻ `<script>` ở cuối `<body>`.

## Giấy phép

[MIT](LICENSE)
