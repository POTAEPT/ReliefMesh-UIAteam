#include <M5Core2.h>
#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <esp_now.h>
#include <ArduinoJson.h>

// -----------------------------------------
// 1. Configuration & Security
// -----------------------------------------
const char* apSSID = "Emergency_SOS_Free";
const byte DNS_PORT = 53;
const char* NODE_ID = "NODE-CAMT-Floor1"; // ไอดีประจำเสานี้

// ใส่ MAC Address ของ Gateway Node (โหนด 2) ลงในนี้
uint8_t gatewayMacAddress[] = {0x2C, 0xBC, 0xBB, 0x82, 0x91, 0xA9}; 

// กุญแจเข้ารหัส (Symmetric Key) 16 bytes ต้องตรงกันทั้ง 2 โหนด
const char* PMK_KEY = "ReliefMesh_PMK_1"; 
const char* LMK_KEY = "ReliefMesh_LMK_1"; 

DNSServer dnsServer;
WebServer server(80);

// -----------------------------------------
// 2. HTML Web Page (หน้าฟอร์มฉุกเฉินบนมือถือ)
// -----------------------------------------
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Emergency SOS</title>
  <style>
    body { font-family: Arial; padding: 20px; background: #f4f4f4; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h2 { color: #E63946; }
    select, input, button { width: 100%; padding: 10px; margin-top: 10px; border-radius: 4px; border: 1px solid #ccc; }
    button { background: #E63946; color: white; border: none; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Send Emergency SOS</h2>
    <form action="/submit" method="POST">
      <label>What do you need?</label>
      <select name="type_id">
        <option value="1">Water</option>
        <option value="2">Food</option>
        <option value="4">Medical Aid</option>
        <option value="5">Rescue/Evacuation</option>
      </select>
      <label>Details:</label>
      <input type="text" name="message" placeholder="Describe situation...">
      <button type="submit">Broadcast SOS</button>
    </form>
  </div>
</body>
</html>
)rawliteral";

// -----------------------------------------
// 3. Functions & ESP-NOW Logic
// -----------------------------------------

// ฟังก์ชันเมื่อส่งข้อมูลผ่าน ESP-NOW สำเร็จหรือล้มเหลว
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(10, 10);
  if (status == ESP_NOW_SEND_SUCCESS) {
    M5.Lcd.setTextColor(GREEN);
    M5.Lcd.println("SOS Delivered to Gateway!");
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("Failed to send SOS.");
  }
}

// ลอจิกการตั้งค่า Web Server
void setupWebServer() {
  // หน้าแรก (Captive Portal จะดึงหน้านี้)
  server.on("/", HTTP_GET, []() {
    server.send_P(200, "text/html", index_html);
  });
  
  // รองรับ Captive Portal ของ Android/iOS
  server.on("/generate_204", HTTP_GET, []() { server.send_P(200, "text/html", index_html); });
  server.on("/hotspot-detect.html", HTTP_GET, []() { server.send_P(200, "text/html", index_html); });

  // รับข้อมูลตอนกด Submit
  server.on("/submit", HTTP_POST, []() {
    int typeId = server.arg("type_id").toInt();
    String message = server.arg("message");

    // แพ็กข้อมูลลง JSON
    StaticJsonDocument<200> doc;
    doc["type_id"] = typeId;
    doc["message"] = message;
    doc["node_id"] = NODE_ID;
    
    char payload[200];
    serializeJson(doc, payload);

    // ยิงคลื่นวิทยุส่งไปหา Gateway
    esp_err_t result = esp_now_send(gatewayMacAddress, (uint8_t *)payload, strlen(payload));
    
    server.send(200, "text/html", "<h2>SOS Sent! Help is on the way.</h2>");
  });

  server.begin();
}

// -----------------------------------------
// 4. Setup & Loop
// -----------------------------------------
void setup() {
  M5.begin();
  M5.Lcd.setTextSize(2);
  M5.Lcd.println("Starting AP Node...");

  // 1. ตั้งค่า Wi-Fi AP Mode
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(apSSID, NULL, 1);
  
  // 2. ตั้งค่า DNS Hijack
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  // 3. เริ่ม Web Server
  setupWebServer();

  // 4. ตั้งค่า ESP-NOW & Security
  if (esp_now_init() != ESP_OK) {
    M5.Lcd.println("Error initializing ESP-NOW");
    return;
  }
  
  // ตั้งค่า Primary Master Key (สำหรับเข้ารหัสเครือข่าย)
  esp_now_set_pmk((uint8_t *)PMK_KEY);
  
  // ลงทะเบียน Gateway Node เป็นเพื่อน
  esp_now_peer_info_t peerInfo;
  memset(&peerInfo, 0, sizeof(peerInfo));
  memcpy(peerInfo.peer_addr, gatewayMacAddress, 6);
  peerInfo.channel = 1;  
  peerInfo.encrypt = true; // เปิดใช้ AES Encryption!
  memcpy(peerInfo.lmk, LMK_KEY, 16); // ตั้งค่า Local Master Key
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    M5.Lcd.println("Failed to add peer");
    return;
  }
  
  esp_now_register_send_cb(OnDataSent);
  
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(10, 10);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.println("AP Active: Emergency_SOS");

  M5.Lcd.printf("STA MAC: %s\n", WiFi.macAddress().c_str());
  M5.Lcd.printf("AP MAC: %s\n", WiFi.softAPmacAddress().c_str());
}

void loop() {
  M5.update();
  dnsServer.processNextRequest();
  server.handleClient();
}