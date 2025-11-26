
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number; // Cost per unit in KES
  minThreshold: number;
  lastUpdated: string;
}

export const JOB_TYPES = ['Deep Clean', 'Standard Clean', 'Move-out', 'Office'] as const;

export interface Job {
  id: string;
  clientName: string;
  date: string; // ISO date string
  type: typeof JOB_TYPES[number];
  estimatedSupplyUsage: Record<string, number>; // Record<ItemId, Quantity>
}

export interface Prediction {
  itemId: string;
  itemName: string;
  daysRemaining: number;
  runOutDate: string;
  status: 'Safe' | 'Low' | 'Critical';
  recommendation: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SCANNER = 'SCANNER',
  PREDICTIONS = 'PREDICTIONS',
  SCHEDULE = 'SCHEDULE'
}

export const CATEGORIES = ['Chemicals', 'Paper Products', 'Tools', 'PPE', 'Soaps', 'Kitchen', 'General'];
