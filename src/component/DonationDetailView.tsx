import React from 'react';
import { EmergencyRequest } from '../App';
import { ArrowLeft, MapPin, Clock, AlertCircle, Wallet } from 'lucide-react';
import styles from '../styles/DonationDetail.module.css';

interface DonationDetailViewProps {
  request: EmergencyRequest;
  onBack: () => void;
}

export const DonationDetailView: React.FC<DonationDetailViewProps> = ({ request, onBack }) => {
  const handleConnectWallet = () => {
    console.log('Connect wallet initiated');
    alert('Wallet connection would be initiated here. In production, this would integrate with Web3 wallet providers.');
  };

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
        {/* Map Snippet */}
        <div className={styles.mapSnippet}>
          <div className={styles.mapPlaceholder}>
            <MapPin size={48} color="#E63946" />
            <span className={styles.mapLabel}>{request.location.address}</span>
          </div>
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
              <AlertCircle size={20} color="#FFFFFF" />
              <span className={styles.urgencyText}>CRITICAL EMERGENCY</span>
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