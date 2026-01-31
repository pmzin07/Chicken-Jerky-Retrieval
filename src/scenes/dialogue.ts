// Dialogue System - Typewriter effect with pause
import { KaboomCtx, GameObj } from "kaboom";
import { DialogueLine } from "../types";
import { gameState } from "../state";
import { COLORS } from "../constants";

interface DialogueUI {
  box: GameObj<any>;
  speakerText: GameObj<any>;
  dialogueText: GameObj<any>;
  continueText: GameObj<any>;
}

let currentDialogueUI: DialogueUI | null = null;
let currentDialogueIndex = 0;
let currentCharIndex = 0;
let isTyping = false;
let typewriterTimer = 0;
const TYPEWRITER_SPEED = 0.03; // seconds per character

export function showDialogue(
  k: KaboomCtx,
  lines: DialogueLine[],
  onComplete: () => void
): void {
  if (lines.length === 0) {
    onComplete();
    return;
  }

  gameState.setDialogueActive(true);
  currentDialogueIndex = 0;
  
  // Create dialogue UI
  createDialogueUI(k);
  
  // Start first line
  showLine(k, lines, onComplete);
}

function createDialogueUI(k: KaboomCtx): void {
  if (currentDialogueUI) {
    destroyDialogueUI();
  }

  // Use dynamic screen dimensions
  const screenW = k.width();
  const screenH = k.height();
  
  // Responsive sizing
  const boxHeight = Math.max(100, Math.min(140, screenH * 0.2));
  const boxY = screenH - boxHeight - 20;
  const boxWidth = screenW - 60;
  const margin = 30;
  
  // Calculate responsive font sizes
  const speakerFontSize = Math.max(14, Math.min(22, screenW / 40));
  const dialogueFontSize = Math.max(12, Math.min(18, screenW / 50));
  const continueFontSize = Math.max(10, Math.min(14, screenW / 60));

  // Background box - fixed to screen with high z-index
  const box = k.add([
    k.rect(boxWidth, boxHeight, { radius: 8 }),
    k.pos(margin, boxY),
    k.color(k.Color.fromHex(COLORS.ui.dialogue)),
    k.outline(3, k.Color.fromHex(COLORS.ui.dialogueBorder)),
    k.opacity(0.95),
    k.z(200),
    k.fixed(),  // Fixed to screen, not affected by camera
    "dialogue-ui"
  ]);

  // Speaker name
  const speakerText = k.add([
    k.text("", { size: speakerFontSize }),
    k.pos(margin + 20, boxY + 15),
    k.color(255, 255, 255),
    k.z(201),
    k.fixed(),
    "dialogue-ui"
  ]);

  // Dialogue text with wrapping
  const dialogueText = k.add([
    k.text("", { 
      size: dialogueFontSize, 
      width: boxWidth - 40,
      lineSpacing: 4
    }),
    k.pos(margin + 20, boxY + 40),
    k.color(255, 255, 255),
    k.z(201),
    k.fixed(),
    "dialogue-ui"
  ]);

  // Continue prompt - positioned at bottom right of box
  const continueText = k.add([
    k.text("Press ENTER to continue...", { size: continueFontSize }),
    k.pos(screenW - margin - 180, boxY + boxHeight - 22),
    k.color(180, 180, 180),
    k.opacity(0.8),
    k.z(201),
    k.fixed(),
    "dialogue-ui"
  ]);

  // Blinking animation for continue text
  continueText.onUpdate(() => {
    continueText.opacity = 0.5 + Math.sin(k.time() * 4) * 0.3;
    continueText.hidden = isTyping;
  });

  currentDialogueUI = {
    box,
    speakerText,
    dialogueText,
    continueText
  };
}

function showLine(
  k: KaboomCtx,
  lines: DialogueLine[],
  onComplete: () => void
): void {
  if (!currentDialogueUI) return;
  if (currentDialogueIndex >= lines.length) {
    destroyDialogueUI();
    gameState.setDialogueActive(false);
    onComplete();
    return;
  }

  const line = lines[currentDialogueIndex];
  
  // Set speaker
  currentDialogueUI.speakerText.text = line.speaker;
  if (line.color) {
    currentDialogueUI.speakerText.color = k.Color.fromHex(line.color);
  }

  // Start typewriter effect
  currentCharIndex = 0;
  isTyping = true;
  typewriterTimer = 0;
  currentDialogueUI.dialogueText.text = "";

  // Typewriter update
  const typewriterCancel = k.onUpdate(() => {
    if (!isTyping || !currentDialogueUI) return;

    typewriterTimer += k.dt();
    
    while (typewriterTimer >= TYPEWRITER_SPEED && currentCharIndex < line.text.length) {
      typewriterTimer -= TYPEWRITER_SPEED;
      currentCharIndex++;
      currentDialogueUI.dialogueText.text = line.text.substring(0, currentCharIndex);
    }

    if (currentCharIndex >= line.text.length) {
      isTyping = false;
    }
  });

  // Handle input
  const enterHandler = k.onKeyPress("enter", () => {
    if (isTyping) {
      // Skip typewriter, show full text
      isTyping = false;
      if (currentDialogueUI) {
        currentDialogueUI.dialogueText.text = line.text;
      }
      currentCharIndex = line.text.length;
    } else {
      // Next line
      currentDialogueIndex++;
      typewriterCancel.cancel();
      enterHandler.cancel();
      showLine(k, lines, onComplete);
    }
  });

  // Also allow space to continue
  const spaceHandler = k.onKeyPress("space", () => {
    if (isTyping) {
      isTyping = false;
      if (currentDialogueUI) {
        currentDialogueUI.dialogueText.text = line.text;
      }
      currentCharIndex = line.text.length;
    } else {
      currentDialogueIndex++;
      typewriterCancel.cancel();
      spaceHandler.cancel();
      enterHandler.cancel();
      showLine(k, lines, onComplete);
    }
  });
}

function destroyDialogueUI(): void {
  if (currentDialogueUI) {
    currentDialogueUI.box.destroy();
    currentDialogueUI.speakerText.destroy();
    currentDialogueUI.dialogueText.destroy();
    currentDialogueUI.continueText.destroy();
    currentDialogueUI = null;
  }
}
