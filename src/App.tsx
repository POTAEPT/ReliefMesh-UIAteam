import React, { useState } from 'react';
import { DashboardView } from './component/DashboardView';
import { DonationDetailView } from './component/DonationDetailView'
import styles from './styles/App.module.css';




export interface EmergencyRequest {
  id: string;
  userName: string;
  userAvatar: string;
  needs: string[];
  proximity: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  description: string;
  urgencyLevel: 'critical' | 'high' | 'medium';
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);

  const handleViewRequest = (request: EmergencyRequest) => {
    setSelectedRequest(request);
    setCurrentView('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedRequest(null);
  };

  return (
    <div className={styles.app}>
      {currentView === 'dashboard' && (
        <DashboardView onViewRequest={handleViewRequest} />
      )}
      {currentView === 'detail' && selectedRequest && (
        <DonationDetailView 
          request={selectedRequest} 
          onBack={handleBackToDashboard}
        />
      )}
    </div>
    
  );
}

export default App;
