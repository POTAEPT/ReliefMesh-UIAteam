-- สร้างตารางสำหรับเก็บข้อมูลแจ้งเหตุ
CREATE TABLE IF NOT EXISTS emergencies (
    id VARCHAR(50) PRIMARY KEY,       -- ตรงกับ 'i' (UUID)
    type_id INT NOT NULL,             -- ตรงกับ 't' (ประเภทเหตุฉุกเฉิน)
    latitude DECIMAL(9,6) NOT NULL,   -- ตรงกับ 'a' (พิกัด GPS ใช้ทศนิยม 6 ตำแหน่งเพื่อความแม่นยำ)
    longitude DECIMAL(9,6) NOT NULL,  -- ตรงกับ 'o'
    message VARCHAR(255),             -- ตรงกับ 'm' (จำกัดความยาวเผื่อไว้สำหรับ ESP-NOW 250 Bytes)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);