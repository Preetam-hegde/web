'use strict';

// ── GEOINTEL WORKSPACE ENGINE ─────────────────────────────────────────────

// Global State
let activeTab = 'device-tab';
let currentDevicePosition = null;
let simulatedPosition = null;
let lastIpLocation = null;
let lastPhoneLocation = null;
let deviceWatchId = null;

// Map & Layer State
let map = null;
let currentTileLayer = null;
let mapTheme = 'dark'; // 'dark' or 'light'
let currentMapStyle = 'dark'; // 'dark', 'street', or 'topo'
let deviceMarker = null;
let deviceAccuracyCircle = null;
let ipMarker = null;
let phoneMarker = null;
let phoneCoverageCircle = null;
let simMarker = null;
let distancePolyline = null;
let batchLayerGroup = null;
let batchData = [];

// DOM Elements: Navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const mapStyleBtns = document.querySelectorAll('.map-style-btn');
const globalStatusPill = document.querySelector('#global-status-pill');
const mapActiveLayerPill = document.querySelector('#map-active-layer-pill');
const cursorCoordsPill = document.querySelector('#cursor-coords-pill');
const recenterMapBtn = document.querySelector('#recenter-map-btn');
const clearPinsBtn = document.querySelector('#clear-pins-btn');

// DOM Elements: Tab 1 (Device)
const findMeBtn = document.querySelector('#find-me-btn');
const liveTrackBtn = document.querySelector('#live-track-btn');
const deviceStatusMsg = document.querySelector('#device-status-msg');
const permissionHint = document.querySelector('#permission-hint');
const gpsStatusBadge = document.querySelector('#gps-status-badge');
const devLat = document.querySelector('#dev-lat');
const devLon = document.querySelector('#dev-lon');
const devAccuracy = document.querySelector('#dev-accuracy');
const devAltitude = document.querySelector('#dev-altitude');
const devSpeed = document.querySelector('#dev-speed');
const devHeading = document.querySelector('#dev-heading');
const devAddress = document.querySelector('#dev-address');
const shareLocBtn = document.querySelector('#share-loc-btn');
const exportGpxBtn = document.querySelector('#export-gpx-btn');

// DOM Elements: Tab 2 (IP Geolocation)
const ipSearchForm = document.querySelector('#ip-search-form');
const ipInput = document.querySelector('#ip-input');
const myIpBtn = document.querySelector('#my-ip-btn');
const ipStatusMsg = document.querySelector('#ip-status-msg');
const ipResAddr = document.querySelector('#ip-res-addr');
const ipResCountry = document.querySelector('#ip-res-country');
const ipResCity = document.querySelector('#ip-res-city');
const ipResIsp = document.querySelector('#ip-res-isp');
const ipResAsn = document.querySelector('#ip-res-asn');
const ipResCoords = document.querySelector('#ip-res-coords');
const ipResTz = document.querySelector('#ip-res-tz');
const viewIpOnMapBtn = document.querySelector('#view-ip-on-map-btn');
const setIpAsTargetBtn = document.querySelector('#set-ip-as-target-btn');

// DOM Elements: Tab 3 (Phone Intel)
const phoneSearchForm = document.querySelector('#phone-search-form');
const phoneCountrySelect = document.querySelector('#phone-country-select');
const phoneInput = document.querySelector('#phone-input');
const phoneStatusMsg = document.querySelector('#phone-status-msg');
const sampleBtns = document.querySelectorAll('.sample-btn');
const phoneResFormatted = document.querySelector('#phone-res-formatted');
const phoneResCountry = document.querySelector('#phone-res-country');
const phoneResRegion = document.querySelector('#phone-res-region');
const phoneResDialcode = document.querySelector('#phone-res-dialcode');
const phoneResType = document.querySelector('#phone-res-type');
const phoneResTz = document.querySelector('#phone-res-tz');
const phoneResCoords = document.querySelector('#phone-res-coords');
const viewPhoneOnMapBtn = document.querySelector('#view-phone-on-map-btn');
const setPhoneAsTargetBtn = document.querySelector('#set-phone-as-target-btn');

// DOM Elements: Tab 4 (Simulator / Change GPS)
const placeSearchForm = document.querySelector('#place-search-form');
const placeSearchInput = document.querySelector('#place-search-input');
const simLatInput = document.querySelector('#sim-lat-input');
const simLonInput = document.querySelector('#sim-lon-input');
const applyCoordsBtn = document.querySelector('#apply-coords-btn');
const simStatusMsg = document.querySelector('#sim-status-msg');
const simCoordsDisplay = document.querySelector('#sim-coords-display');
const simAddressDisplay = document.querySelector('#sim-address-display');
const simDistFromReal = document.querySelector('#sim-dist-from-real');
const simBearingFromReal = document.querySelector('#sim-bearing-from-real');
const centerSimBtn = document.querySelector('#center-sim-btn');
const clearSimBtn = document.querySelector('#clear-sim-btn');

// DOM Elements: Tab 5 (Distance)
const pointASelect = document.querySelector('#point-a-select');
const pointBSelect = document.querySelector('#point-b-select');
const pointAInputs = document.querySelector('#point-a-inputs');
const pointBInputs = document.querySelector('#point-b-inputs');
const ptALat = document.querySelector('#pt-a-lat');
const ptALon = document.querySelector('#pt-a-lon');
const ptBLat = document.querySelector('#pt-b-lat');
const ptBLon = document.querySelector('#pt-b-lon');
const ptASummary = document.querySelector('#pt-a-summary');
const ptBSummary = document.querySelector('#pt-b-summary');
const calcDistBtn = document.querySelector('#calc-dist-btn');
const distResKm = document.querySelector('#dist-res-km');
const distResMi = document.querySelector('#dist-res-mi');
const distResBearing = document.querySelector('#dist-res-bearing');
const distResCardinal = document.querySelector('#dist-res-cardinal');
const travelWalk = document.querySelector('#travel-walk');
const travelDrive = document.querySelector('#travel-drive');
const travelFlight = document.querySelector('#travel-flight');
const drawLineBtn = document.querySelector('#draw-line-btn');

// DOM Elements: Tab 6 (Weather & Elevation)
const weatherMyGpsBtn = document.querySelector('#weather-my-gps-btn');
const weatherSimBtn = document.querySelector('#weather-sim-btn');
const weatherIpBtn = document.querySelector('#weather-ip-btn');
const weatherCoordsForm = document.querySelector('#weather-coords-form');
const weatherLatInput = document.querySelector('#weather-lat-input');
const weatherLonInput = document.querySelector('#weather-lon-input');
const weatherStatusMsg = document.querySelector('#weather-status-msg');
const weatherIcon = document.querySelector('#weather-icon');
const weatherTemp = document.querySelector('#weather-temp');
const weatherTempF = document.querySelector('#weather-temp-f');
const weatherCondition = document.querySelector('#weather-condition');
const weatherFeels = document.querySelector('#weather-feels');
const weatherHumidity = document.querySelector('#weather-humidity');
const weatherWind = document.querySelector('#weather-wind');
const weatherPressure = document.querySelector('#weather-pressure');
const weatherElevation = document.querySelector('#weather-elevation');
const weatherPrecip = document.querySelector('#weather-precip');

// DOM Elements: Tab 7 (Batch Coordinates)
const batchTextarea = document.querySelector('#batch-textarea');
const batchFileInput = document.querySelector('#batch-file-input');
const loadSampleBatchBtn = document.querySelector('#load-sample-batch-btn');
const plotBatchBtn = document.querySelector('#plot-batch-btn');
const clearBatchBtn = document.querySelector('#clear-batch-btn');
const batchStatusMsg = document.querySelector('#batch-status-msg');
const batchCount = document.querySelector('#batch-count');
const batchCentroid = document.querySelector('#batch-centroid');
const exportBatchGeoJsonBtn = document.querySelector('#export-batch-geojson-btn');

// DOM Elements: Tab 8 (Military & Coordinate Converter)
const convMyGpsBtn = document.querySelector('#conv-my-gps-btn');
const convSimBtn = document.querySelector('#conv-sim-btn');
const convForm = document.querySelector('#conv-form');
const convLatInput = document.querySelector('#conv-lat-input');
const convLonInput = document.querySelector('#conv-lon-input');
const convDd = document.querySelector('#conv-dd');
const convDms = document.querySelector('#conv-dms');
const convUtm = document.querySelector('#conv-utm');
const convMgrs = document.querySelector('#conv-mgrs');
const convMaidenhead = document.querySelector('#conv-maidenhead');
const convW3wLink = document.querySelector('#conv-w3w-link');

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────

function formatNumber(val, decimals = 6) {
	if (val == null || isNaN(val)) return '—';
	return Number(val).toFixed(decimals);
}

function toRadians(deg) {
	return (deg * Math.PI) / 180;
}

function toDegrees(rad) {
	return (rad * 180) / Math.PI;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Earth radius in km
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
	const φ1 = toRadians(lat1);
	const φ2 = toRadians(lat2);
	const Δλ = toRadians(lon2 - lon1);
	const y = Math.sin(Δλ) * Math.cos(φ2);
	const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
	const θ = Math.atan2(y, x);
	return (toDegrees(θ) + 360) % 360;
}

function getCardinalDirection(bearing) {
	if (bearing == null || isNaN(bearing)) return '—';
	const directions = [
		'N', 'NNE', 'NE', 'ENE',
		'E', 'ESE', 'SE', 'SSE',
		'S', 'SSW', 'SW', 'WSW',
		'W', 'WNW', 'NW', 'NNW',
	];
	const index = Math.round((bearing % 360) / 22.5) % 16;
	return directions[index];
}

function formatDurationFromHours(hours) {
	if (hours == null || !isFinite(hours)) return '—';
	if (hours < 1) {
		const mins = Math.round(hours * 60);
		return `${mins} min`;
	}
	const h = Math.floor(hours);
	const m = Math.round((hours - h) * 60);
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── TAB SYSTEM ────────────────────────────────────────────────────────────

function switchTab(targetTabId) {
	activeTab = targetTabId;

	tabButtons.forEach((btn) => {
		btn.classList.toggle('active', btn.dataset.tab === targetTabId);
	});

	tabPanels.forEach((panel) => {
		panel.classList.toggle('active', panel.id === targetTabId);
	});

	// Update Map Toolbar status
	const tabNames = {
		'device-tab': 'Active: Device GPS',
		'ip-tab': 'Active: IP Geolocation',
		'phone-tab': 'Active: Phone Intel',
		'simulator-tab': 'Active: Location Simulator (Click to Pick)',
		'distance-tab': 'Active: Distance Calculator',
		'weather-tab': 'Active: Weather & Elevation (Click Map to Inspect)',
		'batch-tab': 'Active: Batch Coordinates (Multi-Pin)',
		'converter-tab': 'Active: Military / MGRS / UTM Converter',
	};
	if (mapActiveLayerPill) {
		mapActiveLayerPill.textContent = tabNames[targetTabId] || 'Active Layer';
	}

	// Invalidate Leaflet size to avoid rendering glitches
	if (map) {
		setTimeout(() => map.invalidateSize(), 150);
	}
}

// ── LEAFLET MAP INITIALIZATION ────────────────────────────────────────────

function initLeafletMap() {
	const mapContainer = document.querySelector('#geointel-map');
	if (!mapContainer || typeof L === 'undefined') return;

	map = L.map('geointel-map', {
		zoomControl: true,
		attributionControl: false,
	}).setView([20, 0], 2);

	batchLayerGroup = L.featureGroup().addTo(map);

	setMapStyle('dark');

	// Mouse movement coordinate tracking
	map.on('mousemove', (e) => {
		if (cursorCoordsPill) {
			cursorCoordsPill.textContent = `Lat: ${e.latlng.lat.toFixed(4)} | Lon: ${e.latlng.lng.toFixed(4)}`;
		}
	});

	// Click on map: allows picking a location in Simulator, Weather, or Converter mode
	map.on('click', (e) => {
		const { lat, lng } = e.latlng;
		handleMapClickLocation(lat, lng);
	});
}

function setMapStyle(style) {
	currentMapStyle = style;
	if (currentTileLayer && map) {
		map.removeLayer(currentTileLayer);
		currentTileLayer = null;
	}

	if (style === 'dark') {
		currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
			maxNativeZoom: 16,
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		}).addTo(map);
	} else if (style === 'street') {
		currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom',
		}).addTo(map);
	} else if (style === 'satellite') {
		currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
		}).addTo(map);
	} else if (style === 'topo') {
		currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase',
		}).addTo(map);
	}

	mapStyleBtns.forEach((btn) => {
		btn.classList.toggle('active', btn.dataset.style === style);
	});
}

