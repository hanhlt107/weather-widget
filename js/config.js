(function (global) {
  "use strict";

  var LOCATIONS = {
    hanoi: { name: "Hà Nội", latitude: 21.0278, longitude: 105.8342 },
    saigon: { name: "TP. Hồ Chí Minh", latitude: 10.8231, longitude: 106.6297 },
    danang: { name: "Đà Nẵng", latitude: 16.0678, longitude: 108.2208 },
    haiphong: { name: "Hải Phòng", latitude: 20.8449, longitude: 106.6881 },
    hue: { name: "Huế", latitude: 16.4637, longitude: 107.5909 },
    cantho: { name: "Cần Thơ", latitude: 10.0452, longitude: 105.7469 },
    dalat: { name: "Đà Lạt", latitude: 11.9404, longitude: 108.4583 },
    nhatrang: { name: "Nha Trang", latitude: 12.2388, longitude: 109.1967 },
  };

  var VIEWS = ["all", "1d", "7d"];
  var THEMES = ["auto", "light", "dark"];
  var UNITS = ["celsius", "fahrenheit"];

  var DEFAULTS = {
    location: "hanoi",
    view: "7d",
    theme: "auto",
    unit: "celsius",
    timezone: "auto",
    forecastDays: 7,
    hourlyCount: 24,
    refreshAfterMs: 10 * 60 * 1000,
    requestTimeoutMs: 10000,
    slideCards: 3,
    wetThreshold: 30,
  };

  var TEXT = {
    weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    now: "Bây giờ",
    today: "Hôm nay",
    empty: "—",
    hourlyTitle: function (city) {
      return "Thời tiết " + city + " trong 24h tới";
    },
    dailyTitle: function (city) {
      return "Thời tiết " + city + " 7 ngày tới";
    },
    loadError: function (reason) {
      return "Không tải được dữ liệu: " + reason;
    },
    timeout: "Hết thời gian chờ, vui lòng thử lại",
    serverError: function (status) {
      return "Máy chủ trả về lỗi " + status;
    },
    upstreamError: "API trả về lỗi",
    pickerOpen: "Đổi vị trí",
    pickerTitle: "Chọn vị trí trên bản đồ",
    pickerHint: "Chạm vào bản đồ để chọn nơi bạn muốn xem thời tiết.",
    pickerClose: "Đóng",
    pickerConfirm: "Xem thời tiết",
    pickerLocate: "Vị trí của tôi",
    pickerLocating: "Đang định vị…",
    pickerLocateError: "Không lấy được vị trí của bạn",
    pickerLoading: "Đang tải bản đồ…",
    pickerMapError: "Không tải được bản đồ",
    coords: function (lat, lon) {
      return lat.toFixed(3) + ", " + lon.toFixed(3);
    },
  };

  var API = {
    forecastUrl: "https://api.open-meteo.com/v1/forecast",
    reverseUrl: "https://nominatim.openstreetmap.org/reverse",
    current: "is_day,weather_code",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
    daily: "weather_code,temperature_2m_max,precipitation_probability_max",
  };

  var MAP = {
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    zoom: 11,
    minZoom: 2,
    maxZoom: 18,
  };

  var STORAGE_KEY = "weather-widget:location";

  function readSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (
        typeof saved.latitude !== "number" ||
        typeof saved.longitude !== "number"
      )
        return null;
      return saved;
    } catch (e) {
      return null;
    }
  }

  function pick(value, allowed, fallback) {
    return allowed.indexOf(value) >= 0 ? value : fallback;
  }

  global.WeatherConfig = {
    LOCATIONS: LOCATIONS,
    VIEWS: VIEWS,
    THEMES: THEMES,
    UNITS: UNITS,
    DEFAULTS: DEFAULTS,
    view: function () {
      return pick(DEFAULTS.view, VIEWS, "all");
    },
    theme: function () {
      return pick(DEFAULTS.theme, THEMES, "auto");
    },
    unit: function () {
      return pick(DEFAULTS.unit, UNITS, "celsius");
    },
    TEXT: TEXT,
    API: API,
    MAP: MAP,
    location: function () {
      return readSaved() || LOCATIONS[DEFAULTS.location] || LOCATIONS.hanoi;
    },
    saveLocation: function (location) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
      } catch (e) {
        /* storage đầy hoặc bị chặn — bỏ qua */
      }
    },
  };
})(window);
