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

export interface PlayerUpgrades {
  maxHealth: number;
  energyRecharge: number;
  nanobots: number;
  cargoCapacity: number;
}

export interface WeaponConfig {
    manualTurrets: {
        count: number;
        type: 'basic' | 'heavy';
        offsets: {x: number, y: number}[];
    };
    autoTurrets?: {
        count: number;
        type: 'basic' | 'heavy';
        offsets: {x: number, y: number}[];
    };
    beam?: {
        count: number;
        type: 'basic' | 'heavy';
        offsets: {x: number, y: number}[];
    };
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
  };
  resources: Resources;
  upgrades: PlayerUpgrades;
}

export type VesselSystemStatus = 'Online' | 'Ready' | 'Optimal' | 'Offline' | 'Damaged';

export interface VesselSystemsData {
  shields: VesselSystemStatus;
  weapons: VesselSystemStatus;
  power: VesselSystemStatus;
}

export interface StellarBaseData {
  shields: number;
  maxShields: number;
  hull: number;
  maxHull: number;
}

export type EnemyAiState = 'patrolling' | 'chasing' | 'searching' | 'fleeing' | 'following' | 'mining' | 'returning_to_base' | 'guarding' | 'scavenging';
export type BotShipType = 'Chasseur' | 'Frégate' | 'Mineur' | 'Intercepteur';

export type EnemyState = {
  id: number;
  type: BotShipType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  health: number;
  maxHealth: number;
  lastShotTimestamp: number;
  lastAutoShotTimestamp: number;
  aiState: EnemyAiState;
  lastKnownPlayerPosition: { x: number, y: number } | null;
  stateChangeTimestamp: number;
  energy: number;
  maxEnergy: number;
  cargo: number;
  lastEnergyUseTimestamp: number;
  isAlly?: boolean;
  role?: 'escort' | 'miner';
  targetObjectId?: number | null;
  combatTargetId?: number | null;
  patrolCenter?: { x: number, y: number };
  lastAttackerId?: number | null;
  patrolTarget?: { x: number, y: number } | null;
  followTargetId?: number | null;
  shipMode?: ShipMode;
};

export type AsteroidState = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  mineableCharges: number;
  cooldownUntil: number;
}

export type StationState = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lastHitTimestamp: number;
}

export type Debris = {
  id: number;
  x: number;
  y: number;
  resources: Partial<Resources>;
}

export interface BeamState {
  id: number;
  sourceId: number;
  targetId: number;
  startTime: number;
  type: 'basic' | 'heavy';
  sourceOffsetX?: number;
  sourceOffsetY?: number;
}
