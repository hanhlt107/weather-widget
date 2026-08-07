(function (global) {
  'use strict';

  var DESCRIPTIONS = {
    0: 'Trời quang',
    1: 'Nắng nhẹ',
    2: 'Có mây rải rác',
    3: 'Nhiều mây',
    45: 'Sương mù',
    48: 'Sương mù đóng băng',
    51: 'Mưa phùn nhẹ',
    53: 'Mưa phùn',
    55: 'Mưa phùn dày',
    56: 'Mưa phùn lạnh giá',
    57: 'Mưa phùn lạnh giá dày',
    61: 'Mưa nhỏ',
    63: 'Mưa vừa',
    65: 'Mưa to',
    66: 'Mưa lạnh giá',
    67: 'Mưa lạnh giá to',
    71: 'Tuyết nhẹ',
    73: 'Tuyết vừa',
    75: 'Tuyết dày',
    77: 'Hạt tuyết',
    80: 'Mưa rào nhẹ',
    81: 'Mưa rào',
    82: 'Mưa rào rất to',
    85: 'Mưa tuyết nhẹ',
    86: 'Mưa tuyết dày',
    95: 'Dông',
    96: 'Dông kèm mưa đá',
    99: 'Dông kèm mưa đá lớn'
  };

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

  var SUN = '<circle class="wi-sun" cx="12" cy="12" r="4.2"/>' +
    '<g class="wi-rays"><line x1="12" y1="2" x2="12" y2="4.4"/><line x1="12" y1="19.6" x2="12" y2="22"/>' +
    '<line x1="2" y1="12" x2="4.4" y2="12"/><line x1="19.6" y1="12" x2="22" y2="12"/>' +
    '<line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/>' +
    '<line x1="19.1" y1="4.9" x2="17.4" y2="6.6"/><line x1="6.6" y1="17.4" x2="4.9" y2="19.1"/></g>';

  var MOON = '<path class="wi-moon" d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>';

  var CLOUD = '<path class="wi-cloud" d="M7.2 19h9.4a3.9 3.9 0 0 0 .5-7.77 5.6 5.6 0 0 0-10.72-1.2A4.02 4.02 0 0 0 7.2 19z"/>';

  var SMALL_SUN = '<circle class="wi-sun" cx="8.6" cy="7.6" r="3.1"/>' +
    '<g class="wi-rays"><line x1="8.6" y1="1.6" x2="8.6" y2="3"/><line x1="2.6" y1="7.6" x2="4" y2="7.6"/>' +
    '<line x1="4.35" y1="3.35" x2="5.35" y2="4.35"/><line x1="12.85" y1="3.35" x2="11.85" y2="4.35"/></g>';

  var SMALL_MOON = '<path class="wi-moon" d="M12.4 8.2A5 5 0 0 1 6.2 2a5 5 0 1 0 6.2 6.2z"/>';

  function rainDrops() {
    return '<g class="wi-rain"><line x1="9" y1="20" x2="8" y2="22.4"/>' +
      '<line x1="13" y1="20" x2="12" y2="22.4"/><line x1="17" y1="20" x2="16" y2="22.4"/></g>';
  }

  function snowFlakes() {
    return '<g class="wi-snow"><circle cx="9" cy="21.2" r="1"/><circle cx="13" cy="21.2" r="1"/><circle cx="17" cy="21.2" r="1"/></g>';
  }

  var ICONS = {
    clear: function (isDay) { return isDay ? SUN : MOON; },
    partly: function (isDay) { return (isDay ? SMALL_SUN : SMALL_MOON) + CLOUD; },
    cloudy: function () { return CLOUD; },
    fog: function () {
      return CLOUD + '<g class="wi-fog"><line x1="6" y1="21" x2="15" y2="21"/><line x1="9" y1="23" x2="18" y2="23"/></g>';
    },
    drizzle: function () { return CLOUD + '<g class="wi-rain"><line x1="10" y1="20.2" x2="9.4" y2="22"/><line x1="14.5" y1="20.2" x2="13.9" y2="22"/></g>'; },
    rain: function () { return CLOUD + rainDrops(); },
    snow: function () { return CLOUD + snowFlakes(); },
    thunder: function () { return CLOUD + '<path class="wi-bolt" d="M13.4 18.6l-3.6 4.6h2.6l-1 3.4 3.9-5h-2.6z"/>' + '<g class="wi-rain"><line x1="9" y1="20" x2="8.3" y2="22"/></g>'; }
  };

  var WeatherCodes = {
    describe: function (code) {
      return DESCRIPTIONS[code] || 'Không xác định';
    },

    group: groupOf,

    icon: function (code, isDay, extraClass) {
      var group = groupOf(code);
      var body = (ICONS[group] || ICONS.cloudy)(isDay !== false);
      var cls = 'wi wi-' + group + (isDay === false ? ' wi-night' : ' wi-day') + (extraClass ? ' ' + extraClass : '');
      return '<svg class="' + cls + '" viewBox="0 0 24 26" role="img" aria-label="' +
        WeatherCodes.describe(code) + '">' + body + '</svg>';
    }
  };

  global.WeatherCodes = WeatherCodes;
})(window);
