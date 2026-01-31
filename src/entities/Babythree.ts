// Babythree Entity (Level 2) - Chasing ghost/creditor
import { KaboomCtx, GameObj } from "kaboom";
import { gameState } from "../state";

export interface BabythreeConfig {
  x: number;
  y: number;
  speed: number;
}

export function createBabythree(k: KaboomCtx, config: BabythreeConfig): GameObj<any> {
  const babythree = k.add([
    k.circle(18),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.area(),
    k.color(239, 83, 80), // Red
    k.opacity(0.8),
    k.z(5),
    "babythree",
    "enemy",
    "chaser",
    {
      speed: config.speed,
      bobOffset: k.rand(0, Math.PI * 2)
    }
  ]);

  // Add eyes for visual
  babythree.onDraw(() => {
    // Ghost body
    k.drawCircle({
      pos: k.vec2(0, 0),
      radius: 18,
      color: k.rgb(239, 83, 80)
    });
    
    // Eyes
    k.drawCircle({
      pos: k.vec2(-6, -3),
      radius: 5,
      color: k.rgb(255, 255, 255)
    });
    k.drawCircle({
      pos: k.vec2(6, -3),
      radius: 5,
      color: k.rgb(255, 255, 255)
    });
    k.drawCircle({
      pos: k.vec2(-6, -3),
      radius: 2,
      color: k.rgb(0, 0, 0)
    });
    k.drawCircle({
      pos: k.vec2(6, -3),
      radius: 2,
      color: k.rgb(0, 0, 0)
    });
  });

  return babythree;
}

// Update babythree to chase player
export function updateBabythreeChase(
  k: KaboomCtx,
  babythree: GameObj<any>,
  player: GameObj<any>
): void {
  if (gameState.isPaused() || gameState.isDialogueActive()) return;
  if (gameState.isTimeFrozen()) return;

  const toPlayer = player.pos.sub(babythree.pos);
  if (toPlayer.len() > 0) {
    const dir = toPlayer.unit();
    babythree.move(dir.scale(babythree.speed));
  }

  // Bobbing animation
  babythree.bobOffset += k.dt() * 5;
  babythree.pos.y += Math.sin(babythree.bobOffset) * 0.5;
}

// Trưởng Phòng Đòi Nợ (Level 2 mini-boss NPC that shouts)
export function createTuSe(k: KaboomCtx, x: number, y: number): GameObj<any> {
  const tuse = k.add([
    k.rect(40, 50),
    k.pos(x, y),
    k.anchor("center"),
    k.color(200, 50, 50),
    k.z(5),
    "tuse",
    {
      shoutTimer: 0,
      shouts: ["Trả nợ đi!", "Tiền đâu?!", "Không thoát được đâu!", "Đứng lại!"]
    }
  ]);

  return tuse;
}

// Shout text effect
export function tuSeShout(k: KaboomCtx, tuse: GameObj<any>): void {
  const shoutText = tuse.shouts[Math.floor(k.rand(0, tuse.shouts.length))];
  
  const text = k.add([
    k.text(shoutText, { size: 20 }),
    k.pos(tuse.pos.x, tuse.pos.y - 50),
    k.anchor("center"),
    k.color(255, 100, 100),
    k.opacity(1),
    k.z(100),
    "shout-text"
  ]);

  k.tween(
    1,
    0,
    1,
    (val) => { text.opacity = val; },
    k.easings.easeOutQuad
  ).onEnd(() => {
    text.destroy();
  });

  k.tween(
    text.pos.y,
    text.pos.y - 30,
    1,
    (val) => { text.pos.y = val; },
    k.easings.easeOutQuad
  );
}
