-- 1. ตาราง nodes: เก็บข้อมูลจุดปล่อย Wi-Fi (Gateway)
CREATE TABLE IF NOT EXISTS nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL, -- จะถูกเอาไปใช้เป็นค่า proximity ใน UI
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

-- 2. ตาราง emergencies: เก็บข้อมูลคนขอความช่วยเหลือ
CREATE TABLE IF NOT EXISTS emergencies (
    id VARCHAR(50) PRIMARY KEY,
    node_id VARCHAR(50) REFERENCES nodes(node_id), -- ผูก Foreign Key กลับไปหาโหนดเสมอ!
    type_id INT NOT NULL,
    message TEXT,
    urgency_level VARCHAR(20) DEFAULT 'high', -- ค่าเริ่มต้นให้แสดงป้ายเตือน
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Data Initialization (ยัดข้อมูลจำลองให้ระบบพร้อมทำงาน)
INSERT INTO nodes (node_id, location_name, latitude, longitude) 
VALUES 
    ('NODE-CAMT-Floor1', 'CAMT Building (Floor 1)', 18.795200, 98.952800),
    ('NODE-CMU-Dorm', 'CMU Student Dormitory', 18.796500, 98.951000)
ON CONFLICT (node_id) DO NOTHING;