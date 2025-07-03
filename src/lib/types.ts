export type ShipType = "Combat" | "Mining" | "Support" | "Galleon";

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
