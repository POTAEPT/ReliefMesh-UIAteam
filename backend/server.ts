import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

const fastify = Fastify({ logger: true });

const availableNeeds = [
  'Water', 'Food', 'Shelter', 'Medical Aid',
  'Rescue/Evacuation', 'Generator/Power', 'Boat/Transport', 'Communication'
];

// 1. เปิด CORS: อนุญาตให้เว็บจากพอร์ต 5173 ยิงข้อมูลเข้ามาได้
fastify.register(cors, {
  origin: 'http://localhost:5173'
});

// 2. ตั้งค่าการเชื่อมต่อ Database
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'reliefmesh',
  password: 'secretpassword',
  port: 5432,
});

// 3. API Endpoint สำหรับรับ SOS (ขาเข้า)
fastify.post('/api/emergency', async (request, reply) => {
  // 🔴 อัปเดต Type ให้ type_id รับค่าเป็น Array ของตัวเลข (number[])
  const { type_id, message, node_id } = request.body as {
    type_id: number[];
    message: string;
    node_id: string;
  };

  // ใช้ Prepared Statements เพื่อความปลอดภัยระดับ DevSecOps ป้องกัน SQL Injection
  const query = `
    INSERT INTO emergencies (id, node_id, type_id, message)
    VALUES ($1, $2, $3, $4)
  `;
  const id = `SOS-${Date.now()}`;

  try {
    // node-postgres จะแปลง Array ของ JS เป็น Format ของ Postgres ให้โดยอัตโนมัติ
    await pool.query(query, [id, node_id, type_id, message]);
    return { success: true, id };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Database Error' });
  }
});

// 4. API Endpoint สำหรับดึงข้อมูล SOS ทั้งหมด (ขาออก)
fastify.get('/api/emergencies', async (request, reply) => {
  try {
    // ดึงข้อมูลจาก 2 ตารางมาประกอบร่างกัน (JOIN) เพื่อเอาพิกัด GPS และสถานที่ของโหนด
    const query = `
      SELECT 
        e.id, e.message, e.urgency_level, e.created_at, e.type_id,
        n.location_name, n.latitude, n.longitude
      FROM emergencies e
      JOIN nodes n ON e.node_id = n.node_id
      ORDER BY e.created_at DESC
    `;
    const { rows } = await pool.query(query);

    // Data Transfer Object (DTO): แปลงร่างข้อมูล SQL ให้ตรงกับ Interface ที่ React ต้องการ
    const formattedData = rows.map(row => {
      const rawTypeId = row.type_id; 
      let needsArray: number[] = [];

      // 🔴 ลอจิกแกะกล่องและทำความสะอาดข้อมูล (Data Cleansing)
      // เผื่อกรณีที่ตัว Driver คืนค่าออกมาเป็นข้อความ String รูปแบบปีกกา "{1,2,4}"
      if (typeof rawTypeId === 'string') {
        const cleanString = rawTypeId.replace(/[{}]/g, '').trim();
        if (cleanString) {
          needsArray = cleanString.split(',').map(Number);
        }
      } else if (Array.isArray(rawTypeId)) {
        // ถ้าคัดลอกมาเป็น Array อยู่แล้ว ก็นำไปใช้งานได้เลย
        needsArray = rawTypeId.map(Number);
      } else if (typeof rawTypeId === 'number') {
        // รองรับข้อมูลเก่าที่เป็นตัวเลขตัวเดียว (Fallback)
        needsArray = [rawTypeId];
      }

      // วนลูปเปลี่ยนรหัสตัวเลข (ID) ให้กลายเป็นชื่อข้อความความช่วยเหลือ
      const needTexts = needsArray.map(id => availableNeeds[id - 1] || 'Unknown Need');

      return {
        id: row.id,
        userName: 'Anonymous Victim', 
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${row.id}`, 
        needs: needTexts, // 🔴 ยัดก้อน Array ชื่อความช่วยเหลือที่แปลงเสร็จแล้วลงไป
        proximity: row.location_name,
        location: {
          lat: parseFloat(row.latitude),
          lng: parseFloat(row.longitude),
          address: row.location_name
        },
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: row.message || 'No additional details provided.',
        urgencyLevel: row.urgency_level
      };
    });

    return reply.send(formattedData);
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch emergencies' });
  }
});

// 5. สตาร์ทเซิร์ฟเวอร์
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});