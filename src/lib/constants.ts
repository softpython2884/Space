import type { PlayerData } from "@/lib/types";

export const INITIAL_PLAYER_DATA: PlayerData = {
  level: 5,
  ship: {
    class: "Fighter",
    role: "Combat",
    size: "S",
    upgrades: {
      "Laser Cannon": 2,
      "Deflector Shields": 1,
    },
  },
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
};
