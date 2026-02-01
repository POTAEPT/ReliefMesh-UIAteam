import React, { useState } from 'react'; // <--- เพิ่ม useState
import { type EmergencyRequest } from '../App';
import { ArrowLeft, MapPin, Clock, AlertCircle, Wallet, CheckCircle } from 'lucide-react';
import styles from '../styles/DonationDetail.module.css';

// 1. เพิ่ม Import สำหรับแผนที่ (Leaflet)
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapStyles from '../styles/MapContainer.module.css'; // เรียกใช้ Style ของ Pin จากไฟล์ MapContainer

interface DonationDetailViewProps {
  onBack: () => void;
}

// Custom Pin Icon
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
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={24} color="#1F2937" />
        </button>
        <h1 className={styles.headerTitle}>Request Details</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      <div className={styles.contentContainer}>
        {/* Map Section */}
        <div className={styles.mapSnippet} style={{ background: '#E5E7EB' }}>
          <LeafletMap 
            center={position} 
            zoom={15} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={true}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={createCustomIcon()} />
          </LeafletMap>
        </div>
      </div>

        {/* Info Card */}
        <div className={styles.requestCard}>
          <div className={styles.userSection}>
            <img src={request.userAvatar} alt={request.userName} className={styles.userAvatar} />
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>{request.userName}</h2>
              <div className={styles.userMeta}>
                <div className={styles.metaItem}>
                  <Clock size={16} color="#6B7280" />
                  <span className={styles.metaText}>{request.timestamp}</span>
                </div>
              </div>
            </div>
          </div>

          {request.urgencyLevel === 'critical' && (
            <div className={styles.urgencyBanner}>
              <AlertCircle size={20} color="#991B1B" />
              <span className={styles.urgencyText} style={{ color: '#991B1B' }}>CRITICAL EMERGENCY</span>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Situation</h3>
            <p className={styles.description}>{request.description}</p>
          </div>

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

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.locationCard}>
              <MapPin size={20} color="#E63946" />
              <div className={styles.locationInfo}>
                <span className={styles.locationAddress}>{request.location.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section: ปุ่มเปลี่ยนตามสถานะ */}
        <div className={styles.actionSection}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', color: 'green', padding: '10px' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 10px' }} />
              <h3>Donation Successful!</h3>
              <p>Tx Hash: {txHash.slice(0, 6)}...{txHash.slice(-4)}</p>
            </div>
          ) : (
            <button 
              className={styles.donateButton}
              onClick={handleAction}
              disabled={status === 'connecting' || status === 'donating'}
              style={{
                backgroundColor: walletAddress ? '#10B981' : '#DC2626', // เขียวถ้าต่อแล้ว, แดงถ้ายัง
              }}
            >
              <Wallet size={22} color="#FFFFFF" />
              <span>
                {status === 'connecting' ? 'Connecting...' :
                 status === 'donating' ? 'Processing...' :
                 walletAddress ? 'Donate 0.001 ETH' : 'Connect Wallet to Donate'}
              </span>
            </button>
          )}
          
          <p className={styles.actionNote}>
            {walletAddress 
              ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Your donation will be sent directly to help this emergency request"}
          </p>
        </div>
      </div>

    </div>
  );
};