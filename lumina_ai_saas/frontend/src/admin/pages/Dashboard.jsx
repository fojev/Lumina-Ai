import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_colleges: 0,
    total_subjects: 0,
    total_papers: 0,
    total_questions: 0
  });

  useEffect(() => {
    adminService.getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats", err));
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.total_users, color: '#3b82f6', icon: 'people' },
    { title: 'Colleges', value: stats.total_colleges, color: '#10b981', icon: 'account_balance' },
    { title: 'Subjects', value: stats.total_subjects, color: '#f59e0b', icon: 'library_books' },
    { title: 'PDF Papers', value: stats.total_papers, color: '#ef4444', icon: 'picture_as_pdf' },
    { title: 'Extracted Questions', value: stats.total_questions, color: '#8b5cf6', icon: 'quiz' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>Dashboard Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{card.title}</p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{card.value}</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${card.color}20`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
