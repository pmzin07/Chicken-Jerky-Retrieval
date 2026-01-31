// Security Camera Entity (Level 1) - Rotating camera with vision cone
import { KaboomCtx, GameObj } from "kaboom";
import { gameState } from "../state";

export interface CameraConfig {
  x: number;
  y: number;
  visionRange: number;
  visionAngle: number;
  rotationSpeed: number; // degrees per second
  startAngle: number; // initial angle in degrees
  sweepAngle: number; // total sweep angle (oscillates)
}

export function createSecurityCamera(k: KaboomCtx, config: CameraConfig): GameObj<any> {
  const camera = k.add([
    k.circle(12),
    k.pos(config.x, config.y),
    k.anchor("center"),
    k.color(126, 87, 194), // Purple
    k.z(6),
    "camera",
    "enemy",
    {
      visionRange: config.visionRange,
      visionAngle: config.visionAngle,
      rotationSpeed: config.rotationSpeed,
      currentAngle: config.startAngle,
      sweepAngle: config.sweepAngle,
      sweepDirection: 1,
      minAngle: config.startAngle - config.sweepAngle / 2,
      maxAngle: config.startAngle + config.sweepAngle / 2,
      canSeePlayer: false
    }
  ]);

  // Vision cone visual
  const visionCone = k.add([
    k.pos(camera.pos),
    k.z(4),
    "camera-vision"
  ]);

  visionCone.onDraw(() => {
    const halfAngle = (camera.visionAngle / 2) * (Math.PI / 180);
    const range = camera.visionRange;
    const baseAngle = camera.currentAngle * (Math.PI / 180);

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
      color: camera.canSeePlayer ? k.rgb(255, 100, 100) : k.rgb(126, 87, 194),
      opacity: camera.canSeePlayer ? 0.5 : 0.25
    });
  });

  camera.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    if (gameState.isTimeFrozen()) return;

    // Oscillate camera angle
    camera.currentAngle += camera.rotationSpeed * camera.sweepDirection * k.dt();
    
    if (camera.currentAngle >= camera.maxAngle) {
      camera.currentAngle = camera.maxAngle;
      camera.sweepDirection = -1;
    } else if (camera.currentAngle <= camera.minAngle) {
      camera.currentAngle = camera.minAngle;
      camera.sweepDirection = 1;
    }

    visionCone.pos = camera.pos;
  });

  return camera;
}

// Check if camera can see player
export function canCameraSeePlayer(
  _k: KaboomCtx,
  camera: GameObj<any>,
  player: GameObj<any>
): boolean {
  if (gameState.isPlayerInvisible()) return false;

  const toPlayer = player.pos.sub(camera.pos);
  const distance = toPlayer.len();

  // Check if player is within range
  if (distance > camera.visionRange) return false;

  // Check if player is within FOV
  const cameraAngle = camera.currentAngle * (Math.PI / 180);
  const playerAngle = Math.atan2(toPlayer.y, toPlayer.x);
  
  let angleDiff = Math.abs(cameraAngle - playerAngle);
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

  const halfFov = (camera.visionAngle / 2) * (Math.PI / 180);
  
  return angleDiff <= halfFov;
}
