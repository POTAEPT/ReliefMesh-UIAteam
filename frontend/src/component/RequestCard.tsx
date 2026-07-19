import React from 'react';
import {type  EmergencyRequest } from '../App';
import { MapPin, Clock } from 'lucide-react';
import styles from '../styles/RequestCard.module.css';

interface RequestCardProps {
  request: EmergencyRequest;
  onViewDetails: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onViewDetails }) => {
  return (
    <article className={styles.card}>
      {/* Card Header with User Info */}
      <div className={styles.cardHeader}>
        <img 
          src={request.userAvatar} 
          alt={request.userName}
          className={styles.avatar}
        />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{request.userName}</h3>
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <Clock size={14} color="#6B7280" />
              <span className={styles.metaText}>{request.timestamp}</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={14} color="#E63946" />
              <span className={styles.metaText}>{request.proximity}</span>
            </div>
          </div>
        </div>
        {request.urgencyLevel === 'critical' && (
          <span className={styles.urgencyBadge}>CRITICAL</span>
        )}
      </div>

      {/* Needs List */}
      <div className={styles.needsContainer}>
        <span className={styles.needsLabel}>Needs:</span>
        <div className={styles.needsList}>
          {request.needs.map((need, index) => (
            <span key={index} className={styles.needTag}>
              {need}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button 
        className={styles.actionButton}
        onClick={onViewDetails}
      >
        View Details & Help
      </button>
    </article>
  );
};