// The data contract between the UI and the agent/data lanes.
// Offsets are always "°F hotter (or cooler) than the city's own average on the campaign day",
// never absolute temperatures.

export interface City {
  name: string;
  scenario: string;
  center: { lat: number; lon: number };
  bbox: [latMin: number, lonMin: number, latMax: number, lonMax: number];
  readingCount: number;
  campaignDate: string;
  /** From station history: average days per summer at or above 95°F. */
  hotDaysPerYear: number;
}

export interface HeatPoint {
  lat: number;
  lon: number;
  offsetF: number;
}

export interface Driver {
  feature: string;
  contributionF: number;
}

export interface Demographics {
  population: number;
  medianAge: number;
  /** Share of households without a vehicle, 0–1. */
  noVehicleRate: number;
  medianIncome: number;
}

export type Severity = 'high' | 'medium' | 'low';

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tractGeoId: string;
  /** Predicted offset from the BQML model, in °F. */
  offsetF: number;
  severity: Severity;
  demographics: Demographics;
  /** ML.EXPLAIN_PREDICT attributions. Secondary in the Today track. */
  drivers: Driver[];
  suggestedActions: ActionType[];
}

export type Horizon = 'today' | 'budget_cycle' | 'decade';

export type ActionType =
  | 'mobile_cooling'
  | 'hydration_truck'
  | 'wellness_checks'
  | 'extended_hours'
  | 'cooling_center'
  | 'tree_planting';

export type ActionStatus = 'proposed' | 'approved' | 'deployed';

export interface ActionLogEntry {
  id: string;
  hotspotId: string;
  type: ActionType;
  status: ActionStatus;
  timestamp: string;
  note?: string;
}

/** A location the agent referenced in a reply. */
export interface AgentLocation {
  lat: number;
  lon: number;
  label?: string;
  offsetF?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  locations?: AgentLocation[];
  error?: boolean;
}

export interface CityData {
  city: City;
  heatPoints: HeatPoint[];
  hotspots: Hotspot[];
  isMock: boolean;
}
