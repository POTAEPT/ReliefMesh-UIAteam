import React from 'react';
import { type EmergencyRequest } from '../App';
import styles from '../styles/MapContainer.module.css';
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapContainerProps {
  requests: EmergencyRequest[];
}

// สร้าง Custom Icon ที่ดึงเอา Class 'pinIcon' และ 'pinPulse' จาก CSS เดิมมาใช้
const createCustomIcon = () => {
  return new L.DivIcon({
    className: '', // ลบ default class ออก
    html: `
      <div class="${styles.pin}">
        <div class="${styles.pinIcon}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="${styles.pinPulse}"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24], // ให้จุดศูนย์กลางอยู่ตรงกลาง icon
  });
};

export const MapContainer: React.FC<MapContainerProps> = ({ requests }) => {
  const centerPosition: [number, number] = [13.7563, 100.5018];

  return (
    <div className={styles.mapContainer}>
      <LeafletMap 
        center={centerPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {requests.map((request) => (
          <Marker 
            key={request.id} 
            position={centerPosition} // เปลี่ยนเป็นพิกัดจริงของ request ถ้ามี
            icon={createCustomIcon()}
          />
        ))}
      </LeafletMap>
    </div>
  );
};