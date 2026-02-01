// src/components/DonationDetailView.tsx
import React, { useState } from 'react';
import { type EmergencyRequest } from '../App';
import { ArrowLeft, MapPin, Clock, AlertCircle, Wallet, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers'; // พระเอกของเรา
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
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDonate = async () => {
    setStatus('processing');
    setErrorMessage('');

    try {
      // 1. เช็คว่ามี MetaMask ไหม
      if (!window.ethereum) {
        throw new Error("ไม่พบ MetaMask กรุณาติดตั้ง Wallet");
      }

      // 2. เชื่อมต่อกระเป๋า
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // ขอ Permission
      const signer = await provider.getSigner();

      // 3. เตรียม Transaction (Demo โอน 0.001 ETH)
      // *ในงานจริง Address ผู้รับควรมาจาก request.walletAddress*
      // *อันนี้ใส่ Address กลางไว้เทสก่อน*
      const recipientAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; 
      
      console.log(`Initiating donation to ${recipientAddress}...`);
      
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther("0.001") // จำนวนเงิน
      });

      console.log("Tx Sent:", tx.hash);
      setTxHash(tx.hash);
      setStatus('success');

    } catch (error: any) {
      console.error("Donation failed:", error);
      setStatus('error');
      // แปลง Error ให้อ่านง่าย
      if (error.code === 'ACTION_REJECTED') {
        setErrorMessage("ยกเลิกรายการ");
      } else {
        setErrorMessage(error.message || "เกิดข้อผิดพลาดในการโอน");
      }
    }
  };

  // พิกัดของเคสปัจจุบัน
  const position: [number, number] = [request.location.lat, request.location.lng];

  return (
    <div className={styles.detailView}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={24} color="#1F2937" />
        </button>
        <h1 className={styles.headerTitle}>Help & Donate</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      <div className={styles.contentContainer}>
        {/* Map Placeholder */}
        <div className={styles.mapSnippet}>
          <div className={styles.mapPlaceholder}>
            <MapPin size={48} color="#E63946" />
            <span className={styles.mapLabel}>{request.location.address}</span>
          </div>
        </div>

        <div className={styles.requestCard}>
          {/* User Info */}
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

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Situation</h3>
            <p className={styles.description}>{request.description}</p>
          </div>

          {/* Needs */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Needs</h3>
            <div className={styles.needsGrid}>
              {request.needs.map((need, index) => (
                <div key={index} className={styles.needItem}>
                  <AlertCircle size={16} color="#E63946" />
                  <span className={styles.needText}>{need}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section: ส่วนบริจาค */}
        <div className={styles.actionSection}>
          {status === 'success' ? (
            // Success State
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
              <h3 className="text-green-800 font-bold mb-1">Donation Sent!</h3>
              <p className="text-green-600 text-sm mb-3">Thank you for your help.</p>
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-green-600 underline text-sm"
              >
                View on Etherscan <ExternalLink size={14} />
              </a>
              <button 
                onClick={onBack}
                className="mt-4 w-full py-2 bg-white border border-green-500 text-green-600 rounded-lg font-medium"
              >
                Back to Map
              </button>
            </div>
          ) : (
            // Normal / Processing State
            <>
              {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-2 rounded mb-3 text-sm text-center">
                  {errorMessage}
                </div>
              )}
              
              <button 
                className={styles.donateButton}
                onClick={handleDonate}
                disabled={status === 'processing'}
                style={{ opacity: status === 'processing' ? 0.7 : 1 }}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 size={22} className="animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Wallet size={22} color="#FFFFFF" className="mr-2" />
                    <span>Donate 0.001 ETH</span>
                  </>
                )}
              </button>
              <p className={styles.actionNote}>
                Direct blockchain transfer (No Platform Fees)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};