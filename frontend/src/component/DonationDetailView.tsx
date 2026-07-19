import React, { useState } from 'react';
import { type EmergencyRequest } from '../App';
import { ArrowLeft, MapPin, Clock, AlertCircle, Wallet, CheckCircle } from 'lucide-react';
import styles from '../styles/DonationDetail.module.css';

// Import Map components
import { MapContainer as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapStyles from '../styles/MapContainer.module.css';

interface DonationDetailViewProps {
  request: EmergencyRequest;
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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'donating' | 'success'>('idle');
  const [txHash, setTxHash] = useState<string>('');

  const position: [number, number] = [request.location.lat, request.location.lng];

  // 🛠️ Force Network Switch Function (Sepolia Only)
  const checkAndSwitchNetwork = async (ethereum: any) => {
    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia Chain ID

    try {
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      if (currentChainId === SEPOLIA_CHAIN_ID) return true;

      // Switch to Sepolia if not currently selected
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // If switch fails (network not added), try to add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/'], // or other public RPCs
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add Sepolia network", addError);
          return false;
        }
      }
      console.error("Failed to switch network", switchError);
      return false;
    }
  };

  const handleAction = async () => {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert("Wallet not found! If you are on mobile, please open this website via the MetaMask Browser app.");
      return;
    }

    if (!walletAddress) {
      try {
        setStatus('connecting');
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        
        // ✅ Check Network immediately after connecting
        const isSepolia = await checkAndSwitchNetwork(ethereum);
        if (!isSepolia) {
          alert("Please switch to Sepolia Testnet before proceeding.");
          setStatus('idle');
          return;
        }

        setWalletAddress(accounts[0]);
        setStatus('idle');
      } catch (error) {
        console.error("User rejected connection", error);
        setStatus('idle');
      }
    } else {
      try {
        setStatus('donating');

        // ✅ Check Network again before transfer (Safety check)
        const isSepolia = await checkAndSwitchNetwork(ethereum);
        if (!isSepolia) {
          alert("Must use Sepolia Testnet only (to avoid real costs).");
          setStatus('idle');
          return;
        }

        const amountInWei = '0x38D7EA4C68000'; // 0.001 ETH
        
        const tx = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress,
              to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 
              value: amountInWei, 
            },
          ],
        });

        console.log('Tx Hash:', tx);
        setTxHash(tx);
        setStatus('success');
      } catch (error) {
        console.error("Donation failed", error);
        alert("Transaction cancelled or failed.");
        setStatus('idle');
      }
    }
  };

  return (
    <div className={styles.detailView} style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F3F4F6' }}>
      
      <header className={styles.header} style={{ flexShrink: 0, zIndex: 50, backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button className={styles.backButton} onClick={onBack} style={{ marginRight: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#1F2937" />
        </button>
        <h1 className={styles.headerTitle} style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Request Details</h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        
        {/* Map Section */}
        <div style={{ height: '300px', width: '100%' }}>
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

        {/* Card Section */}
        <div style={{ 
          marginTop: '-40px', 
          borderTopLeftRadius: '24px', 
          borderTopRightRadius: '24px', 
          backgroundColor: 'white', 
          position: 'relative', 
          zIndex: 10,
          padding: '24px', 
          minHeight: '500px', 
          boxShadow: '0 -4px 6px rgba(0,0,0,0.05)'
        }}>
          
          <div className={styles.userSection} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <img src={request.userAvatar} alt={request.userName} style={{ width: '56px', height: '56px', borderRadius: '50%', marginRight: '16px', objectFit: 'cover' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#111827' }}>{request.userName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', color: '#6B7280' }}>
                <Clock size={14} style={{ marginRight: '4px' }} />
                <span style={{ fontSize: '0.875rem' }}>{request.timestamp}</span>
              </div>
            </div>
          </div>

          {request.urgencyLevel === 'critical' && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: '12px' }} />
              <span style={{ color: '#991B1B', fontWeight: 600, fontSize: '0.875rem' }}>CRITICAL EMERGENCY</span>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Situation</h3>
            <p style={{ color: '#4B5563', lineHeight: '1.5', margin: 0 }}>{request.description}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Immediate Needs</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {request.needs.map((need, index) => (
                <div key={index} style={{ backgroundColor: '#FEF2F2', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', border: '1px solid #FECACA' }}>
                  <AlertCircle size={14} color="#E63946" style={{ marginRight: '6px' }} />
                  <span style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: 500 }}>{need}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Location</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <MapPin size={18} color="#6B7280" style={{ marginTop: '2px', marginRight: '8px', flexShrink: 0 }} />
              <span style={{ color: '#4B5563', fontSize: '0.9rem' }}>{request.location.address}</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', color: '#059669', padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #D1FAE5' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 4px 0', fontWeight: 700 }}>Donation Successful!</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Tx: {txHash.slice(0, 6)}...{txHash.slice(-4)}</p>
              </div>
            ) : (
              <button 
                onClick={handleAction}
                disabled={status === 'connecting' || status === 'donating'}
                style={{
                  width: '100%',
                  backgroundColor: walletAddress ? '#10B981' : '#DC2626',
                  color: 'white',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: (status === 'connecting' || status === 'donating') ? 'not-allowed' : 'pointer',
                  opacity: (status === 'connecting' || status === 'donating') ? 0.7 : 1,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <Wallet size={20} color="#FFFFFF" />
                <span>
                  {status === 'connecting' ? 'Connecting...' :
                   status === 'donating' ? 'Processing...' :
                   walletAddress ? 'Donate 0.001 ETH (Sepolia)' : 'Connect Wallet'}
                </span>
              </button>
            )}
            
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '12px', marginBottom: 0 }}>
              {walletAddress 
                ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (Testnet Only)`
                : "Direct blockchain transfer (No Platform Fees)"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};