function handleMapClickLocation(lat, lng) {
	if (activeTab === 'weather-tab') {
		if (weatherLatInput) weatherLatInput.value = lat.toFixed(6);
		if (weatherLonInput) weatherLonInput.value = lng.toFixed(6);
		fetchWeatherAndElevation(lat, lng);
		return;
	}
	if (activeTab === 'converter-tab') {
		if (convLatInput) convLatInput.value = lat.toFixed(6);
		if (convLonInput) convLonInput.value = lng.toFixed(6);
		convertCoordinates(lat, lng);
		return;
	}
	setSimulatedLocation(lat, lng, 'Map Click Coordinates');
	if (activeTab !== 'simulator-tab' && activeTab !== 'distance-tab' && activeTab !== 'batch-tab') {
		switchTab('simulator-tab');
	}
}

function clearAllPins() {
	if (ipMarker) { map.removeLayer(ipMarker); ipMarker = null; }
	if (phoneMarker) { map.removeLayer(phoneMarker); phoneMarker = null; }
	if (phoneCoverageCircle) { map.removeLayer(phoneCoverageCircle); phoneCoverageCircle = null; }
	if (simMarker) { map.removeLayer(simMarker); simMarker = null; }
	if (distancePolyline) { map.removeLayer(distancePolyline); distancePolyline = null; }
	if (batchLayerGroup) { batchLayerGroup.clearLayers(); }
	batchData = [];
	if (batchCount) batchCount.textContent = '0';
	if (batchCentroid) batchCentroid.textContent = '—';
	if (exportBatchGeoJsonBtn) exportBatchGeoJsonBtn.disabled = true;
	simCoordsDisplay.textContent = '—';
	simAddressDisplay.textContent = '—';
	simDistFromReal.textContent = '—';
	simBearingFromReal.textContent = '—';
	simStatusMsg.textContent = 'All custom pins cleared.';
}

// ── TAB 1: DEVICE GPS LOCATION ────────────────────────────────────────────

