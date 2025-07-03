export type ShipType = "Combat" | "Mining" | "Support" | "Galleon";
export type ControlScheme = 'relative' | 'absolute' | 'hybrid';
export type ShipMode = 'normal' | 'cruise' | 'stealth' | 'scan';

export type ShipSize = 'S' | 'M' | 'L' | 'XL';
export type ShipRole = 'Combat' | 'Commerce' | 'Mining' | 'Construction' | 'Support';
export type ShipClass = 'Fighter' | 'Frigate' | 'Destroyer' | 'Corvette' | 'Galleon' | 'Hauler' | 'Miner';

export interface Resources {
  money: number;
  ore: number;
  gas: number;
}

export interface ShipData {
    class: ShipClass;
    role: ShipRole;
    size: ShipSize;
    upgrades: Record<string, number>;
}

export interface PlayerData {
  level: number;
  ship: ShipData;
  health: number;
  energy: number;
  cargo: {
    current: number;
    max: number;
  };
  resources: Resources;
}

export type VesselSystemStatus = 'Online' | 'Ready' | 'Optimal' | 'Offline' | 'Damaged';

export interface VesselSystemsData {
  shields: VesselSystemStatus;
  weapons: VesselSystemStatus;
  power: VesselSystemStatus;
}

export interface StellarBaseData {
  shields: number;
  hull: number;
}

export type EnemyState = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  lastShotTimestamp: number;
};

export type AsteroidState = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export type StationState = {
  id: number;
  x: number;
  y: number;
}

export type Debris = {
  id: number;
  x: number;
  y: number;
  amount: number;
}
