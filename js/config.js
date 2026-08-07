(function (global) {
  'use strict';

  var LOCATIONS = {
    hanoi: { name: 'Hà Nội', latitude: 21.0278, longitude: 105.8342 },
    saigon: { name: 'TP. Hồ Chí Minh', latitude: 10.8231, longitude: 106.6297 },
    danang: { name: 'Đà Nẵng', latitude: 16.0678, longitude: 108.2208 },
    haiphong: { name: 'Hải Phòng', latitude: 20.8449, longitude: 106.6881 },
    hue: { name: 'Huế', latitude: 16.4637, longitude: 107.5909 },
    cantho: { name: 'Cần Thơ', latitude: 10.0452, longitude: 105.7469 },
    dalat: { name: 'Đà Lạt', latitude: 11.9404, longitude: 108.4583 },
    nhatrang: { name: 'Nha Trang', latitude: 12.2388, longitude: 109.1967 }
  };

  var DEFAULTS = {
    location: 'hanoi',
    unit: 'celsius',
    timezone: 'auto',
    forecastDays: 7,
    hourlyCount: 24,
    refreshAfterMs: 10 * 60 * 1000,
    requestTimeoutMs: 10000,
    slideCards: 3,
    wetThreshold: 30
  };

  var TEXT = {
    weekdays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    now: 'Bây giờ',
    today: 'Hôm nay',
    empty: '—',
    hourlyTitle: function (city) { return 'Thời tiết ' + city + ' trong 24h tới'; },
    dailyTitle: function (city) { return 'Thời tiết ' + city + ' 7 ngày tới'; },
    loadError: function (reason) { return 'Không tải được dữ liệu: ' + reason; },
    timeout: 'Hết thời gian chờ, vui lòng thử lại',
    serverError: function (status) { return 'Máy chủ trả về lỗi ' + status; },
    upstreamError: 'API trả về lỗi'
  };

  var API = {
    forecastUrl: 'https://api.open-meteo.com/v1/forecast',
    current: 'is_day,weather_code',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,precipitation_probability_max'
  };

  global.WeatherConfig = {
    LOCATIONS: LOCATIONS,
    DEFAULTS: DEFAULTS,
    TEXT: TEXT,
    API: API,
    location: function () {
      return LOCATIONS[DEFAULTS.location] || LOCATIONS.hanoi;
    }
  };
})(window);
