// Camera System - Smooth follow with zoom
import { KaboomCtx, GameObj, Vec2 } from "kaboom";

export interface CameraConfig {
  zoom: number;
  lerpSpeed: number;
  lookAheadDistance: number;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

const DEFAULT_CONFIG: CameraConfig = {
  zoom: 3,
  lerpSpeed: 0.1,
  lookAheadDistance: 30,
  bounds: undefined
};

// Linear interpolation helper
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Camera controller class
export class CameraController {
  private k: KaboomCtx;
  private config: CameraConfig;
  private targetPos: Vec2;
  private currentPos: Vec2;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;

  constructor(k: KaboomCtx, config: Partial<CameraConfig> = {}) {
    this.k = k;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.targetPos = k.vec2(0, 0);
    this.currentPos = k.vec2(0, 0);
    
    // Set initial zoom
    k.camScale(k.vec2(this.config.zoom));
  }

  // Update camera to follow target
  follow(target: GameObj<any>, mousePos?: Vec2): void {
    if (!target || !target.pos) return;

    // Base target is player position
    let targetX = target.pos.x;
    let targetY = target.pos.y;

    // Add look-ahead based on mouse position (optional)
    if (mousePos && this.config.lookAheadDistance > 0) {
      const screenCenter = this.k.vec2(this.k.width() / 2, this.k.height() / 2);
      const mouseOffset = mousePos.sub(screenCenter);
      const lookAhead = mouseOffset.unit().scale(this.config.lookAheadDistance);
      targetX += lookAhead.x;
      targetY += lookAhead.y;
    }

    this.targetPos = this.k.vec2(targetX, targetY);

    // Apply bounds if set
    if (this.config.bounds) {
      const halfWidth = this.k.width() / (2 * this.config.zoom);
      const halfHeight = this.k.height() / (2 * this.config.zoom);

      this.targetPos.x = Math.max(
        this.config.bounds.minX + halfWidth,
        Math.min(this.config.bounds.maxX - halfWidth, this.targetPos.x)
      );
      this.targetPos.y = Math.max(
        this.config.bounds.minY + halfHeight,
        Math.min(this.config.bounds.maxY - halfHeight, this.targetPos.y)
      );
    }

    // Smooth lerp to target
    this.currentPos.x = lerp(this.currentPos.x, this.targetPos.x, this.config.lerpSpeed);
    this.currentPos.y = lerp(this.currentPos.y, this.targetPos.y, this.config.lerpSpeed);

    // Apply camera shake
    let finalX = this.currentPos.x;
    let finalY = this.currentPos.y;

    if (this.shakeDuration > 0) {
      this.shakeDuration -= this.k.dt();
      finalX += (Math.random() - 0.5) * this.shakeIntensity;
      finalY += (Math.random() - 0.5) * this.shakeIntensity;
    }

    // Set camera position
    this.k.camPos(finalX, finalY);
  }

  // Instant snap to position (for level transitions)
  snapTo(pos: Vec2): void {
    this.currentPos = pos.clone();
    this.targetPos = pos.clone();
    this.k.camPos(pos);
  }

  // Camera shake effect
  shake(intensity: number = 5, duration: number = 0.2): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  // Set zoom level
  setZoom(zoom: number): void {
    this.config.zoom = zoom;
    this.k.camScale(this.k.vec2(zoom));
  }

  // Get current zoom
  getZoom(): number {
    return this.config.zoom;
  }

  // Set camera bounds (for level boundaries)
  setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    this.config.bounds = { minX, minY, maxX, maxY };
  }

  // Clear bounds
  clearBounds(): void {
    this.config.bounds = undefined;
  }

  // Get world position from screen position
  screenToWorld(screenPos: Vec2): Vec2 {
    const camPos = this.k.camPos();
    const zoom = this.config.zoom;
    return this.k.vec2(
      (screenPos.x - this.k.width() / 2) / zoom + camPos.x,
      (screenPos.y - this.k.height() / 2) / zoom + camPos.y
    );
  }

  // Get screen position from world position
  worldToScreen(worldPos: Vec2): Vec2 {
    const camPos = this.k.camPos();
    const zoom = this.config.zoom;
    return this.k.vec2(
      (worldPos.x - camPos.x) * zoom + this.k.width() / 2,
      (worldPos.y - camPos.y) * zoom + this.k.height() / 2
    );
  }

  // Check if a world position is visible on screen
  isOnScreen(worldPos: Vec2, margin: number = 50): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return (
      screenPos.x >= -margin &&
      screenPos.x <= this.k.width() + margin &&
      screenPos.y >= -margin &&
      screenPos.y <= this.k.height() + margin
    );
  }
}

// Create fixed UI layer (doesn't move with camera)
export function createFixedUI(k: KaboomCtx): GameObj<any> {
  return k.add([
    k.pos(0, 0),
    k.fixed(),
    k.z(1000),
    "ui-layer"
  ]);
}
