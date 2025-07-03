'use server';

export type ShipType = "Combat" | "Mining" | "Support" | "Galleon";
export type ControlScheme = 'relative' | 'absolute' | 'hybrid';
export type ShipMode = 'normal' | 'cruise' | 'stealth' | 'scan' | 'shield';
export type ContextMenuTargetType = 'enemy' | 'asteroid' | 'station';
export type PlayerActionType = 'mining' | 'boarding' | 'pillaging';

export type ShipSize = 'S' | 'M' | 'L' | 'XL';
export type ShipRole = 'Combat' | 'Commerce' | 'Mining' | 'Construction' | 'Support';

// Player ship types defined for future use
export type PlayerShipClass = 'Chasseur' | 'Intercepteur' | 'Frégate' | 'Destroyer' | 'Porteur' | 'Cargo' | 'Mineur';

export interface Resources {
  money: number;
  ore: number;
  gas: number;
}

export interface ShipData {
    class: PlayerShipClass;
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

export type EnemyAiState = 'patrolling' | 'chasing' | 'searching' | 'fleeing' | 'following';
export type BotShipType = 'chasseur' | 'frigate' | 'staff';

export type EnemyState = {
  id: number;
  type: BotShipType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  lastShotTimestamp: number;
  aiState: EnemyAiState;
  lastKnownPlayerPosition: { x: number, y: number } | null;
  stateChangeTimestamp: number;
  energy: number;
  maxEnergy: number;
  cargo: number;
  lastEnergyUseTimestamp: number;
  isAlly?: boolean;
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
  resources: Partial<Resources>;
}
