import type { ActionType, Horizon } from './types';

export const ACTIONS: Record<ActionType, { label: string; horizon: Horizon; description: string }> = {
  mobile_cooling: {
    label: 'Mobile cooling station',
    horizon: 'today',
    description: 'Deploy a misting or air-conditioned trailer for the hottest hours.',
  },
  hydration_truck: {
    label: 'Hydration truck',
    horizon: 'today',
    description: 'Water distribution at a fixed corner on a schedule.',
  },
  wellness_checks: {
    label: 'Wellness checks',
    horizon: 'today',
    description: 'Door-to-door checks on older residents and people without a car.',
  },
  extended_hours: {
    label: 'Extended library hours',
    horizon: 'today',
    description: 'Keep the nearest air-conditioned public building open late.',
  },
  cooling_center: {
    label: 'Permanent cooling center',
    horizon: 'budget_cycle',
    description: 'Fund a year-round cooling center.',
  },
  tree_planting: {
    label: 'Tree planting',
    horizon: 'decade',
    description: 'Add canopy where pavement and building density drive the offset.',
  },
};

export const HORIZON_LABEL: Record<Horizon, string> = {
  today: 'Today',
  budget_cycle: 'Budget cycle',
  decade: 'Decade',
};
