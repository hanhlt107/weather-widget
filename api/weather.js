import {
  DEFAULTS, LAYOUT, CACHE, TEXT, PALETTES,
  resolveOptions, forecastUrl
} from './config.js';

const WEEKDAYS = TEXT.weekdays;

const CARD_W = LAYOUT.cardWidth;
const GAP = LAYOUT.cardGap;
const PAD = LAYOUT.padding;
const HOURS = DEFAULTS.hours;
const DAYS = DEFAULTS.days;

function groupOf(code) {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';
  return 'cloudy';
}

function escapeXml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]
  ));
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function parseLocalTime(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(text || '');
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] };
}

function weekdayOf(year, month, day) {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let y = year;
  if (month < 3) y -= 1;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month - 1] + day) % 7;
}

function icon(code, isDay, cx, cy) {
  const group = groupOf(code);
  const g = (body) => `<g transform="translate(${cx - 12} ${cy - 13})">${body}</g>`;

  const SUN = `<circle cx="12" cy="12" r="4.2" fill="var(--sun)"/>
    <g stroke="var(--sun)" stroke-width="1.8" stroke-linecap="round">
    <line x1="12" y1="2" x2="12" y2="4.4"/><line x1="12" y1="19.6" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="4.4" y2="12"/><line x1="19.6" y1="12" x2="22" y2="12"/>
    <line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/>
    <line x1="19.1" y1="4.9" x2="17.4" y2="6.6"/><line x1="6.6" y1="17.4" x2="4.9" y2="19.1"/></g>`;

  const MOON = '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="var(--moon)"/>';

  const CLOUD = '<path d="M7.2 19h9.4a3.9 3.9 0 0 0 .5-7.77 5.6 5.6 0 0 0-10.72-1.2A4.02 4.02 0 0 0 7.2 19z" fill="var(--cloud)" stroke="var(--cloud-line)" stroke-width="0.8"/>';

  const SMALL_SUN = `<circle cx="8.6" cy="7.6" r="3.1" fill="var(--sun)"/>
    <g stroke="var(--sun)" stroke-width="1.8" stroke-linecap="round">
    <line x1="8.6" y1="1.6" x2="8.6" y2="3"/><line x1="2.6" y1="7.6" x2="4" y2="7.6"/>
    <line x1="4.35" y1="3.35" x2="5.35" y2="4.35"/><line x1="12.85" y1="3.35" x2="11.85" y2="4.35"/></g>`;

  const SMALL_MOON = '<path d="M12.4 8.2A5 5 0 0 1 6.2 2a5 5 0 1 0 6.2 6.2z" fill="var(--moon)"/>';

  const RAIN = `<g stroke="var(--rain)" stroke-width="1.9" stroke-linecap="round">
    <line x1="9" y1="20" x2="8" y2="22.4"/><line x1="13" y1="20" x2="12" y2="22.4"/>
    <line x1="17" y1="20" x2="16" y2="22.4"/></g>`;

  const SNOW = `<g fill="var(--snow)"><circle cx="9" cy="21.2" r="1"/>
    <circle cx="13" cy="21.2" r="1"/><circle cx="17" cy="21.2" r="1"/></g>`;

  switch (group) {
    case 'clear': return g(isDay ? SUN : MOON);
    case 'partly': return g((isDay ? SMALL_SUN : SMALL_MOON) + CLOUD);
    case 'fog': return g(CLOUD + `<g stroke="var(--cloud-line)" stroke-width="1.9" stroke-linecap="round">
      <line x1="6" y1="21" x2="15" y2="21"/><line x1="9" y1="23" x2="18" y2="23"/></g>`);
    case 'drizzle': return g(CLOUD + `<g stroke="var(--rain)" stroke-width="1.9" stroke-linecap="round">
      <line x1="10" y1="20.2" x2="9.4" y2="22"/><line x1="14.5" y1="20.2" x2="13.9" y2="22"/></g>`);
    case 'rain': return g(CLOUD + RAIN);
    case 'snow': return g(CLOUD + SNOW);
    case 'thunder': return g(CLOUD + '<path d="M13.4 18.6l-3.6 4.6h2.6l-1 3.4 3.9-5h-2.6z" fill="var(--sun)"/>' +
      '<g stroke="var(--rain)" stroke-width="1.9" stroke-linecap="round"><line x1="9" y1="20" x2="8.3" y2="22"/></g>');
    default: return g(CLOUD);
  }
}

function card(x, y, label, sub, code, isDay, pop, temp, highlight) {
  const cx = x + CARD_W / 2;
  const wet = pop != null && pop >= 30;
  const boxH = sub ? 106 : 92;

  return `<g>
    ${highlight ? `<rect x="${x}" y="${y - 6}" width="${CARD_W}" height="${boxH}" rx="10" fill="var(--card)"/>` : ''}
    <text x="${cx}" y="${y + 18}" class="lbl${highlight ? ' strong' : ''}">${escapeXml(label)}</text>
    ${sub ? `<text x="${cx}" y="${y + 32}" class="sub">${escapeXml(sub)}</text>` : ''}
    ${icon(code, isDay, cx, y + (sub ? 55 : 48))}
    <text x="${cx}" y="${y + (sub ? 84 : 78)}" class="temp">${temp}°</text>
    <text x="${cx}" y="${y + (sub ? 99 : 93)}" class="pop${wet ? ' wet' : ''}">${pop != null && pop > 0 ? pop + '%' : ''}</text>
  </g>`;
}

