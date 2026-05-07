import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const Colleges = () => {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    adminService.getColleges()
      .then(data => setColleges(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Colleges</h1>
        <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          + Add College
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>ID</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>College Name</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Location</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map(college => (
              <tr key={college.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{college.id}</td>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{college.name}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{college.location || 'N/A'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
            {colleges.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No colleges found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Colleges;
