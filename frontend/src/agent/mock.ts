import type { Hotspot } from '../types';

const pct = (n: number) => `${Math.round(n * 100)}%`;

function locationsBlock(spots: Hotspot[]): string {
  const locations = spots.map((h) => ({ lat: h.lat, lon: h.lon, label: h.name, offsetF: h.offsetF }));
  return '```json\n' + JSON.stringify({ locations }) + '\n```';
}

/** Canned replies in the same shape the real agent will send: prose plus a locations block. */
export async function mockAgentReply(message: string, hotspots: Hotspot[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 700));
  const q = message.toLowerCase();

  const named = hotspots.find((h) => q.includes(h.name.split(' – ')[0].toLowerCase()));
  if (named) {
    const d = named.demographics;
    return (
      `${named.name} is predicted to run +${named.offsetF.toFixed(1)}°F hotter than the Chicago average. ` +
      `About ${d.population.toLocaleString()} people live in the tract; median age ${d.medianAge}, and ` +
      `${pct(d.noVehicleRate)} of households have no car, so many residents can't easily leave for a ` +
      `cooler place. Mostly driven by ${named.drivers[0].feature.replace(/_/g, ' ')}.\n\n` +
      locationsBlock([named])
    );
  }

  // Default: a Today-track ranking that weighs the offset by who can't leave.
  const ranked = [...hotspots]
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
  const lines = ranked.map(
    (h, i) =>
      `${i + 1}. ${h.name}: +${h.offsetF.toFixed(1)}°F, ${pct(h.demographics.noVehicleRate)} without a car, ` +
      `median age ${h.demographics.medianAge}`,
  );
  return (
    `(Mock agent) For Thursday I'd send the mobile cooling units here first, ranked by predicted heat ` +
    `offset weighted by residents who can't leave:\n\n${lines.join('\n')}\n\n` +
    locationsBlock(ranked)
  );
}

function score(h: Hotspot): number {
  const d = h.demographics;
  return h.offsetF * (1 + d.noVehicleRate) * (d.medianAge >= 40 ? 1.15 : 1);
}
