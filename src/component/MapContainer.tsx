import React from 'react';
import { EmergencyRequest } from '../App';
import styles from '../styles/MapContainer.module.css';
import { AlertCircle } from 'lucide-react';

interface MapContainerProps {
  requests: EmergencyRequest[];
}

export const MapContainer: React.FC<MapContainerProps> = ({ requests }) => {
  return (
    <div className={styles.mapContainer}>
      {/* Map Overlay Grid */}
      <div className={styles.mapGrid}>
        {/* Simulate map tiles */}
        <div className={styles.mapTile}></div>
      </div>
      
      {/* Emergency Pins */}
      <div className={styles.pinsContainer}>
        {requests.map((request, index) => (
          <div 
            key={request.id}
            className={styles.pin}
            style={{
              top: `${20 + index * 15}%`,
              left: `${25 + index * 12}%`
            }}
          >
            <div className={styles.pinIcon}>
              <AlertCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div className={styles.pinPulse}></div>
          </div>
        ))}
      </div>
    </div>
  );
};