import type { PlayerData, PlayerUpgrades } from "@/lib/types";

export const INITIAL_PLAYER_UPGRADES: PlayerUpgrades = {
  maxHealth: 0,
  energyRecharge: 0,
  nanobots: 0,
  cargoCapacity: 0,
};

export const INITIAL_PLAYER_DATA: PlayerData = {
  level: 5,
  ship: {
    class: "Chasseur",
    role: "Combat",
    size: "S",
    upgrades: {
      "Laser Cannon": 2,
      "Deflector Shields": 1,
    },
  },
  health: 100,
  energy: 70,
  cargo: {
    current: 0,
    max: 200,
  },
  resources: {
    money: 150,
    ore: 0,
    gas: 0,
  },
  upgrades: INITIAL_PLAYER_UPGRADES,
};

export const UPGRADE_COSTS = {
  maxHealth: [100, 250, 500, 1000, 2000],
  energyRecharge: [150, 300, 600, 1200, 2500],
  nanobots: [500, 1000, 2000, 4000, 8000],
  cargoCapacity: [50, 150, 300, 600, 1200],
};

export const UPGRADE_VALUES = {
  maxHealth: [100, 120, 150, 200, 250, 300], // Base is level 0
  energyRecharge: [0.02, 0.025, 0.03, 0.04, 0.05, 0.06], // Base is level 0
  nanobots: [0, 0.005, 0.01, 0.015, 0.02, 0.03], // Base is level 0
  cargoCapacity: [200, 250, 325, 450, 600, 800], // Base is level 0
};

export const RESOURCE_PRICES = {
  ore: 5,
  gas: 12,
};
