// Elevator Entity - Level exit
import { KaboomCtx, GameObj } from "kaboom";
import { COLORS } from "../constants";

export function createElevator(k: KaboomCtx, x: number, y: number): GameObj<any> {
  const elevator = k.add([
    k.rect(50, 60),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.color(k.Color.fromHex(COLORS.elevator)),
    k.opacity(0.8),
    k.z(3),
    "elevator"
  ]);

  // Glowing effect
  let glowPhase = 0;
  elevator.onUpdate(() => {
    glowPhase += k.dt() * 3;
    elevator.opacity = 0.6 + Math.sin(glowPhase) * 0.3;
  });

  // Draw elevator with glow
  elevator.onDraw(() => {
    // Outer glow
    k.drawRect({
      width: 60,
      height: 70,
      anchor: "center",
      color: k.rgb(255, 255, 255),
      opacity: 0.3
    });
    
    // Main elevator
    k.drawRect({
      width: 50,
      height: 60,
      anchor: "center",
      color: k.rgb(255, 255, 255)
    });
    
    // Door lines
    k.drawLine({
      p1: k.vec2(0, -30),
      p2: k.vec2(0, 30),
      width: 2,
      color: k.rgb(200, 200, 200)
    });
    
    // Arrow up
    k.drawText({
      text: "↑",
      size: 24,
      anchor: "center",
      color: k.rgb(100, 100, 100)
    });
  });

  return elevator;
}
