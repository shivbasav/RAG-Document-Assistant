import { useCallback, useState } from 'react';
import { useDropzone }            from 'react-dropzone';
import { ingestPDF }              from '../api/client';
import type { Document }          from '../types';
import styles                     from './PDFUploader.module.css';

interface Props {
  userId:   string;
  onUploaded: (doc: Document) => void;
}

export function PDFUploader({ userId, onUploaded }: Props) {
  const [status,   setStatus]   = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message,  setMessage]  = useState('');
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setStatus('error');
      setMessage('Only PDF files are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus('error');
      setMessage('File too large — max 10MB');
      return;
    }

    setStatus('uploading');
    setMessage(`Uploading ${file.name}...`);
    setProgress(30);

    try {
      setProgress(60);
      const result = await ingestPDF(file, userId);
      setProgress(100);
      setStatus('success');
      setMessage(`✓ ${result.filename} — ${result.pages} pages, ${result.total_chunks} chunks indexed`);
      onUploaded(result as Document);

      // Reset after 3s
      setTimeout(() => { setStatus('idle'); setMessage(''); setProgress(0); }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Upload failed');
      setProgress(0);
    }
  }, [userId, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  });

  return (
    <div className={styles.wrapper}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${status === 'error' ? styles.errored : ''}`}
      >
        <input {...getInputProps()} />
        <div className={styles.icon}>
          {status === 'uploading' ? '⏳' : status === 'success' ? '✓' : '📄'}
        </div>
        <p className={styles.label}>
          {isDragActive
            ? 'Drop your PDF here'
            : status === 'uploading'
            ? 'Processing...'
            : 'Drag & drop a PDF, or click to browse'}
        </p>
        <p className={styles.hint}>Max 10MB · PDF only</p>
      </div>

      {status === 'uploading' && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      )}

      {message && (
        <p className={`${styles.msg} ${status === 'error' ? styles.msgError : styles.msgSuccess}`}>
          {message}
        </p>
      )}
    </div>
  );
}