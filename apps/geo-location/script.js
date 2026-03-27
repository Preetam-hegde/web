const statusEl = document.querySelector("#status");
const permissionHintEl = document.querySelector("#permission-hint");
const locationCard = document.querySelector("#location-card");
const mapSection = document.querySelector("#map-section");
const mapFrame = document.querySelector("#map-frame");

const findButton = document.querySelector("#find-me");
const trackToggleBtn = document.querySelector("#track-toggle");
const shareButton = document.querySelector("#share-location");
const downloadButton = document.querySelector("#download-gpx");
const clearHistoryButton = document.querySelector("#clear-history");

const historySection = document.querySelector("#history-section");
const historyList = document.querySelector("#history-list");
const sunCard = document.querySelector("#sun-card");

const fields = {
  latitude: document.querySelector("#latitude"),
  longitude: document.querySelector("#longitude"),
  accuracy: document.querySelector("#accuracy"),
  altitude: document.querySelector("#altitude"),
  speed: document.querySelector("#speed"),
  heading: document.querySelector("#heading"),
  timestamp: document.querySelector("#timestamp"),
  address: document.querySelector("#address"),
};

const mapLinks = {
  osm: document.querySelector("#osm-link"),
  google: document.querySelector("#google-link"),
  apple: document.querySelector("#apple-link"),
};

const sunFields = {
  sunrise: document.querySelector("#sunrise"),
  sunset: document.querySelector("#sunset"),
  goldenHour: document.querySelector("#golden-hour"),
  dayLength: document.querySelector("#day-length"),
};

const copyButtons = document.querySelectorAll("[data-copy]");

const MAX_HISTORY_ENTRIES = 15;
const MOVEMENT_THRESHOLD_METERS = 10;
const IDLE_TIME_THRESHOLD_MS = 300000;
const SUN_DISTANCE_THRESHOLD_METERS = 500;

let currentPosition = null;
let locationHistory = [];
let watchId = null;
let renderToken = 0;
let lastSunQuery = { lat: null, lon: null, data: null };

function formatNumber(value, fractionDigits = 6) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return Number(value).toFixed(fractionDigits);
}

