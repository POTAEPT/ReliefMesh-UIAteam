import React, { useState, useRef, useEffect } from 'react';
import { MapContainer } from './MapContainer';
import { RequestCard } from './RequestCard';
import { FAB } from './FAB';
import { SOSModal } from './SOSModal';
import { type EmergencyRequest } from '../App';
import styles from '../styles/Dashboard.module.css';

interface DashboardViewProps {
  onViewRequest: (request: EmergencyRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onViewRequest }) => {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  
  // --- State และ Ref สำหรับการลาก ---
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

  // --- Mock Data ---
  const emergencyRequests: EmergencyRequest[] = [
    {
      id: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      needs: ['Water', 'Food', 'First Aid'],
      proximity: '0.3 km away',
      location: { lat: 34.0522, lng: -118.2437, address: '123 Main St, Los Angeles, CA' },
      timestamp: '5 min ago',
      description: 'Trapped on second floor with family of 4. Water rising quickly. Need immediate evacuation and supplies.',
      urgencyLevel: 'critical'
    },
    {
      id: '2',
      userName: 'Michael Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      needs: ['Boat', 'Rescue'],
      proximity: '0.8 km away',
      location: { lat: 34.0622, lng: -118.2537, address: '456 Oak Ave, Los Angeles, CA' },
      timestamp: '12 min ago',
      description: 'Elderly neighbors need evacuation. Cannot swim. Water level at 4 feet and rising.',
      urgencyLevel: 'critical'
    },
    {
      id: '3',
      userName: 'Emily Rodriguez',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      needs: ['Medicine', 'Water'],
      proximity: '1.2 km away',
      location: { lat: 34.0422, lng: -118.2337, address: '789 Pine Rd, Los Angeles, CA' },
      timestamp: '18 min ago',
      description: 'Diabetic patient running out of insulin. Need medical supplies and clean water urgently.',
      urgencyLevel: 'high'
    },
    {
      id: '4',
      userName: 'David Park',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      needs: ['Generator', 'Food'],
      proximity: '2.1 km away',
      location: { lat: 34.0722, lng: -118.2637, address: '321 Elm St, Los Angeles, CA' },
      timestamp: '25 min ago',
      description: 'Power out for 12 hours. Food spoiling. Baby formula needs refrigeration.',
      urgencyLevel: 'high'
    }
  ];

  const handleSOSSubmit = (data: { needs: string[]; details: string; location: string }) => {
    console.log('SOS Request submitted:', data);
    setIsSOSModalOpen(false);
  };

  // --- UseEffect Logic ---
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
      <MapContainer requests={emergencyRequests} />
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>ReliefMesh</h1>
          <div className={styles.headerStats}>
            <span className={styles.activeRequests}>{emergencyRequests.length} Active</span>
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
        {/* ✅✅✅ ส่วนที่แก้ไข: แยกพื้นที่จับ (ใส) กับตัวขีด (เทา) ออกจากกัน */}
        <div 
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          style={{ 
            cursor: 'grab', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '12px 0', /* เพิ่มพื้นที่ให้กดง่าย */
            background: 'transparent' /* พื้นหลังใส ไม่บังความโค้ง */
          }}
        >
          {/* อันนี้คือขีดเล็กๆ ตรงกลาง */}
          <div className={styles.bottomSheetHandle}></div>
        </div>

        <div className={styles.bottomSheetHeader}>
          <h2 className={styles.bottomSheetTitle}>Urgent Requests</h2>
          <span className={styles.bottomSheetSubtitle}>Real-time updates from your area</span>
        </div>

        <div className={styles.requestFeed} style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
          {emergencyRequests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request}
              onViewDetails={() => onViewRequest(request)}
            />
          ))}
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