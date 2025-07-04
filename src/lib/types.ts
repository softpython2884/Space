'use server';

export type ShipType = "Combat" | "Mining" | "Support" | "Galleon";
export type ControlScheme = 'relative' | 'absolute' | 'hybrid';
export type ShipMode = 'normal' | 'cruise' | 'stealth' | 'scan' | 'shield';
export type ContextMenuTargetType = 'enemy' | 'asteroid' | 'station' | 'tactical_space' | 'ally';
export type PlayerActionType = 'mining' | 'boarding' | 'pillaging' | 'open_station_menu' | 'tactical_move' | 'patrolling_order' | 'follow_target';

export type ShipSize = 'S' | 'M' | 'L' | 'XL';
export type ShipRole = 'Combat' | 'Commerce' | 'Mining' | 'Construction' | 'Support';

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
  antimatterReactor: number;
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

export type EnemyAiState = 'patrolling' | 'chasing' | 'searching' | 'fleeing' | 'following' | 'mining' | 'returning_to_base' | 'guarding' | 'scavenging' | 'moving_to_order' | 'patrolling_order' | 'recharging';
export type BotShipType = 'Chasseur' | 'Frégate' | 'Mineur' | 'Intercepteur' | 'Destroyer' | 'Porteur' | 'Cargo';

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
  role?: 'escort' | 'miner' | 'attack';
  targetObjectId?: number | null;
  combatTargetId?: number | null;
  patrolCenter?: { x: number, y: number };
  lastAttackerId?: number | null;
  patrolTarget?: { x: number, y: number } | null;
  orderTarget?: { x: number, y: number } | null;
  followTargetId?: number | null;
  shipMode?: ShipMode;
  cruiseState?: 'idle' | 'charging' | 'cruising';
  cruiseChargeStartTimestamp?: number;
  cruiseDurationStartTimestamp?: number;
  cruiseAvailableAt?: number;
  fleeFrom?: { x: number, y: number } | null;
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
  owner: 'player' | 'enemy';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lastHitTimestamp: number;
}

export type FactionData = {
    money: number;
    ships: number[];
    shipCounts: Record<BotShipType, number>;
}


export type OutpostState = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  ownerId: number; // To know if it's player's or AI's
  lastShotTimestamp: number;
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
  type: 'basic' | 'heavy';
  sourceOffsetX?: number;
  sourceOffsetY?: number;
  isAlly?: boolean;
}

export type ProjectileState = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  rotation: number;
  ownerId: number;
  type: 'basic' | 'heavy';
};

export type PlayerAction = {
  type: PlayerActionType;
  targetId: number | null;
  startTime: number;
  duration: number;
};

export interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    color?: string;
}

export type ZoneType = 'nebula' | 'asteroid_field' | 'empty' | 'vortex';
export interface Zone {
  id: string;
  type: ZoneType;
  x: number;
  y: number;
  radius: number;
  density?: number;
  color?: string;
}
