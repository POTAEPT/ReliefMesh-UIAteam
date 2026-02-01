import React, { useState, useRef, useEffect } from 'react';
import { MapContainer } from './MapContainer';
import { RequestCard } from './RequestCard';
import { FAB } from './FAB';
import { SOSModal } from './SOSModal';
import { type EmergencyRequest } from '../App';
import { useRelief } from '../hooks/useRelief'; // <--- 1. Import Hook กลับมา
import styles from '../styles/Dashboard.module.css';

interface DashboardViewProps {
  onViewRequest: (request: EmergencyRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onViewRequest }) => {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  
  // <--- 2. เรียกใช้ข้อมูลจริงจาก Gun.js (แทน Mock Data)
  const { sosList, sendSOS } = useRelief();

  // --- State และ Ref สำหรับการลาก (เก็บของเพื่อนไว้) ---
  const [panelHeight, setPanelHeight] = useState(400); 
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // --- ฟังก์ชันเริ่มลาก ---
  const handleDragStart = (clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    startHeight.current = panelHeight;
    document.body.style.cursor = 'grabbing';
  };

  // --- ฟังก์ชัน Submit (แก้ให้ส่งเข้า Gun) ---
  const handleSOSSubmit = (data: { needs: string[]; details: string; location: string; lat: number; lng: number }) => {
    // ส่งข้อมูลเข้า P2P Network
    sendSOS(data);
    setIsSOSModalOpen(false);
  };

  // --- UseEffect Logic สำหรับการลาก (เก็บของเพื่อนไว้) ---
  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!isDragging.current) return;
      
      const delta = startY.current - clientY; 
      const newHeight = startHeight.current + delta;
      const maxHeight = window.innerHeight * 0.9; 

      if (newHeight > 150 && newHeight < maxHeight) {
        setPanelHeight(newHeight);
      }
    };

    const handleEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* 3. ส่งข้อมูลจริง (sosList) ไปให้ Map */}
      <MapContainer requests={sosList} />
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>ReliefMesh</h1>
          <div className={styles.headerStats}>
            <span className={styles.activeRequests}>{sosList.length} Active</span>
          </div>
        </div>
      </header>

      <div 
        className={styles.bottomSheet}
        style={{ 
          height: `${panelHeight}px`,
          transition: isDragging.current ? 'none' : 'height 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* ส่วน Header สำหรับลาก */}
        <div 
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          style={{ 
            cursor: 'grab', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '12px 0', 
            background: 'transparent'
          }}
        >
          <div className={styles.bottomSheetHandle}></div>
        </div>

        <div className={styles.bottomSheetHeader}>
          <h2 className={styles.bottomSheetTitle}>Urgent Requests</h2>
          <span className={styles.bottomSheetSubtitle}>Real-time updates from P2P Network</span>
        </div>

        <div className={styles.requestFeed} style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
          {/* 4. Loop ข้อมูลจริงมาแสดง (ถ้าไม่มีให้ขึ้น Waiting) */}
          {sosList.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
              <p>Waiting for signals...</p>
              <small>No active SOS within range</small>
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