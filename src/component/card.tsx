
// 1. Import ของจำเป็น
import QRCode from 'react-qr-code'

// 2. กำหนดสเปคของข้อมูลที่จะรับเข้ามา 
interface QRCodeProps {
  url: string;
  isLoading: boolean;
  onManualRefresh: () => void;
}

// 3. เริ่มเขียน Component
export const QRCodeView = ({ url, isLoading, onManualRefresh }: QRCodeProps) => {

  return (
    // --- พื้นที่แก้ Design ตรงนี้ ---
    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ffffff', height: '380px' }}>
      
      <h2>สแกน QR Code ตรงนี้</h2>

      {/* ถ้ากำลังโหลด ให้แสดงคำว่า Loading */}
      {isLoading && <p>กำลังสร้าง QR Code...</p>}

      {/* ถ้ามี URL ให้แสดง QR Code */}
      {!isLoading && url && (
         <div style={{ padding: '10px' }}>
            <QRCode value={url} size={200} bgColor="transparent" />
         </div>
      )}

      {/* ปุ่มกดเริ่มใหม่ */}
      <button onClick={onManualRefresh} style={{ marginTop: '20px' }}>
        ขอ QR ใหม่
      </button>

    </div>
    // ----------------------------------------
  )
}