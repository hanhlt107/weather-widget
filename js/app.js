(function () {
  'use strict';

  var CONFIG = window.WeatherConfig;
  var TEXT = CONFIG.TEXT;

  var LOCATION = CONFIG.location();
  var VIEW = CONFIG.view();
  var SHOW_HOURLY = VIEW === 'all' || VIEW === '1d';
  var SHOW_DAILY = VIEW === 'all' || VIEW === '7d';
  var REFRESH_AFTER_MS = CONFIG.DEFAULTS.refreshAfterMs;
  var WEEKDAYS = TEXT.weekdays;

  var state = {
    data: null,
    requestId: 0,
    lastLoadAt: 0
  };

  var el = {};
  var refreshNav = null;

  function cacheDom() {
    [
      'widget', 'error', 'content',
      'hourly-title', 'daily-title',
      'hourly', 'daily',
      'hourly-prev', 'hourly-next',
      'picker-open', 'section-hourly', 'section-daily', 'daily-head'
    ].forEach(function (id) {
      el[id] = document.getElementById(id);
    });
  }

  function roundTemp(value) {
    return value === null || value === undefined ? TEXT.empty : Math.round(value);
  }

  function parseLocalTime(text) {
    if (!text) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(text);
    if (!m) return null;
    return {
      year: +m[1], month: +m[2], day: +m[3],
      hour: +m[4], minute: +m[5]
    };
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatHHMM(text) {
    var t = parseLocalTime(text);
    return t ? pad2(t.hour) + ':' + pad2(t.minute) : TEXT.empty;
  }

  function weekdayOf(year, month, day) {
    var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    var y = year;
    if (month < 3) y -= 1;
    return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month - 1] + day) % 7;
  }

  function formatDayLabel(dateText, index) {
    var t = parseLocalTime(dateText + 'T00:00');
    if (!t) return TEXT.empty;
    if (index === 0) return TEXT.today;
    return WEEKDAYS[weekdayOf(t.year, t.month, t.day)];
  }

  function formatDateShort(dateText) {
    var t = parseLocalTime(dateText + 'T00:00');
    return t ? pad2(t.day) + '/' + pad2(t.month) : '';
  }

  function showError(message) {
    el['error'].textContent = message;
    el['error'].hidden = false;
  }

  function clearError() {
    el['error'].hidden = true;
    el['error'].textContent = '';
  }

  function renderTitles(data) {
    var current = data.current;
    var isDay = current.is_day === 1;

    el['hourly-title'].textContent = TEXT.hourlyTitle(LOCATION.name);
    el['daily-title'].textContent = TEXT.dailyTitle(LOCATION.name);

    el['widget'].setAttribute('data-weather', WeatherCodes.group(current.weather_code));
    el['widget'].setAttribute('data-daytime', isDay ? 'day' : 'night');
  }

  function renderHourly(data) {
    var hourly = data.hourly;
    var nowText = data.current.time.slice(0, 13);

    var startIndex = hourly.time.findIndex(function (t) { return t.slice(0, 13) >= nowText; });
    if (startIndex < 0) startIndex = 0;

    var html = '';
    var limit = Math.min(startIndex + CONFIG.DEFAULTS.hourlyCount, hourly.time.length);
    for (var i = startIndex; i < limit; i++) {
      var time = hourly.time[i];
      var isNow = i === startIndex;
      var pop = hourly.precipitation_probability[i];

      html += '<li class="ww-hour' + (isNow ? ' is-now' : '') + '">' +
        '<span class="ww-hour-time">' + (isNow ? TEXT.now : formatHHMM(time)) + '</span>' +
        '<span class="ww-hour-icon">' + WeatherCodes.icon(hourly.weather_code[i], hourly.is_day[i] === 1) + '</span>' +
        '<span class="ww-hour-temp">' + roundTemp(hourly.temperature_2m[i]) + '°</span>' +
        '<span class="ww-hour-pop' + (pop >= CONFIG.DEFAULTS.wetThreshold ? ' is-wet' : '') + '">' +
          (pop != null ? pop + '%' : '') +
        '</span>' +
      '</li>';
    }

    el['hourly'].innerHTML = html;
  }

  function renderDaily(data) {
    var daily = data.daily;

    var html = '';
    var days = Math.min(CONFIG.DEFAULTS.forecastDays, daily.time.length);
    for (var i = 0; i < days; i++) {
      var max = daily.temperature_2m_max[i];
      var pop = daily.precipitation_probability_max[i];

      html += '<li class="ww-day' + (i === 0 ? ' is-today' : '') + '">' +
        '<span class="ww-day-name">' + formatDayLabel(daily.time[i], i) + '</span>' +
        '<span class="ww-day-date">' + formatDateShort(daily.time[i]) + '</span>' +
        '<span class="ww-day-icon">' + WeatherCodes.icon(daily.weather_code[i], true) + '</span>' +
        '<span class="ww-day-pop' + (pop >= CONFIG.DEFAULTS.wetThreshold ? ' is-wet' : '') + '">' +
          (pop != null && pop > 0 ? pop + '%' : '') +
        '</span>' +
        '<span class="ww-day-max">' + roundTemp(max) + '°</span>' +
      '</li>';
    }

    el['daily'].innerHTML = html;
  }

  function updateNav(track, prev, next) {
    var max = track.scrollWidth - track.clientWidth;
    var atStart = track.scrollLeft <= 1;
    var atEnd = track.scrollLeft >= max - 1;

    prev.hidden = max <= 1 || atStart;
    next.hidden = max <= 1 || atEnd;
  }

  function slide(track, direction) {
    var card = track.querySelector('li');
    var step = card
      ? (card.offsetWidth + 2) * CONFIG.DEFAULTS.slideCards
      : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  function setupSlider(trackId, prevId, nextId) {
    var track = el[trackId];
    var prev = el[prevId];
    var next = el[nextId];
    var refresh = function () { updateNav(track, prev, next); };

    prev.addEventListener('click', function () { slide(track, -1); });
    next.addEventListener('click', function () { slide(track, 1); });
    track.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh);

    return refresh;
  }

  function render(data) {
    renderTitles(data);
    renderHourly(data);
    renderDaily(data);
    el['content'].hidden = false;
    if (refreshNav) refreshNav();
  }

  function load() {
    var id = ++state.requestId;
    el['widget'].classList.add('is-loading');

    return WeatherAPI.getForecast(LOCATION.latitude, LOCATION.longitude, CONFIG.unit())
      .then(function (data) {
        if (id !== state.requestId) return;
        state.data = data;
        state.lastLoadAt = performance.now();
        clearError();
        render(data);
      })
      .catch(function (err) {
        if (id !== state.requestId) return;
        showError(TEXT.loadError(err.message));
      })
      .finally(function () {
        if (id === state.requestId) el['widget'].classList.remove('is-loading');
      });
  }

  function bindEvents() {
    refreshNav = setupSlider('hourly', 'hourly-prev', 'hourly-next');

    LocationPicker.init({
      onPick: function (location) {
        LOCATION = location;
        load();
      }
    });

    el['picker-open'].addEventListener('click', function () {
      LocationPicker.open(LOCATION);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (performance.now() - state.lastLoadAt > REFRESH_AFTER_MS) {
        load();
      }
    });
  }

  function applyConfig() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme());
    el['daily'].style.setProperty('--ww-days', CONFIG.DEFAULTS.forecastDays);

    el['section-hourly'].hidden = !SHOW_HOURLY;
    el['section-daily'].hidden = !SHOW_DAILY;

    if (!SHOW_HOURLY) {
      el['daily-head'].appendChild(el['picker-open']);
    }
  }

  function init() {
    cacheDom();
    applyConfig();
    bindEvents();
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
