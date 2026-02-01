import React from 'react';
import { type EmergencyRequest } from '../App';
import { ArrowLeft, MapPin, Clock, AlertCircle, Wallet } from 'lucide-react';
import styles from '../styles/DonationDetail.module.css';

// 1. เพิ่ม Import สำหรับแผนที่ (Leaflet)
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapStyles from '../styles/MapContainer.module.css'; // เรียกใช้ Style ของ Pin จากไฟล์ MapContainer

interface DonationDetailViewProps {
  request: EmergencyRequest;
  onBack: () => void;
}

// 2. ฟังก์ชันสร้าง Icon (Custom Pin)
const createCustomIcon = () => {
  return new L.DivIcon({
    className: '', 
    html: `
      <div class="${mapStyles.pin}">
        <div class="${mapStyles.pinIcon}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="${mapStyles.pinPulse}"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24], 
  });
};

export const DonationDetailView: React.FC<DonationDetailViewProps> = ({ request, onBack }) => {
  const handleConnectWallet = () => {
    console.log('Connect wallet initiated');
    alert('Wallet connection would be initiated here. In production, this would integrate with Web3 wallet providers.');
  };

  // พิกัดของเคสปัจจุบัน
  const position: [number, number] = [request.location.lat, request.location.lng];

  return (
    <div className={styles.detailView}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={24} color="#1F2937" />
        </button>
        <h1 className={styles.headerTitle}>Request Details</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      {/* Content Container */}
      <div className={styles.contentContainer}>
        
        {/* 3. ส่วนแผนที่ (แก้จากกล่องสีม่วงเดิม เป็นแผนที่จริง) */}
        <div className={styles.mapSnippet} style={{ background: '#E5E7EB' }}>
          <LeafletMap 
            center={position} 
            zoom={15} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            scrollWheelZoom={false} // ปิดการเลื่อนเมาส์เพื่อซูม (กัน user รำคาญเวลาเลื่อนหน้าจอ)
            dragging={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker 
              position={position} 
              icon={createCustomIcon()}
            />
          </LeafletMap>
        </div>

        {/* Request Card */}
        <div className={styles.requestCard}>
          {/* User Section */}
          <div className={styles.userSection}>
            <img 
              src={request.userAvatar} 
              alt={request.userName}
              className={styles.userAvatar}
            />
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>{request.userName}</h2>
              <div className={styles.userMeta}>
                <div className={styles.metaItem}>
                  <Clock size={16} color="#6B7280" />
                  <span className={styles.metaText}>{request.timestamp}</span>
                </div>
                <div className={styles.metaItem}>
                  <MapPin size={16} color="#E63946" />
                  <span className={styles.metaText}>{request.proximity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Banner */}
          {request.urgencyLevel === 'critical' && (
            <div className={styles.urgencyBanner}>
              <AlertCircle size={20} color="#991B1B" />
              <span className={styles.urgencyText} style={{ color: '#991B1B' }}>CRITICAL EMERGENCY</span>
            </div>
          )}

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Situation</h3>
            <p className={styles.description}>{request.description}</p>
          </div>

          {/* Needs Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Immediate Needs</h3>
            <div className={styles.needsGrid}>
              {request.needs.map((need, index) => (
                <div key={index} className={styles.needItem}>
                  <div className={styles.needIcon}>
                    <AlertCircle size={20} color="#E63946" />
                  </div>
                  <span className={styles.needText}>{need}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.locationCard}>
              <MapPin size={20} color="#E63946" />
              <div className={styles.locationInfo}>
                <span className={styles.locationAddress}>{request.location.address}</span>
                <span className={styles.locationCoords}>
                  {request.location.lat.toFixed(4)}, {request.location.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <button 
            className={styles.donateButton}
            onClick={handleConnectWallet}
          >
            <Wallet size={22} color="#FFFFFF" />
            <span>Connect Wallet to Donate</span>
          </button>
          <p className={styles.actionNote}>
            Your donation will be sent directly to help this emergency request
          </p>
        </div>
      </div>
    </div>
  );
};