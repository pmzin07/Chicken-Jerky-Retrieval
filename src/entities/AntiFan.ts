// Anti-Fan Entity (Level 4) - Throws projectiles
import { KaboomCtx, GameObj } from "kaboom";
import { COLORS } from "../constants";
import { gameState } from "../state";

export interface AntiFanConfig {
  x: number;
  y: number;
  fireRate: number; // seconds between shots
  projectileSpeed: number;
}

export function createAntiFan(k: KaboomCtx, config: AntiFanConfig): GameObj<any> {
  const antifan = k.add([
    k.rect(30, 30),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.color(211, 47, 47), // Dark red
    k.z(5),
    "antifan",
    "enemy",
    {
      fireRate: config.fireRate,
      projectileSpeed: config.projectileSpeed,
      fireTimer: k.rand(0, config.fireRate),
      moveTimer: 0,
      moveDirection: k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit()
    }
  ]);

  // Draw angry face
  antifan.onDraw(() => {
    k.drawRect({
      width: 30,
      height: 30,
      anchor: "center",
      color: k.rgb(211, 47, 47)
    });
    
    k.drawText({
      text: ">:(",
      size: 14,
      anchor: "center",
      color: k.rgb(255, 255, 255)
    });
  });

  return antifan;
}

// Update anti-fan - move and shoot
export function updateAntiFan(
  k: KaboomCtx,
  antifan: GameObj<any>,
  player: GameObj<any>,
  onFire: (projectile: GameObj<any>) => void
): void {
  if (gameState.isPaused() || gameState.isDialogueActive()) return;
  if (gameState.isTimeFrozen()) return;

  // Slow movement
  antifan.moveTimer += k.dt();
  if (antifan.moveTimer > 2) {
    antifan.moveTimer = 0;
    antifan.moveDirection = k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit();
  }
  antifan.move(antifan.moveDirection.scale(30));

  // Keep in bounds
  antifan.pos.x = k.clamp(antifan.pos.x, 50, k.width() - 50);
  antifan.pos.y = k.clamp(antifan.pos.y, 50, k.height() - 150);

  // Fire projectile
  antifan.fireTimer += k.dt();
  if (antifan.fireTimer >= antifan.fireRate) {
    antifan.fireTimer = 0;
    
    const toPlayer = player.pos.sub(antifan.pos);
    if (toPlayer.len() > 0) {
      const dir = toPlayer.unit();
      const projectile = createProjectile(k, antifan.pos.x, antifan.pos.y, dir, antifan.projectileSpeed);
      onFire(projectile);
    }
  }
}

// Projectile (brick/comment)
export function createProjectile(
  k: KaboomCtx,
  x: number,
  y: number,
  direction: { x: number; y: number },
  speed: number
): GameObj<any> {
  const projectile = k.add([
    k.rect(12, 12),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.color(k.Color.fromHex(COLORS.projectile)),
    k.rotate(0),
    k.z(5),
    "projectile",
    "enemy-projectile",
    {
      direction: k.vec2(direction.x, direction.y),
      speed: speed,
      reflected: false
    }
  ]);

  projectile.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    if (gameState.isTimeFrozen() && !projectile.reflected) return;

    projectile.move(projectile.direction.scale(projectile.speed));
    projectile.angle += 360 * k.dt();

    // Destroy if out of bounds
    if (
      projectile.pos.x < -20 ||
      projectile.pos.x > k.width() + 20 ||
      projectile.pos.y < -20 ||
      projectile.pos.y > k.height() + 20
    ) {
      projectile.destroy();
    }
  });

  return projectile;
}

// Reflect projectile (when player has shield)
export function reflectProjectile(k: KaboomCtx, projectile: GameObj<any>, _player: GameObj<any>): void {
  projectile.direction = projectile.direction.scale(-1);
  projectile.reflected = true;
  projectile.color = k.rgb(100, 255, 100); // Green for reflected
  projectile.unuse("enemy-projectile");
  projectile.use("reflected-projectile");
}
