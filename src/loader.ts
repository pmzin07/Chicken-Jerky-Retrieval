// Centralized Asset Loader with Placeholder Sprites
// All game assets are loaded here - replace placeholders with actual pixel art later
import { KaboomCtx } from "kaboom";

// Import mask images from assets
import maskSilenceImg from './assets/ui/masks/mask_silence.svg';
import maskGhostImg from './assets/ui/masks/mask_ghost.svg';
import maskFreezeImg from './assets/ui/masks/mask_freeze.svg';
import maskShieldImg from './assets/ui/masks/mask_shield.svg';

// Import cutscene slides (using compressed JPG versions)
import slideCityImg from './assets/cutscene/intro/slide_city.jpg';
import slideCompanyImg from './assets/cutscene/intro/slide_company.jpg';
import slideMomSickImg from './assets/cutscene/intro/slide_mom_sick.jpg';

// Import Vu character sprites
import vuIdle from './assets/sprites/characters/vu/Vu_idle_16x16.png';
import vuRun from './assets/sprites/characters/vu/Vu_run_16x16.png';

// Tile size for all entities
export const TILE_SIZE = 16;

// Helper to create a colored rectangle data URL for placeholder sprites
function createPlaceholderSprite(width: number, height: number, color: string, accent?: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  if (accent) {
    ctx.fillStyle = accent;
    ctx.fillRect(2, 2, width - 4, height - 4);
  }
  
  return canvas.toDataURL();
}

// Load all game assets
export function loadAssets(k: KaboomCtx): void {
  // ============= INTRO CUTSCENE SLIDES =============
  // Load actual cutscene images as intro slides
  k.loadSprite("intro_room", slideCityImg);      // Slide 1: City overview
  k.loadSprite("intro_corp", slideCompanyImg);   // Slide 2: Company building  
  k.loadSprite("intro_city", slideMomSickImg);   // Slide 3: Mom sick

  // ============= PLAYER - Vu Character Sprites =============
  // Idle - 4 directional frames (Right, Back, Left, Front)
  k.loadSprite("vu-idle", vuIdle, {
    sliceX: 4,
    sliceY: 1,
    anims: {
      "idle-right": 0,
      "idle-back": 1,
      "idle-left": 2,
      "idle-front": 3
    }
  });
  
  // Run animation - 24 frames (6 per direction: Right, Back, Left, Front)
  k.loadSprite("vu-run", vuRun, {
    sliceX: 24,
    sliceY: 1,
    anims: {
      "run-right": { from: 0, to: 5, loop: true, speed: 10 },
      "run-back": { from: 6, to: 11, loop: true, speed: 10 },
      "run-left": { from: 12, to: 17, loop: true, speed: 10 },
      "run-front": { from: 18, to: 23, loop: true, speed: 10 }
    }
  });
  
  // Legacy player placeholder (keep for compatibility)
  k.loadSprite("player", createPlaceholderSprite(16, 16, "#4FC3F7", "#29B6F6"));

  // ============= ENEMIES =============
  k.loadSprite("guard", createPlaceholderSprite(16, 16, "#FF7043", "#E64A19"));
  k.loadSprite("camera-enemy", createPlaceholderSprite(12, 12, "#7E57C2", "#5E35B1"));
  k.loadSprite("babythree", createPlaceholderSprite(16, 16, "#EF5350", "#C62828"));
  k.loadSprite("frozen-fan", createPlaceholderSprite(16, 16, "#B3E5FC", "#81D4FA"));
  k.loadSprite("antifan", createPlaceholderSprite(16, 16, "#D32F2F", "#B71C1C"));
  k.loadSprite("boss", createPlaceholderSprite(32, 32, "#D32F2F", "#880E4F"));
  k.loadSprite("minion", createPlaceholderSprite(12, 12, "#F8BBD9", "#EC407A"));
  k.loadSprite("tuse", createPlaceholderSprite(16, 24, "#FFC107", "#FF9800"));
  k.loadSprite("debt-collector", createPlaceholderSprite(16, 20, "#8B0000", "#FF0000"));
  k.loadSprite("red-eyes", createPlaceholderSprite(24, 12, "#FF0000", "#880000"));
  k.loadSprite("icicle", createPlaceholderSprite(8, 24, "#E0F7FA", "#B2EBF2"));
  k.loadSprite("icicle-shadow", createPlaceholderSprite(16, 8, "#000000", "#222222"));

  // ============= TILES =============
  k.loadSprite("floor", createPlaceholderSprite(16, 16, "#37474F", "#455A64"));
  k.loadSprite("wall", createPlaceholderSprite(16, 16, "#263238", "#1C313A"));
  k.loadSprite("floor-ice", createPlaceholderSprite(16, 16, "#B3E5FC", "#81D4FA"));
  k.loadSprite("floor-cave", createPlaceholderSprite(16, 16, "#3E2723", "#4E342E"));
  k.loadSprite("floor-boss", createPlaceholderSprite(16, 16, "#7B1FA2", "#6A1B9A"));
  k.loadSprite("pillar", createPlaceholderSprite(16, 32, "#FFD54F", "#FFC107"));
  
  // ============= DECORATIONS =============
  k.loadSprite("crate", createPlaceholderSprite(14, 14, "#8D6E63", "#6D4C41"));
  k.loadSprite("computer", createPlaceholderSprite(12, 10, "#607D8B", "#455A64"));
  k.loadSprite("pipe", createPlaceholderSprite(6, 16, "#78909C", "#546E7A"));
  k.loadSprite("barrel", createPlaceholderSprite(12, 14, "#5D4037", "#4E342E"));
  k.loadSprite("desk", createPlaceholderSprite(20, 12, "#795548", "#5D4037"));

  // ============= OBJECTS =============
  k.loadSprite("elevator", createPlaceholderSprite(16, 24, "#FFFFFF", "#E0E0E0"));
  k.loadSprite("projectile", createPlaceholderSprite(8, 8, "#FFCA28", "#FFB300"));
  k.loadSprite("money-projectile", createPlaceholderSprite(10, 8, "#4CAF50", "#388E3C"));
  k.loadSprite("salary-projectile", createPlaceholderSprite(12, 8, "#4CAF50", "#2E7D32"));
  k.loadSprite("ban-hammer", createPlaceholderSprite(24, 32, "#B71C1C", "#880E4F"));
  k.loadSprite("jerky", createPlaceholderSprite(16, 16, "#FFD700", "#FFA500")); // Golden Chicken Jerky Box

  // ============= MASKS (Loaded from actual assets) =============
  k.loadSprite("mask-silence", maskSilenceImg);
  k.loadSprite("mask-ghost", maskGhostImg);
  k.loadSprite("mask-frozen", maskFreezeImg);
  k.loadSprite("mask-shield", maskShieldImg);

  // ============= UI =============
  k.loadSprite("heart", createPlaceholderSprite(12, 12, "#EF5350", "#C62828"));
  k.loadSprite("heart-empty", createPlaceholderSprite(12, 12, "#424242", "#303030"));
  k.loadSprite("arrow", createPlaceholderSprite(16, 16, "#4CAF50", "#388E3C"));

  // ============= PARTICLES =============
  k.loadSprite("dust", createPlaceholderSprite(4, 4, "#9E9E9E", "#757575"));
  k.loadSprite("hit-particle", createPlaceholderSprite(6, 6, "#FFFFFF", "#FFD700"));
  k.loadSprite("spark", createPlaceholderSprite(3, 3, "#FFEB3B", "#FFC107"));

  console.log("All placeholder assets loaded! Replace with actual sprites.");
}