function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) {
    return "—";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatSpeed(metersPerSecond) {
  if (metersPerSecond == null || Number.isNaN(metersPerSecond)) {
    return "—";
  }
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

function formatHeading(degrees) {
  if (degrees == null || Number.isNaN(degrees)) {
    return "—";
  }
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return `${degrees.toFixed(0)}° (${directions[index]})`;
}

function formatTime(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatDuration(seconds) {
  if (!Number.isFinite(Number(seconds))) {
    return "—";
  }
  const totalSeconds = Number(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.round(totalSeconds % 60);
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && !minutes) parts.push(`${secs}s`);
  return parts.join(" ");
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function hasSignificantMovement(previous, lat, lon, timestamp) {
  if (!previous) {
    return true;
  }
  const distance = haversineDistanceMeters(previous.latitude, previous.longitude, lat, lon);
  const timeGap = Math.abs(timestamp - previous.timestamp);
  return distance >= MOVEMENT_THRESHOLD_METERS || timeGap >= IDLE_TIME_THRESHOLD_MS;
}

function updateActionStates() {
  const hasPosition = Boolean(currentPosition);
  const hasTrack = locationHistory.length > 0;
  if (shareButton) {
    shareButton.disabled = !hasPosition;
  }
  if (downloadButton) {
    downloadButton.disabled = !hasPosition && !hasTrack;
  }
}

function updateMapLinks(latitude, longitude) {
  const lat = Number(latitude).toFixed(6);
  const lon = Number(longitude).toFixed(6);
  const latLng = `${lat},${lon}`;
  mapLinks.osm.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
  mapLinks.google.href = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
  mapLinks.apple.href = `https://maps.apple.com/?ll=${latLng}`;
}

function updateMapFrame(latitude, longitude) {
  const bbox = [
    longitude - 0.005,
    latitude - 0.003,
    longitude + 0.005,
    latitude + 0.003,
  ];
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox[0]}%2C${bbox[1]}%2C${bbox[2]}%2C${bbox[3]}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  mapFrame.src = src;
  mapSection.classList.remove("hidden");
}

async function reverseGeocode(lat, lon) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");
    const response = await fetch(url.toString(), {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "geolocation-enhanced-demo/1.0 (contact@preetamhegde.dev)",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Reverse geocode failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.display_name || "Address unavailable";
  } catch (error) {
    if (error.name === "AbortError") {
      return "Address lookup timed out";
    }
    return "Unable to fetch address";
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSunData(lat, lon) {
  if (lastSunQuery.lat != null) {
    const distance = haversineDistanceMeters(lastSunQuery.lat, lastSunQuery.lon, lat, lon);
    if (distance < SUN_DISTANCE_THRESHOLD_METERS) {
      return lastSunQuery.data;
    }
  }
  try {
    const url = new URL("https://api.sunrise-sunset.org/json");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lng", lon);
    url.searchParams.set("formatted", "0");
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Sun data failed: ${response.status}`);
    }
    const payload = await response.json();
    if (payload.status !== "OK") {
      throw new Error(payload.status || "Sun data unavailable");
    }

    const results = payload.results;
    const data = {
      sunrise: results.sunrise,
      sunset: results.sunset,
      goldenHourStart: results.civil_twilight_begin,
      goldenHourEnd: results.civil_twilight_end,
      dayLength: Number(results.day_length),
    };
    lastSunQuery = { lat, lon, data };
    return data;
  } catch (error) {
    return null;
  }
}

function updateSunCard(sunData) {
  if (!sunData) {
    sunCard.classList.add("hidden");
    Object.values(sunFields).forEach((field) => {
      field.textContent = "—";
    });
    return;
  }
  sunCard.classList.remove("hidden");
  sunFields.sunrise.textContent = formatTime(sunData.sunrise);
  sunFields.sunset.textContent = formatTime(sunData.sunset);
  const goldenStart = formatTime(sunData.goldenHourStart);
  const goldenEnd = formatTime(sunData.goldenHourEnd);
  sunFields.goldenHour.textContent =
    goldenStart === "—" || goldenEnd === "—" ? "—" : `${goldenStart} – ${goldenEnd}`;
  sunFields.dayLength.textContent = formatDuration(sunData.dayLength);
}

function createMetaChip(label, value) {
  const span = document.createElement("span");
  span.textContent = `${label}: ${value}`;
  return span;
}

function renderHistory() {
  if (!historySection) {
    return;
  }
  if (!locationHistory.length) {
    historySection.classList.add("hidden");
    historyList.textContent = "";
    updateActionStates();
    return;
  }
  historySection.classList.remove("hidden");
  historyList.textContent = "";
  locationHistory.forEach((entry, index) => {
    const li = document.createElement("li");

    const indexEl = document.createElement("span");
    indexEl.className = "history-index";
    indexEl.textContent = `#${index + 1}`;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.appendChild(createMetaChip("Lat", formatNumber(entry.latitude, 5)));
    meta.appendChild(createMetaChip("Lon", formatNumber(entry.longitude, 5)));
    if (entry.accuracy != null && !Number.isNaN(entry.accuracy)) {
      meta.appendChild(createMetaChip("Accuracy", formatDistance(entry.accuracy)));
    }
    const timeString = new Date(entry.timestamp).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    meta.appendChild(createMetaChip("Time", timeString));
    if (entry.source) {
      meta.appendChild(createMetaChip("Source", entry.source));
    }

    li.appendChild(indexEl);
    li.appendChild(meta);
    historyList.appendChild(li);
  });
  updateActionStates();
}

function addHistoryEntry(entry) {
  const lastEntry = locationHistory[0];
  if (!hasSignificantMovement(lastEntry, entry.latitude, entry.longitude, entry.timestamp)) {
    return;
  }
  locationHistory.unshift(entry);
  if (locationHistory.length > MAX_HISTORY_ENTRIES) {
    locationHistory.pop();
  }
  renderHistory();
}

async function handleSuccess(position, options = {}) {
  const { coords, timestamp } = position;
  const rawLat = coords.latitude;
  const rawLon = coords.longitude;

  const token = ++renderToken;

  statusEl.textContent = options.statusMessage || "Location detected successfully.";
  locationCard.classList.remove("hidden");

  fields.latitude.textContent = formatNumber(rawLat);
  fields.longitude.textContent = formatNumber(rawLon);
  fields.accuracy.textContent = formatDistance(coords.accuracy);
  fields.altitude.textContent =
    coords.altitude != null && !Number.isNaN(coords.altitude)
      ? `${coords.altitude.toFixed(1)} m`
      : "—";
  fields.speed.textContent = formatSpeed(coords.speed);
  fields.heading.textContent = formatHeading(coords.heading);
  fields.timestamp.textContent = new Date(timestamp).toLocaleString();
  fields.address.textContent = "Fetching nearby address…";

  currentPosition = {
    latitude: rawLat,
    longitude: rawLon,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    speed: coords.speed,
    heading: coords.heading,
    timestamp,
  };

  updateMapLinks(rawLat, rawLon);
  updateMapFrame(rawLat, rawLon);
  updateActionStates();

  const [address, sunData] = await Promise.all([
    reverseGeocode(rawLat, rawLon),
    fetchSunData(rawLat, rawLon),
  ]);

  if (token !== renderToken) {
    return;
  }

  fields.address.textContent = address;
  updateSunCard(sunData);

  if (options.addToHistory) {
    addHistoryEntry({
      latitude: rawLat,
      longitude: rawLon,
      accuracy: coords.accuracy,
      timestamp,
      source: options.source || "Single Fix",
    });
  }
}

function stopTracking({ silent = false } = {}) {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  trackToggleBtn.dataset.tracking = "false";
  trackToggleBtn.textContent = "Start Live Tracking";
  if (!silent) {
    statusEl.textContent = "Live tracking stopped.";
  }
}

function startTracking() {
  if (!navigator.geolocation) {
    statusEl.textContent = "Geolocation is not supported by your browser.";
    trackToggleBtn.disabled = true;
    findButton.disabled = true;
    return;
  }
  if (watchId != null) {
    return;
  }
  statusEl.textContent = "Starting live tracking…";
  trackToggleBtn.dataset.tracking = "true";
  trackToggleBtn.textContent = "Stop Live Tracking";
  watchId = navigator.geolocation.watchPosition(
    (position) =>
      handleSuccess(position, {
        addToHistory: true,
        source: "Live Track",
        statusMessage: "Tracking – live update received.",
      }),
    (error) => {
      handleError(error);
      stopTracking({ silent: true });
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    },
  );
}

function geoFindMe() {
  if (!navigator.geolocation) {
    statusEl.textContent = "Geolocation is not supported by your browser.";
    findButton.disabled = true;
    trackToggleBtn.disabled = true;
    return;
  }

  statusEl.textContent = "Locating…";
  locationCard.classList.add("hidden");
  mapSection.classList.add("hidden");
  updateActionStates();

  navigator.geolocation.getCurrentPosition(
    (position) =>
      handleSuccess(position, {
        addToHistory: true,
        source: "Quick Fix",
        statusMessage: "Location detected successfully.",
      }),
    handleError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    },
  );
}

function handleError(error) {
  let message = "Unable to retrieve your location.";
  if (!error) {
    message = "Unexpected error.";
  } else if (error.code === error.PERMISSION_DENIED) {
    message = "Location permission denied. Allow access and try again.";
    stopTracking({ silent: true });
  } else if (error.code === error.POSITION_UNAVAILABLE) {
    message = "Location information is unavailable.";
  } else if (error.code === error.TIMEOUT) {
    message = "Location request timed out. Move outdoors and retry.";
  }
  statusEl.textContent = message;
  updateActionStates();
}

findButton.addEventListener("click", geoFindMe);

trackToggleBtn.addEventListener("click", () => {
  if (trackToggleBtn.dataset.tracking === "true") {
    stopTracking();
  } else {
    startTracking();
  }
});

shareButton.addEventListener("click", async () => {
  if (!currentPosition) {
    statusEl.textContent = "Detect your location first.";
    return;
  }
  const lat = Number(currentPosition.latitude).toFixed(6);
  const lon = Number(currentPosition.longitude).toFixed(6);
  const shareText = `My location: ${lat}, ${lon}`;
  const shareUrl =
    mapLinks.google.href && mapLinks.google.href.startsWith("http")
      ? mapLinks.google.href
      : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Current Location",
        text: shareText,
        url: shareUrl,
      });
      statusEl.textContent = "Shared using native dialog.";
    } catch (error) {
      statusEl.textContent =
        error.name === "AbortError" ? "Share canceled." : "Share failed.";
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    statusEl.textContent = "Share link copied to clipboard.";
  } catch (error) {
    statusEl.textContent = "Clipboard unavailable. Copy the map link above.";
  }
});

