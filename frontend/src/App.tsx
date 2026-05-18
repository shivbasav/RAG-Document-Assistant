import { useState }      from 'react';
import { PDFUploader }   from './components/PDFUploader';
import { ChatWindow }    from './components/ChatWindow';
import type { Document } from './types';
import styles            from './App.module.css';

const USER_ID = 'user_' + Math.random().toString(36).slice(2, 9);

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleUploaded = (doc: Document) => {
    setDocuments(prev => [...prev, doc]);
  };

  return (
    <div className={styles.app}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>RAG<span>_</span>docs</div>
        <div className={styles.badge}>
          <span className={styles.dot} />
          {documents.length} document{documents.length !== 1 ? 's' : ''} loaded
        </div>
      </header>

      {/* Main layout */}
      <main className={styles.main}>

        {/* Left panel */}
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <p className={styles.sectionLabel}>// upload</p>
            <PDFUploader userId={USER_ID} onUploaded={handleUploaded} />
          </div>

          {documents.length > 0 && (
            <div className={styles.sideSection}>
              <p className={styles.sectionLabel}>// documents</p>
              <div className={styles.docList}>
                {documents.map(doc => (
                  <div key={doc.doc_id} className={styles.docItem}>
                    <span className={styles.docName}>{doc.filename}</span>
                    <span className={styles.docMeta}>
                      {doc.pages}p · {doc.total_chunks} chunks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sideSection}>
            <p className={styles.sectionLabel}>// how it works</p>
            <div className={styles.steps}>
              <div className={styles.step}><span className={styles.stepNum}>01</span>Upload a PDF</div>
              <div className={styles.step}><span className={styles.stepNum}>02</span>It gets chunked + embedded</div>
              <div className={styles.step}><span className={styles.stepNum}>03</span>Ask any question</div>
              <div className={styles.step}><span className={styles.stepNum}>04</span>Get cited answers</div>
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        <section className={styles.chat}>
          <ChatWindow
            userId={USER_ID}
            hasDocuments={documents.length > 0}
          />
        </section>

      </main>
    </div>
  );
}