function detectDeviceLocation() {
	if (!navigator.geolocation) {
		deviceStatusMsg.textContent = 'Geolocation is not supported by your browser.';
		return;
	}

	deviceStatusMsg.textContent = 'Requesting device coordinates…';
	gpsStatusBadge.textContent = 'Locating…';
	gpsStatusBadge.className = 'badge active';

	navigator.geolocation.getCurrentPosition(
		(pos) => handleDeviceLocationSuccess(pos),
		(err) => handleDeviceLocationError(err),
		{ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
	);
}

function handleDeviceLocationSuccess(pos) {
	const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;

	currentDevicePosition = { latitude, longitude, accuracy, altitude, speed, heading };

	devLat.textContent = formatNumber(latitude);
	devLon.textContent = formatNumber(longitude);
	devAccuracy.textContent = accuracy != null ? `±${Math.round(accuracy)} m` : '—';
	devAltitude.textContent = altitude != null ? `${altitude.toFixed(1)} m` : '—';
	devSpeed.textContent = speed != null ? `${(speed * 3.6).toFixed(1)} km/h` : '0.0 km/h';
	devHeading.textContent = heading != null ? `${heading.toFixed(0)}° (${getCardinalDirection(heading)})` : '—';

	deviceStatusMsg.textContent = 'Location detected successfully.';
	gpsStatusBadge.textContent = 'Fix Acquired';
	gpsStatusBadge.className = 'badge active';
	shareLocBtn.disabled = false;
	exportGpxBtn.disabled = false;

	// Plot Device Marker on Map (Emerald Green Pin)
	plotDeviceLocationOnMap(latitude, longitude, accuracy);

	// Update distance calculation option
	updatePointASummary();

	// Reverse geocode
	reverseGeocode(latitude, longitude).then((addr) => {
		devAddress.textContent = addr;
	});
}

function handleDeviceLocationError(err) {
	gpsStatusBadge.textContent = 'Error';
	gpsStatusBadge.className = 'badge';
	if (err.code === err.PERMISSION_DENIED) {
		deviceStatusMsg.textContent = 'Location permission denied. Please allow access in browser settings.';
		permissionHint.textContent = 'Tip: Check your browser address bar permissions icon to enable location.';
	} else if (err.code === err.POSITION_UNAVAILABLE) {
		deviceStatusMsg.textContent = 'Location signal unavailable.';
	} else if (err.code === err.TIMEOUT) {
		deviceStatusMsg.textContent = 'Location request timed out.';
	} else {
		deviceStatusMsg.textContent = 'An unknown error occurred.';
	}
}

function toggleLiveTracking() {
	if (deviceWatchId != null) {
		navigator.geolocation.clearWatch(deviceWatchId);
		deviceWatchId = null;
		liveTrackBtn.textContent = 'Start Live Tracking';
		liveTrackBtn.classList.remove('primary-btn');
		liveTrackBtn.classList.add('secondary-btn');
		deviceStatusMsg.textContent = 'Live tracking stopped.';
		gpsStatusBadge.textContent = 'Standby';
	} else {
		if (!navigator.geolocation) return;
		deviceStatusMsg.textContent = 'Streaming live position updates…';
		liveTrackBtn.textContent = 'Stop Live Tracking';
		liveTrackBtn.classList.remove('secondary-btn');
		liveTrackBtn.classList.add('primary-btn');
		gpsStatusBadge.textContent = 'Tracking Live';

		deviceWatchId = navigator.geolocation.watchPosition(
			(pos) => handleDeviceLocationSuccess(pos),
			(err) => handleDeviceLocationError(err),
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
		);
	}
}

function plotDeviceLocationOnMap(lat, lon, accuracy) {
	if (!map || typeof L === 'undefined') return;

	const latLng = [lat, lon];

	if (!deviceMarker) {
		const greenIcon = L.divIcon({
			className: 'custom-dev-marker',
			html: '<div style="width:16px;height:16px;background:#10b981;border:2px solid #ffffff;border-radius:50%;box-shadow:0 0 12px #10b981;"></div>',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
		});

		deviceMarker = L.marker(latLng, { icon: greenIcon }).addTo(map);
		deviceAccuracyCircle = L.circle(latLng, {
			radius: accuracy || 30,
			color: '#10b981',
			fillColor: '#10b981',
			fillOpacity: 0.12,
			weight: 1.5,
		}).addTo(map);
	} else {
		deviceMarker.setLatLng(latLng);
		deviceAccuracyCircle.setLatLng(latLng);
		if (accuracy) deviceAccuracyCircle.setRadius(accuracy);
	}

	deviceMarker.bindPopup(`<b>My Location</b><br>${lat.toFixed(5)}, ${lon.toFixed(5)}<br>Accuracy: ±${Math.round(accuracy || 0)}m`).openPopup();
	map.setView(latLng, 15);
}

// ── TAB 2: IP GEOLOCATION & NETWORK RECON ─────────────────────────────────

async function lookupIpAddress(query) {
	const trimmed = query.trim();
	if (!trimmed) return;

	ipStatusMsg.textContent = `Resolving IP geolocation for '${trimmed}'…`;
	viewIpOnMapBtn.disabled = true;
	setIpAsTargetBtn.disabled = true;

	try {
		// Clean query: strip http:// or https:// if user pasted domain URL
		const cleanQuery = trimmed.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

		// Query free IP API
		const response = await fetch(`https://freeipapi.com/api/json/${cleanQuery}`, { cache: 'no-cache' });
		if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
		const data = await response.json();

		if (!data || data.latitude == null) {
			throw new Error('Could not resolve location for this IP or domain.');
		}

		lastIpLocation = {
			ip: data.ipAddress || cleanQuery,
			country: data.countryName || 'Unknown',
			countryCode: data.countryCode || '',
			city: data.cityName || 'Unknown',
			region: data.regionName || '',
			zip: data.zipCode || '',
			isp: data.asn ? `AS${data.asn}` : 'Internet Service Provider',
			asn: data.asn ? `AS${data.asn}` : '—',
			lat: Number(data.latitude),
			lon: Number(data.longitude),
			timezone: data.timeZone || '—',
		};

		// Display data
		ipResAddr.textContent = lastIpLocation.ip;
		ipResCountry.textContent = `${lastIpLocation.country} (${lastIpLocation.countryCode})`;
		ipResCity.textContent = lastIpLocation.region ? `${lastIpLocation.city}, ${lastIpLocation.region}` : lastIpLocation.city;
		ipResIsp.textContent = lastIpLocation.isp;
		ipResAsn.textContent = lastIpLocation.asn;
		ipResCoords.textContent = `${formatNumber(lastIpLocation.lat, 4)}, ${formatNumber(lastIpLocation.lon, 4)}`;
		ipResTz.textContent = lastIpLocation.timezone;

		ipStatusMsg.textContent = `Successfully resolved ${lastIpLocation.ip} (${lastIpLocation.city}, ${lastIpLocation.country}).`;
		viewIpOnMapBtn.disabled = false;
		setIpAsTargetBtn.disabled = false;

		// Plot on Map (Vibrant Blue Pin)
		plotIpLocationOnMap(lastIpLocation.lat, lastIpLocation.lon, lastIpLocation.ip, lastIpLocation.city, lastIpLocation.country);

		// Update Distance target
		updatePointBSummary();
	} catch (err) {
		ipStatusMsg.textContent = `Lookup failed: ${err.message}. Check IP/domain and try again.`;
	}
}

async function useMyCurrentIp() {
	ipStatusMsg.textContent = 'Querying your current public IP…';
	try {
		const res = await fetch('https://api64.ipify.org?format=json');
		if (!res.ok) throw new Error('Could not detect public IP');
		const data = await res.json();
		ipInput.value = data.ip;
		lookupIpAddress(data.ip);
	} catch (e) {
		lookupIpAddress('');
	}
}

function plotIpLocationOnMap(lat, lon, ip, city, country) {
	if (!map || typeof L === 'undefined') return;

	const latLng = [lat, lon];

	if (!ipMarker) {
		const blueIcon = L.divIcon({
			className: 'custom-ip-marker',
			html: '<div style="width:16px;height:16px;background:#3b82f6;border:2px solid #ffffff;border-radius:50%;box-shadow:0 0 12px #3b82f6;"></div>',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
		});
		ipMarker = L.marker(latLng, { icon: blueIcon }).addTo(map);
	} else {
		ipMarker.setLatLng(latLng);
	}

	ipMarker.bindPopup(`<b>IP Location: ${ip}</b><br>${city}, ${country}<br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`).openPopup();
	map.setView(latLng, 11);
}

// ── TAB 3: PHONE NUMBER INTELLIGENCE & TELECOM GEOCODER ───────────────────

// Comprehensive Telecom and Country Database for International Prefix Geocoding
const PHONE_DATABASE = [
	// North America (NANP +1)
	{ code: '+1', country: 'United States / Canada', iso: 'US/CA', lat: 37.0902, lon: -95.7129, tz: 'UTC-5 to UTC-8', areas: [
		{ prefix: '415', region: 'California (San Francisco / Bay Area)', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
		{ prefix: '650', region: 'California (San Mateo / Silicon Valley)', lat: 37.5630, lon: -122.3255, tz: 'America/Los_Angeles' },
		{ prefix: '408', region: 'California (San Jose / Silicon Valley)', lat: 37.3382, lon: -121.8863, tz: 'America/Los_Angeles' },
		{ prefix: '510', region: 'California (Oakland / East Bay)', lat: 37.8044, lon: -122.2712, tz: 'America/Los_Angeles' },
		{ prefix: '213', region: 'California (Los Angeles Downtown)', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
		{ prefix: '310', region: 'California (Los Angeles West / Beverly Hills)', lat: 34.0736, lon: -118.4004, tz: 'America/Los_Angeles' },
		{ prefix: '818', region: 'California (San Fernando Valley)', lat: 34.1808, lon: -118.4490, tz: 'America/Los_Angeles' },
		{ prefix: '619', region: 'California (San Diego)', lat: 32.7157, lon: -117.1611, tz: 'America/Los_Angeles' },
		{ prefix: '916', region: 'California (Sacramento)', lat: 38.5816, lon: -121.4944, tz: 'America/Los_Angeles' },
		{ prefix: '212', region: 'New York (Manhattan, NYC)', lat: 40.7831, lon: -73.9712, tz: 'America/New_York' },
		{ prefix: '718', region: 'New York (Brooklyn / Queens / Bronx)', lat: 40.6782, lon: -73.9442, tz: 'America/New_York' },
		{ prefix: '516', region: 'New York (Long Island)', lat: 40.7891, lon: -73.5912, tz: 'America/New_York' },
		{ prefix: '206', region: 'Washington (Seattle)', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
		{ prefix: '503', region: 'Oregon (Portland)', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles' },
		{ prefix: '312', region: 'Illinois (Chicago Downtown)', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
		{ prefix: '713', region: 'Texas (Houston)', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
		{ prefix: '214', region: 'Texas (Dallas)', lat: 32.7767, lon: -96.7970, tz: 'America/Chicago' },
		{ prefix: '512', region: 'Texas (Austin)', lat: 30.2672, lon: -97.7431, tz: 'America/Chicago' },
		{ prefix: '305', region: 'Florida (Miami / Keys)', lat: 25.7617, lon: -80.1918, tz: 'America/New_York' },
		{ prefix: '407', region: 'Florida (Orlando)', lat: 28.5383, lon: -81.3792, tz: 'America/New_York' },
		{ prefix: '404', region: 'Georgia (Atlanta)', lat: 33.7490, lon: -84.3880, tz: 'America/New_York' },
		{ prefix: '617', region: 'Massachusetts (Boston / Cambridge)', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
		{ prefix: '202', region: 'District of Columbia (Washington, D.C.)', lat: 38.9072, lon: -77.0369, tz: 'America/New_York' },
		{ prefix: '702', region: 'Nevada (Las Vegas)', lat: 36.1699, lon: -115.1398, tz: 'America/Los_Angeles' },
		{ prefix: '602', region: 'Arizona (Phoenix)', lat: 33.4484, lon: -112.0740, tz: 'America/Phoenix' },
		{ prefix: '303', region: 'Colorado (Denver)', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
		{ prefix: '416', region: 'Canada (Toronto, Ontario)', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
		{ prefix: '604', region: 'Canada (Vancouver, British Columbia)', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
		{ prefix: '514', region: 'Canada (Montreal, Quebec)', lat: 45.5017, lon: -73.5673, tz: 'America/Toronto' },
	]},
	// India (+91) - Comprehensive Telecom Circles & Series
	{ code: '+91', country: 'India', iso: 'IN', lat: 20.5937, lon: 78.9629, tz: 'Asia/Kolkata', areas: [
		{ prefix: '9845', region: 'Karnataka (Bengaluru / Bangalore Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9844', region: 'Karnataka (Bengaluru / Bangalore Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9448', region: 'Karnataka Circle (BSNL)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9449', region: 'Karnataka Circle (BSNL)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9900', region: 'Karnataka (Bengaluru Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9901', region: 'Karnataka (Bengaluru Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9980', region: 'Karnataka (Bengaluru Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9986', region: 'Karnataka (Bengaluru Circle)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9740', region: 'Karnataka Circle', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9741', region: 'Karnataka Circle', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9742', region: 'Karnataka Circle', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9886', region: 'Karnataka Circle', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9880', region: 'Karnataka Circle', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '80', region: 'Karnataka (Bengaluru Fixed/Landline)', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
		{ prefix: '9820', region: 'Mumbai (Maharashtra Circle)', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9821', region: 'Mumbai (Maharashtra Circle)', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9819', region: 'Mumbai Circle', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9833', region: 'Mumbai Circle', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9869', region: 'Mumbai Circle (MTNL)', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9892', region: 'Mumbai Circle', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9920', region: 'Mumbai Circle', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '22', region: 'Mumbai (Maharashtra Fixed/Landline)', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
		{ prefix: '9810', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9811', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9818', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9871', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9891', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9910', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9958', region: 'Delhi NCR Circle', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '11', region: 'Delhi NCR (Fixed/Landline)', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
		{ prefix: '9840', region: 'Chennai / Tamil Nadu Circle', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
		{ prefix: '9841', region: 'Chennai / Tamil Nadu Circle', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
		{ prefix: '9884', region: 'Chennai / Tamil Nadu Circle', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
		{ prefix: '44', region: 'Chennai (Tamil Nadu Fixed/Landline)', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
		{ prefix: '9848', region: 'Hyderabad / Telangana & AP Circle', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
		{ prefix: '9849', region: 'Hyderabad / Telangana & AP Circle', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
		{ prefix: '40', region: 'Hyderabad (Telangana Fixed/Landline)', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
		{ prefix: '9830', region: 'Kolkata (West Bengal Circle)', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
		{ prefix: '9831', region: 'Kolkata (West Bengal Circle)', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
		{ prefix: '33', region: 'Kolkata (West Bengal Fixed/Landline)', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
		{ prefix: '9822', region: 'Pune / Maharashtra Circle', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
		{ prefix: '9823', region: 'Pune / Maharashtra Circle', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
		{ prefix: '20', region: 'Pune (Maharashtra Fixed/Landline)', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
		{ prefix: '9825', region: 'Gujarat (Ahmedabad Circle)', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
		{ prefix: '9824', region: 'Gujarat Circle', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
		{ prefix: '9829', region: 'Rajasthan (Jaipur Circle)', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
		{ prefix: '9814', region: 'Punjab / Chandigarh Circle', lat: 30.7333, lon: 76.7794, tz: 'Asia/Kolkata' },
		{ prefix: '9846', region: 'Kerala (Kochi / Thiruvananthapuram Circle)', lat: 9.9312, lon: 76.2673, tz: 'Asia/Kolkata' },
		{ prefix: '9839', region: 'Uttar Pradesh (East / Lucknow Circle)', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata' },
		{ prefix: '9837', region: 'Uttar Pradesh (West Circle)', lat: 28.9845, lon: 77.7064, tz: 'Asia/Kolkata' },
		{ prefix: '9', region: 'India National Mobile (Airtel / Jio / Vi)', lat: 20.5937, lon: 78.9629, tz: 'Asia/Kolkata' },
		{ prefix: '8', region: 'India National Mobile (Airtel / Jio / Vi)', lat: 20.5937, lon: 78.9629, tz: 'Asia/Kolkata' },
		{ prefix: '7', region: 'India National Mobile (Jio / Airtel / Vi)', lat: 20.5937, lon: 78.9629, tz: 'Asia/Kolkata' },
		{ prefix: '6', region: 'India National Mobile (Jio / Airtel / Vi)', lat: 20.5937, lon: 78.9629, tz: 'Asia/Kolkata' },
	]},
	// United Kingdom (+44)
	{ code: '+44', country: 'United Kingdom', iso: 'GB', lat: 55.3781, lon: -3.4360, tz: 'Europe/London', areas: [
		{ prefix: '20', region: 'Greater London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
		{ prefix: '161', region: 'Greater Manchester', lat: 53.4808, lon: -2.2426, tz: 'Europe/London' },
		{ prefix: '121', region: 'Birmingham / West Midlands', lat: 52.4862, lon: -1.8904, tz: 'Europe/London' },
		{ prefix: '113', region: 'Leeds / West Yorkshire', lat: 53.8008, lon: -1.5491, tz: 'Europe/London' },
		{ prefix: '141', region: 'Glasgow, Scotland', lat: 55.8642, lon: -4.2518, tz: 'Europe/London' },
		{ prefix: '7', region: 'UK Mobile Network (O2/EE/Vodafone/Three)', lat: 52.3555, lon: -1.1743, tz: 'Europe/London' },
	]},
	// Australia (+61)
	{ code: '+61', country: 'Australia', iso: 'AU', lat: -25.2744, lon: 133.7751, tz: 'Australia/Sydney', areas: [
		{ prefix: '2', region: 'Sydney / NSW / ACT', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
		{ prefix: '3', region: 'Melbourne / Victoria / Tasmania', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
		{ prefix: '7', region: 'Brisbane / Queensland', lat: -27.4698, lon: 153.0251, tz: 'Australia/Brisbane' },
		{ prefix: '8', region: 'Perth / WA / SA / NT', lat: -31.9505, lon: 115.8605, tz: 'Australia/Perth' },
		{ prefix: '4', region: 'Mobile Cellular Network (Telstra/Optus)', lat: -25.2744, lon: 133.7751, tz: 'Australia/Sydney' },
	]},
	// Germany (+49)
	{ code: '+49', country: 'Germany', iso: 'DE', lat: 51.1657, lon: 10.4515, tz: 'Europe/Berlin', areas: [
		{ prefix: '30', region: 'Berlin', lat: 52.5200, lon: 13.4050, tz: 'Europe/Berlin' },
		{ prefix: '89', region: 'Munich (Bavaria)', lat: 48.1351, lon: 11.5820, tz: 'Europe/Berlin' },
		{ prefix: '69', region: 'Frankfurt am Main', lat: 50.1109, lon: 8.6821, tz: 'Europe/Berlin' },
		{ prefix: '40', region: 'Hamburg', lat: 53.5511, lon: 9.9937, tz: 'Europe/Berlin' },
		{ prefix: '221', region: 'Cologne / Köln', lat: 50.9375, lon: 6.9603, tz: 'Europe/Berlin' },
		{ prefix: '15', region: 'Mobile Cellular Network', lat: 51.1657, lon: 10.4515, tz: 'Europe/Berlin' },
		{ prefix: '16', region: 'Mobile Cellular Network', lat: 51.1657, lon: 10.4515, tz: 'Europe/Berlin' },
		{ prefix: '17', region: 'Mobile Cellular Network', lat: 51.1657, lon: 10.4515, tz: 'Europe/Berlin' },
	]},
	// France (+33)
	{ code: '+33', country: 'France', iso: 'FR', lat: 46.2276, lon: 2.2137, tz: 'Europe/Paris', areas: [
		{ prefix: '1', region: 'Paris & Île-de-France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
		{ prefix: '4', region: 'South-East France (Marseille/Nice/Lyon)', lat: 45.7640, lon: 4.8357, tz: 'Europe/Paris' },
		{ prefix: '6', region: 'Mobile Cellular Network (Orange/SFR/Bouygues)', lat: 46.2276, lon: 2.2137, tz: 'Europe/Paris' },
		{ prefix: '7', region: 'Mobile Cellular Network (Orange/Free)', lat: 46.2276, lon: 2.2137, tz: 'Europe/Paris' },
	]},
	// Japan (+81)
	{ code: '+81', country: 'Japan', iso: 'JP', lat: 36.2048, lon: 138.2529, tz: 'Asia/Tokyo', areas: [
		{ prefix: '3', region: 'Tokyo Metropolitan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
		{ prefix: '6', region: 'Osaka', lat: 34.6937, lon: 135.5023, tz: 'Asia/Tokyo' },
		{ prefix: '75', region: 'Kyoto', lat: 35.0116, lon: 135.7681, tz: 'Asia/Tokyo' },
		{ prefix: '90', region: 'Mobile Cellular Network (Docomo/Softbank)', lat: 36.2048, lon: 138.2529, tz: 'Asia/Tokyo' },
		{ prefix: '80', region: 'Mobile Cellular Network', lat: 36.2048, lon: 138.2529, tz: 'Asia/Tokyo' },
		{ prefix: '70', region: 'Mobile Cellular Network', lat: 36.2048, lon: 138.2529, tz: 'Asia/Tokyo' },
	]},
	// China (+86)
	{ code: '+86', country: 'China', iso: 'CN', lat: 35.8617, lon: 104.1954, tz: 'Asia/Shanghai', areas: [
		{ prefix: '10', region: 'Beijing', lat: 39.9042, lon: 116.4074, tz: 'Asia/Shanghai' },
		{ prefix: '21', region: 'Shanghai', lat: 31.2304, lon: 121.4737, tz: 'Asia/Shanghai' },
		{ prefix: '20', region: 'Guangzhou', lat: 23.1291, lon: 113.2644, tz: 'Asia/Shanghai' },
		{ prefix: '755', region: 'Shenzhen', lat: 22.5431, lon: 114.0579, tz: 'Asia/Shanghai' },
		{ prefix: '1', region: 'Mobile Cellular Network (China Mobile/Unicom)', lat: 35.8617, lon: 104.1954, tz: 'Asia/Shanghai' },
	]},
	// United Arab Emirates (+971)
	{ code: '+971', country: 'United Arab Emirates', iso: 'AE', lat: 23.4241, lon: 53.8478, tz: 'Asia/Dubai', areas: [
		{ prefix: '4', region: 'Dubai', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
		{ prefix: '2', region: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, tz: 'Asia/Dubai' },
		{ prefix: '6', region: 'Sharjah', lat: 25.3463, lon: 55.4209, tz: 'Asia/Dubai' },
		{ prefix: '5', region: 'Mobile Cellular Network (e& / du)', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
	]},
	// Brazil (+55)
	{ code: '+55', country: 'Brazil', iso: 'BR', lat: -14.2350, lon: -51.9253, tz: 'America/Sao_Paulo', areas: [
		{ prefix: '11', region: 'São Paulo Metropolitan', lat: -23.5505, lon: -46.6333, tz: 'America/Sao_Paulo' },
		{ prefix: '21', region: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, tz: 'America/Sao_Paulo' },
		{ prefix: '61', region: 'Brasília (Federal District)', lat: -15.7975, lon: -47.8919, tz: 'America/Sao_Paulo' },
	]},
	// Russia (+7)
	{ code: '+7', country: 'Russia / Kazakhstan', iso: 'RU', lat: 61.5240, lon: 105.3188, tz: 'Europe/Moscow', areas: [
		{ prefix: '495', region: 'Moscow', lat: 55.7558, lon: 37.6173, tz: 'Europe/Moscow' },
		{ prefix: '812', region: 'Saint Petersburg', lat: 59.9343, lon: 30.3351, tz: 'Europe/Moscow' },
		{ prefix: '9', region: 'Mobile Cellular Network (MTS/Beeline/MegaFon)', lat: 55.7558, lon: 37.6173, tz: 'Europe/Moscow' },
	]},
	// Italy (+39)
	{ code: '+39', country: 'Italy', iso: 'IT', lat: 41.8719, lon: 12.5674, tz: 'Europe/Rome', areas: [
		{ prefix: '06', region: 'Rome / Lazio', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome' },
		{ prefix: '02', region: 'Milan / Lombardy', lat: 45.4642, lon: 9.1900, tz: 'Europe/Rome' },
		{ prefix: '3', region: 'Mobile Cellular Network (TIM/Vodafone/WindTre)', lat: 41.8719, lon: 12.5674, tz: 'Europe/Rome' },
	]},
	// Spain (+34)
	{ code: '+34', country: 'Spain', iso: 'ES', lat: 40.4637, lon: -3.7492, tz: 'Europe/Madrid', areas: [
		{ prefix: '91', region: 'Madrid', lat: 40.4168, lon: -3.7038, tz: 'Europe/Madrid' },
		{ prefix: '93', region: 'Barcelona / Catalonia', lat: 41.3874, lon: 2.1686, tz: 'Europe/Madrid' },
		{ prefix: '6', region: 'Mobile Cellular Network (Movistar/Vodafone/Orange)', lat: 40.4637, lon: -3.7492, tz: 'Europe/Madrid' },
		{ prefix: '7', region: 'Mobile Cellular Network', lat: 40.4637, lon: -3.7492, tz: 'Europe/Madrid' },
	]},
	// Mexico (+52)
	{ code: '+52', country: 'Mexico', iso: 'MX', lat: 23.6345, lon: -102.5528, tz: 'America/Mexico_City', areas: [
		{ prefix: '55', region: 'Mexico City (CDMX)', lat: 19.4326, lon: -99.1332, tz: 'America/Mexico_City' },
		{ prefix: '81', region: 'Monterrey (Nuevo León)', lat: 25.6866, lon: -100.3161, tz: 'America/Monterrey' },
		{ prefix: '33', region: 'Guadalajara (Jalisco)', lat: 20.6597, lon: -103.3496, tz: 'America/Mexico_City' },
	]},
	// Pakistan (+92)
	{ code: '+92', country: 'Pakistan', iso: 'PK', lat: 30.3753, lon: 69.3451, tz: 'Asia/Karachi', areas: [
		{ prefix: '21', region: 'Karachi (Sindh)', lat: 24.8607, lon: 67.0011, tz: 'Asia/Karachi' },
		{ prefix: '42', region: 'Lahore (Punjab)', lat: 31.5204, lon: 74.3587, tz: 'Asia/Karachi' },
		{ prefix: '51', region: 'Islamabad / Rawalpindi', lat: 33.6844, lon: 73.0479, tz: 'Asia/Karachi' },
		{ prefix: '3', region: 'Mobile Cellular Network (Jazz/Telenor/Zong)', lat: 30.3753, lon: 69.3451, tz: 'Asia/Karachi' },
	]},
	// Bangladesh (+880)
	{ code: '+880', country: 'Bangladesh', iso: 'BD', lat: 23.6850, lon: 90.3563, tz: 'Asia/Dhaka', areas: [
		{ prefix: '2', region: 'Dhaka', lat: 23.8103, lon: 90.4125, tz: 'Asia/Dhaka' },
		{ prefix: '1', region: 'Mobile Cellular Network (Grameenphone/Robi/Banglalink)', lat: 23.6850, lon: 90.3563, tz: 'Asia/Dhaka' },
	]},
	// Indonesia (+62)
	{ code: '+62', country: 'Indonesia', iso: 'ID', lat: -0.7893, lon: 113.9213, tz: 'Asia/Jakarta', areas: [
		{ prefix: '21', region: 'Jakarta', lat: -6.2088, lon: 106.8456, tz: 'Asia/Jakarta' },
		{ prefix: '8', region: 'Mobile Cellular Network (Telkomsel/Indosat/XL)', lat: -0.7893, lon: 113.9213, tz: 'Asia/Jakarta' },
	]},
	// Nigeria (+234)
	{ code: '+234', country: 'Nigeria', iso: 'NG', lat: 9.0820, lon: 8.6753, tz: 'Africa/Lagos', areas: [
		{ prefix: '1', region: 'Lagos', lat: 6.5244, lon: 3.3792, tz: 'Africa/Lagos' },
		{ prefix: '9', region: 'Abuja (Federal Capital Territory)', lat: 9.0765, lon: 7.3986, tz: 'Africa/Lagos' },
		{ prefix: '80', region: 'Mobile Cellular Network (MTN/Airtel/Glo)', lat: 9.0820, lon: 8.6753, tz: 'Africa/Lagos' },
		{ prefix: '90', region: 'Mobile Cellular Network', lat: 9.0820, lon: 8.6753, tz: 'Africa/Lagos' },
		{ prefix: '70', region: 'Mobile Cellular Network', lat: 9.0820, lon: 8.6753, tz: 'Africa/Lagos' },
	]},
	// South Africa (+27)
	{ code: '+27', country: 'South Africa', iso: 'ZA', lat: -30.5595, lon: 22.9375, tz: 'Africa/Johannesburg', areas: [
		{ prefix: '11', region: 'Johannesburg (Gauteng)', lat: -26.2041, lon: 28.0473, tz: 'Africa/Johannesburg' },
		{ prefix: '21', region: 'Cape Town (Western Cape)', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg' },
		{ prefix: '8', region: 'Mobile Cellular Network (Vodacom/MTN)', lat: -30.5595, lon: 22.9375, tz: 'Africa/Johannesburg' },
		{ prefix: '7', region: 'Mobile Cellular Network', lat: -30.5595, lon: 22.9375, tz: 'Africa/Johannesburg' },
	]},
	// Saudi Arabia (+966)
	{ code: '+966', country: 'Saudi Arabia', iso: 'SA', lat: 23.8859, lon: 45.0792, tz: 'Asia/Riyadh', areas: [
		{ prefix: '11', region: 'Riyadh', lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh' },
		{ prefix: '12', region: 'Jeddah / Mecca', lat: 21.5433, lon: 39.1728, tz: 'Asia/Riyadh' },
		{ prefix: '5', region: 'Mobile Cellular Network (stc/Mobily/Zain)', lat: 23.8859, lon: 45.0792, tz: 'Asia/Riyadh' },
	]},
	// Singapore (+65)
	{ code: '+65', country: 'Singapore', iso: 'SG', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', areas: [
		{ prefix: '9', region: 'Mobile Cellular Network (Singtel/StarHub/M1)', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
		{ prefix: '8', region: 'Mobile Cellular Network', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
		{ prefix: '6', region: 'Fixed Line / Broadband', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
	]},
	// Malaysia (+60)
	{ code: '+60', country: 'Malaysia', iso: 'MY', lat: 4.2105, lon: 101.9758, tz: 'Asia/Kuala_Lumpur', areas: [
		{ prefix: '3', region: 'Kuala Lumpur / Selangor', lat: 3.1390, lon: 101.6869, tz: 'Asia/Kuala_Lumpur' },
		{ prefix: '1', region: 'Mobile Cellular Network (Maxis/Celcom/Digi)', lat: 4.2105, lon: 101.9758, tz: 'Asia/Kuala_Lumpur' },
	]},
	// New Zealand (+64)
	{ code: '+64', country: 'New Zealand', iso: 'NZ', lat: -40.9006, lon: 174.8860, tz: 'Pacific/Auckland', areas: [
		{ prefix: '9', region: 'Auckland / Northland', lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland' },
		{ prefix: '4', region: 'Wellington', lat: -41.2865, lon: 174.7762, tz: 'Pacific/Auckland' },
		{ prefix: '2', region: 'Mobile Cellular Network (One NZ/Spark/2degrees)', lat: -40.9006, lon: 174.8860, tz: 'Pacific/Auckland' },
	]},
	// Sri Lanka (+94)
	{ code: '+94', country: 'Sri Lanka', iso: 'LK', lat: 7.8731, lon: 80.7718, tz: 'Asia/Colombo', areas: [
		{ prefix: '11', region: 'Colombo', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo' },
		{ prefix: '7', region: 'Mobile Cellular Network (Dialog/Mobitel)', lat: 7.8731, lon: 80.7718, tz: 'Asia/Colombo' },
	]},
	// Nepal (+977)
	{ code: '+977', country: 'Nepal', iso: 'NP', lat: 28.3949, lon: 84.1240, tz: 'Asia/Kathmandu', areas: [
		{ prefix: '1', region: 'Kathmandu Valley', lat: 27.7172, lon: 85.3240, tz: 'Asia/Kathmandu' },
		{ prefix: '98', region: 'Mobile Cellular Network (Ncell/NTC)', lat: 28.3949, lon: 84.1240, tz: 'Asia/Kathmandu' },
		{ prefix: '97', region: 'Mobile Cellular Network', lat: 28.3949, lon: 84.1240, tz: 'Asia/Kathmandu' },
	]},
	// Switzerland (+41)
	{ code: '+41', country: 'Switzerland', iso: 'CH', lat: 46.8182, lon: 8.2275, tz: 'Europe/Zurich', areas: [
		{ prefix: '44', region: 'Zurich', lat: 47.3769, lon: 8.5417, tz: 'Europe/Zurich' },
		{ prefix: '22', region: 'Geneva', lat: 46.2044, lon: 6.1432, tz: 'Europe/Zurich' },
		{ prefix: '79', region: 'Mobile Cellular Network (Swisscom)', lat: 46.8182, lon: 8.2275, tz: 'Europe/Zurich' },
	]},
	// Netherlands (+31)
	{ code: '+31', country: 'Netherlands', iso: 'NL', lat: 52.1326, lon: 5.2913, tz: 'Europe/Amsterdam', areas: [
		{ prefix: '20', region: 'Amsterdam', lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam' },
		{ prefix: '10', region: 'Rotterdam', lat: 51.9244, lon: 4.4777, tz: 'Europe/Amsterdam' },
		{ prefix: '6', region: 'Mobile Cellular Network (KPN/Vodafone)', lat: 52.1326, lon: 5.2913, tz: 'Europe/Amsterdam' },
	]},
	// Sweden (+46)
	{ code: '+46', country: 'Sweden', iso: 'SE', lat: 60.1282, lon: 18.6435, tz: 'Europe/Stockholm', areas: [
		{ prefix: '8', region: 'Stockholm', lat: 59.3293, lon: 18.0686, tz: 'Europe/Stockholm' },
		{ prefix: '7', region: 'Mobile Cellular Network (Telia/Tele2)', lat: 60.1282, lon: 18.6435, tz: 'Europe/Stockholm' },
	]},
	// Norway (+47)
	{ code: '+47', country: 'Norway', iso: 'NO', lat: 60.4720, lon: 8.4689, tz: 'Europe/Oslo', areas: [
		{ prefix: '2', region: 'Oslo', lat: 59.9139, lon: 10.7522, tz: 'Europe/Oslo' },
		{ prefix: '9', region: 'Mobile Cellular Network (Telenor/Telia)', lat: 60.4720, lon: 8.4689, tz: 'Europe/Oslo' },
		{ prefix: '4', region: 'Mobile Cellular Network', lat: 60.4720, lon: 8.4689, tz: 'Europe/Oslo' },
	]},
	// Poland (+48)
	{ code: '+48', country: 'Poland', iso: 'PL', lat: 51.9194, lon: 19.1451, tz: 'Europe/Warsaw', areas: [
		{ prefix: '22', region: 'Warsaw', lat: 52.2297, lon: 21.0122, tz: 'Europe/Warsaw' },
		{ prefix: '5', region: 'Mobile Cellular Network', lat: 51.9194, lon: 19.1451, tz: 'Europe/Warsaw' },
		{ prefix: '6', region: 'Mobile Cellular Network', lat: 51.9194, lon: 19.1451, tz: 'Europe/Warsaw' },
		{ prefix: '7', region: 'Mobile Cellular Network', lat: 51.9194, lon: 19.1451, tz: 'Europe/Warsaw' },
	]},
	// Turkey (+90)
	{ code: '+90', country: 'Turkey', iso: 'TR', lat: 38.9637, lon: 35.2433, tz: 'Europe/Istanbul', areas: [
		{ prefix: '212', region: 'Istanbul (European side)', lat: 41.0082, lon: 28.9784, tz: 'Europe/Istanbul' },
		{ prefix: '216', region: 'Istanbul (Asian side)', lat: 40.9923, lon: 29.1244, tz: 'Europe/Istanbul' },
		{ prefix: '312', region: 'Ankara', lat: 39.9334, lon: 32.8597, tz: 'Europe/Istanbul' },
		{ prefix: '5', region: 'Mobile Cellular Network (Turkcell/Vodafone)', lat: 38.9637, lon: 35.2433, tz: 'Europe/Istanbul' },
	]},
	// Egypt (+20)
	{ code: '+20', country: 'Egypt', iso: 'EG', lat: 26.8206, lon: 30.8025, tz: 'Africa/Cairo', areas: [
		{ prefix: '2', region: 'Cairo / Giza', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo' },
		{ prefix: '3', region: 'Alexandria', lat: 31.2001, lon: 29.9187, tz: 'Africa/Cairo' },
		{ prefix: '10', region: 'Mobile Cellular Network (Vodafone)', lat: 26.8206, lon: 30.8025, tz: 'Africa/Cairo' },
		{ prefix: '11', region: 'Mobile Cellular Network (Etisalat)', lat: 26.8206, lon: 30.8025, tz: 'Africa/Cairo' },
		{ prefix: '12', region: 'Mobile Cellular Network (Orange)', lat: 26.8206, lon: 30.8025, tz: 'Africa/Cairo' },
	]},
];

function analyzePhoneNumber(rawNumber) {
	const cleaned = rawNumber.trim().replace(/[^\d+]/g, '');
	if (!cleaned) {
		phoneStatusMsg.textContent = 'Please enter a valid phone number.';
		return;
	}

	let formattedE164 = '';
	const selectedCountryCode = phoneCountrySelect ? phoneCountrySelect.value : 'auto';

	// Case 1: User explicitly provided a leading plus '+'
	if (cleaned.startsWith('+')) {
		formattedE164 = cleaned;
	} else {
		// Case 2: No leading plus. Check selected dropdown or smart auto-detection
		let digitsOnly = cleaned.replace(/^0+/, ''); // Strip leading trunk zero (e.g. 09876543210 -> 9876543210)

		if (selectedCountryCode !== 'auto') {
			formattedE164 = `${selectedCountryCode}${digitsOnly}`;
		} else {
			// Auto-detection rules:
			if (digitsOnly.length === 10 && ['6', '7', '8', '9'].includes(digitsOnly[0])) {
				// Standard 10-digit Indian mobile number
				formattedE164 = `+91${digitsOnly}`;
			} else if (digitsOnly.length === 10 && ['2', '3', '4', '5'].includes(digitsOnly[0])) {
				// Standard 10-digit US/Canada NANP number
				formattedE164 = `+1${digitsOnly}`;
			} else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
				// 91xxxxxxxxxx
				formattedE164 = `+${digitsOnly}`;
			} else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
				// 1xxxxxxxxxx
				formattedE164 = `+${digitsOnly}`;
			} else if (digitsOnly.length >= 11 && digitsOnly.startsWith('44')) {
				// 44xxxxxxxxxx
				formattedE164 = `+${digitsOnly}`;
			} else {
				// Default fallback to India (+91) if 10 digits, or prepend +
				formattedE164 = digitsOnly.length === 10 ? `+91${digitsOnly}` : `+${digitsOnly}`;
			}
		}
	}

	// Match country code by longest prefix match
	let match = null;
	let remainingDigits = '';
	const sortedDb = [...PHONE_DATABASE].sort((a, b) => b.code.length - a.code.length);

	for (const entry of sortedDb) {
		if (formattedE164.startsWith(entry.code)) {
			match = entry;
			remainingDigits = formattedE164.slice(entry.code.length);
			break;
		}
	}

	if (!match) {
		phoneStatusMsg.textContent = `Country code for '${formattedE164}' not recognized. Please select your country from the dropdown.`;
		return;
	}

	// Sync country selector dropdown if matched
	if (phoneCountrySelect) {
		const matchedOption = Array.from(phoneCountrySelect.options).find((opt) => opt.value === match.code);
		if (matchedOption) {
			phoneCountrySelect.value = match.code;
		}
	}

	// Identify regional area code or mobile circle
	let matchedArea = null;
	if (match.areas && match.areas.length > 0) {
		const sortedAreas = [...match.areas].sort((a, b) => b.prefix.length - a.prefix.length);
		for (const area of sortedAreas) {
			if (remainingDigits.startsWith(area.prefix)) {
				matchedArea = area;
				break;
			}
		}
	}

	const countryName = match.country;
	const regionName = matchedArea ? matchedArea.region : 'National / General Area';
	const lat = matchedArea ? matchedArea.lat : match.lat;
	const lon = matchedArea ? matchedArea.lon : match.lon;
	const tz = matchedArea ? matchedArea.tz : match.tz;
	const lineType = matchedArea && matchedArea.region.toLowerCase().includes('mobile')
		? 'Mobile Cellular (GSM/4G/5G)'
		: 'Fixed Line / Mobile Regional';

	// Compute current local time in that timezone
	let localTimeStr = '—';
	try {
		localTimeStr = new Intl.DateTimeFormat(undefined, {
			timeZone: tz,
			hour: '2-digit',
			minute: '2-digit',
			timeZoneName: 'short',
		}).format(new Date());
	} catch (e) {
		localTimeStr = 'UTC';
	}

	lastPhoneLocation = {
		formatted: formattedE164,
		country: countryName,
		region: regionName,
		dialCode: match.code,
		type: lineType,
		tz,
		lat,
		lon,
	};

	// Display fields
	phoneResFormatted.textContent = formattedE164;
	phoneResCountry.textContent = `${countryName} (${match.iso})`;
	phoneResRegion.textContent = regionName;
	phoneResDialcode.textContent = match.code;
	phoneResType.textContent = lineType;
	phoneResTz.textContent = `${tz} [Local Time: ${localTimeStr}]`;
	phoneResCoords.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

	// Distance from device if available
	let distanceNotice = '';
	if (currentDevicePosition) {
		const distKm = haversineDistance(currentDevicePosition.latitude, currentDevicePosition.longitude, lat, lon);
		distanceNotice = ` (Distance from your location: ${distKm < 10 ? distKm.toFixed(1) : Math.round(distKm)} km)`;
	}

	phoneStatusMsg.textContent = `Phone resolved to ${regionName}, ${countryName}.${distanceNotice}`;
	viewPhoneOnMapBtn.disabled = false;
	setPhoneAsTargetBtn.disabled = false;

	// Plot Purple Pin and Telecom Coverage Area on Map
	plotPhoneLocationOnMap(lat, lon, formattedE164, regionName, countryName, localTimeStr);

	// Update Distance target in Tab 5
	updatePointBSummary();
}

function plotPhoneLocationOnMap(lat, lon, phone, region, country, localTime = '') {
	if (!map || typeof L === 'undefined') return;

	const latLng = [lat, lon];

	// Remove previous marker & coverage circle
	if (phoneMarker) {
		map.removeLayer(phoneMarker);
		phoneMarker = null;
	}
	if (phoneCoverageCircle) {
		map.removeLayer(phoneCoverageCircle);
		phoneCoverageCircle = null;
	}

	// Purple Pin
	const purpleIcon = L.divIcon({
		className: 'custom-phone-marker',
		html: '<div style="width:18px;height:18px;background:#8b5cf6;border:2px solid #ffffff;border-radius:50%;box-shadow:0 0 14px #8b5cf6;"></div>',
		iconSize: [18, 18],
		iconAnchor: [9, 9],
	});
	phoneMarker = L.marker(latLng, { icon: purpleIcon }).addTo(map);

	// Simulated Telecom Routing Area Circle (~25km radius)
	phoneCoverageCircle = L.circle(latLng, {
		radius: 25000,
		color: '#8b5cf6',
		fillColor: '#8b5cf6',
		fillOpacity: 0.12,
		weight: 1.5,
		dashArray: '4, 6',
	}).addTo(map);

	const timeHtml = localTime ? `<br>Local Time: ${localTime}` : '';
	phoneMarker.bindPopup(`<b>Phone Telecom Origin: ${phone}</b><br>${region}, ${country}${timeHtml}<br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}<br><i>(Telecom Sector: ~25 km radius)</i>`).openPopup();

	// Smooth fly to location
	map.flyTo(latLng, 9, { duration: 1.2 });
}

// ── TAB 4: SIMULATOR & CHANGE GPS ─────────────────────────────────────────

async function searchPlaceGeocode(query) {
	const trimmed = query.trim();
	if (!trimmed) return;

	simStatusMsg.textContent = `Searching place '${trimmed}'…`;

	try {
		const url = new URL('https://nominatim.openstreetmap.org/search');
		url.searchParams.set('q', trimmed);
		url.searchParams.set('format', 'jsonv2');
		url.searchParams.set('limit', '1');
		url.searchParams.set('addressdetails', '1');

		const response = await fetch(url.toString(), {
			headers: { 'Accept-Language': 'en', 'User-Agent': 'geointel-suite/1.0' },
		});
		if (!response.ok) throw new Error(`Search failed: ${response.status}`);
		const results = await response.json();

		if (!results || !results.length) {
			simStatusMsg.textContent = `No place found matching '${trimmed}'.`;
			return;
		}

		const place = results[0];
		const lat = parseFloat(place.lat);
		const lon = parseFloat(place.lon);
		const displayName = place.display_name;

		setSimulatedLocation(lat, lon, displayName);
	} catch (e) {
		simStatusMsg.textContent = `Search error: ${e.message}.`;
	}
}

function setSimulatedLocation(lat, lon, knownAddress = null) {
	simulatedPosition = { latitude: lat, longitude: lon };

	simCoordsDisplay.textContent = `${formatNumber(lat, 6)}, ${formatNumber(lon, 6)}`;
	simLatInput.value = lat.toFixed(6);
	simLonInput.value = lon.toFixed(6);
	centerSimBtn.disabled = false;

	// Distance from real GPS if available
	if (currentDevicePosition) {
		const distKm = haversineDistance(
			currentDevicePosition.latitude,
			currentDevicePosition.longitude,
			lat,
			lon
		);
		const distMi = distKm * 0.621371;
		simDistFromReal.textContent = `${distKm.toFixed(2)} km (${distMi.toFixed(2)} mi)`;

		const bearing = calculateBearing(
			currentDevicePosition.latitude,
			currentDevicePosition.longitude,
			lat,
			lon
		);
		simBearingFromReal.textContent = `${bearing.toFixed(1)}° (${getCardinalDirection(bearing)})`;
	} else {
		simDistFromReal.textContent = 'Acquire Device GPS to compare';
		simBearingFromReal.textContent = '—';
	}

	// Address resolution
	if (knownAddress) {
		simAddressDisplay.textContent = knownAddress;
		simStatusMsg.textContent = `Active GPS overridden to: ${knownAddress.slice(0, 45)}…`;
	} else {
		simAddressDisplay.textContent = 'Resolving address…';
		reverseGeocode(lat, lon).then((addr) => {
			simAddressDisplay.textContent = addr;
			simStatusMsg.textContent = `Simulated GPS set to: ${addr.slice(0, 45)}…`;
		});
	}

	// Plot Amber Marker on Map
	plotSimulatedLocationOnMap(lat, lon);

	// Update distance calculation options
	updatePointASummary();
}

function plotSimulatedLocationOnMap(lat, lon) {
	if (!map || typeof L === 'undefined') return;

	const latLng = [lat, lon];

	if (!simMarker) {
		const amberIcon = L.divIcon({
			className: 'custom-sim-marker',
			html: '<div style="width:16px;height:16px;background:#f59e0b;border:2px solid #ffffff;border-radius:50%;box-shadow:0 0 12px #f59e0b;"></div>',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
		});

		// Make it draggable so user can drag anywhere!
		simMarker = L.marker(latLng, { icon: amberIcon, draggable: true }).addTo(map);

		simMarker.on('dragend', (e) => {
			const pos = e.target.getLatLng();
			setSimulatedLocation(pos.lat, pos.lng);
		});
	} else {
		simMarker.setLatLng(latLng);
	}

	simMarker.bindPopup(`<b>Simulated GPS</b><br>Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}<br><i>(Drag marker to move)</i>`).openPopup();
	map.setView(latLng, 14);
}

// ── TAB 5: DISTANCE & RANGEFINDER CALCULATOR ──────────────────────────────

function updatePointASummary() {
	const mode = pointASelect.value;
	if (mode === 'device') {
		pointAInputs.style.display = 'none';
		if (currentDevicePosition) {
			ptASummary.textContent = `Device: ${currentDevicePosition.latitude.toFixed(4)}, ${currentDevicePosition.longitude.toFixed(4)}`;
		} else {
			ptASummary.textContent = 'Device GPS not acquired yet.';
		}
	} else if (mode === 'simulated') {
		pointAInputs.style.display = 'none';
		if (simulatedPosition) {
			ptASummary.textContent = `Simulated: ${simulatedPosition.latitude.toFixed(4)}, ${simulatedPosition.longitude.toFixed(4)}`;
		} else {
			ptASummary.textContent = 'Simulated GPS not set yet.';
		}
	} else {
		pointAInputs.style.display = 'flex';
		ptASummary.textContent = 'Enter custom Point A coordinates.';
	}
}

function updatePointBSummary() {
	const mode = pointBSelect.value;
	if (mode.startsWith('preset_')) {
		pointBInputs.style.display = 'none';
		const presets = {
			preset_nyc: 'New York City (40.7128, -74.0060)',
			preset_london: 'London (51.5074, -0.1278)',
			preset_tokyo: 'Tokyo (35.6762, 139.6503)',
			preset_paris: 'Paris (48.8566, 2.3522)',
			preset_sydney: 'Sydney (-33.8688, 151.2093)',
		};
		ptBSummary.textContent = presets[mode] || 'Preset selected';
	} else if (mode === 'ip_loc') {
		pointBInputs.style.display = 'none';
		if (lastIpLocation) {
			ptBSummary.textContent = `IP: ${lastIpLocation.ip} (${lastIpLocation.city}, ${lastIpLocation.country})`;
		} else {
			ptBSummary.textContent = 'No IP lookup performed yet.';
		}
	} else if (mode === 'phone_loc') {
		pointBInputs.style.display = 'none';
		if (lastPhoneLocation) {
			ptBSummary.textContent = `Phone: ${lastPhoneLocation.formatted} (${lastPhoneLocation.region})`;
		} else {
			ptBSummary.textContent = 'No phone lookup performed yet.';
		}
	} else {
		pointBInputs.style.display = 'flex';
		ptBSummary.textContent = 'Enter custom Point B coordinates.';
	}
}

function getPointACoordinates() {
	const mode = pointASelect.value;
	if (mode === 'device') {
		return currentDevicePosition ? { lat: currentDevicePosition.latitude, lon: currentDevicePosition.longitude } : null;
	}
	if (mode === 'simulated') {
		return simulatedPosition ? { lat: simulatedPosition.latitude, lon: simulatedPosition.longitude } : null;
	}
	const lat = parseFloat(ptALat.value);
	const lon = parseFloat(ptALon.value);
	return (!isNaN(lat) && !isNaN(lon)) ? { lat, lon } : null;
}

function getPointBCoordinates() {
	const mode = pointBSelect.value;
	const presets = {
		preset_nyc: { lat: 40.7128, lon: -74.0060 },
		preset_london: { lat: 51.5074, lon: -0.1278 },
		preset_tokyo: { lat: 35.6762, lon: 139.6503 },
		preset_paris: { lat: 48.8566, lon: 2.3522 },
		preset_sydney: { lat: -33.8688, lon: 151.2093 },
	};
	if (presets[mode]) return presets[mode];

	if (mode === 'ip_loc') {
		return lastIpLocation ? { lat: lastIpLocation.lat, lon: lastIpLocation.lon } : null;
	}
	if (mode === 'phone_loc') {
		return lastPhoneLocation ? { lat: lastPhoneLocation.lat, lon: lastPhoneLocation.lon } : null;
	}

	const lat = parseFloat(ptBLat.value);
	const lon = parseFloat(ptBLon.value);
	return (!isNaN(lat) && !isNaN(lon)) ? { lat, lon } : null;
}

function calculateDistanceAndHeading() {
	const ptA = getPointACoordinates();
	const ptB = getPointBCoordinates();

	if (!ptA) {
		alert('Please select or specify valid coordinates for Point A.');
		return;
	}
	if (!ptB) {
		alert('Please select or specify valid coordinates for Point B.');
		return;
	}

	const distKm = haversineDistance(ptA.lat, ptA.lon, ptB.lat, ptB.lon);
	const distMi = distKm * 0.621371;
	const distNmi = distKm * 0.539957;

	const bearing = calculateBearing(ptA.lat, ptA.lon, ptB.lat, ptB.lon);
	const cardinal = getCardinalDirection(bearing);

	distResKm.textContent = `${distKm.toFixed(2)} km`;
	distResMi.textContent = `${distMi.toFixed(2)} mi (${distNmi.toFixed(2)} NM)`;
	distResBearing.textContent = `${bearing.toFixed(1)}°`;
	distResCardinal.textContent = cardinal;

	// Travel Times: Walking (5 km/h), Driving (80 km/h), Flight (800 km/h)
	travelWalk.textContent = formatDurationFromHours(distKm / 5);
	travelDrive.textContent = formatDurationFromHours(distKm / 80);
	travelFlight.textContent = formatDurationFromHours(distKm / 800);

	drawLineBtn.disabled = false;

	// Automatically draw path on map
	drawDistanceLineOnMap(ptA, ptB, distKm);
}

function drawDistanceLineOnMap(ptA, ptB, distKm) {
	if (!map || typeof L === 'undefined') return;

	if (distancePolyline) {
		map.removeLayer(distancePolyline);
	}

	const latLngs = [
		[ptA.lat, ptA.lon],
		[ptB.lat, ptB.lon],
	];

	distancePolyline = L.polyline(latLngs, {
		color: '#6366f1',
		weight: 3,
		opacity: 0.85,
		dashArray: '6, 8',
	}).addTo(map);

	distancePolyline.bindPopup(`<b>Distance:</b> ${distKm.toFixed(2)} km<br>From Point A to Point B`).openPopup();
	map.fitBounds(distancePolyline.getBounds(), { padding: [40, 40] });
}

// ── TAB 6: WEATHER & ELEVATION ────────────────────────────────────────────

function getWmoWeatherDescription(code) {
	const wmoMap = {
		0: { label: 'Clear Sky', icon: '☀️' },
		1: { label: 'Mainly Clear', icon: '🌤️' },
		2: { label: 'Partly Cloudy', icon: '⛅' },
		3: { label: 'Overcast', icon: '☁️' },
		45: { label: 'Fog / Mist', icon: '🌫️' },
		48: { label: 'Depositing Rime Fog', icon: '🌫️' },
		51: { label: 'Light Drizzle', icon: '🌦️' },
		53: { label: 'Moderate Drizzle', icon: '🌦️' },
		55: { label: 'Dense Drizzle', icon: '🌦️' },
		56: { label: 'Light Freezing Drizzle', icon: '🌧️' },
		57: { label: 'Dense Freezing Drizzle', icon: '🌧️' },
		61: { label: 'Slight Rain', icon: '🌧️' },
		63: { label: 'Moderate Rain', icon: '🌧️' },
		65: { label: 'Heavy Rain', icon: '🌧️' },
		66: { label: 'Light Freezing Rain', icon: '❄️' },
		67: { label: 'Heavy Freezing Rain', icon: '❄️' },
		71: { label: 'Slight Snow Fall', icon: '🌨️' },
		73: { label: 'Moderate Snow Fall', icon: '🌨️' },
		75: { label: 'Heavy Snow Fall', icon: '🌨️' },
		77: { label: 'Snow Grains', icon: '❄️' },
		80: { label: 'Slight Rain Showers', icon: '🌦️' },
		81: { label: 'Moderate Rain Showers', icon: '🌧️' },
		82: { label: 'Violent Rain Showers', icon: '⛈️' },
		85: { label: 'Slight Snow Showers', icon: '🌨️' },
		86: { label: 'Heavy Snow Showers', icon: '🌨️' },
		95: { label: 'Thunderstorm', icon: '⛈️' },
		96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️' },
		99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️' },
	};
	return wmoMap[code] || { label: 'Variable Conditions', icon: '🌤️' };
}

async function fetchWeatherAndElevation(lat, lon) {
	if (weatherStatusMsg) weatherStatusMsg.textContent = `Fetching atmospheric telemetry for ${lat.toFixed(4)}, ${lon.toFixed(4)}…`;

	try {
		const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m`;
		const response = await fetch(endpoint);
		if (!response.ok) throw new Error('Weather API service error');
		const data = await response.json();

		const current = data.current || {};
		const tempC = current.temperature_2m;
		const feelsC = current.apparent_temperature;
		const humidity = current.relative_humidity_2m;
		const windKmh = current.wind_speed_10m;
		const pressureHpa = current.surface_pressure;
		const precipMm = current.precipitation;
		const code = current.weather_code;
		const elevationM = data.elevation;

		const condition = getWmoWeatherDescription(code);

		if (weatherTemp) weatherTemp.textContent = tempC != null ? tempC.toFixed(1) : '—';
		if (weatherTempF) weatherTempF.textContent = tempC != null ? `(${(tempC * 9 / 5 + 32).toFixed(1)}°F)` : '(—°F)';
		if (weatherCondition) weatherCondition.textContent = condition.label;
		if (weatherIcon) weatherIcon.textContent = condition.icon;
		if (weatherFeels) weatherFeels.textContent = feelsC != null ? `${feelsC.toFixed(1)} °C` : '—';
		if (weatherHumidity) weatherHumidity.textContent = humidity != null ? `${humidity}%` : '—';
		if (weatherWind) weatherWind.textContent = windKmh != null ? `${windKmh.toFixed(1)} km/h` : '—';
		if (weatherPressure) weatherPressure.textContent = pressureHpa != null ? `${pressureHpa.toFixed(1)} hPa` : '—';
		if (weatherPrecip) weatherPrecip.textContent = precipMm != null ? `${precipMm.toFixed(1)} mm` : '—';
		if (weatherElevation) {
			weatherElevation.textContent = elevationM != null
				? `${elevationM.toFixed(1)} m (${(elevationM * 3.28084).toFixed(0)} ft)`
				: '—';
		}

		if (weatherStatusMsg) {
			weatherStatusMsg.textContent = `Telemetry acquired for [${lat.toFixed(4)}, ${lon.toFixed(4)}].`;
		}
	} catch (err) {
		if (weatherStatusMsg) {
			weatherStatusMsg.textContent = 'Failed to fetch weather telemetry. Check connection or try again.';
		}
	}
}

// ── TAB 7: BATCH COORDINATES & CSV UPLOADER ───────────────────────────────

function parseBatchText(rawText) {
	if (!rawText || !rawText.trim()) return [];

	const lines = rawText.split(/\r?\n/);
	const results = [];

	lines.forEach((line, index) => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

		// Check if header row
		if (index === 0 && (trimmed.toLowerCase().includes('lat') || trimmed.toLowerCase().includes('latitude'))) {
			return;
		}

		// Split by comma, semicolon, or tab
		const parts = trimmed.split(/[,;\t]+/).map((p) => p.trim());
		if (parts.length < 2) return;

		const lat = parseFloat(parts[0]);
		const lon = parseFloat(parts[1]);
		const label = parts[2] ? parts.slice(2).join(', ').trim() : `Point #${results.length + 1}`;

		if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
			results.push({ lat, lon, label });
		}
	});

	return results;
}

function plotBatchPoints(points) {
	if (!map || typeof L === 'undefined') return;

	if (batchLayerGroup) {
		batchLayerGroup.clearLayers();
	}

	batchData = points;

	if (points.length === 0) {
		if (batchCount) batchCount.textContent = '0';
		if (batchCentroid) batchCentroid.textContent = '—';
		if (exportBatchGeoJsonBtn) exportBatchGeoJsonBtn.disabled = true;
		if (batchStatusMsg) batchStatusMsg.textContent = 'No valid coordinate pairs found.';
		return;
	}

	const redIcon = L.divIcon({
		className: 'custom-batch-marker',
		html: '<div style="width:14px;height:14px;background:#ef4444;border:2px solid #ffffff;border-radius:50%;box-shadow:0 0 8px #ef4444;"></div>',
		iconSize: [14, 14],
		iconAnchor: [7, 7],
	});

	let sumLat = 0;
	let sumLon = 0;

	points.forEach((pt) => {
		sumLat += pt.lat;
		sumLon += pt.lon;

		const marker = L.marker([pt.lat, pt.lon], { icon: redIcon }).addTo(batchLayerGroup);
		marker.bindPopup(`<b>${escapeHtml(pt.label)}</b><br>Lat: ${pt.lat.toFixed(5)}<br>Lon: ${pt.lon.toFixed(5)}`);
	});

	const avgLat = sumLat / points.length;
	const avgLon = sumLon / points.length;

	if (batchCount) batchCount.textContent = points.length;
	if (batchCentroid) batchCentroid.textContent = `${avgLat.toFixed(4)}, ${avgLon.toFixed(4)}`;
	if (exportBatchGeoJsonBtn) exportBatchGeoJsonBtn.disabled = false;

	if (batchStatusMsg) {
		batchStatusMsg.textContent = `Successfully plotted ${points.length} points on the map.`;
	}

	// Fit map bounds to encompass all plotted points
	if (points.length > 1) {
		map.fitBounds(batchLayerGroup.getBounds(), { padding: [40, 40] });
	} else {
		map.setView([points[0].lat, points[0].lon], 12);
	}
}

function escapeHtml(str) {
	if (!str) return '';
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function exportBatchGeoJSON() {
	if (!batchData || batchData.length === 0) return;

	const geojson = {
		type: 'FeatureCollection',
		features: batchData.map((pt) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [pt.lon, pt.lat],
			},
			properties: {
				name: pt.label || 'Waypoint',
				timestamp: new Date().toISOString(),
			},
		})),
	};

	const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `geointel-batch-${Date.now()}.geojson`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ── TAB 8: ADVANCED MILITARY & MGRS / UTM CONVERTER ────────────────────────

function toDMS(val, isLat) {
	const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
	const absVal = Math.abs(val);
	const deg = Math.floor(absVal);
	const minFloat = (absVal - deg) * 60;
	const min = Math.floor(minFloat);
	const sec = ((minFloat - min) * 60).toFixed(2);
	return `${deg}° ${min}' ${sec}" ${dir}`;
}

function latToUtmBand(lat) {
	const bands = 'CDEFGHJKLMNPQRSTUVWX';
	if (lat < -80 || lat > 84) return '';
	const idx = Math.floor((lat + 80) / 8);
	return bands[Math.min(idx, bands.length - 1)];
}

function toUTM(lat, lon) {
	const a = 6378137.0; // WGS84 major axis
	const f = 1 / 298.257223563; // flattening
	const b = a * (1 - f);
	const e = Math.sqrt(1 - (b * b) / (a * a));
	const ePrimeSq = (e * e) / (1 - e * e);

	const zone = Math.floor((lon + 180) / 6) + 1;
	const centralLon = (zone - 1) * 6 - 180 + 3;
	const k0 = 0.9996;

	const phi = toRadians(lat);
	const lambda = toRadians(lon);
	const lambda0 = toRadians(centralLon);

	const N = a / Math.sqrt(1 - e * e * Math.sin(phi) * Math.sin(phi));
	const T = Math.tan(phi) * Math.tan(phi);
	const C = ePrimeSq * Math.cos(phi) * Math.cos(phi);
	const A = (lambda - lambda0) * Math.cos(phi);

	const M = a * (
		(1 - (e ** 2) / 4 - 3 * (e ** 4) / 64 - 5 * (e ** 6) / 256) * phi -
		(3 * (e ** 2) / 8 + 3 * (e ** 4) / 32 + 45 * (e ** 6) / 1024) * Math.sin(2 * phi) +
		(15 * (e ** 4) / 256 + 45 * (e ** 6) / 1024) * Math.sin(4 * phi) -
		(35 * (e ** 6) / 3072) * Math.sin(6 * phi)
	);

	const easting = k0 * N * (
		A + (1 - T + C) * (A ** 3) / 6 +
		(5 - 18 * T + T * T + 72 * C - 58 * ePrimeSq) * (A ** 5) / 120
	) + 500000;

	let northing = k0 * (
		M + N * Math.tan(phi) * (
			(A ** 2) / 2 +
			(5 - T + 9 * C + 4 * (C ** 2)) * (A ** 4) / 24 +
			(61 - 58 * T + T * T + 600 * C - 330 * ePrimeSq) * (A ** 6) / 720
		)
	);

	if (lat < 0) northing += 10000000;

	const band = latToUtmBand(lat);
	return { zone, band, easting, northing };
}

function toMGRS(lat, lon) {
	const utm = toUTM(lat, lon);
	const { zone, band, easting, northing } = utm;

	// 100k column identification: 24 letters A-Z (excluding I and O)
	const colLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
	const set = (zone - 1) % 6;
	const colOrigin = (set % 3) * 8 + 1;
	const colIdx = (colOrigin - 1 + Math.floor(easting / 100000) - 1) % 24;
	const colChar = colLetters[colIdx >= 0 ? colIdx : 0];

	// 100k row identification: 20 letters A-V (excluding I and O)
	const rowLetters = 'ABCDEFGHJKLMNPQRSTUV';
	const rowOrigin = (zone % 2 === 0) ? 5 : 0;
	const rowIdx = (rowOrigin + Math.floor((northing % 2000000) / 100000)) % 20;
	const rowChar = rowLetters[rowIdx];

	const eVal = Math.floor(easting % 100000).toString().padStart(5, '0');
	const nVal = Math.floor(northing % 100000).toString().padStart(5, '0');

	return `${zone}${band} ${colChar}${rowChar} ${eVal} ${nVal}`;
}

function toMaidenhead(lat, lon) {
	const lonNorm = lon + 180;
	const latNorm = lat + 90;

	const f1 = String.fromCharCode(65 + Math.floor(lonNorm / 20));
	const f2 = String.fromCharCode(65 + Math.floor(latNorm / 10));
	const s1 = Math.floor((lonNorm % 20) / 2);
	const s2 = Math.floor((latNorm % 10) / 1);
	const ss1 = String.fromCharCode(97 + Math.floor((lonNorm % 2) * 12));
	const ss2 = String.fromCharCode(97 + Math.floor((latNorm % 1) * 24));

	return `${f1}${f2}${s1}${s2}${ss1}${ss2}`;
}

function convertCoordinates(lat, lon) {
	if (isNaN(lat) || isNaN(lon)) return;

	// Decimal Degrees
	if (convDd) convDd.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

	// Degrees, Minutes, Seconds
	if (convDms) convDms.textContent = `${toDMS(lat, true)}, ${toDMS(lon, false)}`;

	// UTM
	const utm = toUTM(lat, lon);
	if (convUtm) {
		convUtm.textContent = `${utm.zone}${utm.band} ${Math.round(utm.easting)}m E, ${Math.round(utm.northing)}m N`;
	}

	// MGRS
	const mgrs = toMGRS(lat, lon);
	if (convMgrs) convMgrs.textContent = mgrs;

	// Maidenhead QTH Grid
	const maidenhead = toMaidenhead(lat, lon);
	if (convMaidenhead) convMaidenhead.textContent = maidenhead;

	// What3Words Link
	if (convW3wLink) {
		convW3wLink.href = `https://what3words.com/${lat.toFixed(6)},${lon.toFixed(6)}`;
	}
}

// ── REVERSE GEOCODE ───────────────────────────────────────────────────────

async function reverseGeocode(lat, lon) {
	try {
		const url = new URL('https://nominatim.openstreetmap.org/reverse');
		url.searchParams.set('lat', lat);
		url.searchParams.set('lon', lon);
		url.searchParams.set('format', 'jsonv2');
		url.searchParams.set('zoom', '18');
		url.searchParams.set('addressdetails', '1');

		const response = await fetch(url.toString(), {
			headers: { 'Accept-Language': 'en', 'User-Agent': 'geointel-suite/1.0' },
		});
		if (!response.ok) throw new Error('Address query failed');
		const data = await response.json();
		return data.display_name || 'Address unavailable';
	} catch (e) {
		return 'Tactical coordinates resolved (address service offline)';
	}
}

// ── COPY TO CLIPBOARD & EXPORT ────────────────────────────────────────────

function initCopyButtons() {
	const copyButtons = document.querySelectorAll('.copy-btn');
	copyButtons.forEach((btn) => {
		btn.addEventListener('click', async () => {
			const targetId = btn.dataset.copy;
			const targetEl = document.getElementById(targetId);
			if (!targetEl) return;
			const text = targetEl.textContent.trim();
			if (!text || text === '—') return;

			try {
				await navigator.clipboard.writeText(text);
				const orig = btn.textContent;
				btn.textContent = 'Copied!';
				btn.classList.add('copied');
				setTimeout(() => {
					btn.textContent = orig;
					btn.classList.remove('copied');
				}, 1400);
			} catch (e) {
				// clipboard denied
			}
		});
	});
}

function exportGpx() {
	if (!currentDevicePosition) return;
	const lat = currentDevicePosition.latitude.toFixed(6);
	const lon = currentDevicePosition.longitude.toFixed(6);
	const timeIso = new Date().toISOString();

	const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GeoIntel Suite" xmlns="http://www.topografix.com/GPX/1/1">\n  <wpt lat="${lat}" lon="${lon}">\n    <time>${timeIso}</time>\n    <name>My Location</name>\n  </wpt>\n</gpx>`;

	const blob = new Blob([gpx], { type: 'application/gpx+xml' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `location-fix-${Date.now()}.gpx`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 100);
}

function shareLocation() {
	if (!currentDevicePosition) return;
	const lat = currentDevicePosition.latitude.toFixed(6);
	const lon = currentDevicePosition.longitude.toFixed(6);
	const shareUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
	const shareText = `My Location: ${lat}, ${lon}`;

	if (navigator.share) {
		navigator.share({ title: 'My Coordinates', text: shareText, url: shareUrl }).catch(() => {});
	} else {
		navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
		alert('Location link copied to clipboard!');
	}
}

// ── INITIALIZATION & EVENT LISTENERS ──────────────────────────────────────

function initGeoIntelApp() {
	// Initialize Leaflet Map
	initLeafletMap();

	// Tab switching
	tabButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			switchTab(btn.dataset.tab);
		});
	});

	// Map Style Switcher
	mapStyleBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			setMapStyle(btn.dataset.style);
		});
	});

	// Recenter map
	recenterMapBtn.addEventListener('click', () => {
		if (simulatedPosition) {
			map.setView([simulatedPosition.latitude, simulatedPosition.longitude], 15);
		} else if (currentDevicePosition) {
			map.setView([currentDevicePosition.latitude, currentDevicePosition.longitude], 15);
		} else if (lastIpLocation) {
			map.setView([lastIpLocation.lat, lastIpLocation.lon], 11);
		} else {
			map.setView([20, 0], 2);
		}
	});

	// Clear pins
	clearPinsBtn.addEventListener('click', clearAllPins);

	// Tab 1 Events
	findMeBtn.addEventListener('click', detectDeviceLocation);
	liveTrackBtn.addEventListener('click', toggleLiveTracking);
	shareLocBtn.addEventListener('click', shareLocation);
	exportGpxBtn.addEventListener('click', exportGpx);

	// Tab 2 Events (IP)
	ipSearchForm.addEventListener('submit', (e) => {
		e.preventDefault();
		lookupIpAddress(ipInput.value);
	});
	myIpBtn.addEventListener('click', useMyCurrentIp);
	viewIpOnMapBtn.addEventListener('click', () => {
		if (lastIpLocation && map) {
			map.setView([lastIpLocation.lat, lastIpLocation.lon], 13);
		}
	});
	setIpAsTargetBtn.addEventListener('click', () => {
		if (!lastIpLocation) return;
		pointBSelect.value = 'ip_loc';
		updatePointBSummary();
		switchTab('distance-tab');
	});

	// Tab 3 Events (Phone)
	phoneSearchForm.addEventListener('submit', (e) => {
		e.preventDefault();
		analyzePhoneNumber(phoneInput.value);
	});
	if (phoneCountrySelect) {
		phoneCountrySelect.addEventListener('change', () => {
			if (phoneInput.value.trim()) {
				analyzePhoneNumber(phoneInput.value);
			}
		});
	}
	sampleBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			phoneInput.value = btn.dataset.phone;
			analyzePhoneNumber(btn.dataset.phone);
		});
	});
	viewPhoneOnMapBtn.addEventListener('click', () => {
		if (lastPhoneLocation && map) {
			map.setView([lastPhoneLocation.lat, lastPhoneLocation.lon], 10);
		}
	});
	setPhoneAsTargetBtn.addEventListener('click', () => {
		if (!lastPhoneLocation) return;
		pointBSelect.value = 'phone_loc';
		updatePointBSummary();
		switchTab('distance-tab');
	});

	// Tab 4 Events (Simulator)
	placeSearchForm.addEventListener('submit', (e) => {
		e.preventDefault();
		searchPlaceGeocode(placeSearchInput.value);
	});
	applyCoordsBtn.addEventListener('click', () => {
		const lat = parseFloat(simLatInput.value);
		const lon = parseFloat(simLonInput.value);
		if (!isNaN(lat) && !isNaN(lon)) {
			setSimulatedLocation(lat, lon);
		} else {
			alert('Please enter valid numerical Latitude and Longitude values.');
		}
	});
	centerSimBtn.addEventListener('click', () => {
		if (simulatedPosition && map) {
			map.setView([simulatedPosition.latitude, simulatedPosition.longitude], 15);
		}
	});
	clearSimBtn.addEventListener('click', () => {
		simulatedPosition = null;
		if (simMarker) { map.removeLayer(simMarker); simMarker = null; }
		simCoordsDisplay.textContent = '—';
		simAddressDisplay.textContent = '—';
		simDistFromReal.textContent = '—';
		simBearingFromReal.textContent = '—';
		simStatusMsg.textContent = 'Simulated GPS reset. Active reference returned to Device GPS.';
		centerSimBtn.disabled = true;
		updatePointASummary();
	});

	// Tab 5 Events (Distance)
	pointASelect.addEventListener('change', updatePointASummary);
	pointBSelect.addEventListener('change', updatePointBSummary);
	calcDistBtn.addEventListener('click', calculateDistanceAndHeading);
	drawLineBtn.addEventListener('click', () => {
		const ptA = getPointACoordinates();
		const ptB = getPointBCoordinates();
		if (ptA && ptB) {
			const distKm = haversineDistance(ptA.lat, ptA.lon, ptB.lat, ptB.lon);
			drawDistanceLineOnMap(ptA, ptB, distKm);
		}
	});

	// Tab 6 Events (Weather & Elevation)
	if (weatherMyGpsBtn) {
		weatherMyGpsBtn.addEventListener('click', () => {
			if (currentDevicePosition) {
				weatherLatInput.value = currentDevicePosition.latitude.toFixed(6);
				weatherLonInput.value = currentDevicePosition.longitude.toFixed(6);
				fetchWeatherAndElevation(currentDevicePosition.latitude, currentDevicePosition.longitude);
			} else {
				detectDeviceLocation();
			}
		});
	}

	if (weatherSimBtn) {
		weatherSimBtn.addEventListener('click', () => {
			if (simulatedPosition) {
				weatherLatInput.value = simulatedPosition.latitude.toFixed(6);
				weatherLonInput.value = simulatedPosition.longitude.toFixed(6);
				fetchWeatherAndElevation(simulatedPosition.latitude, simulatedPosition.longitude);
			} else {
				alert('No simulated location set. Click on the map or configure Tab 4 first.');
			}
		});
	}

	if (weatherIpBtn) {
		weatherIpBtn.addEventListener('click', () => {
			if (lastIpLocation) {
				weatherLatInput.value = lastIpLocation.lat.toFixed(6);
				weatherLonInput.value = lastIpLocation.lon.toFixed(6);
				fetchWeatherAndElevation(lastIpLocation.lat, lastIpLocation.lon);
			} else {
				alert('No IP location resolved yet. Run an IP lookup in Tab 2 first.');
			}
		});
	}

	if (weatherCoordsForm) {
		weatherCoordsForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const lat = parseFloat(weatherLatInput.value);
			const lon = parseFloat(weatherLonInput.value);
			if (!isNaN(lat) && !isNaN(lon)) {
				fetchWeatherAndElevation(lat, lon);
			} else {
				alert('Please enter valid numeric latitude and longitude.');
			}
		});
	}

	// Tab 7 Events (Batch Coordinates)
	if (plotBatchBtn) {
		plotBatchBtn.addEventListener('click', () => {
			const points = parseBatchText(batchTextarea.value);
			plotBatchPoints(points);
		});
	}

	if (loadSampleBatchBtn) {
		loadSampleBatchBtn.addEventListener('click', () => {
			const sample = [
				'37.7749, -122.4194, San Francisco CA',
				'40.7128, -74.0060, New York NY',
				'51.5074, -0.1278, London UK',
				'35.6762, 139.6503, Tokyo JP',
				'-33.8688, 151.2093, Sydney AU',
				'48.8566, 2.3522, Paris FR',
				'1.3521, 103.8198, Singapore SG',
			].join('\n');
			batchTextarea.value = sample;
			const points = parseBatchText(sample);
			plotBatchPoints(points);
		});
	}

	if (clearBatchBtn) {
		clearBatchBtn.addEventListener('click', () => {
			batchTextarea.value = '';
			if (batchLayerGroup) batchLayerGroup.clearLayers();
			batchData = [];
			if (batchCount) batchCount.textContent = '0';
			if (batchCentroid) batchCentroid.textContent = '—';
			if (exportBatchGeoJsonBtn) exportBatchGeoJsonBtn.disabled = true;
			if (batchStatusMsg) batchStatusMsg.textContent = 'Batch entries cleared.';
		});
	}

	if (batchFileInput) {
		batchFileInput.addEventListener('change', (e) => {
			const file = e.target.files && e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (ev) => {
				const text = ev.target.result;
				batchTextarea.value = text;
				const points = parseBatchText(text);
				plotBatchPoints(points);
			};
			reader.readAsText(file);
		});
	}

	if (exportBatchGeoJsonBtn) {
		exportBatchGeoJsonBtn.addEventListener('click', exportBatchGeoJSON);
	}

	// Tab 8 Events (Military Converter)
	if (convMyGpsBtn) {
		convMyGpsBtn.addEventListener('click', () => {
			if (currentDevicePosition) {
				convLatInput.value = currentDevicePosition.latitude.toFixed(6);
				convLonInput.value = currentDevicePosition.longitude.toFixed(6);
				convertCoordinates(currentDevicePosition.latitude, currentDevicePosition.longitude);
			} else {
				detectDeviceLocation();
			}
		});
	}

	if (convSimBtn) {
		convSimBtn.addEventListener('click', () => {
			if (simulatedPosition) {
				convLatInput.value = simulatedPosition.latitude.toFixed(6);
				convLonInput.value = simulatedPosition.longitude.toFixed(6);
				convertCoordinates(simulatedPosition.latitude, simulatedPosition.longitude);
			} else {
				alert('No simulated location set. Click on the map or configure Tab 4 first.');
			}
		});
	}

	if (convForm) {
		convForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const lat = parseFloat(convLatInput.value);
			const lon = parseFloat(convLonInput.value);
			if (!isNaN(lat) && !isNaN(lon)) {
				convertCoordinates(lat, lon);
			} else {
				alert('Please enter valid numeric latitude and longitude.');
			}
		});
	}

	// Initialize copy buttons
	initCopyButtons();

	// Check permissions on startup
	if (navigator.permissions && navigator.permissions.query) {
		navigator.permissions.query({ name: 'geolocation' }).then((res) => {
			if (res.state === 'granted') {
				permissionHint.textContent = 'Permission granted. Click "Detect My Location" to start.';
			} else if (res.state === 'prompt') {
				permissionHint.textContent = 'Browser location permission required on request.';
			} else {
				permissionHint.textContent = 'Permission denied in browser settings.';
			}
		}).catch(() => {});
	}
}

// Boot on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initGeoIntelApp);
} else {
	initGeoIntelApp();
}
