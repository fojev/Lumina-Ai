import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/pages/Dashboard.jsx'
import Colleges from './admin/pages/Colleges.jsx'
import Subjects from './admin/pages/Subjects.jsx'
import UploadPaper from './admin/pages/UploadPaper.jsx'
import UsersManagement from './admin/pages/UsersManagement.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="colleges" element={<Colleges />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="papers" element={<UploadPaper />} />
          <Route path="users" element={<UsersManagement />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
