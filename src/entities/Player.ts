// Player Entity
import { KaboomCtx, GameObj } from "kaboom";
import { PLAYER_SIZE, PLAYER_SPEED, COLORS } from "../constants";
import { gameState } from "../state";
import { MaskManager } from "../mechanics/MaskManager";

export function createPlayer(k: KaboomCtx, x: number, y: number, maskManager: MaskManager): GameObj<any> {
  const player = k.add([
    k.rect(PLAYER_SIZE, PLAYER_SIZE),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.body(),
    k.color(k.Color.fromHex(COLORS.player)),
    k.opacity(1),
    k.z(10),
    "player",
    {
      speed: PLAYER_SPEED,
      dir: k.vec2(0, 0)
    }
  ]);

  // Movement
  player.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;

    const dir = k.vec2(0, 0);

    if (k.isKeyDown("left") || k.isKeyDown("a")) dir.x -= 1;
    if (k.isKeyDown("right") || k.isKeyDown("d")) dir.x += 1;
    if (k.isKeyDown("up") || k.isKeyDown("w")) dir.y -= 1;
    if (k.isKeyDown("down") || k.isKeyDown("s")) dir.y += 1;

    if (dir.len() > 0) {
      player.dir = dir.unit();
      player.move(player.dir.scale(player.speed));
    }

    // Keep player in bounds
    player.pos.x = k.clamp(player.pos.x, PLAYER_SIZE / 2, k.width() - PLAYER_SIZE / 2);
    player.pos.y = k.clamp(player.pos.y, PLAYER_SIZE / 2, k.height() - PLAYER_SIZE / 2);

    // Update visual based on state
    if (gameState.isPlayerInvisible()) {
      player.opacity = 0.3;
    } else if (gameState.isPlayerEthereal()) {
      player.color = k.rgb(129, 212, 250);
      player.opacity = 0.7;
    } else if (gameState.isPlayerShielding()) {
      player.color = k.rgb(255, 204, 128);
    } else {
      player.opacity = 1;
      player.color = k.Color.fromHex(COLORS.player);
    }
  });

  // Ability activation
  k.onKeyPress("space", () => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    maskManager.activateAbility(player);
  });

  // Mask switching for boss level (keys 1-4)
  k.onKeyPress("1", () => {
    if (gameState.getCurrentLevel() === 5) {
      maskManager.switchToMaskByIndex(0);
    }
  });
  k.onKeyPress("2", () => {
    if (gameState.getCurrentLevel() === 5) {
      maskManager.switchToMaskByIndex(1);
    }
  });
  k.onKeyPress("3", () => {
    if (gameState.getCurrentLevel() === 5) {
      maskManager.switchToMaskByIndex(2);
    }
  });
  k.onKeyPress("4", () => {
    if (gameState.getCurrentLevel() === 5) {
      maskManager.switchToMaskByIndex(3);
    }
  });

  // Tab to cycle masks (boss level)
  k.onKeyPress("tab", () => {
    if (gameState.getCurrentLevel() === 5) {
      maskManager.switchToNextMask();
    }
  });

  return player;
}

// Create shield visual around player
export function createShieldVisual(k: KaboomCtx, player: GameObj<any>): GameObj<any> {
  const shield = k.add([
    k.circle(PLAYER_SIZE * 1.5),
    k.pos(player.pos),
    k.anchor("center"),
    k.color(255, 204, 128),
    k.opacity(0.4),
    k.z(9),
    "shield-visual"
  ]);

  shield.onUpdate(() => {
    shield.pos = player.pos;
    shield.hidden = !gameState.isPlayerShielding();
  });

  return shield;
}
