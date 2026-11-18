import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeView({
  satellites,
  selectedSat,
  orbitPath,
  onSelectSat,
  autoFollow,
}) {
  const globeRef = useRef();

  // Smooth camera transition when switching satellites or when autoFollow is active
  useEffect(() => {
    if (selectedSat && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: selectedSat.lat, lng: selectedSat.lng, altitude: 1.9 },
        autoFollow ? 800 : 1200
      );
    }
  }, [selectedSat?.name, autoFollow ? Math.round(selectedSat?.lat) : null]);

  return (
    <div className="w-full h-full cursor-move">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.18}
        pointsData={satellites}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={(d) => d.alt / 6371}
        pointColor={(d) => (d.name === selectedSat?.name ? '#38bdf8' : '#f43f5e')}
        pointRadius={(d) => (d.name === selectedSat?.name ? 0.65 : 0.35)}
        pointLabel={(d) => `
          <div style="background: rgba(15, 23, 42, 0.9); padding: 6px 10px; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 12px;">
            <strong style="color: #38bdf8;">${d.name}</strong><br/>
            ALT: ${Math.round(d.alt)} km | VEL: ${d.speed.toFixed(2)} km/s
          </div>
        `}
        onPointClick={onSelectSat}
        pathsData={orbitPath.length ? [orbitPath] : []}
        pathPoints={(d) => d}
        pathPointLat="lat"
        pathPointLng="lng"
        pathPointAlt="alt"
        pathColor={() => ['rgba(56, 189, 248, 0.95)', 'rgba(56, 189, 248, 0.1)']}
        pathStroke={2.2}
      />
    </div>
  );
}