export interface Message {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  sources?:  Source[];
  streaming?: boolean;
}

export interface Source {
  source: string;
  page:   number;
  score?: number;
}

export interface Document {
  doc_id:       string;
  filename:     string;
  pages:        number;
  total_chunks: number;
}

export interface IngestResponse {
  doc_id:       string;
  filename:     string;
  pages:        number;
  total_chunks: number;
}