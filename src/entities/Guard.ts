// Guard Entity (Level 1) - Patrolling guard with vision cone
import { KaboomCtx, GameObj, Vec2 } from "kaboom";
import { COLORS } from "../constants";
import { gameState } from "../state";

export interface GuardConfig {
  x: number;
  y: number;
  patrolPoints: Vec2[];
  visionRange: number;
  visionAngle: number; // FOV in degrees
  speed: number;
}

export function createGuard(k: KaboomCtx, config: GuardConfig): GameObj<any> {
  const guard = k.add([
    k.rect(28, 28),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.area(),
    k.color(k.Color.fromHex(COLORS.guard)),
    k.z(5),
    "guard",
    "enemy",
    {
      patrolPoints: config.patrolPoints,
      currentPatrolIndex: 0,
      visionRange: config.visionRange,
      visionAngle: config.visionAngle,
      speed: config.speed,
      direction: k.vec2(1, 0),
      canSeePlayer: false
    }
  ]);

  // Create vision cone visual
  const visionCone = k.add([
    k.pos(guard.pos),
    k.anchor("center"),
    k.color(255, 200, 100),
    k.opacity(0.3),
    k.z(4),
    "vision-cone",
    {
      parentGuard: guard
    }
  ]);

  // Draw vision cone
  visionCone.onDraw(() => {
    const halfAngle = (guard.visionAngle / 2) * (Math.PI / 180);
    const range = guard.visionRange;
    const dir = guard.direction;
    const baseAngle = Math.atan2(dir.y, dir.x);

    k.drawTriangle({
      p1: k.vec2(0, 0),
      p2: k.vec2(
        Math.cos(baseAngle - halfAngle) * range,
        Math.sin(baseAngle - halfAngle) * range
      ),
      p3: k.vec2(
        Math.cos(baseAngle + halfAngle) * range,
        Math.sin(baseAngle + halfAngle) * range
      ),
      color: guard.canSeePlayer ? k.rgb(255, 100, 100) : k.rgb(255, 200, 100),
      opacity: guard.canSeePlayer ? 0.5 : 0.3
    });
  });

  // Guard patrol logic
  guard.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    if (gameState.isTimeFrozen()) return;

    // Patrol movement
    if (guard.patrolPoints.length > 0) {
      const target = guard.patrolPoints[guard.currentPatrolIndex];
      const diff = target.sub(guard.pos);
      
      if (diff.len() < 5) {
        guard.currentPatrolIndex = (guard.currentPatrolIndex + 1) % guard.patrolPoints.length;
      } else {
        guard.direction = diff.unit();
        guard.move(guard.direction.scale(guard.speed));
      }
    }

    // Update vision cone position
    visionCone.pos = guard.pos;
  });

  return guard;
}

// Check if guard can see player
export function canGuardSeePlayer(
  _k: KaboomCtx,
  guard: GameObj<any>,
  player: GameObj<any>
): boolean {
  if (gameState.isPlayerInvisible()) return false;

  const toPlayer = player.pos.sub(guard.pos);
  const distance = toPlayer.len();

  // Check if player is within range
  if (distance > guard.visionRange) return false;

  // Check if player is within FOV
  const guardAngle = Math.atan2(guard.direction.y, guard.direction.x);
  const playerAngle = Math.atan2(toPlayer.y, toPlayer.x);
  
  let angleDiff = Math.abs(guardAngle - playerAngle);
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

  const halfFov = (guard.visionAngle / 2) * (Math.PI / 180);
  
  return angleDiff <= halfFov;
}
