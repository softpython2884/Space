import type { PlayerData, PlayerUpgrades, PlayerShipClass } from "@/lib/types";

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
  },
  resources: {
    money: 150,
    ore: 0,
    gas: 0,
  },
  upgrades: INITIAL_PLAYER_UPGRADES,
};

export const SHIP_DATA: Record<PlayerShipClass, { name: PlayerShipClass, description: string, cost: number, baseHealth: number, baseCargo: number }> = {
    'Chasseur': { name: 'Chasseur', description: 'Vaisseau de base polyvalent. Peut être équipé de tourelles automatiques.', cost: 0, baseHealth: 100, baseCargo: 200 },
    'Intercepteur': { name: 'Intercepteur', description: 'Petit et rapide, idéal pour les raids éclairs et l\'esquive.', cost: 5000, baseHealth: 75, baseCargo: 100 },
    'Frégate': { name: 'Frégate', description: 'Vaisseau de guerre lourdement armé. Futurs modules : rayons énergétiques et tourelles lourdes.', cost: 20000, baseHealth: 250, baseCargo: 150 },
    'Destroyer': { name: 'Destroyer', description: 'Plateforme d\'armement mobile dévastatrice. Futurs modules : armes destructrices et multiples tourelles.', cost: 50000, baseHealth: 400, baseCargo: 250 },
    'Porteur': { name: 'Porteur', description: 'Transporte et déploie une escouade de drones (fonction à venir).', cost: 35000, baseHealth: 200, baseCargo: 300 },
    'Cargo': { name: 'Cargo', description: 'Soute immense et coque résistante, mais lent et peu maniable.', cost: 15000, baseHealth: 150, baseCargo: 1000 },
    'Mineur': { name: 'Mineur', description: 'Équipé pour une extraction de ressources rapide et efficace. Octroie un bonus de rendement.', cost: 12000, baseHealth: 100, baseCargo: 500 },
};

export const ALLY_COST = 2500;


export const UPGRADE_COSTS = {
  maxHealth: [100, 250, 500, 1000, 2000],
  energyRecharge: [150, 300, 600, 1200, 2500],
  nanobots: [500, 1000, 2000, 4000, 8000],
  cargoCapacity: [50, 150, 300, 600, 1200],
};

export const UPGRADE_VALUES = {
  maxHealth: [0, 20, 50, 100, 150, 200], // Additive Bonus HP
  energyRecharge: [0.02, 0.025, 0.03, 0.04, 0.05, 0.06],
  nanobots: [0, 0.005, 0.01, 0.015, 0.02, 0.03],
  cargoCapacity: [0, 50, 125, 250, 400, 600], // Additive Bonus Cargo
};

export const RESOURCE_PRICES = {
  ore: 5,
  gas: 12,
};
