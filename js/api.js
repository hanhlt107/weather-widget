(function (global) {
  'use strict';

  var CONFIG = global.WeatherConfig;

  function buildUrl(base, params) {
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === null || value === undefined || value === '') return;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return base + '?' + parts.join('&');
  }

  function getJSON(url, timeoutMs) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;

    if (controller) {
      timer = setTimeout(function () {
        controller.abort();
      }, timeoutMs || CONFIG.DEFAULTS.requestTimeoutMs);
    }

    return fetch(url, controller ? { signal: controller.signal } : undefined)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(CONFIG.TEXT.serverError(res.status));
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.error) {
          throw new Error(data.reason || CONFIG.TEXT.upstreamError);
        }
        return data;
      })
      .catch(function (err) {
        if (err.name === 'AbortError') {
          throw new Error(CONFIG.TEXT.timeout);
        }
        throw err;
      })
      .finally(function () {
        if (timer) clearTimeout(timer);
      });
  }

  var WeatherAPI = {
    getForecast: function (lat, lon, unit, timezone) {
      var url = buildUrl(CONFIG.API.forecastUrl, {
        latitude: lat,
        longitude: lon,
        current: CONFIG.API.current,
        hourly: CONFIG.API.hourly,
        daily: CONFIG.API.daily,
        temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
        timezone: timezone || CONFIG.DEFAULTS.timezone,
        forecast_days: CONFIG.DEFAULTS.forecastDays
      });

      return getJSON(url);
    },

    reverseGeocode: function (lat, lon) {
      var url = buildUrl(CONFIG.API.reverseUrl, {
        lat: lat,
        lon: lon,
        format: 'jsonv2',
        zoom: 10,
        'accept-language': 'vi'
      });

      return getJSON(url)
        .then(function (data) {
          var a = (data && data.address) || {};
          var name = a.city || a.town || a.village || a.county || a.state || a.country;
          return name || null;
        })
        .catch(function () { return null; });
    }
  };

  global.WeatherAPI = WeatherAPI;
})(window);
