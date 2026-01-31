// Main Entry Point - Chicken Jerky Retrieval
import kaboom from "kaboom";
import { setKaboomContext } from "./types.ts";
import { loadAssets } from "./loader.ts";
import {
  mainMenuScene,
  gameOverScene,
  victoryScene,
  introScene,
  outroScene,
  gateOpeningScene,
  level1Scene,
  level2Scene,
  level3Scene,
  level4Scene,
  level5Scene
} from "./scenes/index.ts";

// Initialize Kaboom with fullscreen pixel-perfect settings
const k = kaboom({
  // Fullscreen mode - fills the window
  width: window.innerWidth,
  height: window.innerHeight,
  // Pixel art settings
  background: [20, 20, 30],
  font: "monospace",
  crisp: true,        // Disable anti-aliasing for crisp pixels
  letterbox: false,   // No letterboxing - true fullscreen
  stretch: true,      // Stretch to fill window
  global: false,
  debug: false,        // Set to true for debug info
  scale: 1,           // Base scale (camera will handle zoom)
});

// Handle window resize
window.addEventListener("resize", () => {
  // Kaboom handles this automatically with stretch: true
  // but we can add custom logic here if needed
});

// Load all game assets
loadAssets(k);

// Set global context
setKaboomContext(k);

// Register all scenes
k.scene("menu", () => mainMenuScene(k));
k.scene("intro", () => introScene(k));
k.scene("level1", () => level1Scene(k));
k.scene("level2", () => level2Scene(k));
k.scene("level3", () => level3Scene(k));
k.scene("level4", () => level4Scene(k));
k.scene("gate_opening", () => gateOpeningScene(k));
k.scene("level5", () => level5Scene(k));
k.scene("gameover", () => gameOverScene(k));
k.scene("victory", () => victoryScene(k));
k.scene("outro", () => outroScene(k));

// Debug: Skip to specific level with F-keys
k.onKeyPress("f1", () => k.go("level1"));
k.onKeyPress("f2", () => k.go("level2"));
k.onKeyPress("f3", () => k.go("level3"));
k.onKeyPress("f4", () => k.go("level4"));
k.onKeyPress("f5", () => k.go("level5"));

// Start at main menu
k.go("menu");

// Log game info
console.log("🍗 Chicken Jerky Retrieval - The Masked Mission 🎭");
console.log("Controls:");
console.log("  WASD/Arrow Keys - Move");
console.log("  SPACE - Use Mask Ability");
console.log("  1-4/TAB - Switch Masks (Boss Level Only)");
console.log("  ENTER - Advance Dialogue");
