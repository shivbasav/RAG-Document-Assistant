const BASE = 'http://localhost:8000';

export async function ingestPDF(
  file: File,
  userId: string,
): Promise<{ doc_id: string; filename: string; pages: number; total_chunks: number }> {
  const form = new FormData();
  form.append('file', file);
  form.append('user_id', userId);

  const res = await fetch(`${BASE}/ingest`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function askQuestion(
  query: string,
  userId: string,
): Promise<{ answer: string; sources: { source: string; page: number; score: number }[] }> {
  const res = await fetch(`${BASE}/ask`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query, user_id: userId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export function streamQuestion(
  query: string,
  userId: string,
): EventSource {
  const url = `${BASE}/ask/stream?query=${encodeURIComponent(query)}&user_id=${encodeURIComponent(userId)}`;
  return new EventSource(url);
}