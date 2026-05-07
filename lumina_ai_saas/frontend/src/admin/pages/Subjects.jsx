import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    adminService.getSubjects()
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Subjects</h1>
        <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          + Add Subject
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>ID</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Name</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Sem/Branch</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>College</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{subject.id}</td>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{subject.name} ({subject.code || '-'})</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>Sem {subject.semester} • {subject.branch || 'All'}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{subject.college_name || 'N/A'}</td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No subjects found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subjects;
