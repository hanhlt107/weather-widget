import shared from "../shared/locations.json" with { type: "json" };

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export const LOCATIONS: Record<string, Location> = shared.locations;

export interface Defaults {
  location: string;
  view: string;
  mode: string;
  theme: string;
  unit: string;
  timezone: string;
  forecastDays: number;
  hours: number;
  days: number;
  hideTitle: boolean;
  hidePin: boolean;
}

export const DEFAULTS: Defaults = {
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
  padding: 12,
  hourlyPanelHeight: 100,
  dailyPanelHeight: 114,
  chartPlotHeight: 120,
  cellSize: 26,
  cellGap: 3,
  maxCityLength: 40,
};

export const CACHE = {
  maxAgeSeconds: 900,
  staleWhileRevalidateSeconds: 1800,
};

export const TEXT = {
  weekdays: shared.weekdays,
  now: "Bây giờ",
  today: "Hôm nay",
  hourlyTitle: (city: string) => `Thời tiết ${city} trong 24h tới`,
  dailyTitle: (city: string) => `Thời tiết ${city} 7 ngày tới`,
  monthTitle: (city: string, month: number, year: number) =>
    `Nhiệt độ ${city} tháng ${month}/${year}`,
  months: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  calendarWeekdays: shared.weekdays,
  legendLess: "Mát",
  legendMore: "Nóng",
  upstreamError: "Open-Meteo trả về lỗi",
};

export const API = {
  forecastUrl: "https://api.open-meteo.com/v1/forecast",
  forecastRangeDays: 15,
  current: "is_day,weather_code,temperature_2m",
  hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
  daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
};

export const VIEWS = ["all", "1d", "7d"];
export const MODES = ["card", "chart", "calendar"];
export const THEMES = ["auto", "light", "dark"];
export const UNITS = ["celsius", "fahrenheit"];

export interface Palette {
  text: string;
  muted: string;
  cloud: string;
  cloudLine: string;
  rain: string;
  sun: string;
  snow: string;
  moon: string;
  pin: string;
  pinBorder: string;
  chart: string;
  chartFill: string;
  grid: string;
  accent: string;
}

export const PALETTES: { light: Palette; dark: Palette } = {
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
    accent: "#ff5b52",
  },
};

// GitHub contribution-style discrete scale: level 0 (coolest) -> level 4 (hottest)
export const HEAT_SCALE = [
  "#eeeeee",
  "#ffe08a",
  "#ffc531",
  "#f5a201",
  "#c97a00",
];

// Dark-theme variant of the yellow scale
export const HEAT_SCALE_DARK = [
  "#1c1a12",
  "#5a4708",
  "#a37a05",
  "#e0a300",
  "#ffc531",
];

export function pick<T>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const TRUTHY = ["true", "1", "yes"];

export function validateBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === "") return fallback;
  return TRUTHY.includes(String(value).toLowerCase());
}

const HEX_COLOR_PATTERN = /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{3}$/;

export function validateHexColor(color: unknown, fallback: string | null): string | null {
  const raw = String(color || "").replace(/^#/, "");
  return HEX_COLOR_PATTERN.test(raw) ? "#" + raw.toLowerCase() : fallback;
}

export const COLOR_PARAMS: Record<string, keyof Palette> = {
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
  accent_color: "accent",
};

export type Query = Record<string, unknown>;

export function resolvePalette(query: Query = {}, base: Palette): Palette {
  const palette: Palette = { ...base };

  for (const [param, key] of Object.entries(COLOR_PARAMS)) {
    if (query[param] === undefined) continue;
    const value = validateHexColor(query[param], null);
    if (value) palette[key] = value;
  }

  return palette;
}

export function resolveLocation(query: Query = {}): Location {
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

export interface ResolvedOptions {
  location: Location;
  view: string;
  mode: string;
  theme: string;
  unit: string;
  hideTitle: boolean;
  hidePin: boolean;
}

export function resolveOptions(query: Query = {}): ResolvedOptions {
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

export function forecastUrl(location: Location, unit: string, timezone?: string): string {
  const params: Record<string, string | number> = {
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

function ymd(year: number, month: number, day: number): string {
  const mm = month < 10 ? "0" + month : String(month);
  const dd = day < 10 ? "0" + day : String(day);
  return `${year}-${mm}-${dd}`;
}

export function monthUrl(location: Location, unit: string, today = new Date(), timezone?: string): string {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();

  const maxForecast = new Date(today);
  maxForecast.setDate(maxForecast.getDate() + API.forecastRangeDays);
  const endDay =
    maxForecast.getFullYear() === year && maxForecast.getMonth() + 1 === month
      ? Math.min(lastDay, maxForecast.getDate())
      : lastDay;

  const params: Record<string, string | number> = {
    latitude: location.latitude,
    longitude: location.longitude,
    daily: API.daily,
    temperature_unit: pick(unit, UNITS, DEFAULTS.unit),
    timezone: timezone || DEFAULTS.timezone,
    start_date: ymd(year, month, 1),
    end_date: ymd(year, month, endDay),
  };

  const parts = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
  );

  return `${API.forecastUrl}?${parts.join("&")}`;
}
