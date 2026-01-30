
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';
import React, { Component } from 'react';
import './App.css'
import './tableList.css'; // นำเข้าไฟล์ CSS ที่แยกไว้

// Interface สำหรับข้อมูล User
export interface VerifiedUser {
  id: number;
  name: string;
  timestamp: string;
}

// Interface สำหรับ Props ที่รับเข้ามา
interface Props {
  data: VerifiedUser[];
}

class VerificationTable extends Component<Props> {
  
  render() {
    const { data } = this.props;

    // --- LOGIC: เช็คความว่างเปล่า ---
    // ถ้าไม่มีข้อมูล หรือ Array ว่างเปล่า ให้ return null (ไม่แสดงอะไรเลยที่หน้าจอ)
    if (!data || data.length === 0) {
      return null;
    }

    // --- ถ้ามีข้อมูลแล้ว ให้แสดงผลโดยใช้ Class จากไฟล์ CSS ---
    return (
      <div className="vt-container">
        
        {/* Header ส่วนบน */}
        <div className="vt-header">
          <h3 className="vt-title">✅ Verified Users</h3>
          <span className="vt-badge">{data.length} คน</span>
        </div>

        {/* ตารางข้อมูล */}
        <div className="vt-table-wrapper">
          <table className="vt-table">
            <thead>
              <tr>
                <th className="vt-th">User Name</th>
                <th className="vt-th" style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="vt-row">
                  <td className="vt-cell-name">
                    {user.name}
                  </td>
                  <td className="vt-cell-time">
                    {user.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default VerificationTable;