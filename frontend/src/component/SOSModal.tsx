import React, { useState, useEffect } from 'react';
import { X, MapPin, Send } from 'lucide-react';
import styles from '../styles/SOSModal.module.css';

interface SOSModalProps {
  onClose: () => void;
  // อัปเดต Interface ให้ตรงกับ Backend
  onSubmit: (data: { type_id: number[]; message: string; node_id: string }) => void;
}

const availableNeeds = [
  'Water', 'Food', 'Shelter', 'Medical Aid',
  'Rescue/Evacuation', 'Generator/Power', 'Boat/Transport', 'Communication'
];

export const SOSModal: React.FC<SOSModalProps> = ({ onClose, onSubmit }) => {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [nodeId, setNodeId] = useState<string>('UNKNOWN');

  useEffect(() => {
    // ลอจิกใหม่: ดึง node_id จาก URL (เช่น http://192.168.4.1/?node_id=NODE-CAMT-Floor1)
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('node_id');
    if (idFromUrl) {
      setNodeId(idFromUrl);
    }
  }, []);

  const handleNeedToggle = (need: string) => {
    setSelectedNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedNeeds.length === 0) {
        alert('Please select at least one need');
        return;
      }
      
      // 🔴 ลอจิกใหม่: วนลูป (map) เอาชื่อ Need ทุกอันที่เลือก ไปแปลงเป็น Index + 1 
      // เช่น เลือก ['Water', 'Food'] จะกลายเป็น [1, 2]
      const typeIds = selectedNeeds.map(need => availableNeeds.indexOf(need) + 1);
    
      onSubmit({ 
        type_id: typeIds, // ส่งเป็น Array ไปเลย
        message: details || selectedNeeds.join(', '), 
        node_id: nodeId
      });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Send Emergency SOS</h2>
            <p className={styles.modalSubtitle}>Help is on the way</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} color="#4B5563" />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>What do you need immediately? *</label>
            <div className={styles.checkboxGrid}>
              {availableNeeds.map((need) => (
                <label key={need} className={`${styles.checkboxLabel} ${selectedNeeds.includes(need) ? styles.checkboxLabelActive : ''}`}>
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

          <div className={styles.formSection}>
            <label className={styles.sectionLabel} htmlFor="details">Additional Details</label>
            <textarea
              id="details"
              className={styles.textarea}
              placeholder="Describe situation..."
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>Your Location</label>
            {/* โชว์ชื่อ Node ID (เช่น NODE-CAMT-Floor1) ให้ผู้ใช้รู้ว่ากำลังเกาะเสาไหนอยู่ */}
            <div className={styles.locationDisplay}>
              <MapPin size={20} color="#E63946" />
              <span className={styles.locationText}>{nodeId}</span>
            </div>
          </div>

          {/* กู้คืนปุ่ม Submit พร้อมลอจิกป้องกันการกดปุ่มถ้ายังไม่เลือก Needs */}
          <button type="submit" className={styles.submitButton} disabled={selectedNeeds.length === 0}>
            <Send size={20} color="#FFFFFF" />
            <span>Broadcast Emergency Request</span>
          </button>
        </form>
      </div>
    </div>
  );
};