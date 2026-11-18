import * as satellite from 'satellite.js';

// Fallback TLE dataset so the app always works offline or if rate-limited
export const FALLBACK_TLE = `ISS (ZARYA)
1 25544U 98067A   26320.51824074  .00016717  00000-0  30142-3 0  9991
2 25544  51.6402 184.2311 0006784  85.1234 275.0412 15.49812345481234
CSS (TIANHE)
1 48274U 21035A   26320.49123456  .00021045  00000-0  26412-3 0  9994
2 48274  41.4712 210.5432 0005123 112.4567 247.6789 15.60123456312345
HST (HUBBLE)
1 20580U 90037B   26320.41234567  .00001423  00000-0  72345-4 0  9998
2 20580  28.4698 142.8765 0002456 265.1234  94.9876 15.09123456891234
NOAA 19
1 33591U 09005A   26320.55678901  .00000112  00000-0  84567-4 0  9992
2 33591  99.1845 312.4567 0014123 198.7654 161.2345 14.12567890912345
TERRA
1 25994U 99068A   26320.48765432  .00000234  00000-0  61234-4 0  9995
2 25994  98.2045  34.5678 0001234  91.2345 268.8765 14.57123456412345`;

export function parseTLEData(tleText) {
  const lines = tleText
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const satellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (!lines[i + 2]) break;
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];

    // Extract orbital metadata directly from TLE Line 2
    const inclination = parseFloat(tle2.substring(8, 16)).toFixed(2);
    const meanMotion = parseFloat(tle2.substring(52, 63)); // revs per day
    const periodMinutes = (1440 / meanMotion).toFixed(1);

    satellites.push({
      name,
      tle1,
      tle2,
      inclination,
      periodMinutes,
      satrec: satellite.twoline2satrec(tle1, tle2),
    });
  }
  return satellites;
}

export function getSatellitePosition(satrec, date = new Date()) {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const velocityEci = positionAndVelocity.velocity;

  if (!positionEci || typeof positionEci === 'boolean') return null;

  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);

  const lng = satellite.degreesLong(positionGd.longitude);
  const lat = satellite.degreesLat(positionGd.latitude);
  const alt = positionGd.height; // km

  const speed = Math.sqrt(
    velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2
  );

  return { lat, lng, alt, speed };
}

export function getOrbitPath(satrec, minutes = 95, step = 1.5) {
  const path = [];
  const now = new Date();

  for (let m = 0; m <= minutes; m += step) {
    const futureTime = new Date(now.getTime() + m * 60000);
    const pos = getSatellitePosition(satrec, futureTime);
    if (pos && !Number.isNaN(pos.lat)) {
      path.push({
        lat: pos.lat,
        lng: pos.lng,
        alt: pos.alt / 6371, // Normalized to Earth radii for globe.gl
      });
    }
  }
  return path;
}