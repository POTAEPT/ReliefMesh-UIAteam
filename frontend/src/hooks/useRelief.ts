import { useState, useEffect } from 'react';
import { type EmergencyRequest } from '../App';

export const useRelief = () => {
  const [sosList, setSosList] = useState<EmergencyRequest[]>([]);

  // ฟังก์ชันดึงข้อมูลจาก Backend
  const fetchEmergencies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/emergencies');
      const data = await response.json();
      setSosList(data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  // ดึงข้อมูลทันทีที่เปิดหน้าเว็บ และตั้งเวลาดึงใหม่ทุกๆ 5 วินาที (Polling)
  useEffect(() => {
    fetchEmergencies(); // ดึงครั้งแรก
    const interval = setInterval(fetchEmergencies, 10000); // อัปเดตแบบ Real-time
    return () => clearInterval(interval); // ล้างหน่วยความจำเมื่อปิดหน้าจอ
  }, []);

  // ฟังก์ชันส่งข้อมูลเข้า Backend
  const sendSOS = async (data: { type_id: number; message: string; node_id: string }) => {
    try {
      await fetch('http://localhost:3001/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // ส่งเสร็จแล้ว สั่งให้ดึงข้อมูลใหม่มาโชว์ทันที
      fetchEmergencies();
    } catch (error) {
      console.error('Error sending SOS:', error);
    }
  };

  return { sosList, sendSOS };
};