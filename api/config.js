export const LOCATIONS = {
  hanoi: { name: "Hà Nội", latitude: 21.0278, longitude: 105.8342 },
  saigon: { name: "TP. Hồ Chí Minh", latitude: 10.8231, longitude: 106.6297 },
  danang: { name: "Đà Nẵng", latitude: 16.0678, longitude: 108.2208 },
  haiphong: { name: "Hải Phòng", latitude: 20.8449, longitude: 106.6881 },
  hue: { name: "Huế", latitude: 16.4637, longitude: 107.5909 },
  cantho: { name: "Cần Thơ", latitude: 10.0452, longitude: 105.7469 },
  dalat: { name: "Đà Lạt", latitude: 11.9404, longitude: 108.4583 },
  nhatrang: { name: "Nha Trang", latitude: 12.2388, longitude: 109.1967 },
};

export const DEFAULTS = {
  location: "hanoi",
  view: "all",
  mode: "card",
  theme: "auto",
  unit: "celsius",
  timezone: "auto",
  forecastDays: 7,
  hours: 12,
  days: 7,
  hideTitle: false,
  hidePin: false,
};

export const LAYOUT = {
  cardWidth: 70,
  cardGap: 2,
  padding: 19,
  hourlyPanelHeight: 100,
  dailyPanelHeight: 114,
  chartPlotHeight: 120,
  cellSize: 62,
  cellGap: 4,
  maxCityLength: 40,
};

export const CACHE = {
  maxAgeSeconds: 900,
  staleWhileRevalidateSeconds: 1800,
};

export const TEXT = {
  weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  now: "Bây giờ",
  today: "Hôm nay",
  hourlyTitle: (city) => `Thời tiết ${city} trong 24h tới`,
  dailyTitle: (city) => `Thời tiết ${city} 7 ngày tới`,
  monthTitle: (city, month, year) => `Nhiệt độ ${city} tháng ${month}/${year}`,
  months: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  calendarWeekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  errorPrefix: "Không tải được thời tiết",
  upstreamError: "Open-Meteo trả về lỗi",
  unknownError: "Lỗi không xác định",
};

export const API = {
  forecastUrl: "https://api.open-meteo.com/v1/forecast",
  current: "is_day,weather_code,temperature_2m",
  hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
  daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
};

export const VIEWS = ["all", "1d", "7d"];
export const MODES = ["card", "chart", "calendar"];
export const THEMES = ["auto", "light", "dark"];
export const UNITS = ["celsius", "fahrenheit"];

export const PALETTES = {
  light: {
    text: "#0f2a54",
    muted: "rgba(15,42,84,.58)",
    cloud: "#f2f6fb",
    cloudLine: "rgba(15,42,84,.28)",
    rain: "#4b9bea",
    sun: "#f7b731",
    snow: "#9fd0f5",
    moon: "#dfe6f5",
    pin: "#e23b3b",
    pinBorder: "rgba(226,59,59,.35)",
    chart: "#f5811f",
    chartFill: "rgba(245,129,31,.12)",
    grid: "rgba(15,42,84,.10)",
    cellEmpty: "#eef1f6",
    cellText: "#5a4a2a",
    accent: "#e5342b",
  },
  dark: {
    text: "#eaf2ff",
    muted: "rgba(234,242,255,.62)",
    cloud: "#dfe9f7",
    cloudLine: "rgba(255,255,255,.22)",
    rain: "#7cc0ff",
    sun: "#f7b731",
    snow: "#9fd0f5",
    moon: "#dfe6f5",
    pin: "#ff6b6b",
    pinBorder: "rgba(255,107,107,.45)",
    chart: "#ff9f43",
    chartFill: "rgba(255,159,67,.16)",
    grid: "rgba(234,242,255,.12)",
    cellEmpty: "rgba(234,242,255,.08)",
    cellText: "#3a2c14",
    accent: "#ff5b52",
  },
};

export const HEAT_SCALE = [
  "#7cb5ec",
  "#a6d3d6",
  "#c9e6b8",
  "#e8e59a",
  "#f5d16b",
  "#f0a848",
  "#e8722c",
];

export function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

const TRUTHY = ["true", "1", "yes"];

export function validateBool(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return TRUTHY.includes(String(value).toLowerCase());
}

const HEX_COLOR_PATTERN = /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{3}$/;

export function validateHexColor(color, fallback) {
  const raw = String(color || "").replace(/^#/, "");
  return HEX_COLOR_PATTERN.test(raw) ? "#" + raw.toLowerCase() : fallback;
}

export const COLOR_PARAMS = {
  text_color: "text",
  muted_color: "muted",
  cloud_color: "cloud",
  cloud_line_color: "cloudLine",
  rain_color: "rain",
  sun_color: "sun",
  snow_color: "snow",
  pin_color: "pin",
  pin_border_color: "pinBorder",
  chart_color: "chart",
  chart_fill_color: "chartFill",
  grid_color: "grid",
  cell_empty_color: "cellEmpty",
  cell_text_color: "cellText",
  accent_color: "accent",
};

export function resolvePalette(query = {}, base) {
  const palette = { ...base };

  for (const [param, key] of Object.entries(COLOR_PARAMS)) {
    if (query[param] === undefined) continue;
    const value = validateHexColor(query[param], null);
    if (value) palette[key] = value;
  }

  return palette;
}

export function resolveLocation(query = {}) {
  const preset = LOCATIONS[String(query.location || "").toLowerCase()];
  const base = preset || LOCATIONS[DEFAULTS.location];

  const lat = Number(query.lat);
  const lon = Number(query.lon);

  return {
    name: query.city
      ? String(query.city).slice(0, LAYOUT.maxCityLength)
      : base.name,
    latitude: Number.isFinite(lat) ? lat : base.latitude,
    longitude: Number.isFinite(lon) ? lon : base.longitude,
  };
}

export function resolveOptions(query = {}) {
  return {
    location: resolveLocation(query),
    view: pick(query.view, VIEWS, DEFAULTS.view),
    mode: pick(query.mode, MODES, DEFAULTS.mode),
    theme: pick(query.theme, THEMES, DEFAULTS.theme),
    unit: pick(query.unit, UNITS, DEFAULTS.unit),
    hideTitle: validateBool(query.hide_title, DEFAULTS.hideTitle),
    hidePin: validateBool(query.hide_pin, DEFAULTS.hidePin),
  };
}

export function forecastUrl(location, unit, timezone) {
  const params = {
    latitude: location.latitude,
    longitude: location.longitude,
    current: API.current,
    hourly: API.hourly,
    daily: API.daily,
    temperature_unit: pick(unit, UNITS, DEFAULTS.unit),
    timezone: timezone || DEFAULTS.timezone,
    forecast_days: DEFAULTS.forecastDays,
  };

  const parts = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
  );

  return `${API.forecastUrl}?${parts.join("&")}`;
}

function ymd(year, month, day) {
  const mm = month < 10 ? "0" + month : String(month);
  const dd = day < 10 ? "0" + day : String(day);
  return `${year}-${mm}-${dd}`;
}

export function monthUrl(location, unit, today = new Date(), timezone) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();

  const params = {
    latitude: location.latitude,
    longitude: location.longitude,
    daily: API.daily,
    temperature_unit: pick(unit, UNITS, DEFAULTS.unit),
    timezone: timezone || DEFAULTS.timezone,
    start_date: ymd(year, month, 1),
    end_date: ymd(year, month, lastDay),
  };

  const parts = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
  );

  return `${API.forecastUrl}?${parts.join("&")}`;
}
