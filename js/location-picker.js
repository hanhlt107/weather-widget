(function (global) {
  'use strict';

  var CONFIG = global.WeatherConfig;
  var TEXT = CONFIG.TEXT;
  var MAP = CONFIG.MAP;

  var LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  var LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  var el = {};
  var map = null;
  var marker = null;
  var leafletPromise = null;
  var lastFocused = null;
  var selection = null;
  var nameRequestId = 0;
  var onPick = null;

  function loadStylesheet(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error(TEXT.pickerMapError)); };
      document.head.appendChild(script);
    });
  }

  function loadLeaflet() {
    if (global.L) return Promise.resolve(global.L);
    if (!leafletPromise) {
      loadStylesheet(LEAFLET_CSS);
      leafletPromise = loadScript(LEAFLET_JS)
        .then(function () { return global.L; })
        .catch(function (err) {
          leafletPromise = null;
          throw err;
        });
    }
    return leafletPromise;
  }

  function setStatus(message) {
    el.status.textContent = message;
  }

  function setSelection(lat, lon, name) {
    selection = { latitude: lat, longitude: lon, name: name || TEXT.coords(lat, lon) };
    el.confirm.disabled = false;
    setStatus(selection.name);
  }

  function resolveName(lat, lon) {
    var id = ++nameRequestId;
    setSelection(lat, lon, null);

    WeatherAPI.reverseGeocode(lat, lon).then(function (name) {
      if (id !== nameRequestId || !name) return;
      setSelection(lat, lon, name);
    });
  }

  function moveMarker(lat, lon) {
    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon], { draggable: true }).addTo(map);
      marker.on('dragend', function () {
        var p = marker.getLatLng();
        resolveName(p.lat, p.lng);
      });
    }
  }

  function pick(lat, lon) {
    moveMarker(lat, lon);
    resolveName(lat, lon);
  }

  function buildMap(start) {
    map = L.map(el.map, {
      center: [start.latitude, start.longitude],
      zoom: MAP.zoom,
      minZoom: MAP.minZoom,
      maxZoom: MAP.maxZoom,
      zoomControl: true
    });

    L.tileLayer(MAP.tileUrl, {
      attribution: MAP.attribution,
      maxZoom: MAP.maxZoom
    }).addTo(map);

    map.on('click', function (e) {
      pick(e.latlng.lat, e.latlng.lng);
    });

    moveMarker(start.latitude, start.longitude);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus(TEXT.pickerLocateError);
      return;
    }

    setStatus(TEXT.pickerLocating);
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        if (map) map.setView([lat, lon], MAP.zoom);
        pick(lat, lon);
      },
      function () { setStatus(TEXT.pickerLocateError); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function close() {
    el.dialog.hidden = true;
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function confirm() {
    if (!selection) return;
    CONFIG.saveLocation(selection);
    close();
    if (onPick) onPick(selection);
  }

  function open(current) {
    lastFocused = document.activeElement;
    selection = null;
    el.confirm.disabled = true;
    el.dialog.hidden = false;
    document.addEventListener('keydown', onKeydown);
    el.close.focus();

    if (map) {
      map.setView([current.latitude, current.longitude], MAP.zoom);
      map.invalidateSize();
      moveMarker(current.latitude, current.longitude);
      setStatus(current.name);
      return;
    }

    setStatus(TEXT.pickerLoading);
    loadLeaflet()
      .then(function () {
        buildMap(current);
        map.invalidateSize();
        setStatus(current.name);
      })
      .catch(function () {
        setStatus(TEXT.pickerMapError);
      });
  }

  function init(options) {
    onPick = options.onPick;

    ['picker-dialog', 'picker-map', 'picker-status', 'picker-close', 'picker-confirm', 'picker-locate']
      .forEach(function (id) {
        el[id.replace('picker-', '')] = document.getElementById(id);
      });

    el.close.addEventListener('click', close);
    el.confirm.addEventListener('click', confirm);
    el.locate.addEventListener('click', locateMe);
    el.dialog.addEventListener('click', function (e) {
      if (e.target === el.dialog) close();
    });
  }

  global.LocationPicker = { init: init, open: open };
})(window);
