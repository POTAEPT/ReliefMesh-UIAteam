-- สร้างตารางสำหรับเก็บข้อมูลแจ้งเหตุ
CREATE TABLE IF NOT EXISTS emergencies (
    id VARCHAR(50) PRIMARY KEY,       -- ตรงกับ 'i' (UUID)
    type_id INT NOT NULL,             -- ตรงกับ 't' (ประเภทเหตุฉุกเฉิน)
    latitude DECIMAL(9,6) NOT NULL,   -- ตรงกับ 'a' (พิกัด GPS ใช้ทศนิยม 6 ตำแหน่งเพื่อความแม่นยำ)
    longitude DECIMAL(9,6) NOT NULL,  -- ตรงกับ 'o'
    message VARCHAR(255),             -- ตรงกับ 'm' (จำกัดความยาวเผื่อไว้สำหรับ ESP-NOW 250 Bytes)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodes (
    node_id VARCHAR(50) PRIMARY KEY,  -- รหัสโหนดที่ตรงกับโค้ด M5Stack
    location_name VARCHAR(100),       -- ชื่อสถานที่
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

INSERT INTO nodes (node_id, location_name, latitude, longitude) 
VALUES 
    ('NODE-CAMT-TLIC-BULIDING', 'อาคาร CAMT TLIC', 18.795200, 98.952800),
    ('NODE-CAMT-OLD-BULIDING', 'อาคารCAMT เก่า', 18.796500, 98.951000)
ON CONFLICT (node_id) DO NOTHING;