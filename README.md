# ReliefMesh

แพลตฟอร์มรับแจ้งเหตุฉุกเฉินที่เชื่อมต่ออุปกรณ์ภาคสนามกับ dashboard สำหรับติดตามคำขอความช่วยเหลือบนแผนที่ โดยรองรับโหนด M5Core2, ESP-NOW และเครือข่าย Wi-Fi ภายในพื้นที่

## ภาพรวม

โปรเจคนี้ประกอบด้วย 3 ส่วนหลัก:

- **Frontend:** React + TypeScript + Vite แสดงแผนที่ รายการ SOS และรายละเอียดคำขอ
- **Backend:** Fastify API รับและอ่านข้อมูล SOS จาก PostgreSQL
- **Firmware:** M5Core2 สองบทบาท ได้แก่ captive portal สำหรับผู้ประสบภัย และ gateway สำหรับส่งข้อมูลต่อไปยัง backend

การไหลของข้อมูล:

```text
M5Core2 Captive Portal
                │  ESP-NOW
                ▼
M5Core2 Gateway ── HTTP POST ──▶ Fastify API ──▶ PostgreSQL
                                                                            │
                                                                            └── HTTP GET ◀── React dashboard
```

## ความสามารถปัจจุบัน

- ส่ง SOS พร้อมเลือกความต้องการได้หลายรายการ
- รับ SOS ผ่าน captive portal ของโหนดภาคสนาม
- ส่งข้อมูลระหว่างโหนดด้วย ESP-NOW พร้อม PMK/LMK
- บันทึกคำขอและตำแหน่งโหนดลง PostgreSQL
- แสดงคำขอ SOS บน Leaflet/OpenStreetMap และ refresh ทุก 10 วินาที
- เปิดดูรายละเอียดคำขอพร้อมแผนที่เฉพาะจุด
- เชื่อมต่อ wallet และส่งธุรกรรมทดสอบบน Sepolia จากหน้ารายละเอียด

## โครงสร้างโปรเจค

```text
.
├── backend/
│   ├── server.ts                 # Fastify API ที่พอร์ต 3000
│   └── src/schema/init.sql       # schema และข้อมูล node เริ่มต้น
├── database/                     # พื้นที่สำหรับไฟล์ database เพิ่มเติม
├── firmware/
│   ├── Captive_Portal_Node/      # AP + captive portal + ESP-NOW sender
│   └── esp_gatewayV2/            # ESP-NOW receiver + HTTP gateway
├── frontend/
│   └── src/
│       ├── App.tsx               # dashboard/detail views
│       ├── component/            # UI และ Leaflet views
│       └── hooks/useRelief.ts    # เรียก API และ refresh SOS
├── docker-compose.yml            # PostgreSQL 15
└── README.md
```

## เทคโนโลยี

- React 19, TypeScript, Vite
- Fastify 5, Node.js, `pg`
- PostgreSQL 15
- Leaflet และ React Leaflet
- M5Core2, Wi-Fi, ESP-NOW, ArduinoJson
- MetaMask-compatible wallet และ Sepolia Testnet

## ข้อกำหนดเบื้องต้น

- Node.js 18 ขึ้นไป และ npm
- Docker และ Docker Compose
- Arduino IDE หรือ PlatformIO พร้อมไลบรารี M5Core2
- MetaMask หากต้องการทดสอบการบริจาค

## วิธีติดตั้งและรันระบบเว็บ

### 1. ติดตั้ง dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. เริ่ม PostgreSQL

จาก root ของโปรเจค:

```bash
docker compose up -d db
docker compose ps
```

Compose จะรัน `backend/src/schema/init.sql` เมื่อสร้าง volume ครั้งแรก:

| ค่า | ค่าเริ่มต้น |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `reliefmesh` |
| User | `admin` |
| Password | `secretpassword` |

> หากแก้ schema แล้วต้องการ init ใหม่ ต้องลบ volume ของโปรเจคก่อน ซึ่งจะลบข้อมูลใน volume ด้วย

### 3. เริ่ม backend

```bash
cd backend
npx tsx server.ts
```

API จะเปิดที่ `http://localhost:3000` ทดสอบได้ด้วย:

```bash
curl http://localhost:3000/api/emergencies
```

### 4. เริ่ม frontend

```bash
cd frontend
npm run dev
```

เปิด `http://localhost:5173` ใน browser

คำสั่ง frontend อื่น ๆ:

```bash
npm run build
npm run lint
npm run preview
```

