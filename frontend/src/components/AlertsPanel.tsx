import { ACTIONS } from '../actions';
import type { ActionType, Hotspot } from '../types';

interface Props {
  hotspots: Hotspot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTakeAction: (hotspotId: string, type: ActionType) => void;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function AlertsPanel({ hotspots, selectedId, onSelect, onTakeAction }: Props) {
  const sorted = [...hotspots].sort((a, b) => b.offsetF - a.offsetF);

  return (
    <section className="panel alerts" aria-label="Hotspot alerts">
      <h2 className="panel__title">
        Alerts <span className="count">{hotspots.length}</span>
      </h2>
      <ul className="alerts__list">
        {sorted.map((h) => {
          const d = h.demographics;
          const selected = h.id === selectedId;
          return (
            <li key={h.id} className={`alert alert--${h.severity} ${selected ? 'is-selected' : ''}`}>
              <button className="alert__head" onClick={() => onSelect(h.id)} aria-expanded={selected}>
                <span className="alert__offset">+{h.offsetF.toFixed(1)}°F</span>
                <span className="alert__name">{h.name}</span>
              </button>

              <dl className="alert__people">
                <div title="Households without a vehicle">
                  <dt>No car</dt>
                  <dd className={d.noVehicleRate >= 0.3 ? 'is-flag' : ''}>{pct(d.noVehicleRate)}</dd>
                </div>
                <div>
                  <dt>Median age</dt>
                  <dd className={d.medianAge >= 40 ? 'is-flag' : ''}>{d.medianAge}</dd>
                </div>
                <div>
                  <dt>Residents</dt>
                  <dd>{d.population.toLocaleString()}</dd>
                </div>
              </dl>

              {selected && (
                <>
                  <p className="alert__drivers">
                    Why it's hot:{' '}
                    {h.drivers
                      .map((dr) => `${dr.feature.replace(/_/g, ' ')} ${dr.contributionF >= 0 ? '+' : '−'}${Math.abs(dr.contributionF).toFixed(1)}°`)
                      .join(' · ')}
                  </p>
                  <div className="alert__actions">
                    {h.suggestedActions.map((type) => (
                      <button key={type} className="btn btn--small" onClick={() => onTakeAction(h.id, type)} title={ACTIONS[type].description}>
                        + {ACTIONS[type].label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
