export type ShipType = "Combat" | "Mining" | "Support" | "Galleon";
export type ControlScheme = 'relative' | 'absolute' | 'hybrid';

export interface Resources {
  money: number;
  ore: number;
  gas: number;
}

export interface PlayerData {
  level: number;
  shipType: ShipType;
  health: number;
  energy: number;
  cargo: {
    current: number;
    max: number;
  };
  resources: Resources;
  upgrades: Record<string, number>;
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
