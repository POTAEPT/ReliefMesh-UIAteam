import { useState, useRef, useEffect } from 'react'
import { initializeReclaimSession } from '../service/reclaimService'
// เรียกไฟล์ Component ของเพื่อน (Import ให้ตรงกับชื่อไฟล์จริง)
import { QRCodeView } from './card'
import { HistoryListView , type UserData } from './tableList'

export const GitHubVerifierLogic = () => {
  const [qrUrl, setQrUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<UserData[]>([]) 
  const isGeneratingRef = useRef(false)

  // ฟังก์ชันเริ่มระบบ
  const startSession = async () => {
    if (isGeneratingRef.current) return
    isGeneratingRef.current = true
    setIsLoading(true)
    setQrUrl('')

    try {
      const url = await initializeReclaimSession(
        (proofs) => {
          if (proofs) {
            const rawData = Array.isArray(proofs) ? proofs[0] : proofs
            
            // 1. แกะข้อมูล JSON
            try {
               const context = JSON.parse(rawData.claimData.context)
               const params = context.extractedParameters || {}
               
               const simpleData: UserData = {
                 username: params.username || 'Unknown',
                 repo: params.repository || 'Unknown',
                 time: new Date().toLocaleTimeString(),
                 status: 'Verified'
               }

               // 2. ส่งเข้า State history
               setHistory(prev => [simpleData, ...prev])

            } catch (e) {
               console.error("Error parsing", e)
            }
          }

          // 3. รีเซ็ต QR อัตโนมัติ (หน่วงเวลา 1.5 วิ)
          setTimeout(() => {
            isGeneratingRef.current = false
            startSession()
          }, 1500)
        },
        (error) => {
          console.error(error)
          isGeneratingRef.current = false
          setIsLoading(false)
        }
      )
      setQrUrl(url)
    } catch (e) {
      console.error(e)
      isGeneratingRef.current = false
    } finally {
      setIsLoading(false)
    }
  }

  // เริ่มทำงานทันทีเมื่อเปิดหน้าเว็บ
  useEffect(() => {
     // startSession() // Uncomment บรรทัดนี้เมื่อพร้อม
  }, [])

  return (
    <div >
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Github Kiosk System</h1>
      
      {/* จัด Layout 2 คอลัมน์ */}
      <div className='column-all' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} >
        
        <div className='column-QR'>
        {/* เพื่อนคนที่ 1 (QRCode) */}
        <QRCodeView 
          url={qrUrl} 
          isLoading={isLoading} 
          onManualRefresh={startSession} 
        />
        </div>
        
        <div className='column-table'>
        {/* เพื่อนคนที่ 2 (History List) */}
        <HistoryListView 
          history={history} 
          onClear={() => setHistory([])} 
        />
        </div>

      </div>
    </div>
  )
}