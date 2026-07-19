import { useState, useEffect } from 'react';
import { type EmergencyRequest } from '../App';

// 1. นำ Array ของ Needs มาไว้บนสุดเพื่อใช้เทียบ Index แปลงกลับเป็นชื่อ
const availableNeeds = [
  'Water', 'Food', 'Shelter', 'Medical Aid',
  'Rescue/Evacuation', 'Generator/Power', 'Boat/Transport', 'Communication'
];

export const useRelief = () => {
  const [sosList, setSosList] = useState<EmergencyRequest[]>([]);

  // ฟังก์ชันดึงข้อมูลจาก Backend
const fetchEmergencies = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/emergencies');
      const data = await response.json();
      setSosList(data); // 🌟 ยัด data เข้าตรงๆ ได้เลย เพราะ Backend ย่อยมาให้เรียบร้อยแล้ว!
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  useEffect(() => {
    fetchEmergencies(); 
    const interval = setInterval(fetchEmergencies, 10000); 
    return () => clearInterval(interval); 
  }, []);

  // 🔴 3. อัปเดต Type ของ type_id ให้รับค่าเป็น Array (number[])
  const sendSOS = async (data: { type_id: number[]; message: string; node_id: string }) => {
    try {
      await fetch('http://localhost:3000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchEmergencies();
    } catch (error) {
      console.error('Error sending SOS:', error);
    }
  };

  return { sosList, sendSOS };
};