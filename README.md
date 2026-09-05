<div align="center">

# ⛅ Weather Widget

**Widget thời tiết đẹp, tự cập nhật — nhúng thẳng vào README GitHub bằng một dòng.**
Không cần API key, không cần server riêng. Dữ liệu từ [Open-Meteo](https://open-meteo.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hanhlt107/weather-widget)
&nbsp;
[![Open-Meteo](https://img.shields.io/badge/data-open--meteo-369?style=flat-square&logo=cloudflare&logoColor=white&color=4b9bea)](https://open-meteo.com/)
[![Vercel](https://img.shields.io/badge/deploy-vercel-000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/new)
[![License](https://img.shields.io/badge/license-MIT-2a8?style=flat-square)](LICENSE)

<br>

[![Thời tiết](https://weather-widget-ebon.vercel.app/api/weather?view=all)](https://open-meteo.com/)

</div>

## ✨ Ba kiểu hiển thị

| `mode=card` (mặc định) | `mode=chart` | `mode=calendar` |
| :---: | :---: | :---: |
| Dự báo 24h + 7 ngày | Biểu đồ nhiệt độ + mưa cả tháng | Lịch nhiệt độ kiểu GitHub |
| ![card](https://weather-widget-ebon.vercel.app/api/weather?view=7d) | ![chart](https://weather-widget-ebon.vercel.app/api/weather?mode=chart) | ![calendar](https://weather-widget-ebon.vercel.app/api/weather?mode=calendar) |

Tự đổi sáng/tối theo giờ tại địa điểm, đổi được thành phố, đơn vị, màu sắc — tất cả qua tham số URL.

## 🚀 Dùng ngay (fork trong 2 phút)

1. Bấm **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/hanhlt107/weather-widget)** → import repo → **Deploy** (không cần biến môi trường).
2. Vercel cấp cho bạn một domain, ví dụ `your-name.vercel.app`.
3. Dán đoạn này vào README, đổi domain thành của bạn:

```markdown
<img src="https://your-name.vercel.app/api/weather?view=all" alt="Thời tiết" />
```

> 💡 Muốn thử trước? Dùng luôn `https://weather-widget-ebon.vercel.app/api/weather` trong các ví dụ dưới đây.

## 📋 Tham số

| Tham số | Giá trị | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `mode` | `card` \| `chart` \| `calendar` | `card` | Kiểu hiển thị |
| `view` | `all` \| `1d` \| `7d` | `all` | (mode card) Hiện 24h, 7 ngày, hoặc cả hai |
| `location` | `hanoi`, `saigon`, `danang`, `haiphong`, `hue`, `cantho`, `dalat`, `nhatrang` | `hanoi` | Thành phố có sẵn |
| `city` | chuỗi bất kỳ | theo `location` | Tên hiển thị trên tiêu đề |
| `lat` / `lon` | số | theo `location` | Toạ độ tuỳ ý, ghi đè `location` |
| `theme` | `auto` \| `light` \| `dark` | `auto` | `auto` = tối vào ban đêm tại địa điểm đó |
| `unit` | `celsius` \| `fahrenheit` | `celsius` | Đơn vị nhiệt độ |
| `hide_title` | `true` \| `false` | `false` | Ẩn tiêu đề |
| `hide_pin` | `true` \| `false` | `false` | Ẩn ghim vị trí |
| `*_color` | mã hex (không cần `#`) | theo theme | Đổi màu: `text_color`, `rain_color`, `sun_color`, `chart_color`, `accent_color`… |

## 📎 Ví dụ copy-paste

**Cơ bản** — thời tiết Hà Nội, 24h + 7 ngày:
```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?view=all" alt="Thời tiết Hà Nội" />
```

**Theme tối, chỉ 7 ngày:**
```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?view=7d&theme=dark" alt="Thời tiết 7 ngày" />
```

**Thành phố nước ngoài bằng toạ độ:**
```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?city=Tokyo&lat=35.68&lon=139.69" alt="Weather Tokyo" />
```

**Lịch nhiệt độ cả tháng:**
```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?mode=calendar" alt="Lịch nhiệt độ" />
```

**Đổi màu chủ đạo:**
```markdown
<img src="https://weather-widget-ebon.vercel.app/api/weather?mode=chart&chart_color=e5342b&accent_color=e5342b" alt="Biểu đồ nhiệt độ" />
```

> GitHub proxy ảnh qua Camo và cache khá lâu. Khi test, thêm tham số vô nghĩa (`&v=2`) để ép làm mới. SVG được cache 15 phút ở CDN.

## 🛠 Tự chạy & tuỳ chỉnh

- **Bản web** (không cần build): mở [index.html](index.html) bằng trình duyệt.
- **Xem trước SVG**: `npm run dev` rồi mở http://localhost:3000
- **Kiểm tra kiểu**: `npm run typecheck`

Chi tiết cấu trúc, cách thêm thành phố, đổi màu, đổi chữ… xem **[SETUP.md](SETUP.md)**.

## 📄 Giấy phép

[MIT](LICENSE) — fork, chỉnh, dùng thoải mái. Một ngôi sao ⭐ là đủ để mình vui rồi!
