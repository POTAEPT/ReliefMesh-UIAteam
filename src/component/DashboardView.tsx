import React, { useState } from 'react';
import { MapContainer } from './MapContainer';
import { RequestCard } from './RequestCard';
import { FAB } from './FAB';
import { SOSModal } from './SOSModal';
import { type EmergencyRequest } from '../App';
import { useRelief } from '../hooks/useRelief'; // Import Hook
import styles from '../styles/Dashboard.module.css';

interface DashboardViewProps {
  onViewRequest: (request: EmergencyRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onViewRequest }) => {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  
  // เรียกใช้ Hook แทน Mock Data
  const { sosList, sendSOS } = useRelief();

  const handleSOSSubmit = (data: { needs: string[]; details: string; location: string; lat: number; lng: number }) => {
    // ส่งข้อมูลเข้า P2P Network
    sendSOS(data);
    setIsSOSModalOpen(false);
  };

  return (
    <div className={styles.dashboard}>
      {/* ส่ง sosList (ข้อมูลจริง) ไปแสดงบนแผนที่ */}
      <MapContainer requests={sosList} />
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>ReliefMesh</h1>
          <div className={styles.headerStats}>
            <span className={styles.activeRequests}>{sosList.length} Active</span>
          </div>
        </div>
      </header>

      <div className={styles.bottomSheet}>
        <div className={styles.bottomSheetHandle}></div>
        <div className={styles.bottomSheetHeader}>
          <h2 className={styles.bottomSheetTitle}>Urgent Requests</h2>
          <span className={styles.bottomSheetSubtitle}>Real-time updates from P2P Network</span>
        </div>
        <div className={styles.requestFeed}>
          {/* แสดงรายการจากข้อมูลจริง */}
          {sosList.length === 0 ? (
            <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
              Waiting for signals...
            </div>
          ) : (
            sosList.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request}
                onViewDetails={() => onViewRequest(request)}
              />
            ))
          )}
        </div>
      </div>

      <FAB onClick={() => setIsSOSModalOpen(true)} />

      {isSOSModalOpen && (
        <SOSModal 
          onClose={() => setIsSOSModalOpen(false)}
          onSubmit={handleSOSSubmit}
        />
      )}
    </div>
  );
};