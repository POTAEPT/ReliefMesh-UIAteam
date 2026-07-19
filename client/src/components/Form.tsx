import { useState, useEffect, type FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 1. สร้าง Dictionary เก็บพิกัดจำลองของแต่ละโหนด (Proximity Mapping)
const NODE_LOCATIONS: Record<string, { lat: number, lng: number }> = {
  'NODE-ตึกA-ชั้น1': { lat: 18.7952, lng: 98.9528 }, 
  'NODE-ตึกB-ชั้น2': { lat: 18.7965, lng: 98.9510 }, 
  'UNKNOWN': { lat: 0.0000, lng: 0.0000 }
};

export default function EmergencyForm() {
  // 2. ประกาศ State ให้ครบทุกตัวที่ UI ต้องใช้งาน
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [typeId, setTypeId] = useState<number>(1); 
  const [nodeId, setNodeId] = useState<string>('UNKNOWN'); 

  // 3. ใช้ useEffect ดึงค่าจาก URL แค่ 1 ครั้งตอนหน้าเว็บโหลด
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nodeParam = params.get('node_id');
    
    // ถ้ามีค่า node_id ส่งมา และตรงกับคู่มือที่เรามี ให้บันทึกลง State
    if (nodeParam && NODE_LOCATIONS[nodeParam]) {
      setNodeId(nodeParam);
    }
  }, []); // Array ว่าง [] หมายถึงให้รันแค่ตอนเปิดหน้าเว็บครั้งแรก

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); 

    // 4. ดึงพิกัดจาก Dictionary ตามโหนดที่ผู้ใช้อยู่
    const location = NODE_LOCATIONS[nodeId];

    // 5. ประกอบ Payload (ใช้ Key แบบย่อ i, t, a, o, m เพื่อประหยัด Byte ตามที่เต้ออกแบบ)
    const payload = {
      i: uuidv4(), 
      t: typeId,           // ดึงจาก Dropdown 
      a: location.lat,     // ดึงจากโหนด
      o: location.lng,     // ดึงจากโหนด
      m: message           // ดึงจากช่องข้อความ
    };

    try {
      const response = await fetch('http://192.168.4.2:3000/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setStatusMessage('Emergency data received successfully');
        setMessage(''); // เคลียร์เฉพาะข้อความ เผื่อต้องพิมพ์ซ้ำ
      } else {
        setStatusMessage('Internal Server Error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setStatusMessage('⚠️ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ (Backend เปิดอยู่ไหม?)');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Emergency Form</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        
        {/* Dropdown สำหรับเลือกประเภทเหตุการณ์ */}
        <label className="flex flex-col gap-1">
          <span>ประเภทเหตุฉุกเฉิน:</span>
          <select 
            value={typeId} 
            onChange={(e) => setTypeId(Number(e.target.value))}
            className="p-2 rounded text-black"
          >
            <option value={1}>อุบัติเหตุ / บาดเจ็บ</option>
            <option value={2}>อัคคีภัย / ไฟไหม้</option>
            <option value={3}>ต้องการความช่วยเหลือทางการแพทย์</option>
            <option value={4}>อื่นๆ</option>
          </select>
        </label>

        {/* ช่องกรอกข้อความ */}
        <label className="flex flex-col gap-1">
          <span>รายละเอียดเพิ่มเติม / จุดสังเกต:</span>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="เช่น ติดอยู่ชั้น 3, มีคนเจ็บ 2 คน..."
            maxLength={200} 
            className="p-2 rounded text-black h-24"
          />
        </label>

        {/* แสดงข้อมูลโหนดที่กำลังเกาะอยู่ */}
        <div className="text-sm text-gray-400 text-center">
          📍 ตรวจพบการเชื่อมต่อจาก: {nodeId}
        </div>

        {/* แจ้งเตือนสถานะการส่ง */}
        {statusMessage && (
          <div className="text-center font-bold text-yellow-400">
            {statusMessage}
          </div>
        )}

        <button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded mt-2 transition-colors"
        >
          ส่งสัญญาณขอความช่วยเหลือ
        </button>
      </form>
    </div>
  );
}