// relay.cjs
const http = require('http');
const Gun = require('gun');

const server = http.createServer((req, res) => {
  if (Gun.serve(req, res)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('ReliefMesh Relay Running!');
    return;
  }
});

// 👇 แก้ตรงนี้ครับ
const gun = Gun({ 
  web: server,
  file: 'data' // <-- เพิ่มบรรทัดนี้ (บอกให้เก็บข้อมูลลงไฟล์ชื่อ data ในโฟลเดอร์นี้แทน)
});

server.listen(8765, () => {
  console.log('✅ Local Relay started on port 8765');
});