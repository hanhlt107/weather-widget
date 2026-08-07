# Weather Widget ⛅

Widget thời tiết đơn giản, chạy thuần HTML/CSS/JavaScript — **không cần build, không cần API key**.
Dữ liệu lấy từ [Open-Meteo](https://open-meteo.com/) (miễn phí cho mục đích phi thương mại).

## Tính năng

- ⏱️ Dự báo 24 giờ tới, dạng slide có nút ‹ › trái/phải
- 📅 Dự báo 7 ngày tới, lưới 7 cột hiển thị trọn không cần cuộn
- 🌙 Giao diện sáng / tối tự theo hệ thống
- 🎨 Nền widget đổi màu theo thời tiết và ngày/đêm
- 🔄 Tự làm mới khi quay lại tab sau hơn 10 phút
- ♿ Có ARIA cho nút điều hướng, hỗ trợ `prefers-reduced-motion`

## Chạy thử

Mở [index.html](index.html) bằng trình duyệt là chạy được ngay. Hoặc dùng server tĩnh:

```bash
# Python
python -m http.server 8000

# hoặc Node
npx serve .
```

Rồi mở http://localhost:8000

## Cấu trúc

```
weather-widget/
├── index.html              # Khung widget cho web
├── css/
│   └── style.css           # Toàn bộ style + design tokens theo theme
├── js/
│   ├── config.js           # Cấu hình cho bản web (thành phố, text, mặc định)
│   ├── weather-codes.js    # WMO code -> mô tả tiếng Việt + icon SVG
│   ├── api.js              # Gọi Open-Meteo forecast
│   └── app.js              # Render, slide, tự làm mới
├── api/
│   ├── config.js           # Cấu hình cho serverless (mặc định, màu, layout)
│   └── weather.js          # Serverless function sinh SVG cho README
├── vercel.json
└── README.md
```

Bốn file trong `js/` nạp theo thứ tự và giao tiếp qua `window.WeatherConfig` /
`window.WeatherCodes` / `window.WeatherAPI`. Không dùng module bundler nên có thể nhúng
thẳng vào bất kỳ trang nào.

Có **hai file config** vì hai môi trường khác nhau: [api/config.js](api/config.js) là ES module
(chạy trên Vercel), còn [js/config.js](js/config.js) gán vào biến global (chạy trên trình duyệt,
không có bundler). Hai file dùng chung cùng bộ giá trị mặc định.

## Nhúng vào README trên GitHub

GitHub **không chạy JavaScript** trong README, nên bản web ở trên không nhúng thẳng được.
Thay vào đó, [api/weather.js](api/weather.js) là một serverless function trả về **ảnh SVG**
— GitHub tải nó như ảnh tĩnh, giống cách widget Spotify hoạt động.

### 1. Deploy lên Vercel

```bash
npm i -g vercel
vercel        # lần đầu: chọn scope, link project
vercel --prod
```

Hoặc vào [vercel.com/new](https://vercel.com/new), import repo này, bấm Deploy. Không cần
khai báo biến môi trường vì Open-Meteo không yêu cầu API key.

### 2. Dán vào README

```markdown
### ⛅ &nbsp; Thời tiết hôm nay

<p align="center">
  <img src="https://TÊN-PROJECT.vercel.app/api/weather?view=all" alt="Thời tiết Hà Nội" />
</p>
```

Đổi `TÊN-PROJECT` thành domain Vercel cấp cho bạn.

### Tham số

| Tham số | Giá trị | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `view` | `all` \| `1d` \| `7d` | `all` | `1d` chỉ hiện 24h tới, `7d` chỉ hiện 7 ngày, `all` hiện cả hai |
| `location` | xem bảng dưới | `hanoi` | Chọn nhanh thành phố có sẵn, khỏi cần nhập toạ độ |
| `city` | chuỗi bất kỳ | theo `location` | Tên hiển thị trên tiêu đề |
| `lat` / `lon` | số | theo `location` | Toạ độ tuỳ ý, ghi đè `location` |
| `theme` | `auto` \| `light` \| `dark` | `auto` | `auto` = tối vào ban đêm tại địa điểm đó |
| `unit` | `celsius` \| `fahrenheit` | `celsius` | Đơn vị nhiệt độ |

Thành phố có sẵn cho `location`: `hanoi`, `saigon`, `danang`, `haiphong`, `hue`,
`cantho`, `dalat`, `nhatrang`. Thêm thành phố mới bằng cách sửa `LOCATIONS` trong
[api/config.js](api/config.js).

Ví dụ:

```markdown
<!-- Chỉ 24h tới -->
<img src="https://TÊN-PROJECT.vercel.app/api/weather?view=1d" />

<!-- Chỉ 7 ngày, nền tối -->
<img src="https://TÊN-PROJECT.vercel.app/api/weather?view=7d&theme=dark" />

<!-- Thành phố có sẵn -->
<img src="https://TÊN-PROJECT.vercel.app/api/weather?location=danang&view=7d" />

<!-- Toạ độ tuỳ ý -->
<img src="https://TÊN-PROJECT.vercel.app/api/weather?view=7d&city=Tokyo&lat=35.68&lon=139.69" />
```

SVG được cache 15 phút ở CDN (`s-maxage=900`) nên vừa luôn mới vừa không gọi Open-Meteo quá dày.

> GitHub proxy ảnh qua Camo và cache khá lâu. Nếu muốn ép làm mới khi test, thêm một tham số
> vô nghĩa vào URL (ví dụ `&v=2`).

## Nhúng bản web vào trang khác

1. Copy thư mục `css/` và `js/`.
2. Chép khối `<section class="weather-widget" id="widget">…</section>` từ `index.html`.
3. Thêm `<link rel="stylesheet" href="css/style.css">` và 3 thẻ `<script>` ở cuối `<body>`.

## Tuỳ chỉnh

| Muốn đổi | Sửa ở đâu |
| --- | --- |
| Thành phố mặc định (web) | `DEFAULTS.location` trong [js/config.js](js/config.js) |
| Thêm thành phố mới | `LOCATIONS` trong [js/config.js](js/config.js) và [api/config.js](api/config.js) |
| Số ngày dự báo | `DEFAULTS.forecastDays` trong config — nhớ sửa `repeat(7, 1fr)` của `.ww-daily` trong CSS |
| Đơn vị °F | `DEFAULTS.unit` = `'fahrenheit'` trong [js/config.js](js/config.js) |
| Chữ tiếng Việt | `TEXT` trong [js/config.js](js/config.js) và [api/config.js](api/config.js) |
| Màu ảnh SVG | `PALETTES` trong [api/config.js](api/config.js) |
| Màu bản web, bo góc | Các biến `--ww-*` ở đầu [css/style.css](css/style.css) |
| Mô tả thời tiết | `DESCRIPTIONS` trong [js/weather-codes.js](js/weather-codes.js) |

## API sử dụng

Duy nhất `api.open-meteo.com/v1/forecast`, gọi trực tiếp từ trình duyệt, không cần khoá.

## Trình duyệt hỗ trợ

Chrome / Edge / Firefox / Safari bản gần đây (cần `fetch`, `Promise.finally`,
`Array.prototype.findIndex`, CSS custom properties).

## Đưa lên Git

```bash
git init
git add .
git commit -m "Weather widget"
git branch -M main
git remote add origin <URL repo của bạn>
git push -u origin main
```

Muốn deploy miễn phí: bật **GitHub Pages** (Settings → Pages → branch `main`, thư mục `/root`).

## Giấy phép

[MIT](LICENSE)
