
// 1. กำหนดหน้าตาข้อมูลไส้ใน (อันนี้เราตกลงกันแล้ว ห้ามแก้ชื่อ)
export interface UserData {
  username: string;
  repo: string;
  time: string;
  status: string;
}

// 2. กำหนดสเปคของ Props
interface HistoryListProps {
  history: UserData[]; 
  onClear: () => void;
}

// 3. เริ่มเขียน Component
export const HistoryListView = ({ history, onClear }: HistoryListProps) => {

  // --- Mock Data (ข้อมูลทิพย์) ---
  // ถ้าอยากเห็นหน้าตาตอนมีข้อมูล ให้แก้ตรงนี้เป็น true ระหว่างทำ
  const useMockData = false 
  
  if (useMockData) {
    history = [
        { username: "TestUser", repo: "TestRepo", time: "12:00", status: "OK" },
        { username: "DevMan", repo: "ProjectA", time: "12:05", status: "OK" }
    ]
  }

  return (
    // --- พื้นที่แก้ Design  ---
    <div className='card' style={{ border: '1px solid #ffffff', padding: '10px', height: '400px' }}>
      
      <div className='table-list'style={{ display: 'flex', justifyContent: 'space-between' }}>
         <h3>รายชื่อคนที่สแกนแล้ว ({history.length})</h3>
         <div className="button">
         <button  onClick={onClear}>ล้างค่า</button>
         </div>
      </div>

      <ul>
        {/* (ห้ามลบ .map) */}
        {history.map((user, index) => (
          
          <li key={index} style={{ marginBottom: '10px', background: '#088395' }}>
             <strong>{user.username}</strong> <br/>
             <span>Repo: {user.repo}</span> <br/>
             <small>{user.time}</small>
          </li>

        ))}
      </ul>

    </div>
    // ----------------------------------------
  )
}