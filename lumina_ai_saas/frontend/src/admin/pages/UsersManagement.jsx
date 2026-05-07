import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminService.getUsers()
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>User Management</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>User</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Email</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>College</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Status</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{user.email || '-'}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{user.college_name || 'Not Set'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, background: user.is_active ? '#dcfce7' : '#fee2e2', color: user.is_active ? '#166534' : '#991b1b' }}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ background: 'none', border: '1px solid #e2e8f0', color: user.is_active ? '#ef4444' : '#10b981', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                    {user.is_active ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;
