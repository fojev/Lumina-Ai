import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/colleges', label: 'Colleges', icon: 'account_balance' },
    { path: '/admin/subjects', label: 'Subjects', icon: 'library_books' },
    { path: '/admin/papers', label: 'Question Papers', icon: 'description' },
    { path: '/admin/users', label: 'Users', icon: 'people' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>LUMINA ADMIN</h2>
        </div>
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', textDecoration: 'none', color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#3b82f6' : 'transparent',
                transition: 'all 0.2s', fontWeight: isActive ? 600 : 400
              })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <header style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#334155' }}>Control Panel</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Admin User</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
