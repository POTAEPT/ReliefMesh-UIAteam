import { useState, type FormEvent } from 'react';

export default function EmergencyForm(){

    const [message, setMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); 

        const payload = {
            i: crypto.randomUUID().slice(0, 8), 
            t: 1, // Mock: ประเภทเหตุฉุกเฉิน (เช่น 1 = การแพทย์)
            a: 18.795, // Mock: ละติจูด 
            o: 98.968, // Mock: ลองจิจูด
            m: message //ดึงข้อความจาก State ที่ผู้ใช้พิมพ์
        };

        try {
            const response = await fetch('http://localhost:3000/api/emergency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // แปลง Object เป็น JSON String ก่อนส่ง
            });
            if (response.ok) {
                setStatusMessage('Emergency data received successfully');
                setMessage(''); 
            } else {
                setStatusMessage('Internal Server Error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setStatusMessage('⚠️ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ (Backend เปิดอยู่ไหม?)');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Emergency Message: </label>
                <input 
                    type="text" 
                    name="message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    required 
                />
            </div>
            <br />
            <button type="submit">ขอความช่วยเหลือ</button>
        
            {statusMessage && <p><strong>{statusMessage}</strong></p>}
        </form>
    );
}