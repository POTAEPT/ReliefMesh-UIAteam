import { useState, useEffect } from 'react';
import Gun from 'gun';
import { type EmergencyRequest } from '../App';

// เพิ่ม Server สำรอง เผื่อตัวหลักล่ม
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun'
  ]
});

export const useRelief = () => {
  const [sosList, setSosList] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    // READ: ฟังข้อมูลจาก Gun Node
    const channel = gun.get('relief-mesh-hackathon-v1');
    
    channel.map().on((data, id) => {
      // Log ข้อมูลดิบออกมาดูเลย จะได้รู้ว่า Sync กันเจอไหม
      console.log("📡 Received signal:", id, data);

      // ✅ แก้ไข: ลบ !data._ ออก เพราะ Gun ส่ง metadata (_) มาเสมอ
      if (data && data.locationLat && data.locationLng) { 
        
        // แปลงข้อมูล
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
          // แปลง timestamp เป็นเวลาที่อ่านง่าย
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: data.description || '',
          urgencyLevel: 'critical'
        };

        setSosList((prev) => {
          // ป้องกันข้อมูลซ้ำ (เผื่อ Gun ส่งมาเบิ้ล)
          const exists = prev.find((item) => item.id === id);
          if (exists) return prev;
          
          // เอาตัวใหม่สุดขึ้นก่อน
          return [newRequest, ...prev];
        });
      }
    });
  }, []);

  // WRITE: ฟังก์ชันส่ง SOS
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
    console.log("✅ SOS Broadcasted:", payload);
  };

  return { sosList, sendSOS };
};