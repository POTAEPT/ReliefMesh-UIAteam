#include <M5Core2.h>
#include <WiFi.h>
#include <esp_now.h>
#include <HTTPClient.h>

// -----------------------------------------
// 1. Configuration & Security
// -----------------------------------------
bool isDevMode = false; // ใช้ false สำหรับวันออกบูธ (Offline 100%)

const char* homeSSID = "Haru-202";
const char* homePassword = "Haru2002";
String serverUrl; 

uint8_t node1MacAddress[] = {0x2C, 0xBC, 0xBB, 0x82, 0x8F, 0xBC}; 

const char* PMK_KEY = "ReliefMesh_PMK_1"; 
const char* LMK_KEY = "ReliefMesh_LMK_1"; 

// =========================================
// 🔴 ตัวแปรกองกลาง (กล่องพักพัสดุ) สำหรับลอจิกบุรุษไปรษณีย์
// =========================================
volatile bool hasNewSOS = false; 
String sosPayload = ""; 

// -----------------------------------------
// 2. HTTP Request Function (คนส่งพัสดุ)
// -----------------------------------------
void sendToBackend(String jsonPayload) {
  if (WiFi.status() == WL_CONNECTED || WiFi.getMode() == WIFI_AP) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    M5.Lcd.println("Sending to Fastify...");
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      M5.Lcd.setTextColor(GREEN);
      M5.Lcd.printf("HTTP Code: %d\n", httpResponseCode);
    } else {
      M5.Lcd.setTextColor(RED);
      M5.Lcd.printf("Error code: %d\n", httpResponseCode);
    }
    http.end();
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("Wi-Fi Not Ready!");
  }
}

// -----------------------------------------
// 3. ESP-NOW Receive Callback (คนรับพัสดุ)
// -----------------------------------------
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(10, 10);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.fillScreen(BLUE); 
  M5.Lcd.setCursor(0,0);
  M5.Lcd.println("Callback Triggered!");
  
  char jsonString[len + 1];
  memcpy(jsonString, incomingData, len);
  jsonString[len] = '\0'; 
  
  M5.Lcd.println("Received SOS!");
  M5.Lcd.println(jsonString);

  // 🔴 ฝากข้อมูลไว้ที่กล่องกองกลาง แล้วชูธงบอก Main Loop
  sosPayload = String(jsonString);
  hasNewSOS = true;
}

// -----------------------------------------
// 4. Setup & Loop
// -----------------------------------------
void setup() {
  M5.begin();
  M5.Lcd.setTextSize(2);
  
  if (isDevMode) {
    M5.Lcd.setTextColor(CYAN);
    M5.Lcd.println("[DEV MODE] Active");
    WiFi.mode(WIFI_STA);
    WiFi.begin(homeSSID, homePassword);
    
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      M5.Lcd.print(".");
    }
    M5.Lcd.println("\nConnected to Home Wi-Fi!");
    serverUrl = "http://192.168.31.231:3000/api/emergency"; 
    
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("[PROD MODE] Offline AP");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("ReliefMesh_Gateway", "12345678", 1);
    
    M5.Lcd.println("AP Created: ReliefMesh_Gateway");
    M5.Lcd.printf("Gateway IP: %s\n", WiFi.softAPIP().toString().c_str());
    
    // ⚠️ ใช้ IP โน้ตบุ๊ก (192.168.4.2) และพอร์ตใหม่ (3001) ให้ตรงกับ Backend
    serverUrl = "http://192.168.4.2:3000/api/emergency"; 
  }

  if (esp_now_init() != ESP_OK) {
    M5.Lcd.println("Error init ESP-NOW");
    return;
  }
  
  esp_now_set_pmk((uint8_t *)PMK_KEY);
  
  esp_now_peer_info_t peerInfo;
  memset(&peerInfo, 0, sizeof(peerInfo));
  memcpy(peerInfo.peer_addr, node1MacAddress, 6);
  peerInfo.channel = 1;  
  peerInfo.encrypt = true; 
  peerInfo.ifidx = WIFI_IF_AP;
  memcpy(peerInfo.lmk, LMK_KEY, 16); 
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    M5.Lcd.println("Failed to add Node 1");
    return;
  }
  
  esp_now_register_recv_cb(OnDataRecv);
  
  M5.Lcd.setTextColor(YELLOW);
  M5.Lcd.println("\nGateway Ready. Listening...");
  M5.Lcd.printf("STA MAC: %s\n", WiFi.macAddress().c_str());
  M5.Lcd.printf("AP MAC: %s\n", WiFi.softAPmacAddress().c_str());
}

void loop() {
  M5.update(); 
  
  // 🔴 บุรุษไปรษณีย์ทำงาน: เช็กว่ามีพัสดุในกล่องไหม?
  if (hasNewSOS) {
    hasNewSOS = false; // เอาธงลงก่อนเพื่อป้องกันการยิงซ้ำซ้อน
    sendToBackend(sosPayload); // วิ่งไปส่งที่ Fastify
  }
  
  delay(100); 
}