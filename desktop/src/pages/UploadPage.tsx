import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

const UploadPage: React.FC = () => {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploads(prev => [...newUploads, ...prev]);

    for (const upload of newUploads) {
      const formData = new FormData();
      formData.append('file', upload.file);

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://127.0.0.1:8000/api/v1/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Upload failed');
        }

        // Success
        setUploads(prev => prev.map(u => 
          u.file.name === upload.file.name 
            ? { ...u, progress: 100, status: 'success', message: 'Indexed successfully' }
            : u
        ));
      } catch (err: any) {
        setUploads(prev => prev.map(u => 
          u.file.name === upload.file.name 
            ? { ...u, status: 'error', message: err.message }
            : u
        ));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Upload Documents</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add PDFs and TXT files to the offline vector database.</p>
      </header>

      {/* Drag & Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        style={{ marginBottom: '32px' }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            borderRadius: '50%', 
            backgroundColor: isDragActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: isDragActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition-fast)'
          }}>
            <Upload size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: isDragActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
              {isDragActive ? 'Drop files now...' : 'Click or drag files here'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>Supports .pdf and .txt files</p>
          </div>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="glass-card" style={{ padding: '0' }}>
          <h3 style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', fontSize: '1.1rem' }}>
            Upload Queue
          </h3>
          <ul style={{ listStyle: 'none' }}>
            {uploads.map((upload, index) => (
              <li key={`${upload.file.name}-${index}`} style={{ 
                padding: '16px 24px', 
                borderBottom: index !== uploads.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <FileText size={24} color="var(--text-secondary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{upload.file.name}</span>
                    <span style={{ 
                      fontSize: '0.85rem',
                      color: upload.status === 'success' ? 'var(--success-text)' : 
                             upload.status === 'error' ? 'var(--error)' : 'var(--text-secondary)'
                    }}>
                      {upload.status === 'success' && 'Completed'}
                      {upload.status === 'error' && upload.message}
                      {upload.status === 'uploading' && 'Processing...'}
                    </span>
                  </div>
                  {/* Progress Bar Background */}
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: upload.status === 'success' ? '100%' : upload.status === 'error' ? '100%' : '50%',
                      backgroundColor: upload.status === 'success' ? 'var(--accent-primary)' : 
                                       upload.status === 'error' ? 'var(--error)' : 'var(--text-secondary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div>
                  {upload.status === 'success' && <CheckCircle size={24} color="var(--accent-primary)" />}
                  {upload.status === 'error' && <AlertCircle size={24} color="var(--error)" />}
                  {upload.status === 'uploading' && <Loader2 size={24} color="var(--text-secondary)" style={{ animation: 'spin 1s linear infinite' }} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
