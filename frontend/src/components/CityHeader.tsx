import type { City, Hotspot } from '../types';

interface Props {
  city: City;
  hotspots: Hotspot[];
  isMockData: boolean;
  isMockAgent: boolean;
}

export function CityHeader({ city, hotspots, isMockData, isMockAgent }: Props) {
  const hottest = hotspots.reduce((max, h) => Math.max(max, h.offsetF), 0);
  const highCount = hotspots.filter((h) => h.severity === 'high').length;

  return (
    <header className="city-header">
      <div className="city-header__title">
        <h1>{city.name} Heat Response</h1>
        <span className="track-badge">⚡ Today</span>
        {isMockData && <span className="mock-badge">Mock data</span>}
        {isMockAgent && <span className="mock-badge">Mock agent</span>}
      </div>
      <p className="city-header__scenario">{city.scenario}</p>
      <dl className="stats">
        <Stat label="Hotspots" value={`${hotspots.length}`} sub={`${highCount} high`} />
        <Stat label="Hottest offset" value={`+${hottest.toFixed(1)}°F`} sub="vs. city average" />
        <Stat label="Days ≥ 95°F" value={`${city.hotDaysPerYear}`} sub="per summer, station avg" />
        <Stat label="Street readings" value={city.readingCount.toLocaleString()} sub={city.campaignDate} />
      </dl>
    </header>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>
        <span className="stat__value">{value}</span>
        <span className="stat__sub">{sub}</span>
      </dd>
    </div>
  );
}