## API

### `POST /api/emergency`

รับคำขอ SOS:

```json
{
    "type_id": [1, 4],
    "message": "ต้องการน้ำและการปฐมพยาบาล",
    "node_id": "NODE-CAMT-Floor1"
}
```

รหัสความต้องการคือ `1 Water`, `2 Food`, `3 Shelter`, `4 Medical Aid`, `5 Rescue/Evacuation`, `6 Generator/Power`, `7 Boat/Transport`, `8 Communication`

`node_id` ต้องมีอยู่ในตาราง `nodes` ก่อน จึงจะ insert ได้สำเร็จ

### `GET /api/emergencies`

ส่งคืนรายการ SOS ที่ join กับพิกัดของ node และแปลง `type_id` เป็นชื่อความต้องการสำหรับ frontend

## Firmware และการเชื่อมต่อภาคสนาม

### Captive Portal Node

`firmware/Captive_Portal_Node/Captive_Portal_Node.ino` จะสร้าง AP ชื่อ `Emergency_SOS_Free`, เปิด captive portal และส่ง JSON ไปยัง gateway ผ่าน ESP-NOW

ก่อนแฟลชต้องตรวจสอบ `gatewayMacAddress`, `NODE_ID`, `PMK_KEY` และ `LMK_KEY` ให้ตรงกับ gateway

### Gateway

`firmware/esp_gatewayV2/esp_gatewayV2.ino` รับข้อมูลจาก node แล้ว POST ไปที่ backend ก่อนใช้งานต้องแก้ `node1MacAddress`, key, Wi-Fi credentials และ `serverUrl` ให้ชี้ไปยัง IP ของเครื่องที่รัน backend บนพอร์ต `3000`

`isDevMode = true` ใช้ Wi-Fi ภายนอก ส่วน `false` ใช้ AP ชื่อ `ReliefMesh_Gateway` สำหรับโหมดภาคสนาม แต่ gateway ยังต้องเข้าถึง backend ได้

> IP, SSID, password และ MAC address ใน firmware เป็นค่าตัวอย่างเฉพาะสภาพแวดล้อมเดิม ต้องเปลี่ยนก่อนใช้งานจริง

## การทดสอบ

### ทดสอบผ่านเว็บ

1. เริ่ม PostgreSQL, backend และ frontend
2. เปิด `http://localhost:5173`
3. กดปุ่ม SOS และเลือกความต้องการอย่างน้อยหนึ่งรายการ
4. ตรวจสอบรายการใหม่บน dashboard และใน PostgreSQL

### ทดสอบผ่านอุปกรณ์

1. แฟลช node และ gateway ด้วย MAC/key ที่ตรงกัน
2. ตรวจสอบว่า `node_id` มีอยู่ในตาราง `nodes`
3. ตั้ง `serverUrl` ของ gateway ให้เข้าถึง backend ได้
4. เชื่อมมือถือกับ AP ของ node แล้วส่ง SOS
5. ตรวจสอบ log ของ gateway, backend และ dashboard

### ทดสอบการบริจาค

1. ติดตั้ง MetaMask หรือเปิดเว็บผ่าน MetaMask Mobile Browser
2. เปิดรายละเอียด SOS
3. เชื่อม wallet และเปลี่ยนเป็น Sepolia Testnet
4. ใช้เฉพาะ SepoliaETH สำหรับธุรกรรมทดสอบ

> โค้ดปัจจุบันส่ง `0.001 ETH` ไปยัง address ที่ hard-code ใน `DonationDetailView.tsx` ควรตรวจสอบ address ก่อน demo และห้ามใช้เงินจริงบน mainnet

## ข้อจำกัดปัจจุบัน

- Frontend hard-code backend URL เป็น `http://localhost:3000` จึงต้องปรับสำหรับการ deploy หรือใช้งานข้ามอุปกรณ์
- CORS อนุญาตเฉพาะ `http://localhost:5173`
- Backend ยังไม่มี start script, migration command หรือ automated tests
- ยังไม่มี authentication และ validation ของ request body อย่างละเอียด
- Dashboard ใช้ polling ทุก 10 วินาที ยังไม่ใช่ realtime push
- ค่า secrets และ network ของ firmware ยังอยู่ใน source code
- การบริจาคเป็นการโอนตรงไปยัง address คงที่ ไม่ได้ผูกกับผู้ร้องขอหรือ smart contract

## License

ยังไม่ได้กำหนด license ของโปรเจค
