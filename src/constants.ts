// Game Constants and Configuration
import { MaskData, DialogueLine, GameState, PlayerState } from "./types";

// Canvas dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Player constants
export const PLAYER_SPEED = 200;
export const PLAYER_SIZE = 24;
export const PLAYER_COLOR = "#4FC3F7";

// Colors
export const COLORS = {
  player: "#4FC3F7",
  enemy: "#EF5350",
  guard: "#FF7043",
  camera: "#7E57C2",
  projectile: "#FFCA28",
  elevator: "#FFFFFF",
  wall: "#424242",
  floor: "#2E2E2E",
  boss: "#D32F2F",
  minion: "#F8BBD9",
  ui: {
    health: "#EF5350",
    healthBg: "#424242",
    cooldown: "#4FC3F7",
    cooldownBg: "#1A1A2E",
    text: "#FFFFFF",
    dialogue: "#1A1A2E",
    dialogueBorder: "#4FC3F7"
  }
};

// Mask definitions
export const MASKS: Record<string, MaskData> = {
  silence: {
    id: "silence",
    name: "Mask of Silence",
    nameVi: "Mặt nạ Câm Lặng",
    color: "#9E9E9E",
    cooldown: 10,
    duration: 5,
    description: "Become invisible for 5 seconds"
  },
  ghost: {
    id: "ghost",
    name: "Ghost Mask",
    nameVi: "Mặt nạ Trốn Nợ",
    color: "#81D4FA",
    cooldown: 8,
    duration: 3,
    description: "Phase through enemies for 3 seconds"
  },
  frozen: {
    id: "frozen",
    name: "Frozen Mask",
    nameVi: "Mặt nạ Tê Liệt",
    color: "#B3E5FC",
    cooldown: 12,
    duration: 4,
    description: "Freeze all enemies for 4 seconds"
  },
  shield: {
    id: "shield",
    name: "Shield Mask",
    nameVi: "Mặt nạ Bịt Tai",
    color: "#FFCC80",
    cooldown: 8,
    duration: 3,
    description: "Reflect projectiles for 3 seconds"
  }
};

// Level dialogues
export const LEVEL_DIALOGUES: Record<number, { intro: DialogueLine[], outro?: DialogueLine[] }> = {
  1: {
    intro: [
      { speaker: "Vu", text: "Security floor... I need to sneak past these cameras.", color: "#4FC3F7" },
      { speaker: "Radio", text: "Be careful, they're watching closely.", color: "#81C784" }
    ],
    outro: [
      { speaker: "Vu", text: "Made it past floor 1! Something seems to have dropped...", color: "#4FC3F7" },
      { speaker: "System", text: "You received: Mask of Silence!", color: "#FFCA28" }
    ]
  },
  2: {
    intro: [
      { speaker: "Vu", text: "What's all this noise?", color: "#4FC3F7" },
      { speaker: "Debt Manager", text: "Hey Vu! You think you can pass? Pay the debt first!", color: "#EF5350" },
      { speaker: "Debt Manager", text: "Stop right there! Pay up!", color: "#EF5350" }
    ],
    outro: [
      { speaker: "Vu", text: "Almost got caught in debt!", color: "#4FC3F7" },
      { speaker: "System", text: "You received: Ghost Mask!", color: "#FFCA28" }
    ]
  },
  3: {
    intro: [
      { speaker: "Vu", text: "Why is it so cold here?", color: "#4FC3F7" },
      { speaker: "Demon Statue", text: "Welcome to TWAN. Watch out for falling stars.", color: "#81C784" },
      { speaker: "Radio", text: "TWAN Headquarters... Where stars fall constantly.", color: "#81C784" }
    ],
    outro: [
      { speaker: "Vu", text: "Made it out alive!", color: "#4FC3F7" },
      { speaker: "System", text: "You received: Freeze Mask!", color: "#FFCA28" }
    ]
  },
  4: {
    intro: [
      { speaker: "Vu", text: "Too dark, can't see the way out.", color: "#4FC3F7" },
      { speaker: "Stadium Gate", text: "Welcome to the Stadium. Wear sunglasses when leaving.", color: "#81C784" },
      { speaker: "Radio", text: "This is the Red Fan Stadium!", color: "#81C784" }
    ],
    outro: [
      { speaker: "Vu", text: "Almost at the goal!", color: "#4FC3F7" },
      { speaker: "System", text: "You received: Shield Mask!", color: "#FFCA28" }
    ]
  },
  5: {
    intro: [
      { speaker: "Final Boss", text: "Want to get medicine for mom? Step over my body first!", color: "#D32F2F" },
      { speaker: "Final Boss", text: "This Golden Jerky Box is the corporation's treasure!", color: "#D32F2F" },
      { speaker: "Vu", text: "Mom is waiting... I can't lose!", color: "#4FC3F7" }
    ],
    outro: [
      { speaker: "Final Boss", text: "Ouch, that hurt... Alright, let me remove the mask.", color: "#D32F2F" },
      { speaker: "Vu", text: "Mask? What do you mean?", color: "#4FC3F7" }
    ]
  }
};

// Initial player state
export const INITIAL_PLAYER_STATE: PlayerState = {
  health: 3,
  maxHealth: 3,
  currentMask: null,
  collectedMasks: [],
  isInvincible: false,
  isInvisible: false,
  isEthereal: false,
  isShielding: false
};

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
  currentLevel: 1,
  isPaused: false,
  isDialogueActive: false,
  player: { ...INITIAL_PLAYER_STATE },
  timeFrozen: false
};

// Level configs
export const LEVEL_CONFIGS = {
  1: {
    survivalTime: 0,
    enemyCount: 3,
    cameraCount: 2
  },
  2: {
    survivalTime: 15,
    enemyCount: 5,
    spawnRate: 2
  },
  3: {
    enemyCount: 8,
    enemySpeed: 300
  },
  4: {
    enemyCount: 4,
    projectileSpeed: 250,
    fireRate: 1.5
  },
  5: {
    bossHealth: 100,
    phases: 3
  }
};
