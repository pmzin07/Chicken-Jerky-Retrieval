// Boss Entity (Level 5) - Trùm Cuối (The Final Boss)
import { KaboomCtx, GameObj } from "kaboom";
import { COLORS } from "../constants";
import { gameState } from "../state";

export type BossPhase = "idle" | "salary_throw" | "document_slam" | "summon" | "cooldown";

export interface BossConfig {
  x: number;
  y: number;
  maxHealth: number;
}

export function createBoss(k: KaboomCtx, config: BossConfig): GameObj<any> {
  const boss = k.add([
    k.rect(60, 70),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.area(),
    k.color(k.Color.fromHex(COLORS.boss)),
    k.z(5),
    "boss",
    "enemy",
    {
      maxHealth: config.maxHealth,
      health: config.maxHealth,
      phase: "idle" as BossPhase,
      phaseTimer: 0,
      attackCooldown: 2,
      currentCooldown: 0,
      attackPattern: 0,
      isVulnerable: true
    }
  ]);

  // Draw boss with simple graphics
  boss.onDraw(() => {
    // Body
    k.drawRect({
      width: 60,
      height: 70,
      anchor: "center",
      color: k.rgb(211, 47, 47)
    });
    
    // Face
    k.drawText({
      text: "CEO",
      size: 16,
      anchor: "center",
      pos: k.vec2(0, -10),
      color: k.rgb(255, 255, 255)
    });
    
    // Health bar above boss
    const healthPercent = boss.health / boss.maxHealth;
    k.drawRect({
      width: 60,
      height: 8,
      anchor: "center",
      pos: k.vec2(0, -50),
      color: k.rgb(50, 50, 50)
    });
    k.drawRect({
      width: 58 * healthPercent,
      height: 6,
      anchor: "left",
      pos: k.vec2(-29, -50),
      color: k.rgb(255, 100, 100)
    });
  });

  return boss;
}

// Boss state machine
export function updateBoss(
  k: KaboomCtx,
  boss: GameObj<any>,
  _player: GameObj<any>,
  callbacks: {
    onSalaryThrow: () => void;
    onDocumentSlam: () => void;
    onSummon: () => void;
  }
): void {
  if (gameState.isPaused() || gameState.isDialogueActive()) return;
  if (gameState.isTimeFrozen()) return;

  boss.phaseTimer += k.dt();

  switch (boss.phase) {
    case "idle":
      // Move around slightly
      boss.pos.x += Math.sin(boss.phaseTimer * 2) * 0.5;
      
      if (boss.phaseTimer >= boss.attackCooldown) {
        boss.phaseTimer = 0;
        
        // Choose attack based on health
        const healthPercent = boss.health / boss.maxHealth;
        
        if (healthPercent > 0.66) {
          boss.phase = "salary_throw";
        } else if (healthPercent > 0.33) {
          const attacks = ["salary_throw", "document_slam"] as const;
          boss.phase = attacks[Math.floor(k.rand(0, attacks.length))];
        } else {
          const attacks = ["salary_throw", "document_slam", "summon"] as const;
          boss.phase = attacks[Math.floor(k.rand(0, attacks.length))];
        }
      }
      break;

    case "salary_throw":
      if (boss.phaseTimer < 0.5) {
        // Wind up
        boss.color = k.rgb(255, 150, 100);
      } else if (boss.phaseTimer >= 0.5 && boss.phaseTimer < 0.6) {
        callbacks.onSalaryThrow();
        boss.phase = "cooldown";
        boss.phaseTimer = 0;
      }
      break;

    case "document_slam":
      if (boss.phaseTimer < 0.8) {
        // Wind up - boss jumps up
        boss.pos.y -= k.dt() * 100;
      } else if (boss.phaseTimer >= 0.8 && boss.phaseTimer < 0.9) {
        callbacks.onDocumentSlam();
        boss.phase = "cooldown";
        boss.phaseTimer = 0;
      }
      break;

    case "summon":
      if (boss.phaseTimer < 1) {
        // Summoning animation
        boss.color = k.rgb(248, 187, 217); // Pink
      } else if (boss.phaseTimer >= 1 && boss.phaseTimer < 1.1) {
        callbacks.onSummon();
        boss.phase = "cooldown";
        boss.phaseTimer = 0;
      }
      break;

    case "cooldown":
      boss.color = k.Color.fromHex(COLORS.boss);
      if (boss.phaseTimer >= 1.5) {
        boss.phase = "idle";
        boss.phaseTimer = 0;
      }
      break;
  }
}

// Salary projectile (money piles)
export function createSalaryProjectile(
  k: KaboomCtx,
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  speed: number
): GameObj<any> {
  const dir = k.vec2(targetX - x, targetY - y).unit();
  
  const projectile = k.add([
    k.rect(20, 15),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.color(100, 200, 100), // Green for money
    k.rotate(0),
    k.z(5),
    "boss-projectile",
    "projectile",
    {
      direction: dir,
      speed: speed
    }
  ]);

  projectile.onDraw(() => {
    k.drawRect({
      width: 20,
      height: 15,
      anchor: "center",
      color: k.rgb(100, 200, 100)
    });
    k.drawText({
      text: "$",
      size: 12,
      anchor: "center",
      color: k.rgb(0, 100, 0)
    });
  });

  projectile.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    if (gameState.isTimeFrozen()) return;

    projectile.move(projectile.direction.scale(projectile.speed));
    projectile.angle += 180 * k.dt();

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

// Document slam shockwave
export function createShockwave(k: KaboomCtx, x: number, y: number): GameObj<any> {
  const shockwave = k.add([
    k.circle(10),
    k.pos(x, y),
    k.anchor("center"),
    k.area({ scale: 1 }),
    k.color(255, 200, 100),
    k.opacity(0.7),
    k.z(4),
    "shockwave",
    "boss-attack",
    {
      maxRadius: 200,
      expandSpeed: 300,
      currentRadius: 10
    }
  ]);

  shockwave.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    if (gameState.isTimeFrozen()) return;

    shockwave.currentRadius += shockwave.expandSpeed * k.dt();
    shockwave.radius = shockwave.currentRadius;
    shockwave.opacity = 1 - (shockwave.currentRadius / shockwave.maxRadius);

    if (shockwave.currentRadius >= shockwave.maxRadius) {
      shockwave.destroy();
    }
  });

  return shockwave;
}

// White cow minion
export function createMinion(k: KaboomCtx, x: number, y: number): GameObj<any> {
  const minion = k.add([
    k.rect(25, 25),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.color(248, 187, 217), // Pink
    k.z(5),
    "minion",
    "enemy",
    {
      speed: 100,
      health: 1
    }
  ]);

  minion.onDraw(() => {
    k.drawRect({
      width: 25,
      height: 25,
      anchor: "center",
      color: k.rgb(248, 187, 217)
    });
    k.drawText({
      text: "🐄",
      size: 16,
      anchor: "center"
    });
  });

  return minion;
}

// Update minion to chase player
export function updateMinion(_k: KaboomCtx, minion: GameObj<any>, player: GameObj<any>): void {
  if (gameState.isPaused() || gameState.isDialogueActive()) return;
  if (gameState.isTimeFrozen()) return;

  const toPlayer = player.pos.sub(minion.pos);
  if (toPlayer.len() > 0) {
    const dir = toPlayer.unit();
    minion.move(dir.scale(minion.speed));
  }
}