downloadButton.addEventListener("click", () => {
  const points = locationHistory.length
    ? [...locationHistory].slice().reverse()
    : currentPosition
    ? [currentPosition]
    : [];
  if (!points.length) {
    statusEl.textContent = "No location data to export yet.";
    return;
  }
  const gpxBody = points
    .map((point) => {
      const lat = Number(point.latitude).toFixed(6);
      const lon = Number(point.longitude).toFixed(6);
      const timeIso = new Date(point.timestamp).toISOString();
      const accuracySegment =
        point.accuracy != null && !Number.isNaN(point.accuracy)
          ? `        <extensions>\n          <accuracy>${point.accuracy.toFixed(
              1,
            )}</accuracy>\n        </extensions>\n`
          : "";
      return `      <trkpt lat="${lat}" lon="${lon}">\n        <time>${timeIso}</time>\n${accuracySegment}      </trkpt>`;
    })
    .join("\n");
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Geolocation Finder" xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>Geolocation Capture</name>\n    <trkseg>\n${gpxBody}\n    </trkseg>\n  </trk>\n</gpx>\n`;
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `geolocation-${new Date().toISOString().replace(/[:.]/g, "-")}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
  statusEl.textContent = "GPX file downloaded.";
});

clearHistoryButton.addEventListener("click", () => {
  if (!locationHistory.length) {
    statusEl.textContent = "History is already empty.";
    return;
  }
  locationHistory = [];
  renderHistory();
  statusEl.textContent = "Location history cleared.";
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const key = button.dataset.copy;
    const value = fields[key]?.textContent;
    if (!value || value === "—") {
      statusEl.textContent = "Nothing to copy yet.";
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = original;
      }, 1500);
    } catch (error) {
      statusEl.textContent = "Clipboard unavailable in this context.";
    }
  });
});

if (navigator.permissions && navigator.permissions.query) {
  navigator.permissions
    .query({ name: "geolocation" })
    .then((result) => {
      if (result.state === "prompt") {
        permissionHintEl.textContent = "Tip: Grant location access to get accurate results.";
      } else if (result.state === "granted") {
        permissionHintEl.textContent =
          "Permission granted. Tap the button to refresh your location.";
      } else if (result.state === "denied") {
        permissionHintEl.textContent =
          "Permission denied. Update browser settings to enable location.";
      }

      result.addEventListener("change", () => {
        if (result.state === "granted") {
          permissionHintEl.textContent =
            "Permission granted. Tap the button to refresh your location.";
        } else if (result.state === "prompt") {
          permissionHintEl.textContent =
            "Tip: Grant location access to get accurate results.";
        } else {
          permissionHintEl.textContent =
            "Permission denied. Update browser settings to enable location.";
        }
      });
    })
    .catch(() => {
      permissionHintEl.textContent = "";
    });
}

renderHistory();
updateActionStates();
