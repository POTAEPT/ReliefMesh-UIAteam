import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from '../styles/FAB.module.css';

interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button 
      className={styles.fab}
      onClick={onClick}
      aria-label="Send SOS"
    >
      <AlertTriangle size={28} color="#FFFFFF" strokeWidth={2.5} />
      <span className={styles.fabText}>SOS</span>
    </button>
  );
};