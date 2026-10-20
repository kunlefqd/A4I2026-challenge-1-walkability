import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AgentLocation, ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  pending: boolean;
  onSend: (text: string) => void;
  onShowLocations: (locations: AgentLocation[]) => void;
}

const SUGGESTIONS = [
  'Where should the 4 mobile cooling units go on Thursday?',
  'Why is Englewood so much hotter than the city average?',
  'Who lives around Little Village: how many without a car?',
];

export function ChatPanel({ messages, pending, onSend, onShowLocations }: Props) {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    onSend(text);
    setDraft('');
  }

  return (
    <section className="panel chat" aria-label="Chat with the heat agent">
      <h2 className="panel__title">Ask the agent</h2>

      <div className="chat__messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat__empty">
            <p>Ask about hotspots, who lives there, or where to send resources.</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => onSend(s)} disabled={pending}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`msg msg--${m.role} ${m.error ? 'msg--error' : ''}`}>
            <div className="msg__text">{m.text}</div>
            {m.locations && m.locations.length > 0 && (
              <button className="btn btn--small btn--ghost" onClick={() => onShowLocations(m.locations!)}>
                📍 Show {m.locations.length} location{m.locations.length > 1 ? 's' : ''} on map
              </button>
            )}
          </div>
        ))}

        {pending && <div className="msg msg--agent msg--pending">Thinking…</div>}
        <div ref={endRef} />
      </div>

      <form className="chat__form" onSubmit={submit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about a neighborhood or a plan…"
          aria-label="Message"
        />
        <button className="btn" type="submit" disabled={pending || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
