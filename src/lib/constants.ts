import type { PlayerData, ShipType } from "@/lib/types";

export const SHIP_TYPES: [ShipType, ...ShipType[]] = ["Combat", "Mining", "Support", "Galleon"];

export const INITIAL_PLAYER_DATA: PlayerData = {
  level: 5,
  shipType: "Combat",
  health: 85,
  energy: 70,
  cargo: {
    current: 150,
    max: 200,
  },
  resources: {
    money: 1250,
    ore: 500,
    gas: 300,
  },
  upgrades: {
    "Laser Cannon": 2,
    "Deflector Shields": 1,
  },
};
