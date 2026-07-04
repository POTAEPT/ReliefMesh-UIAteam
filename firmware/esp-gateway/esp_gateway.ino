#include <M5Core2.h>
#include <WiFi.h>
#include <DNSServer.h>

const char* ssid = "SOS_ReliefMesh_Gateway";
const byte DNS_PORT = 53;
DNSServer dnsServer;

void setup() {
  M5.begin();
  M5.Lcd.setTextSize(2);
  M5.Lcd.println("--- ReliefMesh Gateway ---");

  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid);
  
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
  
  M5.Lcd.print("AP Started: ");
  M5.Lcd.println(ssid);
  M5.Lcd.print("IP: ");
  M5.Lcd.println(WiFi.softAPIP());
  M5.Lcd.println("DNS Hijacking active!");
}

void loop() {

  dnsServer.processNextRequest();
  
  M5.update();
}