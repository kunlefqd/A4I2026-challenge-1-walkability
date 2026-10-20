import type { Hotspot } from '../types';
import { mockAgentReply } from './mock';

export const AGENT_IS_MOCK = !import.meta.env.VITE_AGENT_URL;

const APP_NAME = import.meta.env.VITE_AGENT_APP_NAME || 'heat_agent';
const USER_ID = 'planner';
// Proxied to VITE_AGENT_URL by vite.config.ts.
const BASE = '/agent';

let sessionId: string | null = null;

async function ensureSession(): Promise<string> {
  if (sessionId) return sessionId;
  const res = await fetch(`${BASE}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw new Error(`Could not create agent session (${res.status})`);
  const session = (await res.json()) as { id: string };
  sessionId = session.id;
  return sessionId;
}

interface AdkEvent {
  author?: string;
  content?: { role?: string; parts?: { text?: string }[] };
}

/** Sends one message and returns the agent's raw reply text (locations block included). */
export async function askAgent(message: string, hotspots: Hotspot[]): Promise<string> {
  if (AGENT_IS_MOCK) return mockAgentReply(message, hotspots);

  const session = await ensureSession();
  const res = await fetch(`${BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appName: APP_NAME,
      userId: USER_ID,
      sessionId: session,
      newMessage: { role: 'user', parts: [{ text: message }] },
    }),
  });
  if (!res.ok) throw new Error(`Agent request failed (${res.status})`);

  // /run returns every event of the turn (tool calls included); keep the model's text.
  const events = (await res.json()) as AdkEvent[];
  const text = events
    .filter((e) => e.content?.role === 'model')
    .flatMap((e) => e.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  return text || 'The agent returned no text for that question.';
}
