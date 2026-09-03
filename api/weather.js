import {
  DEFAULTS, LAYOUT, CACHE, TEXT, PALETTES, HEAT_SCALE, HEAT_SCALE_DARK,
  resolveOptions, resolvePalette, forecastUrl, monthUrl
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

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
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
  const wet = pop != null && pop >= 30;

  return `<g>
    <text x="${x}" y="${y + 18}" class="lbl${highlight ? ' strong' : ''}">${escapeXml(label)}</text>
    ${sub ? `<text x="${x}" y="${y + 32}" class="sub">${escapeXml(sub)}</text>` : ''}
    ${icon(code, isDay, x + 12, y + (sub ? 55 : 48))}
    <text x="${x}" y="${y + (sub ? 84 : 78)}" class="temp">${temp}°</text>
    <text x="${x}" y="${y + (sub ? 99 : 93)}" class="pop${wet ? ' wet' : ''}">${pop != null && pop > 0 ? pop + '%' : ''}</text>
  </g>`;
}

function pin(x, y) {
  return `<g transform="translate(${x} ${y})">
    <circle cx="0" cy="0" r="11" fill="none" stroke="var(--pin-line)" stroke-width="1"/>
    <g transform="translate(-6 -6.5)" fill="none" stroke="var(--pin)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 12.4s3.9-3.4 3.9-6.1a3.9 3.9 0 1 0-7.8 0c0 2.7 3.9 6.1 3.9 6.1z"/>
      <circle cx="6" cy="5.9" r="1.45"/>
    </g>
  </g>`;
}

function section(title, y, cards, showPin, showTitle, titleClass = 'title') {
  const pinY = showTitle ? y - 5 : y + 12;
  return `${showTitle ? `<text x="${PAD}" y="${y}" class="${titleClass}">${escapeXml(title)}</text>` : ''}
    ${showPin ? pin(PAD + cards.width - 16, pinY) : ''}
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
    const x = PAD + i * (CARD_W + GAP);
    const isNow = i === 0;
    body += card(
      x, originY + 16,
      isNow ? TEXT.now : pad2(t.hour) + ':' + pad2(t.minute),
      '',
      isNow ? data.current.weather_code : data.hourly.weather_code[idx],
      isNow ? data.current.is_day === 1 : data.hourly.is_day[idx] === 1,
      data.hourly.precipitation_probability[idx],
      Math.round(isNow ? data.current.temperature_2m : data.hourly.temperature_2m[idx]),
      isNow
    );
  }

  return { body, width: HOURS * (CARD_W + GAP) - GAP, height: LAYOUT.hourlyPanelHeight };
}

function buildDaily(data, originY) {
  let body = '';
  for (let i = 0; i < DAYS && i < data.daily.time.length; i++) {
    const t = parseLocalTime(data.daily.time[i] + 'T00:00');
    const x = PAD + i * (CARD_W + GAP);
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

  return { body, width: DAYS * (CARD_W + GAP) - GAP, height: LAYOUT.dailyPanelHeight };
}

function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0].x} ${pts[0].y}` : '';
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function niceTicks(min, max, count) {
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-6; v += step) ticks.push(Math.round(v));
  return ticks;
}

