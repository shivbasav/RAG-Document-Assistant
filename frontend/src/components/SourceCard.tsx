import { useState }  from 'react';
import type { Source } from '../types';
import styles          from './SourceCard.module.css';

interface Props { sources: Source[]; }

export function SourceCard({ sources }: Props) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen(o => !o)}>
        <span className={styles.icon}>📎</span>
        {sources.length} source{sources.length > 1 ? 's' : ''} used
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.list}>
          {sources.map((s, i) => (
            <div key={i} className={styles.source}>
              <span className={styles.filename}>{s.source}</span>
              <span className={styles.page}>Page {s.page}</span>
              {s.score !== undefined && (
                <span className={styles.score}>
                  {Math.round(s.score * 100)}% match
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}