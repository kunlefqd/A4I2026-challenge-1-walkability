import { ACTIONS, HORIZON_LABEL } from '../actions';
import type { ActionLogEntry, ActionStatus, Hotspot } from '../types';

interface Props {
  entries: ActionLogEntry[];
  hotspots: Hotspot[];
  onStatusChange: (id: string, status: ActionStatus) => void;
  onSelectHotspot: (id: string) => void;
}

const STATUSES: ActionStatus[] = ['proposed', 'approved', 'deployed'];

export function ActionLog({ entries, hotspots, onStatusChange, onSelectHotspot }: Props) {
  const byId = new Map(hotspots.map((h) => [h.id, h]));

  return (
    <section className="panel log" aria-label="Actions taken">
      <h2 className="panel__title">
        Actions <span className="count">{entries.length}</span>
      </h2>
      {entries.length === 0 ? (
        <p className="log__empty">No actions yet. Open an alert and add one.</p>
      ) : (
        <div className="log__scroll">
          <table className="log__table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Horizon</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const action = ACTIONS[e.type];
                const spot = byId.get(e.hotspotId);
                return (
                  <tr key={e.id}>
                    <td className="log__time">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{action.label}</td>
                    <td>
                      <span className={`horizon horizon--${action.horizon}`}>{HORIZON_LABEL[action.horizon]}</span>
                    </td>
                    <td>
                      <button className="link" onClick={() => onSelectHotspot(e.hotspotId)}>
                        {spot?.name ?? e.hotspotId}
                      </button>
                    </td>
                    <td>
                      <select
                        className={`status status--${e.status}`}
                        value={e.status}
                        onChange={(ev) => onStatusChange(e.id, ev.target.value as ActionStatus)}
                        aria-label="Status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
