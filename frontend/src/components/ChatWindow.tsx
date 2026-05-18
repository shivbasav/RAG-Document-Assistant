import { useEffect, useRef, FormEvent, useState } from 'react';
import { SourceCard }  from './SourceCard';
import { useStream }   from '../hooks/useStream';
import styles          from './ChatWindow.module.css';

interface Props { userId: string; hasDocuments: boolean; }

export function ChatWindow({ userId, hasDocuments }: Props) {
  const { messages, streaming, sendMessage, clearMessages } = useStream();
  const [input,    setInput]   = useState('');
  const bottomRef              = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || streaming) return;
    setInput('');
    sendMessage(query, userId);
  };

  return (
    <div className={styles.wrapper}>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Chat</span>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearMessages}>
            clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyText}>
              {hasDocuments
                ? 'Ask anything about your uploaded documents'
                : 'Upload a PDF first to start chatting'}
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >
            <div className={styles.bubble}>
              <div className={styles.role}>
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className={styles.content}>
                {msg.content}
                {msg.streaming && <span className={styles.cursor} />}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <SourceCard sources={msg.sources} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            hasDocuments
              ? 'Ask a question about your documents...'
              : 'Upload a PDF first...'
          }
          disabled={!hasDocuments || streaming}
        />
        <button
          className={styles.sendBtn}
          type="submit"
          disabled={!input.trim() || !hasDocuments || streaming}
        >
          {streaming ? '...' : '→'}
        </button>
      </form>
    </div>
  );
}