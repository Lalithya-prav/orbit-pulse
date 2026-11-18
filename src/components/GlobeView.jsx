import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeView({
  satellites,
  selectedSat,
  orbitPath,
  onSelectSat,
  autoFollow,
}) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Keep the 3D WebGL canvas full-screen on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth camera transition when switching satellites or when autoFollow is active
  useEffect(() => {
    if (selectedSat && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: selectedSat.lat, lng: selectedSat.lng, altitude: 2.0 },
        autoFollow ? 800 : 1200
      );
    }
  }, [selectedSat?.name, autoFollow ? Math.round(selectedSat?.lat) : null]);

  return (
    <div className="fixed inset-0 w-screen h-screen cursor-move">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
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