import { useState } from 'react'
import QRCode from 'react-qr-code'
import { initializeReclaimSession } from '../service/reclaimService'

export const GitHubVerifier = () => {
  const [requestUrl, setRequestUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [proofData, setProofData] = useState<any>(null) 

  const onVerifyClick = async () => {
    setIsLoading(true)
    setRequestUrl('')
    setProofData(null) // เคลียร์ข้อมูลเก่าก่อนเริ่มใหม่

    try {
      const url = await initializeReclaimSession(
        (proofs) => {
          console.log('Verification Success:', proofs)
          
          if (proofs) {
            setProofData(proofs[0]) 
          }
        },
        (error) => {
          console.error('Verification Failed:', error)
          alert('เกิดข้อผิดพลาดในการยืนยันตัวตน')
        }
      )

      setRequestUrl(url)

    } catch (error) {
      console.error("Error calling service:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="verifier-container" style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      
      <h3>GitHub Owner Verification</h3>

      <button onClick={onVerifyClick} disabled={isLoading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        {isLoading ? 'กำลังเชื่อมต่อ...' : 'Verify GitHub Owner'}
      </button>

      {requestUrl && !proofData && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ background: 'white', padding: '16px', display: 'inline-block', borderRadius: '8px', border: '1px solid #ddd' }}>
            <QRCode value={requestUrl} />
          </div>
          <p>สแกนด้วย Reclaim App บนมือถือ</p>
        </div>
      )}


      {proofData && (
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'left', 
          border: '1px solid #28a745', 
          borderRadius: '10px', 
          padding: '20px',
          background: '#f0fff4'
        }}>
          <h2 style={{ color: '#28a745', marginTop: 0 }}>✅ ยืนยันตัวตนสำเร็จ!</h2>
          
          {/* ส่วนดึงค่ามาโชว์แบบสวยๆ */}
          <div style={{ marginBottom: '15px' }}>
            <strong>Provider:</strong> {proofData.claimData.provider} <br/>
            <strong>Timestamp:</strong> {new Date(proofData.claimData.timestampS * 1000).toLocaleString()} <br/>
          </div>

          <hr/>

          {/* ส่วนโชว์ JSON ดิบๆ (สำหรับ Developer / DWeb) */}
          <p style={{ fontSize: '12px', color: '#666' }}>Raw Data for DWeb:</p>
          <pre style={{ 
            background: '#333', 
            color: '#fff', 
            padding: '10px', 
            borderRadius: '5px', 
            overflowX: 'auto',
            fontSize: '11px'
          }}>
            {JSON.stringify(proofData, null, 2)}
          </pre>
        </div>
      )}
      
    </div>
  )
}

export default GitHubVerifier