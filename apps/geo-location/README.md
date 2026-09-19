# GeoIntel // Geospatial & Network Intelligence Suite

A clean, modern, and professional geospatial and network intelligence suite built with vanilla JavaScript, HTML5 Geolocation API, and Leaflet maps.

## Features

- **Device GPS & Live Tracking**: Precise real-time coordinates (Lat/Lon), accuracy radius ($\pm\text{m}$), altitude, speed, compass bearing, and reverse geocoded street address.
- **IP Address Geolocation & Recon**: Query any IPv4, IPv6, or domain name (or detect current public IP) to resolve country, city, region, ISP, ASN, timezone, and map coordinates.
- **Phone Number Intelligence & Region Geocoding**: Parse international phone numbers (E.164 format) to identify country of origin, regional area code/city, carrier prefix, line type, and timezone.
- **Location Simulator ("Change GPS")**: Override your active location by searching any place or address (Nominatim forward geocoding), entering custom Lat/Lon coordinates, or clicking anywhere directly on the interactive map with a draggable pin.
- **Distance & Rangefinder Calculator**: Compute Great-Circle geodesic distance, true compass bearing, and walking/driving/flight duration estimates between any two points (Device GPS, Simulated Pin, IP location, Phone region, or custom coordinates).
- **Live Weather & Atmosphere**: Real-time atmospheric telemetry (temperature, feels like, humidity, wind velocity, barometric pressure, precipitation, and WMO conditions) and elevation above sea level powered by Open-Meteo (100% free, no API key required).
- **Batch Coordinates & CSV Uploader**: Plot multiple points simultaneously on the map from pasted coordinate pairs or uploaded CSV/TXT files, with automatic centroid calculation and GeoJSON export.
- **Advanced Military & Coordinate Converter**: Convert coordinates between Decimal Degrees (DD), Degrees-Minutes-Seconds (DMS), Universal Transverse Mercator (UTM), Military Grid Reference System (MGRS), Amateur Radio Maidenhead Grid (QTH), and direct What3Words locator links.
- **Interactive Multi-Layer Map (100% Key-Free & No 403 Blocks)**: Esri ArcGIS CDN tile integration with Dark Canvas (`Canvas/World_Dark_Gray_Base`), Street Map (`World_Street_Map`), Satellite Imagery (`World_Imagery`), and Topographic Terrain (`World_Topo_Map`) layers requiring zero API keys, no watermarks, and no 403 usage policy blocks.
- **Data Export & Sharing**: Export location fixes to standard GPX format, batch waypoints to GeoJSON, or share coordinates with native dialog/clipboard.
