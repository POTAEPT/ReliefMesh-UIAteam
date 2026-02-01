import { useState, useEffect } from 'react';
import Gun from 'gun';
import { type EmergencyRequest } from '../App';

// 👇 แก้ไข Peer: ชี้ไปที่ ngrok ของเราเอง
const gun = Gun({
  peers: [
    // ใส่ลิงก์ ngrok ของคุณที่นี่
    'https://refractional-drumly-ernestina.ngrok-free.dev/gun' 
  ]
});

export const useRelief = () => {
  const [sosList, setSosList] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    // READ: ฟังข้อมูลจาก Gun Node
    const channel = gun.get('relief-mesh-hackathon-v1');
    
    channel.map().on((data, id) => {
      console.log("📡 Received signal:", id, data);

      if (data && data.locationLat && data.locationLng) { 
        const newRequest: EmergencyRequest = {
          id: id,
          userName: data.userName || 'Anonymous',
          userAvatar: data.userAvatar || `https://i.pravatar.cc/150?u=${id}`,
          needs: data.needs ? JSON.parse(data.needs) : [],
          proximity: 'Calculating...', 
          location: {
            lat: parseFloat(data.locationLat),
            lng: parseFloat(data.locationLng),
            address: data.locationAddress || 'Unknown Location'
          },
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: data.description || '',
          urgencyLevel: 'critical'
        };

        setSosList((prev) => {
          const exists = prev.find((item) => item.id === id);
          if (exists) return prev;
          return [newRequest, ...prev];
        });
      }
    });
  }, []);

  // ✅ WRITE: ฟังก์ชันส่ง SOS (อันนี้ที่หายไป)
  const sendSOS = (data: { 
    needs: string[], 
    details: string, 
    location: string, 
    lat: number, 
    lng: number 
  }) => {
    const id = crypto.randomUUID();
    const payload = {
      userName: 'Help Me!', 
      userAvatar: '', 
      needs: JSON.stringify(data.needs),
      description: data.details,
      locationAddress: data.location,
      locationLat: data.lat,
      locationLng: data.lng,
      timestamp: Date.now()
    };

    gun.get('relief-mesh-hackathon-v1').get(id).put(payload);
    console.log("✅ SOS Broadcasted via Local Relay:", payload);
  };

  // ✅ RETURN: ต้องมีบรรทัดนี้ ไม่งั้น Dashboard จะพัง (อันนี้ก็หายไป)
  return { sosList, sendSOS };
};