import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const UploadPaper = () => {
  const [papers, setPapers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    adminService.getPapers()
      .then(data => setPapers(data))
      .catch(err => console.error(err));
  }, [uploading]);

  const handleUpload = (e) => {
    // Integration ready: use adminService.uploadPaper(formData)
    alert('Select a file to upload (Backend is ready for PDF processing)');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Question Papers</h1>
      </div>

      <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '32px', textAlign: 'center', border: '2px dashed #cbd5e1' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }}>upload_file</span>
        <h3 style={{ margin: '0 0 8px', color: '#334155' }}>Upload PDF Question Paper</h3>
        <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>Questions will be automatically extracted.</p>
        <button onClick={handleUpload} disabled={uploading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: uploading ? 'wait' : 'pointer', fontWeight: 500 }}>
          {uploading ? 'Parsing PDF...' : 'Select PDF File'}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Paper</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>College / Subject</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Extracted</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {papers.map(paper => (
              <tr key={paper.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{paper.exam_type} {paper.year}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{paper.college_name} - {paper.subject_name}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{paper.questions_count} Questions</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, background: paper.is_processed ? '#dcfce7' : '#fef3c7', color: paper.is_processed ? '#166534' : '#92400e' }}>
                    {paper.is_processed ? 'Processed' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No papers uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadPaper;
