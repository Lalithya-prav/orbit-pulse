import React, { useState, useEffect, useMemo } from 'react';
import GlobeView from './components/GlobeView';
import TelemetryHUD from './components/TelemetryHUD';
import {
  FALLBACK_TLE,
  parseTLEData,
  getSatellitePosition,
  getOrbitPath,
} from './utils/orbitalMath';

const CELESTRAK_URL =
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';

export default function App() {
  const [rawSats, setRawSats] = useState([]);
  const [liveSats, setLiveSats] = useState([]);
  const [selectedName, setSelectedName] = useState('ISS (ZARYA)');
  const [autoFollow, setAutoFollow] = useState(false);
  const [dataSource, setDataSource] = useState('INITIALIZING...');
  const [utcTime, setUtcTime] = useState('');

  // 1. Fetch live TLEs from NORAD/CelesTrak on startup
  useEffect(() => {
    async function loadTLEs() {
      try {
        const res = await fetch(CELESTRAK_URL);
        if (!res.ok) throw new Error('CelesTrak HTTP error');
        const text = await res.text();
        const parsed = parseTLEData(text).slice(0, 15); // Keep top 15 stations/objects clean
        if (parsed.length === 0) throw new Error('Empty TLE payload');
        setRawSats(parsed);
        setSelectedName(parsed[0].name);
        setDataSource('CELESTRAK NORAD LIVE');
      } catch (err) {
        const fallback = parseTLEData(FALLBACK_TLE);
        setRawSats(fallback);
        setSelectedName(fallback[0].name);
        setDataSource('CACHED EPHEMERIS');
      }
    }
    loadTLEs();
  }, []);

  // 2. Propagate orbital positions every 1 second
  useEffect(() => {
    if (rawSats.length === 0) return;

    const updatePositions = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19));

      const updated = rawSats
        .map((sat) => {
          const pos = getSatellitePosition(sat.satrec, now);
          return pos ? { ...sat, ...pos } : null;
        })
        .filter(Boolean);

      setLiveSats(updated);
    };

    updatePositions();
    const timer = setInterval(updatePositions, 1000);
    return () => clearInterval(timer);
  }, [rawSats]);

  const selectedSat = useMemo(
    () => liveSats.find((s) => s.name === selectedName) || liveSats[0],
    [liveSats, selectedName]
  );

  // 3. Calculate 95-minute predicted ground track when target changes
  const orbitPath = useMemo(() => {
    if (!selectedSat?.satrec) return [];
    return getOrbitPath(selectedSat.satrec, 95, 1.5);
  }, [selectedSat?.name]);

  return (
    <main className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      <TelemetryHUD
        satellites={liveSats}
        selectedSat={selectedSat}
        onSelectSat={(sat) => setSelectedName(sat.name)}
        autoFollow={autoFollow}
        setAutoFollow={setAutoFollow}
        dataSource={dataSource}
        utcTime={utcTime}
      />

      <GlobeView
        satellites={liveSats}
        selectedSat={selectedSat}
        orbitPath={orbitPath}
        onSelectSat={(sat) => setSelectedName(sat.name)}
        autoFollow={autoFollow}
      />
    </main>
  );
}