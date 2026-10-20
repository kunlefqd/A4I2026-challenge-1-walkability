import type { AgentLocation } from '../types';

/**
 * Agreed contract with the agent lane: the reply is prose, optionally followed by a JSON block
 *   {"locations": [{"lat": 41.78, "lon": -87.64, "label": "63rd & Halsted", "offsetF": 7.1}]}
 * either bare or inside a ```json fence. The block is stripped from the text shown in chat.
 */
export function parseAgentReply(raw: string): { text: string; locations: AgentLocation[] } {
  const fenced = /```(?:json)?\s*(\{[\s\S]*?"locations"[\s\S]*?\})\s*```/i.exec(raw);
  const candidate = fenced ?? bareBlock(raw);
  if (!candidate) return { text: raw.trim(), locations: [] };

  try {
    const parsed = JSON.parse(candidate[1]) as { locations?: unknown };
    const locations = Array.isArray(parsed.locations) ? parsed.locations.filter(isLocation) : [];
    const text = (raw.slice(0, candidate.index) + raw.slice(candidate.index + candidate[0].length)).trim();
    return { text, locations };
  } catch {
    return { text: raw.trim(), locations: [] };
  }
}

function bareBlock(raw: string): { 0: string; 1: string; index: number } | null {
  const index = raw.lastIndexOf('{"locations"');
  if (index === -1) return null;
  const block = raw.slice(index).trim();
  return { 0: raw.slice(index), 1: block, index };
}

function isLocation(value: unknown): value is AgentLocation {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Number.isFinite(v.lat) && Number.isFinite(v.lon);
}
