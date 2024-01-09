import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const MyMapComponent = () => {
  // Initial state for marker, let's say it starts at (0, 0)
  const [markerPosition, setMarkerPosition] = useState([0, 0]);

  // Simulated data update: you would replace this with your actual data source
  useEffect(() => {
    const updateMarker = () => {
      // Simulated new coordinates: Replace with actual new coordinates
      const newLat = Math.random() * 100;
      const newLng = Math.random() * 100;

      setMarkerPosition([newLat, newLng]);
    };

    const interval = setInterval(updateMarker, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval); // Cleanup when the component is unmounted
    };
  }, []);

  return (

    <MapContainer center={[0, 0]} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={markerPosition} />
    </MapContainer>

  );
};

export default MyMapComponent;
