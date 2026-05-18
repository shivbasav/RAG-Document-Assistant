import { useState, useCallback, useRef } from 'react';
import { streamQuestion } from '../api/client';
import type { Message, Source } from '../types';

export function useStream() {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [streaming,  setStreaming]   = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const sendMessage = useCallback(async (query: string, userId: string) => {
    // 1. Add user message
    const userMsg: Message = {
      id:      crypto.randomUUID(),
      role:    'user',
      content: query,
    };

    // 2. empty assistant message that we will stream into
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id:        assistantId,
      role:      'assistant',
      content:   '',
      sources:   [],
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    // 3. Close any existing stream
    esRef.current?.close();

    // 4. Open SSE stream
    const es = streamQuestion(query, userId);
    esRef.current = es;

    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        // Mark streaming complete
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
        setStreaming(false);
        es.close();
        return;
      }

      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === 'sources') {
          // Sources come first attach them to assistant message
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, sources: parsed.sources as Source[] }
                : m,
            ),
          );
        }

        if (parsed.type === 'token') {
          // Append all tokens to the content
          const text = parsed.text.replace(/\\n/g, '\n');
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + text }
                : m,
            ),
          );
        }

        if (parsed.type === 'error') {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: parsed.message || 'Something went wrong.', streaming: false }
                : m,
            ),
          );
          setStreaming(false);
          es.close();
          return;
        }
      } catch {
        // Plain text fallback
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + event.data }
              : m,
          ),
        );
      }
    };

    es.onerror = () => {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content || 'Something went wrong. Please try again.', streaming: false }
            : m,
        ),
      );
      setStreaming(false);
      es.close();
    };
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, streaming, sendMessage, clearMessages };
}