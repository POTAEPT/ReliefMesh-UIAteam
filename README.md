# 🚨 ReliefMesh: Decentralized Disaster Response Platform

> **"Unstoppable Aid for an Unpredictable World"**
>
> 🏆 **Submission for Hackathon 2026**
>
> TRACK 2: Digital Economy | TRACK 3: Digital Resilience

![ReliefMesh Banner](https://via.placeholder.com/1200x400?text=ReliefMesh+Dashboard+Preview)

## 💡 Inspiration
In the wake of natural disasters, communication infrastructure often fails. Centralized servers go down, and traditional banking systems become inaccessible. **ReliefMesh** was born to answer one critical question: **"How can we coordinate rescue and funding when the internet is broken?"**

## 🚀 What is ReliefMesh?
ReliefMesh is an **offline-first, peer-to-peer (P2P) disaster management platform**. It allows victims to broadcast SOS signals that hop between devices without needing a central server. Simultaneously, it integrates **Ethereum Smart Contracts** to enable direct, transparent, and fee-free financial aid from donors to victims.

## ✨ Key Features
* **📡 Unstoppable P2P Mesh:** Powered by **Gun.js**, allowing devices to sync emergency data directly.
* **💸 Direct Crypto Aid:** Donations via **MetaMask** on **Sepolia Testnet** (Zero fees, Instant transfer).
* **🗺️ Live Command Center:** Real-time map visualization of SOS clusters.
* **📱 Cross-Device Sync:** Works seamlessly between Mobile and Desktop via Relay.

---

## 🛠️ Tech Stack
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
* **P2P Database:** Gun.js
* **Blockchain:** Ethers.js, Sepolia Testnet
* **Maps:** Leaflet, OpenStreetMap
* **Tunneling:** Ngrok (For public demo)

---

## 🚀 Getting Started (Run the Demo)

To see the full capabilities (P2P Sync & Cross-device), please follow these steps:

### Prerequisites
* Node.js (v18+)
* MetaMask Extension (Browser or Mobile)
* Ngrok Account (Free tier is fine)

### Step 1: Clone & Install
Bash
```
git clone [https://github.com/your-username/relief-mesh.git](https://github.com/your-username/relief-mesh.git)
cd relief-mesh
npm install
```
Step 2: Start the Relay Server (Terminal 1)
This acts as a "superpeer" to help sync data between devices during the demo.

Bash
```
node relay.cjs
# Output: ✅ Local Relay started on port 8765
Step 3: Expose Relay to Internet (Terminal 2)
Required for mobile devices to connect to your local computer.
```
Bash
```
npx ngrok http 8765
Important: Copy the https://....ngrok-free.app URL and update src/hooks/useRelief.ts with this new link.
```
Step 4: Run the Frontend (Terminal 3)
Bash
```
npm run dev
Desktop: Open http://localhost:5173
```
Mobile: Use the Network URL shown in the terminal (e.g., https://192.168.1.x:5173) or use Tailscale Funnel / Ngrok for port 5173.

🧪 How to Test
1. P2P Sync Demo
Open the app on Desktop and Mobile.

On Mobile, click the SOS Button and submit a request.

Watch the Desktop Map update instantly without refreshing!

2. Donation Demo (Sepolia)
Click on any SOS Pin on the map.

Click "Connect Wallet" (Supports MetaMask).

The app will automatically switch you to Sepolia Testnet.

Click "Donate 0.001 ETH" to simulate a transaction.
