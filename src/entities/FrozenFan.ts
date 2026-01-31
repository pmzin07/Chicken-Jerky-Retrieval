// Frozen Fan Entity (Level 3) - Fast erratic enemies
import { KaboomCtx, GameObj } from "kaboom";
import { gameState } from "../state";

export interface FrozenFanConfig {
  x: number;
  y: number;
  speed: number;
}

export function createFrozenFan(k: KaboomCtx, config: FrozenFanConfig): GameObj<any> {
  const fan = k.add([
    k.rect(26, 26),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.area(),
    k.color(179, 229, 252), // Light blue - frozen
    k.z(5),
    "frozen-fan",
    "enemy",
    {
      speed: config.speed,
      direction: k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit(),
      changeTimer: 0,
      changeInterval: k.rand(0.3, 0.8)
    }
  ]);

  // Draw frozen effect
  fan.onDraw(() => {
    // Body
    k.drawRect({
      width: 26,
      height: 26,
      anchor: "center",
      color: k.rgb(179, 229, 252)
    });
    
    // Frozen expression
    k.drawText({
      text: "T_T",
      size: 12,
      anchor: "center",
      color: k.rgb(33, 150, 243)
    });
  });

  return fan;
}

// Update frozen fan with erratic movement
export function updateFrozenFan(k: KaboomCtx, fan: GameObj<any>): void {
  if (gameState.isPaused() || gameState.isDialogueActive()) return;
  if (gameState.isTimeFrozen()) return;

  // Random direction changes
  fan.changeTimer += k.dt();
  if (fan.changeTimer >= fan.changeInterval) {
    fan.changeTimer = 0;
    fan.changeInterval = k.rand(0.3, 0.8);
    fan.direction = k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit();
    
    // Random speed burst
    fan.speed = k.rand(250, 400);
  }

  // Move
  fan.move(fan.direction.scale(fan.speed));

  // Bounce off walls
  if (fan.pos.x < 20 || fan.pos.x > k.width() - 20) {
    fan.direction.x *= -1;
    fan.pos.x = k.clamp(fan.pos.x, 20, k.width() - 20);
  }
  if (fan.pos.y < 20 || fan.pos.y > k.height() - 20) {
    fan.direction.y *= -1;
    fan.pos.y = k.clamp(fan.pos.y, 20, k.height() - 20);
  }
}