function section(title, y, cards) {
  return `<text x="${PAD}" y="${y}" class="title">${escapeXml(title)}</text>
    <rect x="${PAD}" y="${y + 10}" width="${cards.width}" height="${cards.height}" rx="12" fill="var(--panel)"/>
    ${cards.body}`;
}

function buildHourly(data, originY) {
  const nowKey = data.current.time.slice(0, 13);
  let start = data.hourly.time.findIndex((t) => t.slice(0, 13) >= nowKey);
  if (start < 0) start = 0;

  let body = '';
  for (let i = 0; i < HOURS; i++) {
    const idx = start + i;
    if (idx >= data.hourly.time.length) break;

    const t = parseLocalTime(data.hourly.time[idx]);
    const x = PAD + 6 + i * (CARD_W + GAP);
    body += card(
      x, originY + 16,
      i === 0 ? TEXT.now : pad2(t.hour) + ':' + pad2(t.minute),
      '',
      data.hourly.weather_code[idx],
      data.hourly.is_day[idx] === 1,
      data.hourly.precipitation_probability[idx],
      Math.round(data.hourly.temperature_2m[idx]),
      i === 0
    );
  }

  return { body, width: HOURS * (CARD_W + GAP) - GAP + 12, height: LAYOUT.hourlyPanelHeight };
}

function buildDaily(data, originY) {
  let body = '';
  for (let i = 0; i < DAYS && i < data.daily.time.length; i++) {
    const t = parseLocalTime(data.daily.time[i] + 'T00:00');
    const x = PAD + 6 + i * (CARD_W + GAP);
    body += card(
      x, originY + 16,
      i === 0 ? TEXT.today : WEEKDAYS[weekdayOf(t.year, t.month, t.day)],
      pad2(t.day) + '/' + pad2(t.month),
      data.daily.weather_code[i],
      true,
      data.daily.precipitation_probability_max[i],
      Math.round(data.daily.temperature_2m_max[i]),
      i === 0
    );
  }

  return { body, width: DAYS * (CARD_W + GAP) - GAP + 12, height: LAYOUT.dailyPanelHeight };
}

function render(data, opts) {
  const { view, city, theme } = opts;
  const showHourly = view === 'all' || view === '1d';
  const showDaily = view === 'all' || view === '7d';

  let y = 26;
  let body = '';
  let width = 0;

  if (showHourly) {
    const cards = buildHourly(data, y);
    body += section(TEXT.hourlyTitle(city), y, cards);
    width = Math.max(width, cards.width);
    y += cards.height + 44;
  }

  if (showDaily) {
    const cards = buildDaily(data, y);
    body += section(TEXT.dailyTitle(city), y, cards);
    width = Math.max(width, cards.width);
    y += cards.height + 26;
  }

  const w = width + PAD * 2;
  const h = y - 8;
  const isDay = data.current.is_day === 1;
  const night = theme === 'dark' || (theme === 'auto' && !isDay);

  const palette = night ? PALETTES.dark : PALETTES.light;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Dự báo thời tiết ${escapeXml(city)}">
  <style>
    svg {
      --sun: ${palette.sun};
      --snow: ${palette.snow};
      --cloud: ${palette.cloud};
      --cloud-line: ${palette.cloudLine};
      --rain: ${palette.rain};
      --panel: ${palette.panel};
      --card: ${palette.card};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    text { fill: ${palette.text}; }
    .title { font-size: 12px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; fill: ${palette.muted}; }
    .lbl { font-size: 11.5px; text-anchor: middle; fill: ${palette.muted}; }
    .lbl.strong { font-size: 12px; font-weight: 600; fill: ${palette.text}; }
    .sub { font-size: 10px; text-anchor: middle; fill: ${palette.muted}; }
    .temp { font-size: 14px; font-weight: 600; text-anchor: middle; }
    .pop { font-size: 11px; text-anchor: middle; fill: transparent; }
    .pop.wet { fill: ${palette.rain}; font-weight: 600; }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${palette.bg1}"/>
      <stop offset="1" stop-color="${palette.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="18" fill="url(#bg)"/>
  ${body}
</svg>`;
}

export default async function handler(req, res) {
  const { location, view, theme, unit } = resolveOptions(req.query || {});

  try {
    const upstream = await fetch(forecastUrl(location, unit));
    if (!upstream.ok) throw new Error('Open-Meteo trả về ' + upstream.status);

    const data = await upstream.json();
    if (data.error) throw new Error(data.reason || TEXT.upstreamError);

    const svg = render(data, { view, city: location.name, theme });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      `s-maxage=${CACHE.maxAgeSeconds}, stale-while-revalidate=${CACHE.staleWhileRevalidateSeconds}`
    );
    return res.status(200).send(svg);
  } catch (err) {
    const message = escapeXml(`${TEXT.errorPrefix}: ${err.message || TEXT.unknownError}`);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(
      `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="56" viewBox="0 0 420 56">
        <rect width="420" height="56" rx="12" fill="#fdecea"/>
        <text x="16" y="33" font-family="-apple-system, Segoe UI, Arial, sans-serif" font-size="13" fill="#b3261e">${message}</text>
      </svg>`
    );
  }
}
