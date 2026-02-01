import React, { useState, useEffect } from 'react';
import { X, MapPin, Send } from 'lucide-react';
import styles from '../styles/SOSModal.module.css';

interface SOSModalProps {
  onClose: () => void;
  onSubmit: (data: { needs: string[]; details: string; location: string }) => void;
}

const availableNeeds = [
  'Water',
  'Food',
  'Shelter',
  'Medical Aid',
  'Rescue/Evacuation',
  'Generator/Power',
  'Boat/Transport',
  'Communication'
];

export const SOSModal: React.FC<SOSModalProps> = ({ onClose, onSubmit }) => {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Locating...');

  useEffect(() => {
    // Simulate getting user location
    setTimeout(() => {
      setCurrentLocation('123 Emergency St, Los Angeles, CA 90001');
    }, 1000);
  }, []);

  const handleNeedToggle = (need: string) => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNeeds.length === 0) {
      alert('Please select at least one need');
      return;
    }
    onSubmit({ needs: selectedNeeds, details, location: currentLocation });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Send Emergency SOS</h2>
            <p className={styles.modalSubtitle}>Help is on the way</p>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} color="#4B5563" />
          </button>
        </div>

        {/* Modal Form */}
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {/* Immediate Needs Section */}
          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>
              What do you need immediately? *
            </label>
            <div className={styles.checkboxGrid}>
              {availableNeeds.map((need) => (
                <label 
                  key={need} 
                  className={`${styles.checkboxLabel} ${selectedNeeds.includes(need) ? styles.checkboxLabelActive : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={selectedNeeds.includes(need)}
                    onChange={() => handleNeedToggle(need)}
                  />
                  <span className={styles.checkboxText}>{need}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.formSection}>
            <label className={styles.sectionLabel} htmlFor="details">
              Additional Details
            </label>
            <textarea
              id="details"
              className={styles.textarea}
              placeholder="Describe your situation, number of people, special needs..."
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Location Section */}
          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>
              Your Location
            </label>
            <div className={styles.locationDisplay}>
              <MapPin size={20} color="#E63946" />
              <span className={styles.locationText}>{currentLocation}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={selectedNeeds.length === 0}
          >
            <Send size={20} color="#FFFFFF" />
            <span>Broadcast Emergency Request</span>
          </button>
        </form>
      </div>
    </div>
  );
};