function buildChart(data, originY, chartWidth, unit) {
  const n = data.daily.time.length;
  const highs = [];
  for (let i = 0; i < n; i++) highs.push(Math.round(data.daily.temperature_2m_max[i]));

  const rain = data.daily.precipitation_sum
    ? data.daily.precipitation_sum.map((v) => Math.max(0, Math.round(v * 10) / 10))
    : new Array(n).fill(0);
  const rainMax = Math.max(1, ...rain);

  const plotH = LAYOUT.chartPlotHeight;
  const axisW = 26;
  const rainAxisW = 26;
  const top = originY + 16;
  const left = PAD + axisW;
  const plotW = chartWidth - axisW - rainAxisW;
  const right = left + plotW;

  let min = Math.min(...highs);
  let max = Math.max(...highs);
  if (max === min) { max += 1; min -= 1; }
  const pad = Math.max(1, (max - min) * 0.22);
  min -= pad;
  max += pad;

  const stepX = n > 1 ? plotW / (n - 1) : 0;
  const xAt = (i) => left + i * stepX;
  const yAt = (v) => top + plotH - ((v - min) / (max - min)) * plotH;

  const pts = highs.map((v, i) => ({ x: xAt(i), y: yAt(v), v }));

  const ticks = niceTicks(min, max, 4);
  let grid = '';
  let yLabels = '';
  for (const tv of ticks) {
    const gy = yAt(tv);
    grid += `<line x1="${left}" y1="${gy.toFixed(1)}" x2="${right}" y2="${gy.toFixed(1)}" class="grid"/>`;
    yLabels += `<text x="${left - 8}" y="${(gy + 3.5).toFixed(1)}" class="chart-axis" text-anchor="end">${tv}°</text>`;
  }
  yLabels += `<text x="${left - 8}" y="${(top - 4).toFixed(1)}" class="chart-axis" text-anchor="end">°${unit === 'fahrenheit' ? 'F' : 'C'}</text>`;

  const rainZoneH = plotH * 0.5;
  const baseY = top + plotH;
  const barW = Math.max(2, Math.min(10, stepX * 0.5));
  let bars = '';
  for (let i = 0; i < n; i++) {
    if (rain[i] <= 0) continue;
    const bh = (rain[i] / rainMax) * rainZoneH;
    const bx = xAt(i) - barW / 2;
    bars += `<rect x="${bx.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5" class="rain-bar"/>`;
  }

  let rainLabels = '';
  for (const frac of [0, 0.5, 1]) {
    const mm = Math.round(rainMax * frac);
    const ry = baseY - frac * rainZoneH;
    rainLabels += `<text x="${right + 8}" y="${(ry + 3.5).toFixed(1)}" class="chart-axis rain-axis" text-anchor="start">${mm}</text>`;
  }
  rainLabels += `<text x="${right + 8}" y="${(top - 4).toFixed(1)}" class="chart-axis rain-axis" text-anchor="start">mm</text>`;

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L${right.toFixed(1)} ${(top + plotH).toFixed(1)} L${left.toFixed(1)} ${(top + plotH).toFixed(1)} Z`;

  const today = todayStr();
  let dots = '';
  let xLabels = '';
  let todayMark = '';
  const monthShort = TEXT.months[parseLocalTime(data.daily.time[0] + 'T00:00').month - 1];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const t = parseLocalTime(data.daily.time[i] + 'T00:00');
    const isToday = data.daily.time[i] === today;
    // Native SVG tooltip: shows day + temperature (and rain if any) on hover where the host allows it.
    const tip = `${t.day}/${monthShort}: ${p.v}°${rain[i] > 0 ? ` · ${rain[i]}mm` : ''}`;
    if (isToday) {
      const cx = p.x.toFixed(1);
      const cy = p.y.toFixed(1);
      todayMark = `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${(top + plotH).toFixed(1)}" class="chart-today-line"/>
        <circle cx="${cx}" cy="${cy}" r="4" class="chart-today-halo">
          <animate attributeName="r" values="4;11;4" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${cx}" cy="${cy}" r="4.4" class="chart-today-dot"><title>${escapeXml(tip)}</title>
          <animate attributeName="r" values="4.4;5.4;4.4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <text x="${cx}" y="${(p.y - 10).toFixed(1)}" class="chart-today-val" text-anchor="middle">${p.v}°</text>`;
    } else {
      dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.1" class="chart-dot"><title>${escapeXml(tip)}</title></circle>`;
    }
    if (i === 0 || t.day % 5 === 0) {
      xLabels += `<text x="${p.x.toFixed(1)}" y="${(top + plotH + 16).toFixed(1)}" class="chart-axis${isToday ? ' chart-today-axis' : ''}" text-anchor="middle">${t.day}</text>`;
    }
  }

  const body = `${grid}
    ${bars}
    <path d="${areaPath}" class="chart-area"/>
    <path d="${linePath}" class="chart-line"/>
    ${dots}${todayMark}${yLabels}${rainLabels}${xLabels}`;

  return { body, width: chartWidth, height: plotH + 28 };
}

// Quantize a 0..1 value into a discrete GitHub-style level (0 = coolest .. levels-1 = hottest)
function heatLevel(t, levels) {
  const clamped = Math.max(0, Math.min(1, t));
  return Math.min(levels - 1, Math.floor(clamped * levels));
}

