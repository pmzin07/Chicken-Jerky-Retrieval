// Level 2: The Armory - SHIELD MASK TUTORIAL (30-second 3-Phase Survival)
// Phase 1: Hold Block, Phase 2: Timed Reflect, Phase 3: Directional Shield
import { KaboomCtx, GameObj } from "kaboom";
import { MaskManager } from "../mechanics/MaskManager.ts";
import { setupPauseSystem } from "../mechanics/PauseSystem.ts";
import { gameState } from "../state.ts";
import { LEVEL_DIALOGUES, MASKS } from "../constants.ts";
import { showDialogue } from "./dialogue.ts";
import { CameraController } from "../camera.ts";
import { createGameUI, updateGameUI, showMaskDescription } from "../ui.ts";
import { LEVEL_2_MAP, getPlayerSpawn } from "../maps.ts";
import { TILE_SIZE } from "../loader.ts";

// ============= PHASE CONSTANTS =============
const TOTAL_SURVIVAL_TIME = 30;
const PHASE_1_END = 10;   // 0s - 10s: Basic blocking
const PHASE_2_END = 20;   // 10s - 20s: Reflect cannonballs
// Phase 3: 20s - 30s: Laser grid sweep

export function level2Scene(k: KaboomCtx): void {
  const map = LEVEL_2_MAP;
  
  setupPauseSystem(k);
  
  const camera = new CameraController(k, {
    zoom: 3,
    lerpSpeed: 0.1,
    lookAheadDistance: 15
  });
  camera.setBounds(0, 0, map.width, map.height);

  const maskManager = new MaskManager(k);
  gameState.prepareForLevel(2);
  buildLevel(k, map);

  // ============= BOUNDARY WALLS =============
  const WALL_THICKNESS = TILE_SIZE;
  k.add([k.rect(map.width + WALL_THICKNESS * 2, WALL_THICKNESS), k.pos(-WALL_THICKNESS, -WALL_THICKNESS), k.area(), k.body({ isStatic: true }), k.opacity(0), "boundary"]);
  k.add([k.rect(map.width + WALL_THICKNESS * 2, WALL_THICKNESS), k.pos(-WALL_THICKNESS, map.height), k.area(), k.body({ isStatic: true }), k.opacity(0), "boundary"]);
  k.add([k.rect(WALL_THICKNESS, map.height + WALL_THICKNESS * 2), k.pos(-WALL_THICKNESS, -WALL_THICKNESS), k.area(), k.body({ isStatic: true }), k.opacity(0), "boundary"]);
  k.add([k.rect(WALL_THICKNESS, map.height + WALL_THICKNESS * 2), k.pos(map.width, -WALL_THICKNESS), k.area(), k.body({ isStatic: true }), k.opacity(0), "boundary"]);

  const playerSpawn = getPlayerSpawn(map);

  // ============= SAFE TUTORIAL START =============
  let challengeStarted = false;
  let timeElapsed = 0;
  let levelComplete = false;
  let elevatorOpen = false;
  let currentPhase = 0;

  // ============= PLAYER SETUP =============
  const player = createPlayer(k, playerSpawn.x, playerSpawn.y, maskManager, map.width, map.height);
  maskManager.initPlayerMask(player);
  camera.snapTo(k.vec2(playerSpawn.x, playerSpawn.y));

  // ============= TURRETS (4 corners) =============
  const turretPositions = [
    { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
    { x: map.width - TILE_SIZE * 2, y: TILE_SIZE * 2 },
    { x: TILE_SIZE * 2, y: map.height - TILE_SIZE * 2 },
    { x: map.width - TILE_SIZE * 2, y: map.height - TILE_SIZE * 2 }
  ];

  const turrets: GameObj<any>[] = [];
  turretPositions.forEach((pos, i) => {
    const turret = k.add([
      k.rect(20, 20, { radius: 4 }),
      k.pos(pos.x, pos.y),
      k.anchor("center"),
      k.color(100, 100, 100), // Inactive grey
      k.outline(2, k.rgb(150, 150, 150)),
      k.z(5),
      "turret",
      { id: i, fireTimer: k.rand(0, 0.5) }
    ]);
    turrets.push(turret);
  });

  // ============= UI ELEMENTS =============
  const ui = createGameUI(k);

  // Big timer display
  const timerText = k.add([
    k.text("30", { size: 16 }),
    k.pos(map.width / 2, 15),
    k.anchor("center"),
    k.color(255, 255, 100),
    k.z(100)
  ]);

  // Phase indicator
  const phaseText = k.add([
    k.text("PHASE 1: HOLD BLOCK", { size: 8 }),
    k.pos(map.width / 2, 32),
    k.anchor("center"),
    k.color(100, 200, 255),
    k.z(100)
  ]);

  // Tutorial hint
  const hintText = k.add([
    k.text("Hold SPACE to block projectiles!", { size: 7 }),
    k.pos(map.width / 2, map.height - 20),
    k.anchor("center"),
    k.color(100, 255, 200),
    k.z(100)
  ]);

  // ============= ELEVATOR =============
  const elevatorX = map.width - TILE_SIZE * 3;
  const elevatorY = TILE_SIZE * 2;

  const elevator = k.add([
    k.rect(TILE_SIZE * 1.5, TILE_SIZE),
    k.pos(elevatorX, elevatorY),
    k.anchor("center"),
    k.color(80, 80, 100),
    k.outline(2, k.rgb(60, 60, 80)),
    k.area(),
    k.z(3),
    "elevator"
  ]);

  k.add([
    k.text("EXIT", { size: 6 }),
    k.pos(elevatorX, elevatorY + 10),
    k.anchor("center"),
    k.color(150, 150, 150),
    k.z(4)
  ]);

  const elevatorGlow = k.add([
    k.circle(TILE_SIZE),
    k.pos(elevatorX, elevatorY),
    k.anchor("center"),
    k.color(100, 255, 100),
    k.opacity(0),
    k.z(2)
  ]);

  // ============= PHASE 1: SLOW PROJECTILES =============
  function spawnSlowProjectile(turret: GameObj<any>): void {
    const dir = player.pos.sub(turret.pos).unit();
    
    const proj = k.add([
      k.circle(6),
      k.pos(turret.pos.x, turret.pos.y),
      k.anchor("center"),
      k.color(255, 150, 50),
      k.area({ scale: k.vec2(0.6, 0.6) }),
      k.z(6),
      "projectile",
      "blockable",
      { dir, speed: 60, damage: 1, type: "slow" }
    ]);

    proj.onUpdate(() => {
      proj.pos = proj.pos.add(proj.dir.scale(proj.speed * k.dt()));
      if (proj.pos.x < 0 || proj.pos.x > map.width || proj.pos.y < 0 || proj.pos.y > map.height) {
        proj.destroy();
      }
    });
  }

  // ============= PHASE 2: CANNONBALLS (Reflectable) =============
  function spawnCannonball(turret: GameObj<any>): void {
    const dir = player.pos.sub(turret.pos).unit();
    
    // Warning flash on turret
    turret.color = k.rgb(255, 100, 100);
    k.wait(0.3, () => { if (turret.exists()) turret.color = k.rgb(200, 50, 50); });
    
    const cannon = k.add([
      k.circle(12),
      k.pos(turret.pos.x, turret.pos.y),
      k.anchor("center"),
      k.color(80, 80, 80),
      k.outline(3, k.rgb(255, 100, 50)),
      k.area({ scale: k.vec2(0.7, 0.7) }),
      k.z(6),
      "cannonball",
      "reflectable",
      { 
        dir, 
        speed: 80, 
        damage: 1, 
        type: "cannonball",
        reflected: false,
        impactTime: 0 // Track when it hits shield
      }
    ]);

    cannon.onUpdate(() => {
      cannon.pos = cannon.pos.add(cannon.dir.scale(cannon.speed * k.dt()));
      
      // Spin effect
      cannon.outline.color = k.rgb(
        255, 
        100 + Math.sin(k.time() * 10) * 50,
        50
      );
      
      if (cannon.pos.x < 0 || cannon.pos.x > map.width || cannon.pos.y < 0 || cannon.pos.y > map.height) {
        cannon.destroy();
      }
    });
  }

  // ============= PHASE 3: LASER GRID SWEEP =============
  let laserSweepActive = false;
  let laserSweepY = 0;
  let laserSweepDir = 1;
  const LASER_SWEEP_SPEED = 40;

  function startLaserSweep(): void {
    if (laserSweepActive) return;
    laserSweepActive = true;
    laserSweepY = TILE_SIZE * 2;
    laserSweepDir = 1;
  }

  // Laser beam visual
  const laserBeam = k.add([
    k.rect(map.width - TILE_SIZE * 2, 8),
    k.pos(map.width / 2, -100),
    k.anchor("center"),
    k.color(255, 50, 50),
    k.opacity(0),
    k.area({ scale: k.vec2(0.9, 0.5) }),
    k.z(6),
    "laser"
  ]);

  // ============= DAMAGE SYSTEM =============
  let playerInvincible = false;
  let invincibilityTimer = 0;
  const INVINCIBILITY_DURATION = 1.5;
  let blinkLoop: { cancel: () => void } | null = null;

  function triggerInvincibility(): void {
    if (playerInvincible) return;
    playerInvincible = true;
    invincibilityTimer = INVINCIBILITY_DURATION;
    gameState.setInvincible(true);
    
    blinkLoop = k.loop(0.1, () => {
      if (player.exists()) {
        player.opacity = player.opacity > 0.5 ? 0.3 : 1.0;
      }
    });
  }

  function damagePlayer(amount: number = 1): boolean {
    if (playerInvincible || gameState.isInvincible()) return false;
    if (gameState.isPlayerShielding()) return false; // Shield blocks all damage!
    
    gameState.damagePlayer(amount);
    camera.shake(8, 0.3);
    player.color = k.rgb(255, 50, 50);
    triggerInvincibility();
    
    if (gameState.isPlayerDead()) {
      k.go("gameover");
      return true;
    }
    return false;
  }

  // ============= OPEN ELEVATOR =============
  function openElevator(): void {
    elevatorOpen = true;
    
    k.destroyAll("projectile");
    k.destroyAll("cannonball");
    laserBeam.opacity = 0;
    laserSweepActive = false;
    
    elevator.color = k.rgb(100, 255, 100);
    elevator.outline.color = k.rgb(50, 255, 50);
    
    k.tween(0, 0.6, 0.5, (val) => { elevatorGlow.opacity = val; });
    
    phaseText.text = "SURVIVED! GO TO EXIT!";
    phaseText.color = k.rgb(100, 255, 100);
    hintText.text = "";
    
    // Turrets deactivate
    turrets.forEach(t => {
      if (t.exists()) t.color = k.rgb(60, 60, 60);
    });
  }

  // ============= MAIN UPDATE LOOP =============
  k.onUpdate(() => {
    if (gameState.isPaused() || gameState.isDialogueActive() || levelComplete) return;
    if (!challengeStarted) return; // Wait for tutorial to complete
    
    const dt = k.dt();
    timeElapsed += dt;
    maskManager.update(dt);
    maskManager.updatePlayerMask();
    camera.follow(player, k.mousePos());

    // Invincibility update
    if (playerInvincible) {
      invincibilityTimer -= dt;
      if (invincibilityTimer <= 0) {
        playerInvincible = false;
        gameState.setInvincible(false);
        if (blinkLoop) { blinkLoop.cancel(); blinkLoop = null; }
        if (player.exists()) { player.opacity = 1; player.color = k.rgb(79, 195, 247); }
      }
    }

    // Timer display
    const remaining = Math.max(0, TOTAL_SURVIVAL_TIME - timeElapsed);
    timerText.text = `${Math.ceil(remaining)}`;
    
    if (remaining <= 5) timerText.color = k.rgb(100, 255, 100);
    else if (remaining <= 10) timerText.color = k.rgb(255, 255, 100);
    else if (remaining <= 20) timerText.color = k.rgb(255, 200, 100);

    // Victory check
    if (timeElapsed >= TOTAL_SURVIVAL_TIME && !elevatorOpen) {
      openElevator();
      return;
    }
    if (elevatorOpen) return;

    // ============= PHASE LOGIC =============
    if (timeElapsed < PHASE_1_END) {
      // PHASE 1: Slow projectiles - Hold block
      if (currentPhase !== 1) {
        currentPhase = 1;
        phaseText.text = "PHASE 1: HOLD BLOCK";
        phaseText.color = k.rgb(100, 200, 255);
        hintText.text = "Hold SPACE to block projectiles!";
        turrets.forEach(t => { t.color = k.rgb(100, 150, 200); });
      }
      
      turrets.forEach(t => {
        t.fireTimer += dt;
        if (t.fireTimer >= 1.5) {
          t.fireTimer = 0;
          spawnSlowProjectile(t);
        }
      });
      
    } else if (timeElapsed < PHASE_2_END) {
      // PHASE 2: Cannonballs - Timed reflect
      if (currentPhase !== 2) {
        currentPhase = 2;
        phaseText.text = "PHASE 2: TIMED REFLECT";
        phaseText.color = k.rgb(255, 180, 100);
        hintText.text = "Release SPACE right after impact to reflect!";
        turrets.forEach(t => { t.color = k.rgb(200, 100, 50); t.fireTimer = 0; });
      }
      
      turrets.forEach(t => {
        t.fireTimer += dt;
        if (t.fireTimer >= 2.0) {
          t.fireTimer = k.rand(0, 0.5);
          spawnCannonball(t);
        }
      });
      
    } else {
      // PHASE 3: Laser grid sweep - Directional shield walk
      if (currentPhase !== 3) {
        currentPhase = 3;
        phaseText.text = "PHASE 3: LASER SWEEP";
        phaseText.color = k.rgb(255, 50, 50);
        hintText.text = "Face the laser with SHIELD UP to pass through!";
        turrets.forEach(t => { t.color = k.rgb(60, 60, 60); }); // Turrets off
        startLaserSweep();
      }
      
      // Update laser sweep
      if (laserSweepActive) {
        laserSweepY += LASER_SWEEP_SPEED * laserSweepDir * dt;
        laserBeam.pos.y = laserSweepY;
        laserBeam.pos.x = map.width / 2;
        laserBeam.opacity = 0.8;
        
        // Bounce at edges
        if (laserSweepY >= map.height - TILE_SIZE * 2) {
          laserSweepDir = -1;
        } else if (laserSweepY <= TILE_SIZE * 2) {
          laserSweepDir = 1;
        }
      }
    }

    updateGameUI(k, ui, maskManager, player.pos, camera);
  });

  // ============= COLLISION: Projectiles =============
  player.onCollide("projectile", (proj: GameObj<any>) => {
    if (gameState.isPlayerShielding()) {
      // Blocked! Destroy projectile
      proj.destroy();
      camera.shake(3, 0.1);
      // Visual feedback
      k.add([
        k.text("BLOCKED!", { size: 8 }),
        k.pos(player.pos.x, player.pos.y - 20),
        k.anchor("center"),
        k.color(100, 200, 255),
        k.z(200),
        k.lifespan(0.5),
        k.move(k.vec2(0, -1), 30)
      ]);
      return;
    }
    if (!damagePlayer(1)) proj.destroy();
  });

  // ============= COLLISION: Cannonballs (Reflectable) =============
  player.onCollide("cannonball", (cannon: GameObj<any>) => {
    if (cannon.reflected) {
      // Already reflected, hitting player again shouldn't happen
      return;
    }
    
    if (gameState.isPlayerShielding()) {
      // Mark impact time for timed release
      cannon.impactTime = k.time();
      cannon.dir = cannon.dir.scale(-1); // Reverse direction
      cannon.reflected = true;
      cannon.speed = 120; // Faster return
      cannon.color = k.rgb(100, 255, 100); // Green = reflected
      cannon.outline.color = k.rgb(50, 255, 50);
      
      camera.shake(5, 0.15);
      
      k.add([
        k.text("REFLECTED!", { size: 8 }),
        k.pos(player.pos.x, player.pos.y - 20),
        k.anchor("center"),
        k.color(100, 255, 100),
        k.z(200),
        k.lifespan(0.5),
        k.move(k.vec2(0, -1), 30)
      ]);
      return;
    }
    damagePlayer(1);
    cannon.destroy();
  });

  // Reflected cannonball hits turret
  turrets.forEach(turret => {
    turret.onCollide && k.onCollide("cannonball", "turret", (cannon: GameObj<any>, t: GameObj<any>) => {
      if (cannon.reflected) {
        cannon.destroy();
        // Flash turret
        t.color = k.rgb(255, 255, 100);
        k.wait(0.2, () => { if (t.exists()) t.color = k.rgb(200, 50, 50); });
      }
    });
  });

  // ============= COLLISION: Laser =============
  player.onCollide("laser", () => {
    if (gameState.isPlayerShielding()) {
      // Shield absorbs laser - no damage
      return;
    }
    damagePlayer(1);
  });

  // Continuous laser check (area overlap)
  k.onUpdate(() => {
    if (!laserSweepActive || levelComplete || !challengeStarted) return;
    
    // Check if player is in laser area
    const laserTop = laserSweepY - 4;
    const laserBottom = laserSweepY + 4;
    
    if (player.pos.y >= laserTop && player.pos.y <= laserBottom) {
      if (!gameState.isPlayerShielding() && !playerInvincible) {
        damagePlayer(1);
      }
    }
  });

  // ============= ELEVATOR COLLISION =============
  player.onCollide("elevator", () => {
    if (!elevatorOpen || levelComplete) return;
    
    levelComplete = true;
    player.pos = k.vec2(elevatorX, elevatorY);
    
    k.tween(1, 0, 0.5, (val) => {
      player.opacity = val;
    }, k.easings.easeInQuad).onEnd(() => {
      showDialogue(k, LEVEL_DIALOGUES[2].outro!, () => {
        k.go("level3");
      });
    });
  });

  // ============= INTRO DIALOGUE & SAFE START =============
  showDialogue(k, LEVEL_DIALOGUES[2].intro, () => {
    gameState.addCollectedMask(MASKS.shield);
    gameState.setCurrentMask(MASKS.shield);
    showAcquiredNotification(k, "SHIELD MASK");
    
    gameState.setDialogueActive(false);
    showMaskDescription(k, 2);
    
    // Safe Tutorial Start: Begin challenge AFTER UI fades
    k.wait(3.5, () => {
      challengeStarted = true;
      
      // Activate turrets
      turrets.forEach(t => {
        if (t.exists()) {
          k.tween(k.rgb(100, 100, 100), k.rgb(100, 150, 200), 0.3, (c) => {
            t.color = c;
          }, k.easings.easeOutQuad);
        }
      });
    });
  });
}

// ============= HELPER FUNCTIONS =============

function showAcquiredNotification(k: KaboomCtx, maskName: string): void {
  const notification = k.add([
    k.text(`✨ ACQUIRED: ${maskName} ✨`, { size: 16 }),
    k.pos(k.width() / 2, k.height() * 0.25),
    k.anchor("center"),
    k.color(255, 215, 0),
    k.opacity(0),
    k.z(2000),
    k.fixed()
  ]);
  
  k.tween(0, 1, 0.4, (val) => { notification.opacity = val; }, k.easings.easeOutQuad);
  k.wait(2.5, () => {
    k.tween(1, 0, 0.6, (val) => { notification.opacity = val; }, k.easings.easeInQuad)
      .onEnd(() => notification.destroy());
  });
}

function buildLevel(k: KaboomCtx, map: typeof LEVEL_2_MAP): void {
  for (let y = 0; y < map.tiles.length; y++) {
    for (let x = 0; x < map.tiles[y].length; x++) {
      const char = map.tiles[y][x];
      const posX = x * TILE_SIZE + TILE_SIZE / 2;
      const posY = y * TILE_SIZE + TILE_SIZE / 2;

      k.add([
        k.sprite(map.floorSprite),
        k.pos(posX, posY),
        k.anchor("center"),
        k.z(0)
      ]);

      if (char === '#') {
        k.add([
          k.sprite(map.wallSprite),
          k.pos(posX, posY),
          k.anchor("center"),
          k.area(),
          k.body({ isStatic: true }),
          k.z(2),
          "wall"
        ]);
      }
    }
  }
}

function createPlayer(k: KaboomCtx, x: number, y: number, maskManager: MaskManager, mapWidth: number, mapHeight: number): GameObj<any> {
  const player = k.add([
    k.sprite("player"),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.body(),
    k.health(3),
    k.color(79, 195, 247),
    k.opacity(1),
    k.z(10),
    "player",
    {
      speed: 90,
      dir: k.vec2(0, 0)
    }
  ]);

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

    const margin = TILE_SIZE;
    player.pos.x = k.clamp(player.pos.x, margin, mapWidth - margin);
    player.pos.y = k.clamp(player.pos.y, margin, mapHeight - margin);
  });

  k.onKeyPress("space", () => {
    if (gameState.isPaused() || gameState.isDialogueActive()) return;
    maskManager.activateAbility(player);
  });

  return player;
}
