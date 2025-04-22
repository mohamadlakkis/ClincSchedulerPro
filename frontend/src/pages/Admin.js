import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function Admin() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Check if user is logged in as admin
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setFile(null);
      setMessage('Please select a valid PDF file');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a PDF file to upload');
      setMessageType('error');
      return;
    }
    
    setUploading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8001/addPDFToVB', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Document successfully uploaded to RAG system!');
        setMessageType('success');
        setFile(null);
        // Reset file input
        document.getElementById('file-upload').value = '';
      } else {
        throw new Error(data.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.message || 'An error occurred during upload');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="admin-content">
        <div className="upload-section">
          <h2>Upload Document to RAG System</h2>
          <p className="upload-description">
            Upload PDF documents to enhance the clinic's medical knowledge base. 
            These documents will be used by the AI to provide more accurate responses.
          </p>
          
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-input-container">
              <label htmlFor="file-upload" className="file-input-label">
                {file ? file.name : 'Choose a PDF file'}
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>
            
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}
            
            <button 
              type="submit" 
              className="upload-button"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Admin;