function buildCalendar(data, originY, night) {
  const CW = LAYOUT.cellSize;
  const CG = LAYOUT.cellGap;
  const cols = 7;
  const gridW = cols * CW + (cols - 1) * CG;

  const scale = night ? HEAT_SCALE_DARK : HEAT_SCALE;
  const levels = scale.length;

  const first = parseLocalTime(data.daily.time[0] + 'T00:00');
  const firstDow = weekdayOf(first.year, first.month, first.day);

  const highs = data.daily.temperature_2m_max.map((v) => Math.round(v));
  const min = Math.min(...highs);
  const max = Math.max(...highs);
  const span = max - min || 1;

  // Header / legend text scale with the cell so everything stays proportional as CW shrinks.
  const headFs = Math.max(6, Math.min(11, CW * 0.32)).toFixed(1);
  const headGap = Math.max(5, CW * 0.28);

  const headerY = originY + 8;
  let heads = '';
  for (let c = 0; c < cols; c++) {
    const cx = PAD + c * (CW + CG) + CW / 2;
    heads += `<text x="${cx}" y="${headerY}" class="cal-head" text-anchor="middle" style="font-size:${headFs}px">${TEXT.calendarWeekdays[c]}</text>`;
  }

  const today = todayStr();
  const gridTop = headerY + headGap;
  const n = data.daily.time.length;

  // On a GitHub-style scale the top two levels are dark enough to need light text.
  const isDarkFill = (lvl) => (night ? lvl >= 2 : lvl >= 3);

  // Below this size the day number / "Hôm nay" label no longer fits, so cells go
  // GitHub-graph compact: just the temperature centred in the coloured square.
  const compact = CW < 26;

  const drawCell = (x, y, w, day, hi, lvl, isToday) => {
    const cls = isDarkFill(lvl) ? ' hot' : '';
    const r = (0.16 * w).toFixed(1);
    const cx = (x + w / 2).toFixed(1);
    const cell = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${w.toFixed(1)}" rx="${r}" fill="${scale[lvl]}" class="cal-cell"/>`;

    if (compact) {
      // Small cells: day number tucked in the top-left, temperature filling the rest.
      const cDayFs = (0.18 * w).toFixed(1);
      const cTempFs = (0.26 * w).toFixed(1);
      return `<g${isToday ? ' filter="url(#todayShadow)"' : ''}>${cell}
      <text x="${(x + 0.14 * w).toFixed(1)}" y="${(y + 0.34 * w).toFixed(1)}" class="cal-day${cls}" style="font-size:${cDayFs}px">${day}</text>
      <text x="${cx}" y="${(y + 0.78 * w).toFixed(1)}" class="cal-temp${cls}" text-anchor="middle" style="font-size:${cTempFs}px">${hi}</text>
    </g>`;
    }

    // Everything is expressed as a fraction of the cell so it scales cleanly at any size.
    // Today keeps the same size but shows a "Hôm nay" label instead of the day number.
    const dayFs = ((isToday ? 0.17 : 0.2) * w).toFixed(1);
    const tempFs = (0.3 * w).toFixed(1);
    const label = isToday ? escapeXml(TEXT.today) : day;
    return `<g${isToday ? ' filter="url(#todayShadow)"' : ''}>${cell}
      <text x="${(x + 0.16 * w).toFixed(1)}" y="${(y + 0.32 * w).toFixed(1)}" class="cal-day${cls}" style="font-size:${dayFs}px">${label}</text>
      <text x="${cx}" y="${(y + 0.68 * w).toFixed(1)}" class="cal-temp${cls}" text-anchor="middle" style="font-size:${tempFs}px">${hi}°</text>
    </g>`;
  };

  let cells = '';
  let todayCell = '';
  let rows = 0;
  for (let i = 0; i < n; i++) {
    const slot = firstDow + i;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    rows = row + 1;

    const x = PAD + col * (CW + CG);
    const y = gridTop + row * (CW + CG);
    const t = parseLocalTime(data.daily.time[i] + 'T00:00');
    const lvl = heatLevel((highs[i] - min) / span, levels);

    if (data.daily.time[i] === today) {
      todayCell = drawCell(x, y, CW, t.day, highs[i], lvl, true);
    } else {
      cells += drawCell(x, y, CW, t.day, highs[i], lvl, false);
    }
  }
  cells += todayCell;

  const gridH = rows * CW + (rows - 1) * CG;

  // GitHub-style "Mát  □ □ □ □ □  Nóng" legend under the grid, scaled to the cell size.
  const legFs = Math.max(6, Math.min(10, CW * 0.32));
  const legendY = gridTop + gridH + Math.max(6, CW * 0.42);
  const sw = Math.max(4, CW * 0.34);   // swatch size
  const sgap = Math.max(0.8, CW * 0.08);
  const lessW = legFs * 2.4;          // rough width of "Mát"
  const moreW = legFs * 2.8;          // rough width of "Nóng"
  const pad = legFs * 0.6;
  const legendW = lessW + pad + levels * (sw + sgap) - sgap + pad + moreW;
  const legendX = PAD + gridW - legendW;
  let swatches = '';
  for (let l = 0; l < levels; l++) {
    const lx = legendX + lessW + pad + l * (sw + sgap);
    swatches += `<rect x="${lx.toFixed(1)}" y="${(legendY - sw + sw * 0.18).toFixed(1)}" width="${sw.toFixed(1)}" height="${sw.toFixed(1)}" rx="${(sw * 0.27).toFixed(1)}" fill="${scale[l]}" class="cal-cell"/>`;
  }
  const legend = `<text x="${legendX.toFixed(1)}" y="${legendY.toFixed(1)}" class="cal-legend" style="font-size:${legFs.toFixed(1)}px">${TEXT.legendLess}</text>
    ${swatches}
    <text x="${(legendX + legendW).toFixed(1)}" y="${legendY.toFixed(1)}" class="cal-legend" text-anchor="end" style="font-size:${legFs.toFixed(1)}px">${TEXT.legendMore}</text>`;

  const defs = `<defs>
    <filter id="todayShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.6" flood-color="rgba(20,40,80,0.30)"/>
    </filter>
  </defs>`;

  return { body: defs + heads + cells + legend, width: gridW, height: (legendY + 6) - originY };
}

