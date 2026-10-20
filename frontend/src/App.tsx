import { useCallback, useEffect, useState } from 'react';
import { loadCityData } from './data';
import { AGENT_IS_MOCK, askAgent } from './agent/client';
import { parseAgentReply } from './agent/parseLocations';
import { CityHeader } from './components/CityHeader';
import { AlertsPanel } from './components/AlertsPanel';
import { HeatMap, type FocusRequest } from './components/HeatMap';
import { ChatPanel } from './components/ChatPanel';
import { ActionLog } from './components/ActionLog';
import type { ActionLogEntry, ActionStatus, ActionType, AgentLocation, ChatMessage, CityData } from './types';

let nextId = 0;
const newId = () => `${Date.now()}-${nextId++}`;

export default function App() {
  const [data, setData] = useState<CityData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [agentLocations, setAgentLocations] = useState<AgentLocation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [log, setLog] = useState<ActionLogEntry[]>([]);

  useEffect(() => {
    loadCityData()
      .then(setData)
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  const focusOn = useCallback((points: { lat: number; lon: number }[]) => {
    setFocus((prev) => ({ points, seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  const selectHotspot = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id));
      const spot = data?.hotspots.find((h) => h.id === id);
      if (spot) focusOn([spot]);
    },
    [data, focusOn],
  );

  const showAgentLocations = useCallback(
    (locations: AgentLocation[]) => {
      setAgentLocations(locations);
      focusOn(locations);
    },
    [focusOn],
  );

  async function send(text: string) {
    if (!data) return;
    setMessages((m) => [...m, { id: newId(), role: 'user', text }]);
    setPending(true);
    try {
      const { text: reply, locations } = parseAgentReply(await askAgent(text, data.hotspots));
      setMessages((m) => [...m, { id: newId(), role: 'agent', text: reply, locations }]);
      if (locations.length > 0) showAgentLocations(locations);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages((m) => [...m, { id: newId(), role: 'agent', text: `Couldn't reach the agent: ${message}`, error: true }]);
    } finally {
      setPending(false);
    }
  }

  function takeAction(hotspotId: string, type: ActionType) {
    setLog((l) => [{ id: newId(), hotspotId, type, status: 'proposed', timestamp: new Date().toISOString() }, ...l]);
  }

  function changeStatus(id: string, status: ActionStatus) {
    setLog((l) => l.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  if (loadError) return <div className="app-message">Couldn't load city data: {loadError}</div>;
  if (!data) return <div className="app-message">Loading city data…</div>;

  return (
    <div className="app">
      <CityHeader city={data.city} hotspots={data.hotspots} isMockData={data.isMock} isMockAgent={AGENT_IS_MOCK} />
      <AlertsPanel hotspots={data.hotspots} selectedId={selectedId} onSelect={selectHotspot} onTakeAction={takeAction} />
      <main className="map-area">
        <HeatMap
          city={data.city}
          heatPoints={data.heatPoints}
          hotspots={data.hotspots}
          selectedId={selectedId}
          agentLocations={agentLocations}
          focus={focus}
          onSelectHotspot={selectHotspot}
        />
      </main>
      <ChatPanel messages={messages} pending={pending} onSend={send} onShowLocations={showAgentLocations} />
      <ActionLog entries={log} hotspots={data.hotspots} onStatusChange={changeStatus} onSelectHotspot={selectHotspot} />
    </div>
  );
}
