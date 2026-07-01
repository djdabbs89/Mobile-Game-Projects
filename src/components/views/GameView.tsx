import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, BadgeDollarSign, Wallet, Heart } from "lucide-react";
import { GLOVES, GloveId } from "../../data/gloves";
import { audio } from "../../lib/audio";

const MAP_W = 1200;
const MAP_H = 1200;
const PLAYER_SPEED = 4.5;
const NPC_SPEED = 1.2;
const CANVAS_W = 432;
const CANVAS_H = 740;

type PowerUpType = "speed" | "stealth" | "fast_hands" | "heart";
type NpcType = "tourist" | "businessman" | "cop";

function createNPC(
  id?: number,
  options?: {
    type?: NpcType;
    x?: number;
    y?: number;
    speedMult?: number;
    powerUpType?: PowerUpType | null;
  },
) {
  let powerUpType: PowerUpType | null =
    options && options.powerUpType !== undefined ? options.powerUpType : null;
  if (!options || options.powerUpType === undefined) {
    const r = Math.random();
    if (r > 0.95) {
      powerUpType = "heart";
    } else if (r > 0.85) {
      powerUpType = ["speed", "stealth", "fast_hands"][
        Math.floor(Math.random() * 3)
      ] as PowerUpType;
    }
  }

  const typeRoll = Math.random();
  let type: NpcType = options?.type || "tourist";
  let baseLoot = 0;
  let speedMult = options?.speedMult ?? 1;
  let visionRange = 180;
  let awarenessSpeed = 60;

  if (type === "cop" || (!options?.type && typeRoll > 0.9)) {
    type = "cop";
    baseLoot = Math.floor(Math.random() * 50) + 10;
    if (!options?.speedMult) speedMult = 1.1;
    visionRange = 250;
    awarenessSpeed = 120;
  } else if (type === "businessman" || (!options?.type && typeRoll > 0.6)) {
    type = "businessman";
    baseLoot = Math.floor(Math.random() * 500) + 200;
    if (!options?.speedMult) speedMult = 1.25;
    visionRange = 160;
    awarenessSpeed = 70;
  } else {
    type = "tourist";
    baseLoot = Math.floor(Math.random() * 150) + 50;
    if (!options?.speedMult) speedMult = 0.8;
    visionRange = 180;
    awarenessSpeed = 50;
  }

  return {
    id: id || Math.random(),
    type,
    x: options?.x ?? Math.random() * MAP_W,
    y: options?.y ?? Math.random() * MAP_H,
    vx: 0,
    vy: 0,
    targetX: Math.random() * MAP_W,
    targetY: Math.random() * MAP_H,
    waitTimer: 0,
    radius: 14,
    angle: Math.random() * Math.PI * 2,
    loot: baseLoot,
    detection: 0,
    powerUpType,
    speedMult,
    visionRange,
    awarenessSpeed,
  };
}

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const [playerNameInput, setPlayerNameInput] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);

  // Core Game State
  const [gameState, setGameState] = useState<
    | "menu"
    | "options"
    | "achievements"
    | "playing"
    | "stealing"
    | "caught"
    | "success"
    | "perk_choice"
    | "shop"
    | "stats"
    | "leaderboard"
    | "game_over"
  >("menu");
  const gameStateRef = useRef(gameState);
  const [lastShopOrigin, setLastShopOrigin] = useState<"menu" | "playing">(
    "menu",
  );
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  useEffect(() => {
    audio.setMute(isAudioMuted);
  }, [isAudioMuted]);

  useEffect(() => {
    // Audio integration based on game state
    switch (gameState) {
      case "menu":
        audio.startMenuMusic();
        break;
      case "playing":
        audio.startGameplayMusic();
        break;
      case "stealing":
        audio.playStealStart();
        break;
      case "success":
        audio.playStealSuccess();
        break;
      case "caught":
      case "game_over":
        audio.playCaught();
        audio.stopMusic();
        break;
      case "perk_choice":
      case "achievements":
      case "shop":
        audio.startMenuMusic();
        audio.playPerkSelect();
        break;
      case "options":
      case "leaderboard":
        audio.startMenuMusic();
        audio.playClick();
        break;
    }
  }, [gameState]);

  const [interactiveTutorialActive, setInteractiveTutorialActive] =
    useState(false);
  const interactiveTutorialActiveRef = useRef(false);
  useEffect(() => {
    interactiveTutorialActiveRef.current = interactiveTutorialActive;
  }, [interactiveTutorialActive]);

  const [interactiveTutorialStep, setInteractiveTutorialStep] = useState(0);

  const [cash, setCash] = useState(0);
  const [unbankedCash, setUnbankedCash] = useState(0);
  const unbankedCashRef = useRef(0);
  useEffect(() => {
    unbankedCashRef.current = unbankedCash;
  }, [unbankedCash]);

  const [combo, setCombo] = useState(1);
  const comboRef = useRef(1);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  const [lives, setLives] = useState(3);
  const [canSteal, setCanSteal] = useState(false);
  const [proximityUIProgress, setProximityUIProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  // Skins
  const [currentSkin, setCurrentSkin] = useState<GloveId>("default");
  const currentSkinRef = useRef<GloveId>(currentSkin);
  useEffect(() => {
    currentSkinRef.current = currentSkin;
  }, [currentSkin]);
  const [unlockedSkins, setUnlockedSkins] = useState<GloveId[]>(["default"]);

  // Stats for unlocks
  const [stats, setStats] = useState({
    totalLooted: 0,
    copsRobbed: 0,
    timesCaught: 0,
    perksAcquired: 0,
  });
  const statsRef = useRef(stats);
  useEffect(() => {
    statsRef.current = stats;

    // Evaluate Unlocks
    (Object.keys(GLOVES) as GloveId[]).forEach((skinKey) => {
      const skin = GLOVES[skinKey];
      if (skin.unlockCondition && !unlockedSkins.includes(skinKey)) {
        const cond = skin.unlockCondition;
        let isUnlocked = false;
        if (cond.type === "total_looted" && stats.totalLooted >= cond.target)
          isUnlocked = true;
        else if (cond.type === "cops_robbed" && stats.copsRobbed >= cond.target)
          isUnlocked = true;
        else if (
          cond.type === "times_caught" &&
          stats.timesCaught >= cond.target
        )
          isUnlocked = true;
        else if (
          cond.type === "perks_acquired" &&
          stats.perksAcquired >= cond.target
        )
          isUnlocked = true;

        if (isUnlocked) {
          setUnlockedSkins((prev) => {
            if (!prev.includes(skinKey)) {
              showNotification(`Achievement Unlocked: ${skin.name}!`);
              return [...prev, skinKey];
            }
            return prev;
          });
        }
      }
    });
  }, [stats]);

  // Power-ups
  const [powerUp, setPowerUp] = useState<PowerUpType | null>(null);
  const powerUpsRef = useRef<PowerUpType[]>([]);
  useEffect(() => {
    powerUpsRef.current = powerUp ? [powerUp] : [];
  }, [powerUp]);

  const [pendingPowerUp, setPendingPowerUp] = useState<PowerUpType | null>(
    null,
  );
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Minigame State
  const [stealProgress, setStealProgress] = useState(0);
  const [stealAwareness, setStealAwareness] = useState(0);
  const minigameRef = useRef({ progress: 0, awareness: 0 });
  useEffect(() => {
    minigameRef.current = {
      progress: stealProgress,
      awareness: stealAwareness,
    };
  }, [stealProgress, stealAwareness]);
  const isHolding = useRef(false);

  // Physics Engine State
  const stateRef = useRef({
    player: { x: MAP_W / 2, y: MAP_H / 2, radius: 15 },
    npcs: Array.from({ length: 15 }).map((_, i) => createNPC(i)),
    joystick: {
      active: false,
      originX: 0,
      originY: 0,
      x: 0,
      y: 0,
      dirX: 0,
      dirY: 0,
    },
    camera: { x: MAP_W / 2 - CANVAS_W / 2, y: MAP_H / 2 - CANVAS_H / 2 },
    targetNpcId: null as number | null,
    proximity: 0,
    elapsedRunTime: 0,
  });

  // Minigame Logic loops
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (
        gameStateRef.current === "caught" ||
        gameStateRef.current === "success" ||
        gameStateRef.current === "playing"
      ) {
        return;
      }

      const hasFastHands = powerUpsRef.current.includes("fast_hands");
      const hasStealth = powerUpsRef.current.includes("stealth");

      const skinCfg = GLOVES[currentSkinRef.current] || GLOVES.default;
      const skinStealRate = skinCfg.effects.stealRateMult || 1;
      const skinStealth = skinCfg.effects.stealthMult || 1;

      const targetNpc = stateRef.current.npcs.find(
        (n) => n.id === stateRef.current.targetNpcId,
      );
      const hasHeartMod = targetNpc?.powerUpType === "heart" ? 1.5 : 1.0;
      const heartProgressMod = targetNpc?.powerUpType === "heart" ? 0.6 : 1.0;
      const awarenessSpeedMultiplier = targetNpc
        ? targetNpc.awarenessSpeed / 50
        : 1;

      let newAwareness = minigameRef.current.awareness;

      if (isHolding.current) {
        setStealProgress((p) => {
          const baseSpeed = 45; // % per second
          const np =
            p +
            (hasFastHands ? baseSpeed * 1.5 : baseSpeed) *
              skinStealRate *
              heartProgressMod *
              dt;
          if (np >= 100) {
            if (gameStateRef.current !== "success") setGameState("success");
            setIsPressing(false);
            return 100;
          }
          return np;
        });

        // Awareness rises while holding
        const stealthMod = (hasStealth ? 0.6 : 1.0) * skinStealth;
        const difficultyMultiplier =
          1 + (stateRef.current.elapsedRunTime / 60) * 0.75;
        const awarenessBaseRate = 55 * difficultyMultiplier; // % per second
        newAwareness +=
          awarenessBaseRate *
          awarenessSpeedMultiplier *
          stealthMod *
          hasHeartMod *
          dt;
      } else {
        // Awareness drops quickly when not holding
        newAwareness = Math.max(0, newAwareness - 80 * dt);
      }

      setStealAwareness(Math.min(100, newAwareness));

      if (
        newAwareness > 80 &&
        gameStateRef.current !== "caught" &&
        gameStateRef.current !== "success"
      ) {
        setGameState("caught");
        setLives((l) => l - 1);
        setIsPressing(false);
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState]);

  // World Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const st = stateRef.current;
      const currentGameState = gameStateRef.current;

      if (currentGameState === "playing") {
        st.elapsedRunTime += dt;
        const difficultyMultiplier = 1 + (st.elapsedRunTime / 60) * 0.75; // Increases by 75% per minute

        audio.setWantedLevel(st.elapsedRunTime / 30);

        const timerEl = document.getElementById("play-timer");
        if (timerEl) {
          const mins = Math.floor(st.elapsedRunTime / 60)
            .toString()
            .padStart(2, "0");
          const secs = Math.floor(st.elapsedRunTime % 60)
            .toString()
            .padStart(2, "0");
          timerEl.innerText = `SURVIVED: ${mins}:${secs}`;
        }

        const skinCfg = GLOVES[currentSkinRef.current] || GLOVES.default;
        const skinSpeed = skinCfg.effects.speedMult || 1;
        const skinVisionMult = skinCfg.effects.visionRangeMult || 1;
        const skinStealth = skinCfg.effects.stealthMult || 1;

        // Update Player
        const hasSpeed = powerUpsRef.current.includes("speed");
        const currentSpeed =
          (hasSpeed ? PLAYER_SPEED * 1.5 : PLAYER_SPEED) * skinSpeed;

        if (st.joystick.active) {
          st.player.x += st.joystick.dirX * currentSpeed;
          st.player.y += st.joystick.dirY * currentSpeed;
        }

        st.player.x = Math.max(15, Math.min(MAP_W - 15, st.player.x));
        st.player.y = Math.max(15, Math.min(MAP_H - 15, st.player.y));

        let stealableNpc: any = null;

        st.npcs.forEach((npc) => {
          // Pathing
          if (npc.waitTimer > 0) {
            npc.waitTimer -= dt;
            if (npc.waitTimer <= 0) {
              npc.targetX = npc.x + (Math.random() - 0.5) * 400;
              npc.targetY = npc.y + (Math.random() - 0.5) * 400;
              npc.targetX = Math.max(15, Math.min(MAP_W - 15, npc.targetX));
              npc.targetY = Math.max(15, Math.min(MAP_H - 15, npc.targetY));
            }
          } else {
            const distToTarget = Math.hypot(
              npc.targetX - npc.x,
              npc.targetY - npc.y,
            );
            if (distToTarget < 5) {
              npc.waitTimer = Math.random() * 3 + 1;
              npc.vx = 0;
              npc.vy = 0;
            } else {
              const newAngle = Math.atan2(
                npc.targetY - npc.y,
                npc.targetX - npc.x,
              );
              // Smooth angle
              let angleDiff = newAngle - npc.angle;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              npc.angle += angleDiff * 5 * dt;

              npc.vx =
                Math.cos(npc.angle) *
                NPC_SPEED *
                npc.speedMult *
                difficultyMultiplier;
              npc.vy =
                Math.sin(npc.angle) *
                NPC_SPEED *
                npc.speedMult *
                difficultyMultiplier;
              npc.x += npc.vx;
              npc.y += npc.vy;
            }
          }

          // Vision Check
          const dx = st.player.x - npc.x;
          const dy = st.player.y - npc.y;
          const dist = Math.hypot(dx, dy);
          const finalVisionRange =
            npc.visionRange *
            skinVisionMult *
            (1 + (difficultyMultiplier - 1) * 0.5);

          let inVision = false;
          if (dist < finalVisionRange) {
            const angleToPlayer = Math.atan2(dy, dx);
            let angleDiff = Math.abs(angleToPlayer - npc.angle);
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            angleDiff = Math.abs(angleDiff);

            if (angleDiff < Math.PI / 3.5) {
              inVision = true;
            }
          }

          if (inVision) {
            const hasStealth = powerUpsRef.current.includes("stealth");
            npc.detection +=
              (hasStealth ? npc.awarenessSpeed * 0.4 : npc.awarenessSpeed) *
              skinStealth *
              difficultyMultiplier *
              dt;
            if (npc.detection > 100 && gameStateRef.current === "playing") {
              setGameState("caught");
              setLives((l) => l - 1);
            }
          } else {
            npc.detection = Math.max(0, npc.detection - 30 * dt);
          }

          // Steal Check
          if (!inVision && dist < 50) {
            stealableNpc = npc;
          }
        });

        if (stealableNpc) {
          if (!st.targetNpcId || st.targetNpcId !== stealableNpc.id) {
            st.targetNpcId = stealableNpc.id;
            st.proximity = 0;
            setCanSteal(true);
          } else {
            st.proximity = Math.min(100, st.proximity + 100 * dt); // 1 sec to fill
            if (st.proximity >= 100) {
              setGameState("stealing");
              st.joystick.active = false;
              setCanSteal(false);
              st.proximity = 0;
            }
          }
        } else {
          if (st.targetNpcId) {
            st.targetNpcId = null;
            st.proximity = 0;
            setCanSteal(false);
          }
        }
        setProximityUIProgress(st.proximity);

        // Combo Decay
        if (comboRef.current > 1) {
          st.comboTimer -= dt;

          const comboBar = document.getElementById("combo-bar");
          if (comboBar) {
            comboBar.style.width = `${Math.max(0, (st.comboTimer / 10) * 100)}%`;
          }

          if (st.comboTimer <= 0) {
            setCombo(1);
            if (comboBar) comboBar.style.width = "100%";
          }
        }

        // Banking Zone Check
        const ZONE_RADIUS = 120;
        const zones = [
          { x: 100, y: 100 },
          { x: MAP_W - 100, y: MAP_H - 100 },
        ];
        let banking = false;
        zones.forEach((z) => {
          if (Math.hypot(st.player.x - z.x, st.player.y - z.y) < ZONE_RADIUS) {
            banking = true;
          }
        });

        if (banking && unbankedCashRef.current > 0) {
          const amount = unbankedCashRef.current;
          setCash((c) => c + amount);
          setUnbankedCash(0);
          showNotification(`Banked $${amount}!`);
        }
      }

      // Draw - Smooth Camera
      st.camera.x += (st.player.x - CANVAS_W / 2 - st.camera.x) * 0.1;
      st.camera.y += (st.player.y - CANVAS_H / 2 - st.camera.y) * 0.1;

      st.camera.x = Math.max(-50, Math.min(MAP_W - CANVAS_W + 50, st.camera.x));
      st.camera.y = Math.max(-50, Math.min(MAP_H - CANVAS_H + 50, st.camera.y));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(2, 2);
      ctx.translate(-st.camera.x, -st.camera.y);

      // Ground Background
      ctx.fillStyle = "#08090A";
      ctx.fillRect(st.camera.x, st.camera.y, CANVAS_W, CANVAS_H);

      // Floor Tile Pattern
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      const TILE = 40;
      const startX = Math.floor(st.camera.x / TILE) * TILE;
      const startY = Math.floor(st.camera.y / TILE) * TILE;
      for (let x = startX; x < st.camera.x + CANVAS_W; x += TILE) {
        for (let y = startY; y < st.camera.y + CANVAS_H; y += TILE) {
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // Map Bounds
      ctx.strokeStyle = "#2a2d35";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, MAP_W, MAP_H);

      // Draw Banking Zones
      const bZones = [
        { x: 100, y: 100 },
        { x: MAP_W - 100, y: MAP_H - 100 },
      ];
      bZones.forEach((z) => {
        ctx.beginPath();
        ctx.arc(z.x, z.y, 120, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
        ctx.fill();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText("BANK ZONE", z.x, z.y);
      });

      const skinCfg = GLOVES[currentSkinRef.current] || GLOVES.default;
      const skinVisionMult = skinCfg.effects.visionRangeMult || 1;

      // Draw NPCs
      st.npcs.forEach((npc) => {
        // Vision Cone
        const finalVisionRange = npc.visionRange * skinVisionMult;
        ctx.beginPath();
        ctx.moveTo(npc.x, npc.y);
        ctx.arc(
          npc.x,
          npc.y,
          finalVisionRange,
          npc.angle - Math.PI / 3.5,
          npc.angle + Math.PI / 3.5,
        );
        ctx.lineTo(npc.x, npc.y);
        if (npc.detection > 0) {
          ctx.fillStyle = `rgba(244,63,94,${0.15 + (npc.detection / 100) * 0.5})`;
        } else if (currentGameState === "playing") {
          if (npc.type === "cop") {
            ctx.fillStyle = "rgba(29,78,216,0.08)"; // blueish for cop
          } else {
            ctx.fillStyle = "rgba(6,182,212,0.05)";
          }
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.02)";
        }
        ctx.fill();

        // NPC Body
        ctx.beginPath();
        ctx.arc(npc.x, npc.y, npc.radius, 0, Math.PI * 2);
        const isTarget = st.targetNpcId === npc.id;

        let glowColor = "#ec4899"; // tourist pink
        if (npc.type === "cop")
          glowColor = "#3b82f6"; // cop blue
        else if (npc.type === "businessman") glowColor = "#10b981"; // biz green

        if (npc.powerUpType === "speed") glowColor = "#3b82f6";
        if (npc.powerUpType === "stealth") glowColor = "#a855f7";
        if (npc.powerUpType === "fast_hands") glowColor = "#10b981";
        if (npc.powerUpType === "heart") glowColor = "#f43f5e";

        if (npc.detection > 50) glowColor = "#f43f5e";
        if (isTarget) glowColor = "#eab308";

        ctx.fillStyle = "#0f172a";
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw NPC Inner Shape
        ctx.beginPath();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = glowColor;
        ctx.strokeStyle = glowColor;

        if (npc.detection > 50) {
          const size = 4;
          ctx.lineWidth = 2.5;
          ctx.moveTo(npc.x - size, npc.y - size);
          ctx.lineTo(npc.x + size, npc.y + size);
          ctx.moveTo(npc.x + size, npc.y - size);
          ctx.lineTo(npc.x - size, npc.y + size);
          ctx.stroke();
        } else if (npc.type === "cop") {
          const size = 5;
          ctx.moveTo(npc.x, npc.y - size - 1);
          ctx.lineTo(npc.x + size, npc.y + size - 1);
          ctx.lineTo(npc.x - size, npc.y + size - 1);
          ctx.closePath();
          ctx.fill();
        } else if (npc.type === "businessman") {
          const size = 5;
          ctx.moveTo(npc.x, npc.y - size);
          ctx.lineTo(npc.x + size, npc.y);
          ctx.lineTo(npc.x, npc.y + size);
          ctx.lineTo(npc.x - size, npc.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.arc(npc.x, npc.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Detection Bar
        if (npc.detection > 0) {
          ctx.fillStyle = "rgba(0,0,0,0.8)";
          ctx.fillRect(npc.x - 16, npc.y - 28, 32, 6);
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(npc.x - 15, npc.y - 27, (npc.detection / 100) * 30, 4);
        }

        if (isTarget && currentGameState === "playing") {
          ctx.beginPath();
          ctx.arc(
            npc.x,
            npc.y,
            npc.radius + 6 + Math.sin(time / 150) * 3,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw Player
      const pColor =
        GLOVES[currentSkinRef.current]?.color || GLOVES.default.color;
      const pBorder =
        GLOVES[currentSkinRef.current]?.border || GLOVES.default.border;

      ctx.beginPath();
      ctx.arc(st.player.x, st.player.y, st.player.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = pBorder;
      ctx.shadowColor = pBorder;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Player Inner Core (Cyberpunk dot)
      ctx.beginPath();
      ctx.arc(st.player.x, st.player.y, st.player.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = pColor;
      ctx.shadowColor = pColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tutorial Directional Indicator
      if (
        interactiveTutorialActiveRef.current &&
        unbankedCashRef.current > 0 &&
        currentGameState === "playing"
      ) {
        const tZones = [
          { x: 100, y: 100 },
          { x: MAP_W - 100, y: MAP_H - 100 },
        ];
        let closestZone = tZones[0];
        let minDist = Infinity;
        tZones.forEach((z) => {
          const d = Math.hypot(st.player.x - z.x, st.player.y - z.y);
          if (d < minDist) {
            minDist = d;
            closestZone = z;
          }
        });

        const angleToBank = Math.atan2(
          closestZone.y - st.player.y,
          closestZone.x - st.player.x,
        );

        ctx.save();
        ctx.translate(st.player.x, st.player.y);
        ctx.rotate(angleToBank);
        
        const bounce = Math.sin(time / 150) * 5;
        ctx.beginPath();
        ctx.moveTo(35 + bounce, 0);
        ctx.lineTo(20 + bounce, -12);
        ctx.lineTo(20 + bounce, 12);
        ctx.closePath();
        ctx.fillStyle = "#10b981";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // Draw Joystick UI Over canvas
      if (st.joystick.active && currentGameState === "playing") {
        ctx.save();
        ctx.scale(2, 2);
        ctx.beginPath();
        ctx.arc(st.joystick.originX, st.joystick.originY, 40, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(6,182,212,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(st.joystick.x, st.joystick.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6,182,212,0.6)";
        ctx.fill();
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const st = stateRef.current.joystick;
    st.active = true;
    st.originX = x;
    st.originY = y;
    st.x = x;
    st.y = y;
    st.dirX = 0;
    st.dirY = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = stateRef.current.joystick;
    if (!st.active || gameState !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - st.originX;
    const dy = y - st.originY;
    const dist = Math.hypot(dx, dy);

    const maxDist = 40;
    if (dist > maxDist) {
      st.x = st.originX + (dx / dist) * maxDist;
      st.y = st.originY + (dy / dist) * maxDist;
      st.dirX = dx / dist;
      st.dirY = dy / dist;
    } else {
      st.x = x;
      st.y = y;
      st.dirX = dx / maxDist;
      st.dirY = dy / maxDist;
    }
  };

  const handlePointerUp = () => {
    const st = stateRef.current.joystick;
    st.active = false;
    st.dirX = 0;
    st.dirY = 0;
  };

  useEffect(() => {
    if (gameState === "leaderboard") {
      import("../../lib/firebase").then(({ getLeaderboard }) => {
        getLeaderboard().then(setLeaderboardEntries).catch(console.error);
      });
    }
  }, [gameState]);

  const handleGameOverSubmit = async () => {
    if (!playerNameInput.trim()) return;
    setSubmittingScore(true);
    try {
      const { addLeaderboardEntry } = await import("../../lib/firebase");
      await addLeaderboardEntry({
        playerName: playerNameInput.trim().substring(0, 20),
        score: cash,
        survivedTime: stateRef.current.elapsedRunTime,
      });
    } catch (e) {
      console.error(e);
    }
    setSubmittingScore(false);
    handleRestart();
  };

  const handleRestart = () => {
    setInteractiveTutorialActive(false);
    audio.init();
    audio.playClick();
    setGameState("playing");
    setLives(3);
    setPowerUp(null);
    setPendingPowerUp(null);
    stateRef.current.player.x = MAP_W / 2;
    stateRef.current.player.y = MAP_H / 2;
    stateRef.current.npcs = Array.from({ length: 15 }).map((_, i) =>
      createNPC(i),
    );
    stateRef.current.targetNpcId = null;
    stateRef.current.elapsedRunTime = 0;
    setCanSteal(false);
    setStealProgress(0);
    setStealAwareness(0);
    setUnbankedCash(0);
    setCombo(1);
    stateRef.current.comboTimer = 0;
    stateRef.current.joystick.active = false;
    isHolding.current = false;
    setIsPressing(false);
  };

  const handleStartInteractiveTutorial = () => {
    setInteractiveTutorialActive(true);
    setInteractiveTutorialStep(1);
    audio.init();
    audio.playClick();
    setGameState("playing");
    setLives(3);
    setPowerUp(null);
    setPendingPowerUp(null);
    stateRef.current.player.x = MAP_W / 2;
    stateRef.current.player.y = MAP_H / 2;
    // Spawn just one tourist near the player, moving slowly
    stateRef.current.npcs = [
      createNPC(1, {
        type: "tourist",
        x: MAP_W / 2 + 100,
        y: MAP_H / 2,
        speedMult: 0,
      }),
    ];
    stateRef.current.targetNpcId = null;
    stateRef.current.elapsedRunTime = 0;
    setCanSteal(false);
    setStealProgress(0);
    setStealAwareness(0);
    setUnbankedCash(0);
    setCombo(1);
    stateRef.current.comboTimer = 0;
    stateRef.current.joystick.active = false;
    isHolding.current = false;
    setIsPressing(false);
  };

  const handleTryAgain = () => {
    if (gameState === "caught") {
      setUnbankedCash(0);
      setCombo(1);
      stateRef.current.comboTimer = 0;
      setCash((c) => Math.max(0, c - 50));
      if (!interactiveTutorialActiveRef.current) {
        setStats((prev) => ({ ...prev, timesCaught: prev.timesCaught + 1 }));
      }
      stateRef.current.player.x = MAP_W / 2;
      stateRef.current.player.y = MAP_H / 2;
      stateRef.current.npcs.forEach((n) => (n.detection = 0));
      setPowerUp(null); // Lose powerups
    } else if (gameState === "success") {
      const targetNpcIndex = stateRef.current.npcs.findIndex(
        (n) => n.id === stateRef.current.targetNpcId,
      );
      if (targetNpcIndex !== -1) {
        const targetNpc = stateRef.current.npcs[targetNpcIndex];
        let goToPerkChoice = false;

        const skinCfg = GLOVES[currentSkinRef.current] || GLOVES.default;
        let finalLootMult = skinCfg.effects.lootMult || 1;

        if (
          currentSkinRef.current === "banker" &&
          targetNpc.type === "businessman"
        ) {
          finalLootMult += 1.0;
        }
        if (
          currentSkinRef.current === "cop_impersonator" &&
          targetNpc.type === "cop"
        ) {
          finalLootMult += 0.5;
        }

        if (targetNpc.powerUpType === "heart") {
          setLives((l) => Math.min(3, l + 1));
          showNotification("+1 HEART!");
        } else {
          const earned = Math.floor(
            targetNpc.loot * finalLootMult * comboRef.current,
          );
          setUnbankedCash((c) => c + earned);
          setCombo((c) => Math.min(5, c + 1));
          stateRef.current.comboTimer = 10;
          if (!interactiveTutorialActiveRef.current) {
            setStats((prev) => ({
              ...prev,
              totalLooted: prev.totalLooted + earned,
              copsRobbed: prev.copsRobbed + (targetNpc.type === "cop" ? 1 : 0),
            }));
          }
        }

        if (targetNpc.powerUpType && targetNpc.powerUpType !== "heart") {
          if (!interactiveTutorialActiveRef.current) {
            setStats((prev) => ({
              ...prev,
              perksAcquired: prev.perksAcquired + 1,
            }));
          }
          if (powerUp && powerUp !== targetNpc.powerUpType) {
            setPendingPowerUp(targetNpc.powerUpType);
            goToPerkChoice = true;
          } else {
            if (!powerUp) {
              setPowerUp(targetNpc.powerUpType);
              showNotification(
                `Acquired: ${targetNpc.powerUpType.replace("_", " ").toUpperCase()}!`,
              );
            }
          }
        }

        // Reroll NPC
        if (interactiveTutorialActiveRef.current) {
          if (targetNpc.type === "tourist") {
            setInteractiveTutorialStep(2);
            stateRef.current.npcs = [
              createNPC(2, { type: "businessman", x: stateRef.current.player.x, y: stateRef.current.player.y - 150, speedMult: 0 })
            ];
          } else if (targetNpc.type === "businessman") {
            setInteractiveTutorialStep(3);
            stateRef.current.npcs = [
              createNPC(3, { type: "cop", x: stateRef.current.player.x - 150, y: stateRef.current.player.y, speedMult: 0, powerUpType: "fast_hands" })
            ];
          } else if (targetNpc.type === "cop") {
            setInteractiveTutorialStep(4);
            stateRef.current.npcs = [];
          }
        } else {
          stateRef.current.npcs[targetNpcIndex] = createNPC(targetNpc.id);
        }

        if (goToPerkChoice) {
          setGameState("perk_choice");
          setStealProgress(0);
          setStealAwareness(0);
          isHolding.current = false;
          setIsPressing(false);
          stateRef.current.targetNpcId = null;
          setCanSteal(false);
          stateRef.current.joystick.active = false;
          return;
        }
      }
    }

    setGameState("playing");
    setStealProgress(0);
    setStealAwareness(0);
    isHolding.current = false;
    setIsPressing(false);
    stateRef.current.targetNpcId = null;
    setCanSteal(false);
    stateRef.current.joystick.active = false;
  };

  const handlePerkChoice = (keepNew: boolean) => {
    if (keepNew && pendingPowerUp) {
      setPowerUp(pendingPowerUp);
      showNotification(
        `Swapped to: ${pendingPowerUp.replace("_", " ").toUpperCase()}!`,
      );
    } else {
      showNotification("Kept current perk.");
    }
    setPendingPowerUp(null);
    setGameState("playing");
  };

  const handleStartSteal = () => {
    setGameState("stealing");
    stateRef.current.joystick.active = false;
  };

  const handleStealPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (gameState === "caught" || gameState === "success") return;
    isHolding.current = true;
    setIsPressing(true);
  };

  const handleStealPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (gameState === "caught" || gameState === "success") return;
    isHolding.current = false;
    setIsPressing(false);
  };

  return (
    <div className="max-w-[432px] mx-auto pb-10 flex flex-col items-center">
      <div className="mb-6 text-center min-h-[64px] flex flex-col justify-end">
        {interactiveTutorialActive &&
        (gameState === "playing" ||
          gameState === "stealing" ||
          gameState === "success") ? (
          <p className="text-sm font-bold text-pink-400 bg-slate-900/90 border border-pink-500/30 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-[400px]">
            {interactiveTutorialStep === 1 &&
              !canSteal &&
              gameState === "playing" &&
              "Walk behind the Tourist (pink circle) until the Steal prompt appears."}
            {interactiveTutorialStep === 1 &&
              canSteal &&
              gameState === "playing" &&
              "Great! Now press and hold the 'HOLD TO STEAL' button."}
            {interactiveTutorialStep === 2 &&
              !canSteal &&
              gameState === "playing" &&
              "Next, steal from the Businessman. They carry more cash (Green diamond)!"}
            {interactiveTutorialStep === 2 &&
              canSteal &&
              gameState === "playing" &&
              "Press and hold!"}
            {interactiveTutorialStep === 3 &&
              !canSteal &&
              gameState === "playing" &&
              "Finally, a Cop (Blue triangle). ANY target glowing a different color carries a PERK (Blue=Speed, Purple=Stealth, Green=Fast Hands, Red=Heart)."}
            {interactiveTutorialStep === 3 &&
              canSteal &&
              gameState === "playing" &&
              "This Cop glows green (Fast Hands). Press and hold! Careful, cops have high awareness."}
            {gameState === "stealing" &&
              "Keep holding until the bar is full! If awareness hits 80%, you are caught!"}
            {interactiveTutorialStep === 4 &&
              unbankedCash > 0 &&
              "Nice! You have unbanked cash and a perk. Follow the green arrow to a BANK ZONE to secure the cash!"}
            {interactiveTutorialStep === 4 &&
              cash > 0 &&
              "Tutorial Complete! You've secured the bag."}
          </p>
        ) : (
          <>
            <h2 className="text-2xl font-black italic text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
              PLAY PROTOTYPE
            </h2>
            <p className="text-sm text-slate-400">
              Drag anywhere to move. Sneak up behind targets.
            </p>
          </>
        )}
      </div>

      <div className="relative w-full aspect-[432/740] bg-[#1a1c20] rounded-[40px] border-[8px] border-[#2a2d35] shadow-2xl overflow-hidden flex flex-col select-none touch-none">
        <canvas
          ref={canvasRef}
          width={864}
          height={1480}
          className="absolute inset-0 w-full h-full z-0 block"
        />

        <div
          className="absolute inset-0 z-10 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* HUD overlay */}
        {gameState !== "menu" &&
          gameState !== "options" &&
          gameState !== "achievements" && (
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-20 pointer-events-none">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold">
                  Location
                </span>
                <span className="text-lg text-white font-black italic shadow-black drop-shadow-md">
                  NEON MARKET
                </span>
                <span
                  id="play-timer"
                  className="text-xs font-mono font-bold text-cyan-400 mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                >
                  SURVIVED: 00:00
                </span>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 transition-all ${i < lives ? "text-rose-500 fill-rose-500/80 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "text-slate-700 fill-slate-800"}`}
                    />
                  ))}
                </div>
                {powerUp && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-black italic uppercase text-black shadow-md ${
                        powerUp === "speed"
                          ? "bg-blue-400 border border-blue-200"
                          : powerUp === "stealth"
                            ? "bg-purple-400 border border-purple-200"
                            : "bg-emerald-400 border border-emerald-200"
                      }`}
                    >
                      {powerUp.replace("_", " ")}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden items-end shadow-lg w-36">
                  <div className="w-full px-3 py-2 flex items-center justify-between border-b border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Bank
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      ${cash}
                    </span>
                  </div>
                  {unbankedCash > 0 ? (
                    <div className="w-full px-3 py-2 flex items-center justify-between bg-rose-500/10">
                      <span className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Loot
                      </span>
                      <span className="text-sm font-mono font-bold text-rose-400">
                        ${unbankedCash}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 flex items-center justify-between opacity-50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Loot
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-500">
                        $0
                      </span>
                    </div>
                  )}
                </div>

                {combo > 1 && (
                  <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/50 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] pointer-events-none mt-1">
                    <span className="text-[10px] font-black italic text-amber-400">
                      {combo}x COMBO
                    </span>
                    <div className="w-12 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div
                        id="combo-bar"
                        className="h-full bg-amber-400"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}

                {(gameState === "playing" ||
                  gameState === "stealing" ||
                  gameState === "caught" ||
                  gameState === "success") && (
                  <div
                    onClick={() => {
                      if (gameState === "playing") {
                        setLastShopOrigin("playing");
                        setGameState("shop");
                        stateRef.current.joystick.active = false;
                      }
                    }}
                    className="bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 h-fit cursor-pointer hover:border-white/40 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)] mt-1"
                  >
                    <BadgeDollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black italic tracking-widest text-amber-400">
                      SHOP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Notification overlay */}
        {notification && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
            <div className="bg-emerald-400 text-black px-4 py-2 rounded-lg font-black italic shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-emerald-300">
              {notification}
            </div>
          </div>
        )}

        {/* Interactive Tutorial Overlay */}
        {interactiveTutorialActive &&
          (gameState === "playing" ||
            gameState === "stealing" ||
            gameState === "success") && (
            <div className="absolute top-1/2 left-4 right-4 z-40 pointer-events-none text-center flex flex-col gap-2 -translate-y-1/2">
              {interactiveTutorialStep === 4 && cash > 0 && (
                <button
                  onClick={() => {
                    setGameState("menu");
                    setInteractiveTutorialActive(false);
                  }}
                  className="mt-2 py-3 px-6 rounded-xl bg-[#2a2d35] text-white font-black uppercase tracking-widest border border-white/10 pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                  Back to Menu
                </button>
              )}
            </div>
          )}

        {gameState === "playing" && canSteal && (
          <div className="absolute bottom-10 left-0 right-0 px-8 z-20 flex justify-center pointer-events-none">
            <div className="w-full h-16 relative rounded-2xl bg-black/60 border border-yellow-300/30 overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.2)]">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500"
                style={{ width: `${proximityUIProgress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${proximityUIProgress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference font-black uppercase tracking-widest text-lg">
                Pick Pocket
              </div>
            </div>
          </div>
        )}

        {gameState === "stealing" && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 touch-none">
            <div className="w-full flex-1 flex justify-between items-end mb-10 mt-16 p-6 bg-[#14161a] rounded-[30px] border border-white/10 shadow-2xl relative">
              {/* Loot Bar */}
              <div className="flex flex-col items-center gap-2 h-full justify-end z-10 relative">
                <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-1 mb-1 shadow-black drop-shadow-md">
                  <BadgeDollarSign className="w-3 h-3" /> LOOT
                </span>
                <div className="w-8 flex-1 bg-black/60 rounded-full border border-white/10 flex flex-col justify-end overflow-hidden backdrop-blur-md">
                  <motion.div
                    className="w-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    animate={{ height: `${stealProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-slate-400 text-xs font-mono backdrop-blur-sm px-1 rounded">
                  {Math.floor(stealProgress)}%
                </span>
              </div>

              {/* Character visual proxy */}
              <div className="flex flex-col items-center justify-end h-full mb-4 px-2 pb-12 z-10 relative">
                <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center transition-colors bg-black/60 backdrop-blur-md">
                  <Wallet className="w-8 h-8 text-slate-400" />
                </div>
              </div>

              {/* Awareness Bar */}
              <div className="flex flex-col items-center gap-2 h-full justify-end z-10 relative">
                <span className="text-rose-400 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-1 mb-1 shadow-black drop-shadow-md">
                  AWARE <ShieldAlert className="w-3 h-3" />
                </span>
                <div className="w-8 flex-1 bg-black/60 rounded-full border border-white/10 flex flex-col justify-end overflow-hidden relative backdrop-blur-md">
                  <div className="absolute top-[20%] w-full h-[2px] bg-white/40 z-10"></div>
                  <motion.div
                    className={`w-full rounded-full transition-colors ${stealAwareness > 80 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"}`}
                    animate={{ height: `${stealAwareness}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-slate-400 text-xs font-mono backdrop-blur-sm px-1 rounded">
                  {Math.floor(stealAwareness)}%
                </span>
              </div>
            </div>

            {/* Input Area */}
            <div className="w-full flex gap-3 pointer-events-none">
              <button
                onClick={() => {
                  setGameState("playing");
                  setStealProgress(0);
                  setStealAwareness(0);
                }}
                className="w-20 py-6 rounded-2xl bg-black/40 border border-white/10 text-[#64748b] hover:text-white flex justify-center items-center pointer-events-auto uppercase text-sm font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                BACK
              </button>
              <button
                onPointerDown={handleStealPointerDown}
                onPointerUp={handleStealPointerUp}
                onPointerLeave={handleStealPointerUp}
                className={`flex-1 py-6 rounded-2xl font-black text-xl tracking-widest transition-all select-none touch-none border pointer-events-auto ${
                  isPressing
                    ? "bg-gradient-to-b from-cyan-700 to-cyan-900 border-cyan-400/30 scale-[0.98]"
                    : "bg-gradient-to-b from-cyan-600 to-cyan-800 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                } text-white uppercase italic`}
              >
                Hold to Steal
              </button>
            </div>
          </div>
        )}

        {gameState === "caught" && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 touch-none">
            <div className="text-rose-500 font-black text-5xl italic tracking-wider animate-bounce mb-8 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              CAUGHT
            </div>
            <div className="text-8xl mb-12 drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]">
              😵
            </div>
            <button
              onClick={() => {
                if (lives > 0) {
                  handleTryAgain();
                } else {
                  if (interactiveTutorialActiveRef.current) {
                    setGameState("menu");
                    setInteractiveTutorialActive(false);
                  } else {
                    setGameState("game_over");
                  }
                }
              }}
              className="w-full py-6 rounded-2xl font-black text-xl tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-[#2a2d35] to-[#1a1c20] border-rose-500/50 hover:border-rose-400 text-rose-400 hover:text-white uppercase italic pointer-events-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            >
              {lives > 0 ? "Continue" : (interactiveTutorialActiveRef.current ? "Exit Tutorial" : "Submit Score")}
            </button>
          </div>
        )}

        {gameState === "success" && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 touch-none">
            <div className="text-cyan-400 font-black text-4xl italic tracking-wider animate-bounce mb-8 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              STOLEN!
            </div>
            <div className="text-8xl mb-12 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              💰
            </div>
            {stateRef.current.npcs.find(
              (n) => n.id === stateRef.current.targetNpcId,
            )?.powerUpType === "heart" ? (
              <div className="text-rose-500 text-3xl font-mono mb-12 font-bold">
                + 1 HEART!
              </div>
            ) : (
              <div className="flex flex-col items-center mb-12">
                <div className="text-emerald-400 text-3xl font-mono font-bold">
                  + $
                  {stateRef.current.npcs.find(
                    (n) => n.id === stateRef.current.targetNpcId,
                  )?.loot || 0}
                </div>
                {comboRef.current > 1 && (
                  <div className="text-amber-400 text-sm font-black italic tracking-widest mt-2 animate-pulse bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/50">
                    {comboRef.current}x COMBO MULTIPLIER!
                  </div>
                )}
                <div className="text-rose-400 text-xs mt-4">
                  UNBANKED CASH: $
                  {unbankedCashRef.current +
                    Math.floor(
                      (stateRef.current.npcs.find(
                        (n) => n.id === stateRef.current.targetNpcId,
                      )?.loot || 0) *
                        comboRef.current *
                        ((GLOVES[currentSkinRef.current] || GLOVES.default)
                          .effects.lootMult || 1),
                    )}
                </div>
              </div>
            )}
            <button
              onClick={handleTryAgain}
              className="w-full py-6 rounded-2xl font-black text-xl tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-cyan-600 to-cyan-800 border-cyan-400/50 hover:border-cyan-400 text-white uppercase italic pointer-events-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Continue
            </button>
          </div>
        )}

        {gameState === "perk_choice" && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 touch-none">
            <div className="text-amber-400 font-black text-3xl italic tracking-wider animate-pulse mb-8 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              NEW PERK FOUND
            </div>

            <div className="flex flex-col gap-4 w-full mb-8">
              <div className="bg-[#14161a] border border-white/20 p-4 rounded-xl flex flex-col items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Current
                </span>
                <span
                  className={`text-lg font-black italic uppercase ${powerUp === "speed" ? "text-blue-400" : powerUp === "stealth" ? "text-purple-400" : "text-emerald-400"}`}
                >
                  {powerUp?.replace("_", " ") || "None"}
                </span>
              </div>

              <div className="bg-[#14161a] border border-amber-400/50 p-4 rounded-xl flex flex-col items-center shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                  New (Swap?)
                </span>
                <span
                  className={`text-xl font-black italic uppercase ${pendingPowerUp === "speed" ? "text-blue-400" : pendingPowerUp === "stealth" ? "text-purple-400" : "text-emerald-400"}`}
                >
                  {pendingPowerUp?.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => handlePerkChoice(false)}
                className="flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500/50 hover:border-slate-400 text-slate-300 uppercase italic pointer-events-auto"
              >
                Keep Old
              </button>
              <button
                onClick={() => handlePerkChoice(true)}
                className="flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400/50 hover:border-amber-400 text-white uppercase italic pointer-events-auto shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                Swap New
              </button>
            </div>
          </div>
        )}
        {gameState === "shop" && (
          <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 touch-none">
            <div className="text-amber-400 font-black text-3xl italic tracking-wider mb-2 mt-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              BLACK MARKET
            </div>
            <div className="flex items-center gap-2 mb-6 bg-black/60 px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-mono font-black text-lg">
                ${cash}
              </span>
            </div>

            <div className="w-full flex-1 overflow-y-auto scrollbar-amber flex flex-col gap-4 mb-4 pointer-events-auto pb-8 relative">
              {(Object.keys(GLOVES) as GloveId[]).map((skinKey) => {
                const skin = GLOVES[skinKey];
                const isUnlocked = unlockedSkins.includes(skinKey);
                const isEquipped = currentSkin === skinKey;
                const canBuy = skin.price !== undefined && cash >= skin.price;
                const isAchieve = !!skin.unlockCondition;

                return (
                  <div
                    key={skinKey}
                    className={`bg-[#14161a] border p-4 rounded-xl flex flex-col gap-2 ${isEquipped ? "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]" : "border-white/10"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full border-[3px]"
                          style={{
                            backgroundColor: skin.color,
                            borderColor: skin.border,
                          }}
                        />
                        <div>
                          <div className="text-white font-bold tracking-widest">
                            {skin.name}
                          </div>
                          {!isUnlocked && !isAchieve && (
                            <div className="text-emerald-400 font-mono font-bold text-sm drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                              ${skin.price}
                            </div>
                          )}
                          {!isUnlocked && isAchieve && (
                            <div className="text-rose-400 font-mono font-bold text-xs uppercase [word-spacing:-4px] truncate w-32">
                              {skin.unlockCondition?.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            setCurrentSkin(skinKey);
                            showNotification(`Equipped ${skin.name}`);
                          } else if (!isAchieve && canBuy) {
                            if (skin.price !== undefined) {
                              setCash((c) => c - skin.price);
                            }
                            setUnlockedSkins((prev) => [...prev, skinKey]);
                            setCurrentSkin(skinKey);
                            showNotification(
                              `Bought & Equipped: ${skin.name}!`,
                            );
                          } else {
                            showNotification(
                              isAchieve
                                ? "Achievement locked!"
                                : "Not enough cash!",
                            );
                          }
                        }}
                        disabled={!isUnlocked && (isAchieve || !canBuy)}
                        className={`px-4 py-2 rounded-lg font-black italic uppercase text-xs tracking-wider transition-all ${
                          isEquipped
                            ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)] cursor-default"
                            : isUnlocked
                              ? "bg-slate-700 text-white hover:bg-slate-600"
                              : canBuy && !isAchieve
                                ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:bg-emerald-400"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {isEquipped
                          ? "Equipped"
                          : isUnlocked
                            ? "Equip"
                            : isAchieve
                              ? "Locked"
                              : "Buy"}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium italic mt-1 border-t border-white/5 pt-2">
                      {skin.description}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setGameState(lastShopOrigin);
                stateRef.current.joystick.active = false;
              }}
              className="w-full py-4 shrink-0 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500/50 hover:border-slate-400 text-slate-300 uppercase italic pointer-events-auto"
            >
              Back
            </button>
          </div>
        )}

        {gameState === "menu" && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 touch-none pointer-events-auto">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-6xl font-black italic mb-2 uppercase text-center leading-none tracking-tighter">
                <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                  Picky
                </span>
                <br />
                <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                  Pocket
                </span>
              </h1>
              <p className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase mt-2 mb-12 shadow-black drop-shadow-md">
                Stealth & Steal Simulator
              </p>
            </div>
            <div className="w-full flex justify-center items-center gap-3">
              <button
                onClick={() => {
                  setGameState("playing");
                  // Reset state if needed on play
                  if (lives <= 0) handleRestart();
                }}
                className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-400 text-black font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:brightness-110 active:scale-95 transition-all outline outline-2 outline-offset-4 outline-cyan-400/50"
              >
                {lives <= 0 ? "New Run" : "Play"}
              </button>
            </div>
            <div className="w-full flex flex-col gap-3 mt-4 mb-8">
              <button
                onClick={() => handleStartInteractiveTutorial()}
                className="w-full py-4 rounded-xl bg-pink-500/10 text-pink-500 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:bg-pink-500/20 active:scale-95 transition-all text-sm border border-pink-500/30 flex items-center justify-center gap-2"
              >
                Play Tutorial
              </button>

              <div className="w-full flex justify-center gap-3">
                <button
                  onClick={() => setGameState("leaderboard")}
                  className="flex-1 py-4 rounded-xl bg-[#14161a] text-purple-400 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-95 transition-all text-xs border border-purple-400/30 flex items-center justify-center gap-2"
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setGameState("achievements")}
                  className="flex-1 py-4 rounded-xl bg-[#14161a] text-slate-300 font-bold uppercase tracking-wider hover:brightness-110 border border-slate-600 text-xs shadow-md"
                >
                  Achievements
                </button>
                <button
                  onClick={() => setGameState("options")}
                  className="flex-1 py-4 rounded-xl bg-[#14161a] text-slate-300 font-bold uppercase tracking-wider hover:brightness-110 border border-slate-600 text-xs shadow-md"
                >
                  Options
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === "achievements" && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 touch-none">
            <div className="text-emerald-400 font-black text-3xl italic tracking-wider mb-6 mt-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
              ACHIEVEMENTS
            </div>
            <div className="w-full flex-1 overflow-y-auto scrollbar-emerald flex flex-col gap-4 mb-4 pointer-events-auto pb-8">
              {(Object.keys(GLOVES) as GloveId[])
                .filter((k) => GLOVES[k].unlockCondition)
                .map((skinKey) => {
                  const skin = GLOVES[skinKey];
                  const isUnlocked = unlockedSkins.includes(skinKey);
                  return (
                    <div
                      key={skinKey}
                      className={`bg-[#14161a] border p-4 rounded-xl flex flex-col gap-2 ${isUnlocked ? "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "border-white/10 opacity-60"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full border-[3px] shrink-0"
                          style={{
                            backgroundColor: skin.color,
                            borderColor: skin.border,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-bold tracking-widest">
                            {skin.name}
                          </div>
                          <div className="text-slate-400 text-xs truncate break-words whitespace-normal">
                            {skin.unlockCondition?.description}
                          </div>
                        </div>
                        <div className="ml-auto shrink-0">
                          {isUnlocked ? (
                            <span className="text-emerald-400 text-xs font-bold uppercase">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs font-bold uppercase">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() => setGameState("menu")}
              className="w-full py-4 shrink-0 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500/50 hover:border-slate-400 text-slate-300 uppercase italic pointer-events-auto"
            >
              Back to Menu
            </button>
          </div>
        )}

        {gameState === "game_over" && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 touch-none">
            <div className="w-full flex-1 flex flex-col items-center justify-center max-w-sm pointer-events-auto text-center gap-6">
              <div className="text-rose-500 font-black text-5xl italic tracking-wider drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">
                GAME OVER
              </div>

              <div className="bg-[#14161a] p-6 rounded-2xl border border-white/10 shadow-lg text-center w-full space-y-4">
                <div className="text-xl font-bold text-slate-300">
                  Final Score
                </div>
                <div className="text-4xl font-black text-emerald-400 font-mono">
                  ${cash}
                </div>

                <div className="text-sm font-bold text-slate-400 mt-4">
                  Time Survived
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {Math.floor(stateRef.current.elapsedRunTime / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {Math.floor(stateRef.current.elapsedRunTime % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>

              <div className="w-full space-y-4 mt-4">
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="Enter Your Name"
                  maxLength={20}
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-4 text-white text-center font-bold tracking-widest uppercase focus:outline-none focus:border-cyan-400 placeholder:text-white/30"
                />
                <button
                  onClick={handleGameOverSubmit}
                  disabled={submittingScore || !playerNameInput.trim()}
                  className="w-full py-4 rounded-xl bg-cyan-600 text-black font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400 disabled:opacity-50 disabled:grayscale"
                >
                  {submittingScore ? "Submitting..." : "Submit Score"}
                </button>
                <button
                  onClick={handleRestart}
                  disabled={submittingScore}
                  className="w-full py-4 rounded-xl bg-[#2a2d35] text-white font-bold uppercase tracking-wider hover:brightness-110 transition-all border border-white/10 disabled:opacity-50"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    setGameState("menu");
                  }}
                  disabled={submittingScore}
                  className="w-full py-4 rounded-xl bg-transparent text-slate-400 font-bold uppercase tracking-wider hover:text-white transition-all disabled:opacity-50"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === "leaderboard" && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 touch-none">
            <div className="text-purple-400 font-black text-3xl italic tracking-wider mb-6 mt-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
              LEADERBOARD
            </div>

            <div className="flex-1 w-full max-w-sm overflow-y-auto mb-6 overscroll-contain pointer-events-auto flex flex-col gap-3 pb-20">
              {leaderboardEntries.length === 0 ? (
                <div className="text-center text-slate-500 font-bold italic mt-10">
                  Loading Leaderboard...
                </div>
              ) : (
                leaderboardEntries.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="bg-[#14161a] border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`font-black text-2xl italic w-8 text-center ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-600"}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold uppercase tracking-wider text-sm">
                          {entry.playerName}
                        </span>
                        <span className="text-cyan-400 font-mono text-xs">
                          {Math.floor(entry.survivedTime / 60)
                            .toString()
                            .padStart(2, "0")}
                          :
                          {Math.floor(entry.survivedTime % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-black font-mono shadow-black drop-shadow-md text-lg">
                      ${entry.score}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={() => setGameState("menu")}
                className="w-full py-4 rounded-2xl bg-[#2a2d35] text-white font-black uppercase tracking-widest hover:brightness-110 pointer-events-auto border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
              >
                <span className="relative z-10">Main Menu</span>
              </button>
            </div>
          </div>
        )}

        {gameState === "options" && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 touch-none">
            <div className="text-slate-300 font-black text-3xl italic tracking-wider mb-6 mt-10">
              OPTIONS
            </div>
            <div className="w-full flex-1 flex flex-col gap-4 mb-4 pointer-events-auto">
              <button
                onClick={() => setGameState("stats")}
                className="bg-[#14161a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg hover:border-white/30 transition-all text-left"
              >
                <span className="text-white font-bold tracking-wider uppercase text-sm">
                  Player Stats
                </span>
                <span className="text-slate-500 font-black tracking-widest">
                  {">"}
                </span>
              </button>
              <div
                className="bg-[#14161a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer"
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  audio.init();
                  audio.playClick();
                }}
              >
                <span className="text-white font-bold tracking-wider uppercase text-sm">
                  Sound Effects
                </span>
                <div
                  className={`w-14 h-8 rounded-full border-2 relative transition-colors ${!isAudioMuted ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700 border-slate-600"}`}
                >
                  <div
                    className={`absolute top-1 bottom-1 w-5 bg-white rounded-full shadow-sm transition-all ${!isAudioMuted ? "right-1" : "left-1"}`}
                  />
                </div>
              </div>
              <div className="bg-[#14161a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <span className="text-white font-bold tracking-wider uppercase text-sm">
                  Haptic Feedback
                </span>
                <div className="w-14 h-8 bg-emerald-500 rounded-full border-2 border-emerald-400 relative shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <div className="absolute right-1 top-1 bottom-1 w-5 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setGameState("menu")}
              className="w-full py-4 shrink-0 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500/50 hover:border-slate-400 text-slate-300 uppercase italic pointer-events-auto"
            >
              Back to Menu
            </button>
          </div>
        )}

        {gameState === "stats" && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-6 touch-none">
            <div className="text-slate-300 font-black text-3xl italic tracking-wider mb-6 mt-10">
              PLAYER STATS
            </div>
            <div className="w-full flex-1 flex flex-col gap-4 mb-4 pointer-events-auto">
              <div className="bg-[#14161a] border border-white/10 p-5 rounded-2xl shadow-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Total Looted
                    </span>
                    <span className="text-emerald-400 font-black font-mono shadow-black drop-shadow-md">
                      ${stats.totalLooted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Cops Robbed
                    </span>
                    <span className="text-cyan-400 font-black font-mono shadow-black drop-shadow-md">
                      {stats.copsRobbed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Times Caught
                    </span>
                    <span className="text-rose-500 font-black font-mono shadow-black drop-shadow-md">
                      {stats.timesCaught}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Perks Found
                    </span>
                    <span className="text-amber-400 font-black font-mono shadow-black drop-shadow-md">
                      {stats.perksAcquired}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setGameState("options")}
              className="w-full py-4 shrink-0 rounded-2xl font-black text-sm tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500/50 hover:border-slate-400 text-slate-300 uppercase italic pointer-events-auto"
            >
              Back to Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