function render(data, opts) {
  const { view, mode, city, theme, colors, hideTitle, hidePin, unit } = opts;
  const chart = mode === 'chart';
  const calendar = mode === 'calendar';
  const showHourly = !chart && !calendar && (view === 'all' || view === '1d');
  const showDaily = !chart && !calendar && (view === 'all' || view === '7d');
  const showTitle = !hideTitle;
  const titleSpace = showTitle ? 0 : 18;

  let y = 26 - titleSpace;
  let body = '';
  let width = 0;

  const isDay = data.current ? data.current.is_day === 1 : true;
  const night = theme === 'dark' || (theme === 'auto' && !isDay);

  if (calendar) {
    const ty = showTitle ? 16 : y;   // compact title sits higher than the default
    const first = parseLocalTime(data.daily.time[0] + 'T00:00');
    const cal = buildCalendar(data, ty + (showTitle ? 4 : 0), night);
    const title = TEXT.monthTitle(city, first.month, first.year);
    body += section(title, ty, cal, false, showTitle, 'cal-title');
    width = Math.max(width, cal.width);
    y = ty + (showTitle ? 4 : 0) + cal.height + 16;
  }

  if (chart) {
    const first = parseLocalTime(data.daily.time[0] + 'T00:00');
    const chartWidth = 7 * (48 + 5) - 5; // fixed chart width, independent of calendar cell sizing
    const c = buildChart(data, y, chartWidth, unit);
    const title = TEXT.monthTitle(city, first.month, first.year);
    body += section(title, y, c, false, showTitle);
    width = Math.max(width, c.width);
    y += c.height + 26;
  }

  if (showHourly) {
    const cards = buildHourly(data, y);
    body += section(TEXT.hourlyTitle(city), y, cards, !hidePin, showTitle);
    width = Math.max(width, cards.width);
    y += cards.height + 44 - titleSpace;
  }

  if (showDaily) {
    const cards = buildDaily(data, y);
    body += section(TEXT.dailyTitle(city), y, cards, !hidePin && !showHourly, showTitle);
    width = Math.max(width, cards.width);
    y += cards.height + 26;
  }

  const w = width + PAD * 2;
  const h = y - 8;

  const palette = resolvePalette(colors, night ? PALETTES.dark : PALETTES.light);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" width="${w}" height="${h}" style="max-width:100%;height:auto;display:block" role="img" aria-label="Dự báo thời tiết ${escapeXml(city)}">
  <style>
    svg {
      --sun: ${palette.sun};
      --moon: ${palette.moon};
      --snow: ${palette.snow};
      --cloud: ${palette.cloud};
      --cloud-line: ${palette.cloudLine};
      --rain: ${palette.rain};
      --pin: ${palette.pin};
      --pin-line: ${palette.pinBorder};
      --chart: ${palette.chart};
      --chart-fill: ${palette.chartFill};
      --grid: ${palette.grid};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    text { fill: ${palette.text}; }
    .title { font-size: 12px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; fill: ${palette.muted}; }
    .lbl { font-size: 11.5px; fill: ${palette.muted}; }
    .lbl.strong { font-size: 12px; font-weight: 600; fill: ${palette.text}; }
    .sub { font-size: 10px; fill: ${palette.muted}; }
    .temp { font-size: 14px; font-weight: 600; }
    .pop { font-size: 11px; fill: transparent; }
    .pop.wet { fill: ${palette.rain}; font-weight: 600; }
    .grid { stroke: var(--grid); stroke-width: 1; }
    .chart-area { fill: var(--chart-fill); stroke: none; }
    .chart-line { fill: none; stroke: var(--chart); stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }
    .chart-dot { fill: var(--chart); }
    .chart-today-line { stroke: ${palette.accent}; stroke-width: 1.2; stroke-dasharray: 3 3; opacity: .55; }
    .chart-today-halo { fill: ${palette.accent}; }
    .chart-today-dot { fill: ${palette.accent}; stroke: #fff; stroke-width: 1.8; }
    .chart-today-val { font-size: 12px; font-weight: 400; fill: ${palette.accent}; }
    .chart-today-axis { fill: ${palette.accent}; font-weight: 800; }
    .chart-axis { font-size: 10px; fill: ${palette.muted}; }
    .rain-bar { fill: var(--rain); opacity: .4; }
    .rain-axis { fill: var(--rain); }
    .cal-title { font-size: 9px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; fill: ${palette.muted}; }
    .cal-head { font-size: 11px; font-weight: 700; fill: ${palette.muted}; letter-spacing: .4px; }
    .cal-cell { stroke: ${night ? 'rgba(255,255,255,.06)' : 'rgba(27,31,35,.06)'}; stroke-width: 1; }
    .cal-day { font-size: 10px; font-weight: 700; fill: ${night ? 'rgba(230,237,243,.55)' : 'rgba(60,42,10,.55)'}; }
    .cal-temp { font-size: 15px; font-weight: 800; fill: ${night ? 'rgba(230,237,243,.9)' : 'rgba(60,42,10,.9)'}; }
    .cal-day.hot { fill: rgba(255,255,255,.85); }
    .cal-temp.hot { fill: #fff; }
    .cal-legend { font-size: 10px; font-weight: 600; fill: ${palette.muted}; }
  </style>
  ${body}
</svg>`;
}

export default async function handler(req, res) {
  const { location, view, mode, theme, unit, hideTitle, hidePin } = resolveOptions(req.query || {});

  try {
    const monthly = mode === 'calendar' || mode === 'chart';
    const url = monthly ? monthUrl(location, unit) : forecastUrl(location, unit);
    const upstream = await fetch(url);
    if (!upstream.ok) throw new Error('Open-Meteo trả về ' + upstream.status);

    const data = await upstream.json();
    if (data.error) throw new Error(data.reason || TEXT.upstreamError);

    const svg = render(data, {
      view, mode, city: location.name, theme, colors: req.query || {}, hideTitle, hidePin, unit
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      `s-maxage=${CACHE.maxAgeSeconds}, stale-while-revalidate=${CACHE.staleWhileRevalidateSeconds}`
    );
    return res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1" style="display:block"/>`
    );
  }
}
