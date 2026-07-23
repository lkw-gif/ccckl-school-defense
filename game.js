const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  startOverlay: document.querySelector("#startOverlay"),
  gameOverOverlay: document.querySelector("#gameOverOverlay"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  audioToggle: document.querySelector("#audioToggle"),
  volumeSlider: document.querySelector("#volumeSlider"),
  volumeValue: document.querySelector("#volumeValue"),
  hpText: document.querySelector("#hpText"),
  scoreText: document.querySelector("#scoreText"),
  stageText: document.querySelector("#stageText"),
  killText: document.querySelector("#killText"),
  weaponText: document.querySelector("#weaponText"),
  ammoText: document.querySelector("#ammoText"),
  grenadeText: document.querySelector("#grenadeText"),
  healthFill: document.querySelector("#healthFill"),
  progressFill: document.querySelector("#progressFill"),
  finalScore: document.querySelector("#finalScore"),
  resultStamp: document.querySelector("#resultStamp"),
  resultKicker: document.querySelector("#resultKicker"),
  resultTitle: document.querySelector("#resultTitle"),
  toast: document.querySelector("#toast"),
};

const W = canvas.width;
const H = canvas.height;
const FLOOR_Y = 449;
const WORLD_W = 10400;
const MAX_HP = 8;
const GRAVITY = 1580;
const PLAYER_SPEED = 285;
const JUMP_SPEED = -620;
const DASH_SPEED = 720;
const DASH_TIME = 0.16;
const DASH_COOLDOWN = 0.72;

const STAGES = [
  {
    name: "戰區 01 · 校門防線",
    short: "校門",
    start: 0,
    end: 2500,
    killTarget: 8,
    image: "./assets/run-gun-stage-1.png",
    weather: "rain",
    accent: "#61e7df",
  },
  {
    name: "戰區 02 · 科學樓",
    short: "科學樓",
    start: 2500,
    end: 5100,
    killTarget: 10,
    image: "./assets/run-gun-stage-2.png",
    weather: "lab",
    accent: "#ff665d",
  },
  {
    name: "戰區 03 · 課室封鎖",
    short: "課室",
    start: 5100,
    end: 7800,
    killTarget: 12,
    image: "./assets/run-gun-classroom-v2.png",
    weather: "classroom",
    accent: "#ff9d4a",
  },
  {
    name: "戰區 04 · 天台巢穴",
    short: "天台",
    start: 7800,
    end: WORLD_W,
    killTarget: 14,
    image: "./assets/run-gun-stage-3.png",
    weather: "storm",
    accent: "#d477ff",
  },
];

const stageImages = STAGES.map((stage) => {
  const image = new Image();
  image.src = stage.image;
  return image;
});

const studentSpriteImage = new Image();
studentSpriteImage.src = "./assets/student-hero-sprites-v2.png";

const monsterSpriteImage = new Image();
monsterSpriteImage.src = "./assets/monster-sprites-v2.png";

const MONSTER_SOURCES = {
  crawler: { x: 34, y: 449, w: 462, h: 216, dw: 86, dh: 40 },
  spore: { x: 540, y: 240, w: 250, h: 379, dw: 58, dh: 88 },
  brute: { x: 844, y: 176, w: 402, h: 488, dw: 82, dh: 100 },
  boss: { x: 1306, y: 78, w: 643, h: 598, dw: 185, dh: 172 },
};

const WEAPONS = {
  rifle: {
    name: "RIFLE",
    delay: 0.18,
    speed: 860,
    damage: 1,
    color: "#ffe28c",
    pellets: 1,
  },
  machine: {
    name: "HEAVY MG",
    delay: 0.072,
    speed: 940,
    damage: 1,
    color: "#ffbd56",
    pellets: 1,
  },
  spread: {
    name: "SPREAD",
    delay: 0.42,
    speed: 760,
    damage: 1,
    color: "#66efff",
    pellets: 5,
  },
  rocket: {
    name: "ROCKET",
    delay: 0.64,
    speed: 520,
    damage: 5,
    color: "#ff7057",
    pellets: 1,
    radius: 112,
  },
};

const OBSTACLE_LAYOUT = [
  { x: 570, type: "barrel" },
  { x: 875, type: "barricade" },
  { x: 1190, type: "spikes" },
  { x: 1485, type: "crate", drop: "machine" },
  { x: 1840, type: "desks" },
  { x: 2085, type: "barrel" },
  { x: 2720, type: "crate", drop: "spread" },
  { x: 3020, type: "barricade" },
  { x: 3330, type: "barrel" },
  { x: 3650, type: "spikes" },
  { x: 3970, type: "desks" },
  { x: 4350, type: "crate", drop: "rocket" },
  { x: 4680, type: "barrel" },
  { x: 5350, type: "spikes" },
  { x: 5650, type: "barrel" },
  { x: 5960, type: "barricade" },
  { x: 6250, type: "crate", drop: "rocket" },
  { x: 6580, type: "desks" },
  { x: 6940, type: "barrel" },
  { x: 7240, type: "spikes" },
  { x: 8020, type: "desks" },
  { x: 8320, type: "crate", drop: "machine" },
  { x: 8610, type: "barrel" },
  { x: 8910, type: "spikes" },
  { x: 9250, type: "barricade" },
  { x: 9540, type: "crate", drop: "rocket" },
  { x: 9840, type: "barrel" },
  { x: 10120, type: "desks" },
];

const PLATFORM_LAYOUT = [
  { x: 710, y: 342, w: 176, style: "scaffold" },
  { x: 822, y: 266, w: 132, style: "walkway" },
  { x: 1580, y: 334, w: 192, style: "walkway" },
  { x: 2180, y: 350, w: 168, style: "scaffold" },
  { x: 2840, y: 338, w: 188, style: "walkway" },
  { x: 3740, y: 334, w: 210, style: "scaffold" },
  { x: 3890, y: 258, w: 138, style: "walkway" },
  { x: 4620, y: 346, w: 166, style: "walkway" },
  { x: 5480, y: 336, w: 190, style: "deskbridge" },
  { x: 6250, y: 332, w: 205, style: "scaffold" },
  { x: 6400, y: 256, w: 142, style: "deskbridge" },
  { x: 7080, y: 348, w: 172, style: "deskbridge" },
  { x: 8060, y: 334, w: 192, style: "scaffold" },
  { x: 8960, y: 332, w: 220, style: "walkway" },
  { x: 9125, y: 252, w: 148, style: "scaffold" },
  { x: 9820, y: 338, w: 182, style: "scaffold" },
];

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  jump: false,
  dash: false,
  weapon: false,
  grenade: false,
};

const state = {
  mode: "ready",
  lastTime: performance.now(),
  worldTime: 0,
  cameraX: 0,
  cameraTargetX: 0,
  cameraKickX: 0,
  cameraKickY: 0,
  shake: 0,
  hitPause: 0,
  stageIndex: 0,
  previousStageIndex: 0,
  stageBlend: 1,
  stageGateOpen: false,
  guardianSpawned: false,
  stageBanner: 0,
  victoryTimer: 0,
  score: 0,
  kills: 0,
  stageKills: 0,
  combo: 0,
  comboTimer: 0,
  spawnTimer: 0.8,
  lightning: 0,
  lightningTimer: 2.5,
  toastTimer: 0,
  player: null,
  bullets: [],
  enemyBullets: [],
  grenades: [],
  enemies: [],
  obstacles: [],
  platforms: [],
  pickups: [],
  particles: [],
  floaters: [],
  afterimages: [],
  rain: [],
};

const audio = {
  ctx: null,
  master: null,
  noise: null,
  enabled: true,
  unlocked: false,
  musicTimer: null,
  step: 0,
  volume: 0.6,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function distanceSquared(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function makeRain(count) {
  return Array.from({ length: count }, () => ({
    x: randomBetween(-100, W + 100),
    y: randomBetween(-80, H + 80),
    speed: randomBetween(420, 940),
    length: randomBetween(10, 27),
    alpha: randomBetween(0.18, 0.68),
    layer: randomBetween(0.35, 1),
  }));
}

function makeObstacle(definition) {
  const specs = {
    barrel: { w: 42, h: 58, hp: 3, solid: true },
    barricade: { w: 86, h: 68, hp: 9, solid: true },
    desks: { w: 94, h: 66, hp: 7, solid: true },
    spikes: { w: 92, h: 18, hp: Infinity, solid: false },
    crate: { w: 56, h: 52, hp: 4, solid: false },
  };
  const spec = specs[definition.type];
  return {
    ...definition,
    ...spec,
    y: FLOOR_Y - spec.h,
    maxHp: spec.hp,
    hit: 0,
    destroyed: false,
    exploded: false,
  };
}

function resetGame() {
  startAudio();
  Object.keys(input).forEach((key) => { input[key] = false; });
  Object.assign(state, {
    mode: "playing",
    lastTime: performance.now(),
    worldTime: 0,
    cameraX: 0,
    cameraTargetX: 0,
    cameraKickX: 0,
    cameraKickY: 0,
    shake: 0,
    hitPause: 0,
    stageIndex: 0,
    previousStageIndex: 0,
    stageBlend: 1,
    stageGateOpen: false,
    guardianSpawned: false,
    stageBanner: 2.4,
    victoryTimer: 0,
    score: 0,
    kills: 0,
    stageKills: 0,
    combo: 0,
    comboTimer: 0,
    spawnTimer: 0.65,
    lightning: 0,
    lightningTimer: randomBetween(1.8, 3.4),
    toastTimer: 0,
    bullets: [],
    enemyBullets: [],
    grenades: [],
    enemies: [],
    obstacles: OBSTACLE_LAYOUT.map(makeObstacle),
    platforms: PLATFORM_LAYOUT.map((platform) => ({ ...platform })),
    pickups: [],
    particles: [],
    floaters: [],
    afterimages: [],
    rain: makeRain(185),
  });
  state.player = {
    x: 150,
    y: FLOOR_Y - 78,
    w: 46,
    h: 78,
    vx: 0,
    vy: 0,
    hp: MAX_HP,
    grounded: true,
    facing: 1,
    cooldown: 0,
    grenadeCooldown: 0,
    dash: 0,
    dashCooldown: 0,
    invuln: 0,
    hurt: 0,
    shoot: 0,
    runTime: 0,
    afterimageTimer: 0,
    aimAngle: 0,
    prone: false,
    supportY: FLOOR_Y,
    currentWeapon: "rifle",
    ammo: { rifle: Infinity, machine: 0, spread: 0, rocket: 0 },
    grenades: 3,
  };
  ui.startOverlay.classList.add("is-hidden");
  ui.gameOverOverlay.classList.add("is-hidden");
  ui.toast.classList.remove("show");
  syncHud();
}

function finishRun(victory) {
  if (state.mode !== "playing") return;
  state.mode = victory ? "victory" : "gameover";
  ui.finalScore.textContent = String(state.score).padStart(6, "0");
  if (victory) {
    ui.resultStamp.textContent = "MISSION COMPLETE";
    ui.resultKicker.textContent = "四個戰區已清除";
    ui.resultTitle.textContent = "校園防線守住了。";
    playSfx("victory");
  } else {
    ui.resultStamp.textContent = "MISSION FAILED";
    ui.resultKicker.textContent = "防線尚未守住";
    ui.resultTitle.textContent = "再試一次，打穿四區。";
    playSfx("gameover");
  }
  ui.gameOverOverlay.classList.remove("is-hidden");
  syncHud();
}

function syncHud() {
  const player = state.player;
  const hp = player?.hp ?? MAX_HP;
  const weaponKey = player?.currentWeapon ?? "rifle";
  const ammo = player?.ammo?.[weaponKey] ?? Infinity;
  ui.hpText.textContent = `${Math.max(0, hp)} / ${MAX_HP}`;
  ui.scoreText.textContent = String(state.score).padStart(6, "0");
  ui.stageText.textContent = `0${state.stageIndex + 1} · ${STAGES[state.stageIndex].short}`;
  ui.killText.textContent = state.stageGateOpen
    ? "出口已開"
    : `擊破 ${Math.min(state.stageKills, STAGES[state.stageIndex].killTarget)} / ${STAGES[state.stageIndex].killTarget}`;
  ui.weaponText.textContent = WEAPONS[weaponKey].name;
  ui.ammoText.textContent = Number.isFinite(ammo) ? String(Math.max(0, ammo)) : "∞";
  ui.grenadeText.textContent = `× ${player?.grenades ?? 3}`;
  ui.healthFill.style.width = `${clamp(hp / MAX_HP, 0, 1) * 100}%`;
  ui.progressFill.style.width = `${clamp((player?.x ?? 0) / (WORLD_W - 260), 0, 1) * 100}%`;
}

function showToast(message, duration = 2.25) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  state.toastTimer = duration;
}

function updateToast(dt) {
  if (state.toastTimer <= 0) return;
  state.toastTimer -= dt;
  if (state.toastTimer <= 0) ui.toast.classList.remove("show");
}

function ensureAudio() {
  if (audio.ctx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audio.ctx = new AudioContext();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.28 * audio.volume;
  audio.master.connect(audio.ctx.destination);
  const length = Math.floor(audio.ctx.sampleRate * 0.45);
  audio.noise = audio.ctx.createBuffer(1, length, audio.ctx.sampleRate);
  const data = audio.noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
}

function startAudio() {
  if (!audio.enabled) return;
  ensureAudio();
  if (!audio.ctx) return;
  audio.ctx.resume().then(() => {
    audio.unlocked = true;
    if (!audio.musicTimer) {
      scheduleMusic();
      audio.musicTimer = window.setInterval(scheduleMusic, 122);
    }
    setAudioButton();
  }).catch(() => {});
}

function stopMusic() {
  if (!audio.musicTimer) return;
  window.clearInterval(audio.musicTimer);
  audio.musicTimer = null;
}

function toggleAudio() {
  audio.enabled = !audio.enabled;
  if (audio.enabled) startAudio();
  else stopMusic();
  setAudioButton();
}

function setAudioButton() {
  ui.audioToggle.classList.toggle("is-muted", !audio.enabled);
  ui.audioToggle.textContent = audio.enabled ? "♪" : "×";
  ui.volumeSlider.value = String(Math.round(audio.volume * 100));
  ui.volumeValue.value = String(Math.round(audio.volume * 100));
}

function setAudioVolume(value, persist = true) {
  audio.volume = clamp(Number(value) / 100, 0, 1);
  if (audio.master && audio.ctx) {
    audio.master.gain.setTargetAtTime(0.28 * audio.volume, audio.ctx.currentTime, 0.025);
  }
  if (persist) {
    try {
      window.localStorage.setItem("ccckl-game-volume", String(Math.round(audio.volume * 100)));
    } catch (_error) {
      // Volume still works when storage is unavailable.
    }
  }
  setAudioButton();
}

function tone(frequency, when, duration, type, gainValue, slideTo = null) {
  if (!audio.ctx || !audio.master || !audio.enabled) return;
  const oscillator = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, when + duration);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(audio.master);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.02);
}

function noise(when, duration, gainValue, cutoff = 1200) {
  if (!audio.ctx || !audio.master || !audio.noise || !audio.enabled) return;
  const source = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const gain = audio.ctx.createGain();
  source.buffer = audio.noise;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(cutoff, when);
  gain.gain.setValueAtTime(gainValue, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.master);
  source.start(when);
  source.stop(when + duration);
}

function scheduleMusic() {
  if (!audio.ctx || !audio.enabled) return;
  const now = audio.ctx.currentTime + 0.025;
  const patterns = [
    [0, 0, 7, 0, 3, 5, 7, 10, 0, 12, 10, 7, 5, 3, 2, 7],
    [0, 3, 0, 5, 7, 5, 3, 10, 0, 3, 7, 10, 12, 10, 7, 5],
    [0, 7, 3, 10, 5, 12, 7, 14, 0, 10, 5, 12, 7, 15, 12, 7],
    [0, 0, 10, 7, 12, 10, 7, 3, 0, 12, 10, 15, 12, 10, 7, 5],
  ];
  const step = audio.step % 16;
  const root = [82.41, 73.42, 77.78, 87.31][state.stageIndex];
  const note = patterns[state.stageIndex][step];
  tone(root * 2 ** (note / 12), now, 0.085, "square", 0.035);
  if (step % 4 === 0) tone(root / 2, now, 0.11, "sawtooth", 0.045);
  if (step % 4 === 2) noise(now, 0.034, 0.022, 1900);
  if (state.stageIndex >= 1 && step % 8 === 6) tone(root * 4, now, 0.05, "triangle", 0.018);
  audio.step += 1;
}

function playSfx(name) {
  if (!audio.ctx || !audio.unlocked || !audio.enabled) return;
  const now = audio.ctx.currentTime + 0.005;
  if (name === "rifle") {
    noise(now, 0.035, 0.028, 2500);
    tone(540, now, 0.045, "square", 0.04, 260);
  } else if (name === "machine") {
    noise(now, 0.025, 0.025, 2900);
    tone(720, now, 0.032, "square", 0.032, 340);
  } else if (name === "spread") {
    noise(now, 0.08, 0.05, 1300);
    tone(260, now, 0.09, "sawtooth", 0.045, 120);
  } else if (name === "rocket") {
    noise(now, 0.12, 0.045, 650);
    tone(180, now, 0.16, "sawtooth", 0.04, 70);
  } else if (name === "explosion") {
    noise(now, 0.26, 0.065, 190);
    tone(90, now, 0.22, "sawtooth", 0.05, 42);
  } else if (name === "hit") {
    tone(150, now, 0.05, "square", 0.035, 95);
  } else if (name === "hurt") {
    noise(now, 0.13, 0.045, 500);
    tone(130, now, 0.2, "sawtooth", 0.05, 70);
  } else if (name === "pickup") {
    tone(660, now, 0.06, "triangle", 0.04);
    tone(990, now + 0.06, 0.1, "triangle", 0.04);
  } else if (name === "dash") {
    noise(now, 0.08, 0.028, 3000);
    tone(250, now, 0.09, "sawtooth", 0.028, 480);
  } else if (name === "boss") {
    tone(110, now, 0.25, "sawtooth", 0.055);
    tone(82, now + 0.22, 0.32, "sawtooth", 0.05);
  } else if (name === "gameover") {
    tone(196, now, 0.28, "sawtooth", 0.045);
    tone(98, now + 0.24, 0.5, "sawtooth", 0.04);
  } else if (name === "victory") {
    [0, 4, 7, 12].forEach((note, index) => tone(261.6 * 2 ** (note / 12), now + index * 0.11, 0.18, "square", 0.04));
  }
}

function playerBox() {
  const player = state.player;
  if (player.prone) {
    return {
      x: player.facing > 0 ? player.x + 4 : player.x - 24,
      y: player.y + 46,
      w: player.w + 20,
      h: player.h - 48,
    };
  }
  return { x: player.x + 8, y: player.y + 8, w: player.w - 16, h: player.h - 9 };
}

function enemyBox(enemy) {
  if (enemy.type === "boss") return { x: enemy.x + 20, y: enemy.y + 14, w: enemy.w - 40, h: enemy.h - 18 };
  return { x: enemy.x + 7, y: enemy.y + 7, w: enemy.w - 14, h: enemy.h - 9 };
}

function obstacleBox(obstacle) {
  return { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
}

function queueJump() {
  const player = state.player;
  if (!player || state.mode !== "playing" || !player.grounded || player.prone || input.down) return;
  player.vy = JUMP_SPEED;
  player.grounded = false;
  player.supportY = FLOOR_Y;
  burst(player.x + player.w / 2, player.y + player.h - 3, "#b9d7cf", 8, { speedMin: 35, speedMax: 130, gravity: 160 });
}

function dash() {
  const player = state.player;
  if (!player || state.mode !== "playing" || player.dashCooldown > 0 || player.prone || input.down) return;
  player.dash = DASH_TIME;
  player.dashCooldown = DASH_COOLDOWN;
  player.invuln = Math.max(player.invuln, 0.2);
  player.vx = DASH_SPEED * player.facing;
  state.shake = Math.max(state.shake, 0.06);
  state.cameraKickX -= player.facing * 9;
  pushAfterimage();
  burst(player.x + player.w / 2 - player.facing * 12, player.y + 57, "#6ce8dc", 15, {
    speedMin: 60,
    speedMax: 300,
    gravity: 120,
  });
  playSfx("dash");
}

function cycleWeapon() {
  const player = state.player;
  if (!player || state.mode !== "playing") return;
  const order = ["rifle", "machine", "spread", "rocket"];
  const available = order.filter((key) => key === "rifle" || player.ammo[key] > 0);
  const current = available.indexOf(player.currentWeapon);
  player.currentWeapon = available[(current + 1) % available.length];
  showToast(`${WEAPONS[player.currentWeapon].name} · 已裝備`, 1.2);
  syncHud();
}

function ensureUsableWeapon() {
  const player = state.player;
  if (player.currentWeapon !== "rifle" && player.ammo[player.currentWeapon] <= 0) {
    player.currentWeapon = "rifle";
    showToast("特殊彈藥用完 · 回復 RIFLE", 1.4);
  }
}

function getAimAngle() {
  const player = state.player;
  if (!player) return 0;
  const horizontalHeld = input.left !== input.right;
  if (player.prone) return player.facing > 0 ? 0 : Math.PI;
  if (!player.grounded && input.down) {
    if (!horizontalHeld) return Math.PI / 2;
    return player.facing > 0 ? Math.PI / 4 : Math.PI * 3 / 4;
  }
  if (input.up) {
    if (!horizontalHeld) return -Math.PI / 2;
    return player.facing > 0 ? -Math.PI / 4 : -Math.PI * 3 / 4;
  }
  return player.facing > 0 ? 0 : Math.PI;
}

function shoot() {
  const player = state.player;
  if (!player || state.mode !== "playing" || player.cooldown > 0) return;
  ensureUsableWeapon();
  const weaponKey = player.currentWeapon;
  const weapon = WEAPONS[weaponKey];
  player.cooldown = weapon.delay;
  player.shoot = 0.16;
  const aimAngle = getAimAngle();
  player.aimAngle = aimAngle;
  const originX = player.x + player.w / 2 + Math.cos(aimAngle) * (player.prone ? 44 : 31);
  const originY = player.prone ? player.y + 57 : player.y + 31 + Math.sin(aimAngle) * 26;
  const spreadAngles = weaponKey === "spread" ? [-0.28, -0.14, 0, 0.14, 0.28] : [0];
  for (const spreadAngle of spreadAngles) {
    const jitter = weaponKey === "machine" ? randomBetween(-0.035, 0.035) : 0;
    const finalAngle = aimAngle + spreadAngle + jitter;
    state.bullets.push({
      owner: "player",
      x: originX,
      y: originY,
      vx: Math.cos(finalAngle) * weapon.speed,
      vy: Math.sin(finalAngle) * weapon.speed,
      w: weaponKey === "rocket" ? 22 : weaponKey === "spread" ? 9 : 12,
      h: weaponKey === "rocket" ? 10 : 5,
      damage: weapon.damage,
      radius: weapon.radius ?? 0,
      life: weaponKey === "rocket" ? 1.9 : 1.25,
      weapon: weaponKey,
      color: weapon.color,
      hit: false,
    });
  }
  if (weaponKey !== "rifle") player.ammo[weaponKey] -= 1;
  muzzleFlash(originX, originY, aimAngle, weapon.color, weaponKey === "spread" ? 14 : 8);
  const recoil = weaponKey === "rocket" ? 8 : weaponKey === "spread" ? 5 : 2;
  state.cameraKickX -= Math.cos(aimAngle) * recoil;
  state.cameraKickY -= Math.sin(aimAngle) * recoil;
  playSfx(weaponKey);
  ensureUsableWeapon();
  syncHud();
}

function throwGrenade() {
  const player = state.player;
  if (!player || state.mode !== "playing" || player.grenadeCooldown > 0) return;
  if (player.grenades <= 0) {
    showToast("手榴彈用完", 1.1);
    return;
  }
  player.grenades -= 1;
  player.grenadeCooldown = 0.35;
  state.grenades.push({
    x: player.x + player.w / 2,
    y: player.y + 20,
    vx: player.facing * 410,
    vy: -420,
    fuse: 1.05,
    bounce: 0,
    spin: 0,
  });
  syncHud();
}

function movePlayerX(deltaX) {
  const player = state.player;
  const stage = STAGES[state.stageIndex];
  const stageLimit = state.stageGateOpen ? Math.min(WORLD_W - 90, stage.end + 210) : stage.end - 125;
  player.x = clamp(player.x + deltaX, 24, stageLimit);
  for (const obstacle of state.obstacles) {
    if (obstacle.destroyed || !obstacle.solid || !rectsOverlap(playerBox(), obstacleBox(obstacle))) continue;
    if (player.dash > 0 && Number.isFinite(obstacle.hp)) damageObstacle(obstacle, 2, true);
    if (obstacle.destroyed) continue;
    if (deltaX > 0) player.x = obstacle.x - player.w + 7;
    if (deltaX < 0) player.x = obstacle.x + obstacle.w - 7;
    player.vx = 0;
  }
}

function updatePlayer(dt) {
  const player = state.player;
  player.cooldown = Math.max(0, player.cooldown - dt);
  player.grenadeCooldown = Math.max(0, player.grenadeCooldown - dt);
  player.dash = Math.max(0, player.dash - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.hurt = Math.max(0, player.hurt - dt);
  player.shoot = Math.max(0, player.shoot - dt);
  player.afterimageTimer = Math.max(0, player.afterimageTimer - dt);
  const movingLeft = input.left && !input.right;
  const movingRight = input.right && !input.left;
  if (movingLeft) player.facing = -1;
  if (movingRight) player.facing = 1;
  player.prone = player.grounded && input.down && player.dash <= 0;
  player.runTime += dt * (Math.abs(player.vx) > 20 && !player.prone ? 11 : 2);
  player.aimAngle = getAimAngle();
  if (player.dash > 0) {
    player.vx = DASH_SPEED * player.facing;
    if (player.afterimageTimer <= 0) {
      pushAfterimage();
      player.afterimageTimer = 0.045;
    }
  } else if (player.prone) {
    player.vx = 0;
  } else {
    player.vx = (movingRight ? PLAYER_SPEED : 0) - (movingLeft ? PLAYER_SPEED : 0);
  }

  if (input.fire) shoot();
  movePlayerX(player.vx * dt);
  const previousBottom = player.y + player.h;
  player.vy += GRAVITY * (player.dash > 0 ? 0.4 : 1) * dt;
  player.y += player.vy * dt;
  const nextBottom = player.y + player.h;
  let landingPlatform = null;
  if (player.vy >= 0) {
    for (const platform of state.platforms) {
      const overlapsX = player.x + player.w - 7 > platform.x && player.x + 7 < platform.x + platform.w;
      const crossesTop = previousBottom <= platform.y + 5 && nextBottom >= platform.y;
      if (!overlapsX || !crossesTop) continue;
      if (!landingPlatform || platform.y < landingPlatform.y) landingPlatform = platform;
    }
  }
  if (landingPlatform) {
    player.y = landingPlatform.y - player.h;
    player.vy = 0;
    player.grounded = true;
    player.supportY = landingPlatform.y;
  } else if (nextBottom >= FLOOR_Y) {
    player.y = FLOOR_Y - player.h;
    player.vy = 0;
    player.grounded = true;
    player.supportY = FLOOR_Y;
  } else {
    player.grounded = false;
    player.prone = false;
    player.supportY = FLOOR_Y;
  }

  for (const obstacle of state.obstacles) {
    if (obstacle.destroyed || obstacle.type !== "spikes") continue;
    const hazard = { x: obstacle.x + 5, y: obstacle.y + 6, w: obstacle.w - 10, h: obstacle.h };
    if (rectsOverlap(playerBox(), hazard)) hurtPlayer(obstacle.x > player.x ? -1 : 1);
  }

  for (const pickup of state.pickups) {
    if (pickup.collected) continue;
    if (rectsOverlap(playerBox(), { x: pickup.x - 15, y: pickup.y - 18, w: 30, h: 36 })) collectPickup(pickup);
  }
}

function updateStage(dt) {
  const player = state.player;
  const stage = STAGES[state.stageIndex];
  state.stageBlend = Math.min(1, state.stageBlend + dt * 1.25);
  state.stageBanner = Math.max(0, state.stageBanner - dt);

  if (!state.guardianSpawned && !state.stageGateOpen && state.stageKills >= stage.killTarget - 1) {
    state.guardianSpawned = true;
    spawnGuardian();
    state.stageBanner = 1.55;
  }

  if (state.stageGateOpen && state.stageIndex < STAGES.length - 1 && player.x >= stage.end - 22) {
    state.previousStageIndex = state.stageIndex;
    state.stageIndex += 1;
    state.stageBlend = 0;
    state.stageGateOpen = false;
    state.guardianSpawned = false;
    state.stageKills = 0;
    state.stageBanner = 2.5;
    state.spawnTimer = 0.9;
    state.lightningTimer = randomBetween(1.2, 3.2);
    state.enemyBullets = [];
    state.enemies = state.enemies.filter((enemy) => enemy.x > STAGES[state.stageIndex].start - 220 && enemy.dead <= 0);
    syncHud();
  }

  if (state.victoryTimer > 0) {
    state.victoryTimer -= dt;
    if (state.victoryTimer <= 0) finishRun(true);
  }
}

function spawnGuardian() {
  const stage = STAGES[state.stageIndex];
  if (state.stageIndex === 0) {
    spawnEnemy("brute", stage.end - 430, { guardian: true, hp: 30, scale: 1.12 });
    showToast("WARNING · 重甲變異體", 2.1);
  } else if (state.stageIndex === 1) {
    spawnEnemy("brute", stage.end - 430, { guardian: true, hp: 48, scale: 1.24, rapid: true });
    spawnEnemy("spore", stage.end - 560, { hp: 7 });
    showToast("WARNING · 實驗室暴走體", 2.1);
  } else if (state.stageIndex === 2) {
    spawnEnemy("boss", stage.end - 600, { guardian: true, hp: 115 });
    spawnEnemy("spore", stage.end - 760, { hp: 9 });
    showToast("WARNING · 課室母體", 2.3);
  } else {
    spawnEnemy("boss", stage.end - 600, { guardian: true, hp: 185 });
    spawnEnemy("spore", stage.end - 760, { hp: 12 });
    showToast("FINAL WARNING · 天台巢穴核心", 2.3);
  }
  state.shake = Math.max(state.shake, 0.18);
  playSfx("boss");
}

function chooseEnemyType() {
  const roll = Math.random();
  if (state.stageIndex === 0) return roll < 0.62 ? "crawler" : roll < 0.88 ? "spore" : "brute";
  if (state.stageIndex === 1) return roll < 0.38 ? "crawler" : roll < 0.72 ? "spore" : "brute";
  if (state.stageIndex === 2) return roll < 0.3 ? "crawler" : roll < 0.63 ? "spore" : "brute";
  return roll < 0.3 ? "crawler" : roll < 0.63 ? "spore" : "brute";
}

function spawnEnemy(type = chooseEnemyType(), x = null, options = {}) {
  const specs = {
    crawler: { w: 64, h: 44, hp: 3, speed: 105, points: 120 },
    spore: { w: 58, h: 58, hp: 4, speed: 74, points: 170 },
    brute: { w: 72, h: 92, hp: 10, speed: 53, points: 320 },
    boss: { w: 176, h: 168, hp: 145, speed: 18, points: 5000 },
  };
  const spec = specs[type];
  const scale = options.scale ?? 1;
  const width = spec.w * scale;
  const height = spec.h * scale;
  const spawnX = x ?? Math.min(
    STAGES[state.stageIndex].end - 245,
    Math.max(state.player.x + 430, state.cameraX + W + randomBetween(45, 220)),
  );
  state.enemies.push({
    type,
    x: spawnX,
    baseX: spawnX,
    y: type === "spore" ? FLOOR_Y - height - randomBetween(80, 145) : FLOOR_Y - height,
    w: width,
    h: height,
    hp: options.hp ?? spec.hp + Math.floor(state.stageIndex * (type === "brute" ? 3 : 1)),
    maxHp: options.hp ?? spec.hp + Math.floor(state.stageIndex * (type === "brute" ? 3 : 1)),
    speed: spec.speed + state.stageIndex * 8,
    points: spec.points,
    facing: -1,
    attackCooldown: randomBetween(0.5, 1.4),
    spawnCooldown: 2.5,
    phase: Math.random() * Math.PI * 2,
    hit: 0,
    dead: 0,
    stageIndex: state.stageIndex,
    guardian: Boolean(options.guardian),
    rapid: Boolean(options.rapid),
  });
}

function updateSpawns(dt) {
  state.spawnTimer -= dt;
  const livingNormals = state.enemies.filter((enemy) => enemy.dead <= 0 && !enemy.guardian).length;
  const cap = 5 + state.stageIndex;
  if (state.spawnTimer > 0 || livingNormals >= cap || state.victoryTimer > 0 || state.guardianSpawned || state.stageGateOpen) return;
  spawnEnemy();
  if (state.stageIndex >= 1 && Math.random() < 0.2 && livingNormals < cap - 1) spawnEnemy();
  state.spawnTimer = Math.max(0.52, 1.35 - state.stageIndex * 0.14) + Math.random() * 0.45;
}

function fireEnemyShot(enemy, offsets = [0]) {
  const targetX = state.player.x + state.player.w / 2;
  const targetY = state.player.y + 34;
  const originX = enemy.x + enemy.w / 2;
  const originY = enemy.y + enemy.h * 0.42;
  const baseAngle = Math.atan2(targetY - originY, targetX - originX);
  const speed = enemy.type === "boss" ? 330 : enemy.type === "brute" ? 295 : 250;
  for (const offset of offsets) {
    const angle = baseAngle + offset;
    state.enemyBullets.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: enemy.type === "boss" ? 15 : 11,
      h: enemy.type === "boss" ? 15 : 11,
      life: 4,
      color: enemy.type === "boss" ? "#ff557f" : enemy.type === "brute" ? "#ff9a50" : "#bd67ff",
      wave: Math.random() * Math.PI * 2,
    });
  }
}

function updateEnemies(dt) {
  const player = state.player;
  for (const enemy of state.enemies) {
    if (enemy.dead > 0) {
      enemy.dead -= dt;
      enemy.y += 140 * dt;
      continue;
    }
    enemy.hit = Math.max(0, enemy.hit - dt);
    enemy.attackCooldown -= dt;
    enemy.spawnCooldown -= dt;
    const dx = player.x - enemy.x;
    const distance = Math.abs(dx);
    enemy.facing = dx < 0 ? -1 : 1;

    if (enemy.type === "crawler") {
      if (distance > 42) enemy.x += Math.sign(dx) * enemy.speed * dt;
      enemy.y = FLOOR_Y - enemy.h + Math.sin(state.worldTime * 8 + enemy.phase) * 1.5;
    } else if (enemy.type === "spore") {
      const preferred = 260;
      if (distance > preferred + 55) enemy.x += Math.sign(dx) * enemy.speed * dt;
      if (distance < preferred - 60) enemy.x -= Math.sign(dx) * enemy.speed * 0.6 * dt;
      enemy.y = FLOOR_Y - enemy.h - 105 + Math.sin(state.worldTime * 3.2 + enemy.phase) * 28;
      if (distance < 650 && enemy.attackCooldown <= 0) {
        fireEnemyShot(enemy);
        enemy.attackCooldown = randomBetween(1.3, 1.8);
      }
    } else if (enemy.type === "brute") {
      if (distance > 118) enemy.x += Math.sign(dx) * enemy.speed * dt;
      enemy.y = FLOOR_Y - enemy.h;
      if (state.stageIndex > 0 && distance < 650 && enemy.attackCooldown <= 0) {
        fireEnemyShot(enemy, enemy.rapid ? [-0.12, 0, 0.12] : [0]);
        enemy.attackCooldown = enemy.rapid ? 1.05 : 1.75;
      }
    } else if (enemy.type === "boss") {
      const anchor = STAGES[enemy.stageIndex].end - 615;
      enemy.x = anchor + Math.sin(state.worldTime * 0.7) * 42;
      enemy.y = FLOOR_Y - enemy.h + Math.sin(state.worldTime * 1.8) * 5;
      if (enemy.attackCooldown <= 0) {
        const phase = Math.floor(state.worldTime) % 3;
        fireEnemyShot(enemy, phase === 0 ? [-0.34, -0.17, 0, 0.17, 0.34] : [-0.15, 0, 0.15]);
        enemy.attackCooldown = phase === 0 ? 1.35 : 0.92;
      }
      if (enemy.spawnCooldown <= 0 && state.enemies.filter((item) => item.dead <= 0 && !item.guardian).length < 3) {
        spawnEnemy(Math.random() < 0.55 ? "crawler" : "spore", enemy.x - randomBetween(150, 270));
        enemy.spawnCooldown = 3.1;
      }
    }

    if (rectsOverlap(playerBox(), enemyBox(enemy))) hurtPlayer(enemy.x > player.x ? -1 : 1);
  }
  state.enemies = state.enemies.filter((enemy) => enemy.dead > 0 || (enemy.hp > 0 && enemy.x > state.cameraX - 420));
}

function chooseWeaponDrop(stageIndex = state.stageIndex) {
  const pools = [
    ["machine", "machine", "spread"],
    ["machine", "spread", "spread"],
    ["spread", "rocket", "rocket"],
    ["machine", "spread", "rocket", "rocket"],
  ];
  const pool = pools[Math.min(stageIndex, pools.length - 1)];
  return pool[Math.floor(Math.random() * pool.length)];
}

function damageEnemy(enemy, amount, hitX, hitY) {
  if (enemy.dead > 0 || enemy.hp <= 0) return;
  enemy.hp -= amount;
  enemy.hit = 0.12;
  state.hitPause = Math.max(state.hitPause, enemy.guardian ? 0.035 : 0.018);
  state.shake = Math.max(state.shake, enemy.guardian ? 0.11 : 0.045);
  burst(hitX, hitY, enemy.type === "crawler" ? "#8ce66e" : enemy.type === "brute" ? "#ff9c53" : "#d078ff", 9, {
    speedMin: 40,
    speedMax: 220,
    gravity: 260,
  });
  playSfx("hit");
  if (enemy.hp > 0) return;

  enemy.hp = 0;
  enemy.dead = enemy.type === "boss" ? 1.1 : 0.48;
  state.kills += 1;
  if (enemy.stageIndex === state.stageIndex) state.stageKills += 1;
  state.combo += 1;
  state.comboTimer = 2.5;
  const comboBonus = Math.min(600, Math.max(0, state.combo - 2) * 30);
  state.score += enemy.points + comboBonus;
  addFloater(enemy.x + enemy.w / 2, enemy.y - 7, `+${enemy.points + comboBonus}`, "#ffe285");
  burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.guardian ? "#ff704f" : "#ffd36c", enemy.guardian ? 56 : 24, {
    speedMin: 70,
    speedMax: enemy.guardian ? 460 : 330,
    gravity: 420,
    kind: "debris",
  });
  if (enemy.guardian) {
    state.shake = 0.42;
    explode(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === "boss" ? 190 : 135, 6, false);
    if (state.stageIndex < STAGES.length - 1) {
      state.stageGateOpen = true;
      showToast(`戰區 0${state.stageIndex + 1} CLEAR · 向前推進`, 2.6);
      spawnPickup(enemy.x + enemy.w / 2, enemy.y, "weapon", chooseWeaponDrop(Math.min(state.stageIndex + 1, STAGES.length - 1)));
    } else {
      state.victoryTimer = 1.7;
      showToast("MISSION COMPLETE", 2);
    }
  } else {
    const dropChance = enemy.type === "brute" ? 0.42 : enemy.type === "spore" ? 0.2 : 0.09;
    if (Math.random() < dropChance) {
      spawnPickup(enemy.x + enemy.w / 2, enemy.y, "weapon", chooseWeaponDrop());
    } else if (Math.random() < 0.14) {
      spawnPickup(enemy.x + enemy.w / 2, enemy.y, Math.random() < 0.55 ? "medkit" : "grenade");
    }
    const stage = STAGES[state.stageIndex];
    if (enemy.stageIndex === state.stageIndex && state.stageIndex < STAGES.length - 1 && state.stageKills >= stage.killTarget && !state.stageGateOpen) {
      state.stageGateOpen = true;
      showToast(`擊破目標完成 · 戰區 0${state.stageIndex + 1} 出口開放`, 2.6);
    }
  }
  syncHud();
}

function hurtPlayer(knockDirection = -1) {
  const player = state.player;
  if (!player || player.invuln > 0 || state.mode !== "playing") return;
  player.hp -= 1;
  player.invuln = 1.05;
  player.hurt = 0.35;
  player.vx = knockDirection * 185;
  player.vy = -250;
  state.combo = 0;
  state.shake = 0.25;
  state.hitPause = 0.055;
  state.cameraKickX = knockDirection * 16;
  burst(player.x + player.w / 2, player.y + 31, "#ff6f5d", 22, {
    speedMin: 70,
    speedMax: 330,
    gravity: 390,
    kind: "debris",
  });
  showToast(player.hp <= 2 ? "DANGER · 生命危險" : "中彈！保持移動", 1.35);
  playSfx("hurt");
  syncHud();
  if (player.hp <= 0) finishRun(false);
}

function damageObstacle(obstacle, amount, causedByPlayer = true) {
  if (obstacle.destroyed || !Number.isFinite(obstacle.hp)) return;
  obstacle.hp -= amount;
  obstacle.hit = 0.12;
  burst(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, obstacle.type === "barrel" ? "#ff9b45" : "#d5c28c", 7, {
    speedMin: 40,
    speedMax: 180,
    gravity: 380,
    kind: "debris",
  });
  if (obstacle.hp > 0) return;
  obstacle.destroyed = true;
  state.score += obstacle.type === "crate" ? 160 : 80;
  if (obstacle.type === "barrel" && !obstacle.exploded) {
    obstacle.exploded = true;
    explode(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, 125, 5, true);
  } else if (obstacle.type === "crate") {
    spawnPickup(obstacle.x + obstacle.w / 2, obstacle.y, "weapon", obstacle.drop);
    playSfx("pickup");
  } else {
    burst(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, "#cda76e", 22, {
      speedMin: 70,
      speedMax: 330,
      gravity: 470,
      kind: "debris",
    });
  }
  if (causedByPlayer) syncHud();
}

function explode(x, y, radius, damage, harmfulToPlayer) {
  playSfx("explosion");
  state.shake = Math.max(state.shake, 0.3);
  state.cameraKickY = -8;
  burst(x, y, "#ff6f3f", 48, { speedMin: 90, speedMax: 480, gravity: 360, kind: "debris" });
  burst(x, y, "#ffd66d", 28, { speedMin: 45, speedMax: 320, gravity: 120 });
  for (let i = 0; i < 12; i += 1) {
    addParticle({
      x: x + randomBetween(-20, 20),
      y: y + randomBetween(-20, 20),
      vx: randomBetween(-70, 70),
      vy: randomBetween(-150, -20),
      life: randomBetween(0.55, 1.15),
      color: "#4d5960",
      size: randomBetween(9, 22),
      gravity: -22,
      drag: 0.96,
      kind: "smoke",
    });
  }
  const radiusSquared = radius * radius;
  for (const enemy of state.enemies) {
    if (enemy.dead > 0) continue;
    const ex = enemy.x + enemy.w / 2;
    const ey = enemy.y + enemy.h / 2;
    if (distanceSquared(x, y, ex, ey) <= radiusSquared) damageEnemy(enemy, damage, ex, ey);
  }
  for (const obstacle of state.obstacles) {
    if (obstacle.destroyed || obstacle.type === "spikes") continue;
    const ox = obstacle.x + obstacle.w / 2;
    const oy = obstacle.y + obstacle.h / 2;
    if (distanceSquared(x, y, ox, oy) <= radiusSquared) damageObstacle(obstacle, 4, false);
  }
  if (harmfulToPlayer && state.player) {
    const px = state.player.x + state.player.w / 2;
    const py = state.player.y + state.player.h / 2;
    if (distanceSquared(x, y, px, py) <= radiusSquared) hurtPlayer(px < x ? -1 : 1);
  }
}

function updateBullets(dt) {
  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (Math.random() < (bullet.weapon === "rocket" ? 0.95 : 0.42)) {
      addParticle({
        x: bullet.x,
        y: bullet.y,
        vx: -bullet.vx * 0.08 + randomBetween(-18, 18),
        vy: randomBetween(-20, 20),
        life: bullet.weapon === "rocket" ? 0.36 : 0.13,
        color: bullet.weapon === "rocket" ? "#687276" : bullet.color,
        size: bullet.weapon === "rocket" ? randomBetween(5, 10) : 2,
        gravity: bullet.weapon === "rocket" ? -30 : 0,
        drag: 0.94,
        kind: bullet.weapon === "rocket" ? "smoke" : "spark",
      });
    }
    if (bullet.life <= 0 || bullet.hit) continue;

    const box = { x: bullet.x - bullet.w / 2, y: bullet.y - bullet.h / 2, w: bullet.w, h: bullet.h };
    for (const obstacle of state.obstacles) {
      if (obstacle.destroyed || obstacle.type === "spikes" || !rectsOverlap(box, obstacleBox(obstacle))) continue;
      damageObstacle(obstacle, bullet.damage, true);
      bullet.hit = true;
      if (bullet.radius) explode(bullet.x, bullet.y, bullet.radius, bullet.damage, false);
      break;
    }
    if (bullet.hit) continue;

    for (const enemy of state.enemies) {
      if (enemy.dead > 0 || !rectsOverlap(box, enemyBox(enemy))) continue;
      damageEnemy(enemy, bullet.damage, bullet.x, bullet.y);
      bullet.hit = true;
      if (bullet.radius) explode(bullet.x, bullet.y, bullet.radius, bullet.damage, false);
      break;
    }
  }
  state.bullets = state.bullets.filter((bullet) => (
    bullet.life > 0
    && !bullet.hit
    && bullet.x > state.cameraX - 160
    && bullet.x < state.cameraX + W + 260
    && bullet.y > -80
    && bullet.y < H + 80
  ));
}

function updateEnemyBullets(dt) {
  for (const bullet of state.enemyBullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt + Math.sin(state.worldTime * 6 + bullet.wave) * 18 * dt;
    bullet.life -= dt;
    if (Math.random() < 0.42) {
      addParticle({
        x: bullet.x,
        y: bullet.y,
        vx: randomBetween(-24, 24),
        vy: randomBetween(-24, 24),
        life: 0.2,
        color: bullet.color,
        size: 3,
        gravity: 0,
      });
    }
    const box = { x: bullet.x - bullet.w / 2, y: bullet.y - bullet.h / 2, w: bullet.w, h: bullet.h };
    for (const obstacle of state.obstacles) {
      if (obstacle.destroyed || obstacle.type === "spikes" || !rectsOverlap(box, obstacleBox(obstacle))) continue;
      bullet.life = 0;
      break;
    }
    if (bullet.life > 0 && rectsOverlap(box, playerBox())) {
      bullet.life = 0;
      hurtPlayer(bullet.vx > 0 ? 1 : -1);
    }
  }
  state.enemyBullets = state.enemyBullets.filter((bullet) => (
    bullet.life > 0
    && bullet.x > state.cameraX - 180
    && bullet.x < state.cameraX + W + 240
    && bullet.y > -80
    && bullet.y < H + 80
  ));
}

function updateGrenades(dt) {
  for (const grenade of state.grenades) {
    grenade.vy += GRAVITY * 0.72 * dt;
    grenade.x += grenade.vx * dt;
    grenade.y += grenade.vy * dt;
    grenade.spin += dt * 12;
    grenade.fuse -= dt;
    if (grenade.y >= FLOOR_Y - 10) {
      grenade.y = FLOOR_Y - 10;
      if (Math.abs(grenade.vy) > 80 && grenade.bounce < 2) {
        grenade.vy *= -0.42;
        grenade.vx *= 0.76;
        grenade.bounce += 1;
      } else {
        grenade.vy = 0;
        grenade.vx *= 0.9;
      }
    }
    if (grenade.fuse <= 0) {
      grenade.dead = true;
      explode(grenade.x, grenade.y, 138, 6, false);
    }
  }
  state.grenades = state.grenades.filter((grenade) => !grenade.dead);
}

function spawnPickup(x, y, kind, weapon = null) {
  state.pickups.push({
    x,
    y,
    baseY: FLOOR_Y - 34,
    vy: -240,
    kind,
    weapon,
    life: 12,
    collected: false,
    phase: Math.random() * Math.PI * 2,
  });
}

function collectPickup(pickup) {
  const player = state.player;
  pickup.collected = true;
  if (pickup.kind === "weapon") {
    const ammoGrant = { machine: 110, spread: 34, rocket: 14 };
    player.ammo[pickup.weapon] += ammoGrant[pickup.weapon];
    player.currentWeapon = pickup.weapon;
    showToast(`${WEAPONS[pickup.weapon].name} · WEAPON UPGRADE`, 2);
  } else if (pickup.kind === "medkit") {
    player.hp = Math.min(MAX_HP, player.hp + 2);
    showToast("急救包 · 生命 +2", 1.5);
  } else if (pickup.kind === "grenade") {
    player.grenades = Math.min(9, player.grenades + 2);
    showToast("手榴彈 +2", 1.5);
  } else {
    state.score += 500;
    showToast("BONUS +500", 1.3);
  }
  burst(pickup.x, pickup.y, pickup.kind === "weapon" ? "#ffd05d" : "#75efd8", 18, {
    speedMin: 50,
    speedMax: 250,
    gravity: 180,
  });
  playSfx("pickup");
  syncHud();
}

function updatePickups(dt) {
  for (const pickup of state.pickups) {
    if (pickup.collected) continue;
    pickup.life -= dt;
    pickup.vy += GRAVITY * 0.55 * dt;
    pickup.y += pickup.vy * dt;
    if (pickup.y > pickup.baseY) {
      pickup.y = pickup.baseY;
      pickup.vy = 0;
    }
  }
  state.pickups = state.pickups.filter((pickup) => !pickup.collected && pickup.life > 0);
}

function addParticle(particle) {
  state.particles.push({
    x: particle.x,
    y: particle.y,
    vx: particle.vx ?? 0,
    vy: particle.vy ?? 0,
    life: particle.life ?? 0.45,
    maxLife: particle.life ?? 0.45,
    color: particle.color ?? "#fff",
    size: particle.size ?? 3,
    gravity: particle.gravity ?? 430,
    drag: particle.drag ?? 0.98,
    kind: particle.kind ?? "spark",
  });
}

function burst(x, y, color, count = 10, options = {}) {
  for (let i = 0; i < count; i += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(options.speedMin ?? 35, options.speedMax ?? 220);
    addParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (options.lift ?? 40),
      life: randomBetween(options.lifeMin ?? 0.22, options.lifeMax ?? 0.68),
      color,
      size: randomBetween(options.sizeMin ?? 2, options.sizeMax ?? 5),
      gravity: options.gravity ?? 420,
      drag: options.drag ?? 0.98,
      kind: options.kind ?? "spark",
    });
  }
}

function muzzleFlash(x, y, aimAngle, color, count) {
  for (let i = 0; i < count; i += 1) {
    const particleAngle = aimAngle + randomBetween(-0.24, 0.24);
    const speed = randomBetween(130, 430);
    addParticle({
      x,
      y,
      vx: Math.cos(particleAngle) * speed,
      vy: Math.sin(particleAngle) * speed,
      life: randomBetween(0.07, 0.2),
      color: i % 2 ? color : "#fff0ad",
      size: randomBetween(2, 6),
      gravity: 20,
      drag: 0.86,
    });
  }
}

function addFloater(x, y, text, color) {
  state.floaters.push({ x, y, text, color, life: 1, maxLife: 1 });
}

function pushAfterimage() {
  const player = state.player;
  state.afterimages.push({
    x: player.x,
    y: player.y,
    facing: player.facing,
    life: 0.22,
    maxLife: 0.22,
  });
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= particle.drag;
    particle.vy *= particle.drag;
    particle.vy += particle.gravity * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  for (const floater of state.floaters) {
    floater.y -= 30 * dt;
    floater.life -= dt;
  }
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
  for (const image of state.afterimages) image.life -= dt;
  state.afterimages = state.afterimages.filter((image) => image.life > 0);
  for (const obstacle of state.obstacles) obstacle.hit = Math.max(0, obstacle.hit - dt);
}

function updateAtmosphere(dt) {
  state.lightning = Math.max(0, state.lightning - dt * 3.2);
  state.lightningTimer -= dt;
  const stage = STAGES[state.stageIndex];
  if ((stage.weather === "storm" || stage.weather === "rain") && state.lightningTimer <= 0) {
    state.lightning = stage.weather === "storm" ? randomBetween(0.25, 0.48) : randomBetween(0.08, 0.2);
    state.lightningTimer = stage.weather === "storm" ? randomBetween(1.7, 4.3) : randomBetween(5.5, 9);
    state.shake = Math.max(state.shake, stage.weather === "storm" ? 0.075 : 0.025);
  }
  if (stage.weather === "lab" && Math.random() < dt * 2.2) {
    const x = state.cameraX + randomBetween(0, W);
    burst(x, randomBetween(140, 330), Math.random() < 0.5 ? "#63eaff" : "#ff685e", 4, {
      speedMin: 20,
      speedMax: 90,
      gravity: 230,
      lifeMax: 0.35,
    });
  }
  if (stage.weather === "classroom" && Math.random() < dt * 2.8) {
    const x = state.cameraX + randomBetween(0, W);
    burst(x, randomBetween(90, 390), Math.random() < 0.72 ? "#ffd38a" : "#79e8e1", 3, {
      speedMin: 8,
      speedMax: 34,
      gravity: -14,
      lifeMax: 1.15,
      sizeMin: 1,
      sizeMax: 3,
    });
  }
}

function updateCamera(dt) {
  const player = state.player;
  const lookAhead = player.facing * 76 + player.vx * 0.1;
  state.cameraTargetX = clamp(player.x - W * 0.34 + lookAhead, 0, WORLD_W - W);
  state.cameraX += (state.cameraTargetX - state.cameraX) * (1 - Math.exp(-7.2 * dt));
  state.cameraKickX *= Math.exp(-9 * dt);
  state.cameraKickY *= Math.exp(-9 * dt);
  state.shake = Math.max(0, state.shake - dt);
}

function update(dt, now) {
  state.worldTime += dt;
  updateToast(dt);
  updateAtmosphere(dt);
  if (state.mode !== "playing") return;

  const playDt = state.hitPause > 0 ? Math.min(dt, 0.006) : dt;
  state.hitPause = Math.max(0, state.hitPause - dt);
  updatePlayer(playDt);
  updateStage(playDt);
  updateCamera(playDt);
  updateSpawns(playDt);
  updateBullets(playDt);
  updateEnemyBullets(playDt);
  updateGrenades(playDt);
  updateEnemies(playDt);
  updatePickups(playDt);
  updateParticles(playDt);

  state.comboTimer -= playDt;
  if (state.comboTimer <= 0) state.combo = 0;
  if (Math.floor(now / 150) % 2 === 0) syncHud();
}

function cameraX() {
  return state.cameraX + state.cameraKickX;
}

function drawStageImage(stageIndex, alpha) {
  const stage = STAGES[stageIndex];
  const image = stageImages[stageIndex];
  const progress = clamp((cameraX() - stage.start) / (stage.end - stage.start), 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (image.complete && image.naturalWidth) {
    const scale = 1.12;
    const drawH = H * scale;
    const drawW = Math.max(W * scale, drawH * (image.naturalWidth / image.naturalHeight));
    const drawX = -progress * (drawW - W);
    const drawY = -(drawH - H) * 0.56;
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, stageIndex === 1 ? "#1b1725" : "#12355a");
    gradient.addColorStop(1, "#07151d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawBackground() {
  if (state.stageBlend < 1 && state.previousStageIndex !== state.stageIndex) {
    drawStageImage(state.previousStageIndex, 1);
    drawStageImage(state.stageIndex, state.stageBlend);
  } else {
    drawStageImage(state.stageIndex, 1);
  }
  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, "rgba(1,7,15,.08)");
  tint.addColorStop(0.58, "rgba(1,8,14,0)");
  tint.addColorStop(1, "rgba(1,7,11,.48)");
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
}

function drawGround() {
  const offset = -((cameraX() * 0.78) % 88);
  ctx.save();
  ctx.fillStyle = "rgba(3,10,15,.34)";
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  const groundAccent = STAGES[state.stageIndex].weather === "lab"
    ? "rgba(255,91,82,.35)"
    : STAGES[state.stageIndex].weather === "classroom"
      ? "rgba(255,163,83,.36)"
      : "rgba(98,230,220,.3)";
  ctx.fillStyle = groundAccent;
  ctx.fillRect(0, FLOOR_Y - 2, W, 2);
  ctx.fillStyle = "rgba(235,225,185,.12)";
  for (let x = offset - 88; x < W + 88; x += 88) ctx.fillRect(Math.round(x), FLOOR_Y + 35, 48, 2);
  ctx.restore();
}

function drawPlatform(platform) {
  const x = Math.round(platform.x - cameraX());
  if (x > W + 240 || x + platform.w < -240) return;
  const y = Math.round(platform.y);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.fillRect(x + 8, y + 13, platform.w - 16, 7);

  if (platform.style === "deskbridge") {
    ctx.fillStyle = "#58301f";
    ctx.fillRect(x + 2, y - 2, platform.w - 4, 17);
    ctx.fillStyle = "#c87a3f";
    ctx.fillRect(x, y - 7, platform.w, 9);
    ctx.fillStyle = "#f1a75f";
    ctx.fillRect(x + 6, y - 5, platform.w - 12, 2);
  } else {
    ctx.fillStyle = "#152630";
    ctx.fillRect(x, y - 6, platform.w, 18);
    ctx.fillStyle = platform.style === "walkway" ? "#738d96" : "#526b75";
    ctx.fillRect(x, y - 6, platform.w, 6);
    ctx.fillStyle = "#9ac4c7";
    for (let gx = x + 8; gx < x + platform.w - 5; gx += 17) ctx.fillRect(gx, y + 2, 9, 2);
  }

  const legColor = platform.style === "deskbridge" ? "#313c42" : "#233943";
  ctx.strokeStyle = legColor;
  ctx.lineWidth = 6;
  const legBottom = Math.min(FLOOR_Y, y + 92);
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 10);
  ctx.lineTo(x + 27, legBottom);
  ctx.moveTo(x + platform.w - 17, y + 10);
  ctx.lineTo(x + platform.w - 27, legBottom);
  ctx.stroke();
  ctx.strokeStyle = "rgba(102,238,230,.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 30);
  ctx.lineTo(x + platform.w - 24, Math.min(legBottom - 9, y + 72));
  ctx.moveTo(x + platform.w - 24, y + 30);
  ctx.lineTo(x + 24, Math.min(legBottom - 9, y + 72));
  ctx.stroke();
  ctx.restore();
}

function drawObstacle(obstacle) {
  if (obstacle.destroyed) return;
  const x = Math.round(obstacle.x - cameraX());
  const y = Math.round(obstacle.y);
  if (x > W + 120 || x + obstacle.w < -120) return;
  ctx.save();
  if (obstacle.hit > 0) ctx.filter = "brightness(1.8) saturate(1.4)";
  ctx.fillStyle = "rgba(0,0,0,.42)";
  ctx.beginPath();
  ctx.ellipse(x + obstacle.w / 2, FLOOR_Y + 4, obstacle.w * 0.48, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obstacle.type === "barrel") {
    ctx.fillStyle = "#5d181c";
    ctx.fillRect(x + 5, y + 4, 32, 50);
    ctx.fillStyle = "#d94732";
    ctx.fillRect(x + 8, y + 5, 26, 48);
    ctx.fillStyle = "#ff7648";
    ctx.fillRect(x + 10, y + 9, 6, 36);
    ctx.fillStyle = "#34272a";
    ctx.fillRect(x + 4, y + 8, 34, 5);
    ctx.fillRect(x + 4, y + 43, 34, 5);
    ctx.fillStyle = "#ffd05d";
    ctx.beginPath();
    ctx.moveTo(x + 21, y + 19);
    ctx.lineTo(x + 27, y + 29);
    ctx.lineTo(x + 22, y + 29);
    ctx.lineTo(x + 26, y + 39);
    ctx.lineTo(x + 15, y + 27);
    ctx.lineTo(x + 20, y + 27);
    ctx.closePath();
    ctx.fill();
  } else if (obstacle.type === "barricade") {
    for (let row = 0; row < 3; row += 1) {
      const count = row === 2 ? 3 : 4;
      for (let col = 0; col < count; col += 1) {
        const bx = x + 4 + col * 20 + (row % 2) * 8;
        const by = y + 43 - row * 19;
        ctx.fillStyle = row % 2 ? "#95845e" : "#b19b6b";
        ctx.fillRect(bx, by, 22, 15);
        ctx.fillStyle = "rgba(255,240,178,.2)";
        ctx.fillRect(bx + 3, by + 3, 13, 2);
      }
    }
  } else if (obstacle.type === "desks") {
    ctx.fillStyle = "#6e3c25";
    ctx.fillRect(x + 3, y + 25, 88, 12);
    ctx.fillRect(x + 19, y + 5, 69, 12);
    ctx.fillStyle = "#c88646";
    ctx.fillRect(x + 2, y + 22, 90, 8);
    ctx.fillRect(x + 16, y + 2, 72, 8);
    ctx.fillStyle = "#29343b";
    ctx.fillRect(x + 10, y + 34, 5, 31);
    ctx.fillRect(x + 77, y + 34, 5, 31);
    ctx.fillRect(x + 24, y + 12, 5, 29);
    ctx.fillRect(x + 82, y + 10, 5, 31);
  } else if (obstacle.type === "spikes") {
    ctx.fillStyle = "#323b43";
    ctx.fillRect(x, y + 12, obstacle.w, 6);
    for (let spike = 0; spike < 8; spike += 1) {
      const sx = x + 4 + spike * 11;
      ctx.fillStyle = spike % 2 ? "#9ea9ad" : "#d1d8d3";
      ctx.beginPath();
      ctx.moveTo(sx, y + 12);
      ctx.lineTo(sx + 6, y - 1);
      ctx.lineTo(sx + 11, y + 12);
      ctx.fill();
    }
    ctx.strokeStyle = "#73e7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 7);
    for (let sx = x + 16; sx < x + obstacle.w - 5; sx += 13) ctx.lineTo(sx, y + randomBetween(2, 10));
    ctx.stroke();
  } else if (obstacle.type === "crate") {
    ctx.fillStyle = "#6d3f27";
    ctx.fillRect(x, y, obstacle.w, obstacle.h);
    ctx.fillStyle = "#b97b43";
    ctx.fillRect(x + 5, y + 5, obstacle.w - 10, obstacle.h - 10);
    ctx.strokeStyle = "#4b2b20";
    ctx.lineWidth = 5;
    ctx.strokeRect(x + 3, y + 3, obstacle.w - 6, obstacle.h - 6);
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 7);
    ctx.lineTo(x + obstacle.w - 7, y + obstacle.h - 7);
    ctx.moveTo(x + obstacle.w - 7, y + 7);
    ctx.lineTo(x + 7, y + obstacle.h - 7);
    ctx.stroke();
    ctx.fillStyle = "#ffe16a";
    ctx.fillRect(x + 23, y + 20, 10, 12);
  }

  if (Number.isFinite(obstacle.hp) && obstacle.hp < obstacle.maxHp) {
    ctx.fillStyle = "rgba(0,0,0,.65)";
    ctx.fillRect(x, y - 9, obstacle.w, 4);
    ctx.fillStyle = obstacle.type === "barrel" ? "#ff6b42" : "#ffd266";
    ctx.fillRect(x, y - 9, obstacle.w * clamp(obstacle.hp / obstacle.maxHp, 0, 1), 4);
  }
  ctx.restore();
}

function drawProneStudentAt(worldX, worldY, facing, alpha = 1) {
  const player = state.player;
  const x = worldX - cameraX();
  const baseY = worldY + player.h;
  const recoil = player.shoot > 0 ? -3 : 0;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x + player.w / 2), Math.round(baseY));
  if (facing < 0) ctx.scale(-1, 1);

  ctx.fillStyle = "#101c2b";
  ctx.fillRect(-34, -15, 31, 13);
  ctx.fillRect(-39, -9, 17, 7);
  ctx.fillStyle = "#1d3c68";
  ctx.fillRect(-27, -27, 33, 16);
  ctx.fillStyle = "#0a131d";
  ctx.fillRect(-34, -5, 18, 6);

  ctx.fillStyle = "#e4efeb";
  ctx.fillRect(-4, -32, 31, 23);
  ctx.fillStyle = "#f7faf5";
  ctx.fillRect(2, -35, 24, 22);
  ctx.fillStyle = "#2373a4";
  ctx.fillRect(8, -33, 5, 18);
  ctx.fillStyle = "#10233d";
  ctx.fillRect(-5, -12, 33, 5);

  ctx.fillStyle = "#e8b47c";
  ctx.fillRect(19, -44, 18, 17);
  ctx.fillStyle = "#18222f";
  ctx.fillRect(17, -48, 22, 8);
  ctx.fillRect(31, -44, 7, 10);
  ctx.fillStyle = "#273747";
  ctx.fillRect(33, -37, 3, 2);

  ctx.fillStyle = "#e8b47c";
  ctx.fillRect(19, -25, 21 + recoil, 7);
  ctx.fillStyle = "#354550";
  ctx.fillRect(23 + recoil, -24, 29, 8);
  ctx.fillStyle = "#141c24";
  ctx.fillRect(43 + recoil, -27, player.currentWeapon === "rocket" ? 30 : 25, player.currentWeapon === "rocket" ? 12 : 6);
  ctx.fillRect(31 + recoil, -17, 7, 10);
  if (player.currentWeapon === "spread") {
    ctx.fillStyle = "#6b8fa2";
    ctx.fillRect(57 + recoil, -29, 13, 10);
  } else if (player.currentWeapon === "machine") {
    ctx.fillStyle = "#99a9ad";
    ctx.fillRect(50 + recoil, -29, 19, 3);
  } else if (player.currentWeapon === "rocket") {
    ctx.fillStyle = "#b24e35";
    ctx.fillRect(56 + recoil, -25, 15, 9);
  }
  ctx.restore();
}

function drawStudentAt(worldX, worldY, facing, alpha = 1, ghost = false) {
  const player = state.player;
  if (player.prone && !ghost) {
    drawProneStudentAt(worldX, worldY, facing, alpha);
    return;
  }
  const x = worldX - cameraX();
  const y = worldY;
  const moving = Math.abs(player.vx) > 20 && player.grounded;
  const run = moving ? Math.sin(player.runTime) : 0;
  const jump = !player.grounded;
  if (studentSpriteImage.complete && studentSpriteImage.naturalWidth) {
    const directionalFire = player.shoot > 0 && Math.abs(Math.sin(player.aimAngle)) > 0.25;
    const frame = player.shoot > 0 && !directionalFire ? 3 : jump ? 2 : (moving || player.dash > 0) ? 1 : 0;
    const cellWidth = studentSpriteImage.naturalWidth / 4;
    const drawHeight = 145;
    const drawWidth = drawHeight * cellWidth / studentSpriteImage.naturalHeight;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    if (ghost) {
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "hue-rotate(80deg) saturate(1.8)";
    }
    if (facing < 0) {
      ctx.translate(Math.round(x + player.w / 2 + drawWidth / 2), Math.round(y - 38));
      ctx.scale(-1, 1);
      ctx.drawImage(studentSpriteImage, frame * cellWidth, 0, cellWidth, studentSpriteImage.naturalHeight, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(
        studentSpriteImage,
        frame * cellWidth,
        0,
        cellWidth,
        studentSpriteImage.naturalHeight,
        Math.round(x + player.w / 2 - drawWidth / 2),
        Math.round(y - 38),
        drawWidth,
        drawHeight,
      );
    }
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x + player.w / 2), Math.round(y));
  if (facing < 0) ctx.scale(-1, 1);
  if (ghost) {
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "hue-rotate(80deg) saturate(1.8)";
  }

  const legA = jump ? -4 : run * 5;
  const legB = jump ? 5 : -run * 5;
  ctx.fillStyle = "#142e55";
  ctx.fillRect(-12 + legA, 48, 10, jump ? 21 : 27);
  ctx.fillRect(3 + legB, 48, 10, jump ? 21 : 27);
  ctx.fillStyle = "#09121b";
  ctx.fillRect(-14 + legA, jump ? 68 : 72, 14, 6);
  ctx.fillRect(2 + legB, jump ? 68 : 72, 15, 6);

  ctx.fillStyle = "#dbe9e5";
  ctx.fillRect(-15, 20, 29, 33);
  ctx.fillStyle = "#f5faf3";
  ctx.fillRect(-12, 18, 24, 30);
  ctx.fillRect(-19, 22, 7, 19);
  ctx.fillStyle = "#a8dff0";
  ctx.fillRect(-2, 22, 5, 22);
  ctx.fillStyle = "#2a74a4";
  ctx.fillRect(-1, 30, 4, 15);
  ctx.fillStyle = "#10233d";
  ctx.fillRect(-15, 49, 29, 5);

  ctx.fillStyle = "#e8b47c";
  ctx.fillRect(-9, 4, 18, 16);
  ctx.fillStyle = "#18222f";
  ctx.fillRect(-11, 1, 22, 7);
  ctx.fillRect(-12, 5, 5, 8);
  ctx.fillStyle = "#f4c48c";
  ctx.fillRect(9, 7, 3, 7);
  ctx.fillStyle = "#273747";
  ctx.fillRect(4, 12, 3, 2);

  const recoil = player.shoot > 0 ? -3 : 0;
  ctx.fillStyle = "#e8b47c";
  ctx.fillRect(11, 26, 16 + recoil, 7);
  ctx.fillStyle = "#354550";
  ctx.fillRect(8 + recoil, 28, 34, 8);
  ctx.fillStyle = "#151d25";
  ctx.fillRect(27 + recoil, 25, player.currentWeapon === "rocket" ? 28 : 24, player.currentWeapon === "rocket" ? 12 : 6);
  ctx.fillRect(16 + recoil, 34, 7, 10);
  if (player.currentWeapon === "spread") {
    ctx.fillStyle = "#6b8fa2";
    ctx.fillRect(43 + recoil, 23, 13, 10);
  } else if (player.currentWeapon === "machine") {
    ctx.fillStyle = "#99a9ad";
    ctx.fillRect(34 + recoil, 23, 20, 3);
  } else if (player.currentWeapon === "rocket") {
    ctx.fillStyle = "#b24e35";
    ctx.fillRect(43 + recoil, 26, 14, 9);
  }
  ctx.restore();
}

function drawAimGuide() {
  const player = state.player;
  if (!player || player.prone || (!input.down && !input.up) || (player.grounded && input.down)) return;
  const angle = getAimAngle();
  const startX = player.x - cameraX() + player.w / 2 + Math.cos(angle) * 31;
  const startY = player.y + 31 + Math.sin(angle) * 26;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = input.down ? "rgba(255,211,105,.72)" : "rgba(105,232,255,.7)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 7]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + Math.cos(angle) * 90, startY + Math.sin(angle) * 90);
  ctx.stroke();
  ctx.setLineDash([]);
  const targetX = startX + Math.cos(angle) * 94;
  const targetY = startY + Math.sin(angle) * 94;
  ctx.strokeRect(targetX - 5, targetY - 5, 10, 10);
  ctx.restore();
}

function drawPlayer() {
  const player = state.player;
  if (!player) return;
  const x = player.x - cameraX();
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.beginPath();
  ctx.ellipse(x + player.w / 2, player.supportY + 3, player.prone ? 34 : 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  if (player.invuln > 0 && Math.floor(state.worldTime * 16) % 2 === 0) ctx.globalAlpha = 0.42;
  if (player.hurt > 0) ctx.filter = "brightness(1.9) saturate(1.6)";
  drawAimGuide();
  drawStudentAt(
    player.x,
    player.y + (player.grounded && !player.prone ? Math.abs(Math.sin(player.runTime)) * -1.5 : 0),
    player.facing,
  );
  ctx.restore();
}

function drawMonsterSprite(enemy, screenX) {
  const source = MONSTER_SOURCES[enemy.type];
  if (!source || !monsterSpriteImage.complete || !monsterSpriteImage.naturalWidth) return false;
  const scale = enemy.type === "brute" ? enemy.w / 72 : enemy.type === "boss" ? enemy.w / 176 : 1;
  const drawW = source.dw * scale;
  const drawH = source.dh * scale;
  const drawX = screenX + enemy.w / 2 - drawW / 2;
  const drawY = enemy.type === "spore"
    ? enemy.y + enemy.h / 2 - drawH / 2
    : FLOOR_Y - drawH;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (enemy.facing > 0) {
    ctx.translate(Math.round(drawX + drawW), Math.round(drawY));
    ctx.scale(-1, 1);
    ctx.drawImage(monsterSpriteImage, source.x, source.y, source.w, source.h, 0, 0, drawW, drawH);
  } else {
    ctx.drawImage(monsterSpriteImage, source.x, source.y, source.w, source.h, Math.round(drawX), Math.round(drawY), drawW, drawH);
  }
  ctx.restore();
  return true;
}

function drawEnemy(enemy) {
  const x = Math.round(enemy.x - cameraX());
  const y = Math.round(enemy.y);
  if (x > W + 220 || x + enemy.w < -220) return;
  ctx.save();
  if (enemy.dead > 0) ctx.globalAlpha = clamp(enemy.dead / (enemy.type === "boss" ? 1.1 : 0.48), 0, 1);
  if (enemy.hit > 0) ctx.filter = "brightness(2.2) saturate(1.8)";
  ctx.fillStyle = "rgba(0,0,0,.48)";
  ctx.beginPath();
  ctx.ellipse(x + enemy.w / 2, FLOOR_Y + 4, enemy.w * 0.43, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const generatedSpriteDrawn = drawMonsterSprite(enemy, x);
  if (!generatedSpriteDrawn) {
    ctx.translate(x + enemy.w / 2, y);
    if (enemy.facing > 0) ctx.scale(-1, 1);
  }

  if (!generatedSpriteDrawn && enemy.type === "crawler") {
    ctx.fillStyle = "#244b32";
    ctx.fillRect(-30, 17, 52, 21);
    ctx.fillStyle = "#58a844";
    ctx.fillRect(-24, 10, 40, 25);
    ctx.fillStyle = "#8ed957";
    ctx.fillRect(-18, 8, 24, 6);
    ctx.fillStyle = "#162620";
    ctx.fillRect(-22, 34, 11, 8);
    ctx.fillRect(5, 34, 11, 8);
    ctx.fillStyle = "#ffcf56";
    ctx.fillRect(-21, 18, 5, 5);
    ctx.fillStyle = "#e7f4d2";
    for (let tooth = 0; tooth < 4; tooth += 1) ctx.fillRect(11 + tooth * 4, 26, 3, 6);
  } else if (!generatedSpriteDrawn && enemy.type === "spore") {
    ctx.fillStyle = "#402555";
    ctx.beginPath();
    ctx.arc(0, 27, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9251b8";
    ctx.beginPath();
    ctx.arc(-2, 23, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#df83ff";
    ctx.fillRect(-15, 9, 9, 6);
    ctx.fillRect(4, 4, 8, 7);
    ctx.fillStyle = "#f8e4ff";
    ctx.fillRect(-9, 20, 6, 6);
    ctx.fillRect(7, 20, 6, 6);
    ctx.strokeStyle = "#8f55b5";
    ctx.lineWidth = 5;
    for (let arm = -2; arm <= 2; arm += 1) {
      ctx.beginPath();
      ctx.moveTo(arm * 8, 43);
      ctx.quadraticCurveTo(arm * 11 + 5, 54, arm * 10, 60);
      ctx.stroke();
    }
  } else if (!generatedSpriteDrawn && enemy.type === "brute") {
    const scale = enemy.w / 72;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3d3028";
    ctx.fillRect(-25, 27, 50, 58);
    ctx.fillStyle = "#9d4e2e";
    ctx.fillRect(-30, 29, 60, 42);
    ctx.fillStyle = "#df7a38";
    ctx.fillRect(-25, 34, 50, 30);
    ctx.fillStyle = "#4a2524";
    ctx.fillRect(-19, 2, 38, 29);
    ctx.fillStyle = "#ef9e56";
    ctx.fillRect(-14, 7, 28, 20);
    ctx.fillStyle = "#241c22";
    ctx.fillRect(-18, 2, 36, 8);
    ctx.fillStyle = "#fff087";
    ctx.fillRect(-11, 13, 6, 5);
    ctx.fillRect(6, 13, 6, 5);
    ctx.fillStyle = "#343940";
    ctx.fillRect(-39, 38, 22, 16);
    ctx.fillRect(18, 42, 28, 13);
    ctx.fillStyle = "#171d21";
    ctx.fillRect(-44, 43, 20, 7);
    ctx.fillRect(-23, 82, 18, 9);
    ctx.fillRect(7, 82, 18, 9);
  } else if (!generatedSpriteDrawn && enemy.type === "boss") {
    ctx.fillStyle = "#321638";
    ctx.beginPath();
    ctx.ellipse(0, 78, 78, 76, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6c235f";
    ctx.beginPath();
    ctx.ellipse(-4, 66, 62, 59, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ae315d";
    ctx.beginPath();
    ctx.ellipse(-8, 58, 46, 43, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff5f83";
    ctx.beginPath();
    ctx.arc(-25, 48, 12, 0, Math.PI * 2);
    ctx.arc(14, 45, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe388";
    ctx.beginPath();
    ctx.arc(-25, 48, 5, 0, Math.PI * 2);
    ctx.arc(14, 45, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1d101e";
    ctx.beginPath();
    ctx.ellipse(-3, 91, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1d2bc";
    for (let tooth = -3; tooth <= 3; tooth += 1) {
      ctx.beginPath();
      ctx.moveTo(tooth * 9 - 4, 80);
      ctx.lineTo(tooth * 9 + 3, 80);
      ctx.lineTo(tooth * 9, 94);
      ctx.fill();
    }
    ctx.strokeStyle = "#7c2c70";
    ctx.lineWidth = 12;
    for (let arm = -2; arm <= 2; arm += 1) {
      ctx.beginPath();
      ctx.moveTo(arm * 25, 122);
      ctx.quadraticCurveTo(arm * 42 + Math.sin(state.worldTime * 2 + arm) * 18, 150, arm * 48, 170);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (enemy.hp < enemy.maxHp && enemy.dead <= 0 && !enemy.guardian) {
    ctx.fillStyle = "rgba(0,0,0,.68)";
    ctx.fillRect(x + enemy.w / 2 - 23, y - 10, 46, 4);
    ctx.fillStyle = enemy.type === "brute" ? "#ff9150" : "#a6e86f";
    ctx.fillRect(x + enemy.w / 2 - 23, y - 10, 46 * clamp(enemy.hp / enemy.maxHp, 0, 1), 4);
  }
}

function drawBullet(bullet) {
  const x = bullet.x - cameraX();
  const y = bullet.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = bullet.color;
  ctx.shadowBlur = bullet.weapon === "rocket" ? 14 : 8;
  if (bullet.weapon === "rocket") {
    ctx.fillStyle = "#dad8bd";
    ctx.fillRect(-10, -4, 18, 8);
    ctx.fillStyle = "#ef5e3f";
    ctx.fillRect(7, -5, 8, 10);
    ctx.fillStyle = "#ffd769";
    ctx.fillRect(-17, -3, 7, 6);
  } else {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(-bullet.w / 2, -bullet.h / 2, bullet.w, bullet.h);
    ctx.fillStyle = "#fff8c9";
    ctx.fillRect(0, -1, bullet.w * 0.55, 2);
  }
  ctx.restore();
}

function drawEnemyBullet(bullet) {
  const x = bullet.x - cameraX();
  const y = bullet.y;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = bullet.color;
  ctx.shadowBlur = 13;
  ctx.fillStyle = bullet.color;
  ctx.beginPath();
  ctx.arc(x, y, bullet.w / 2 + Math.sin(state.worldTime * 9 + bullet.wave) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff1c1";
  ctx.fillRect(x - 2, y - 2, 4, 4);
  ctx.restore();
}

function drawGrenade(grenade) {
  const x = grenade.x - cameraX();
  const y = grenade.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(grenade.spin);
  ctx.fillStyle = "#18282a";
  ctx.fillRect(-7, -7, 14, 14);
  ctx.fillStyle = "#6c8b5a";
  ctx.fillRect(-5, -5, 10, 10);
  ctx.fillStyle = grenade.fuse < 0.35 && Math.floor(state.worldTime * 14) % 2 ? "#fff2a2" : "#e9693e";
  ctx.fillRect(4, -9, 5, 5);
  ctx.restore();
}

function drawPickup(pickup) {
  const x = pickup.x - cameraX();
  const y = pickup.y + Math.sin(state.worldTime * 4 + pickup.phase) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = "lighter";
  const color = pickup.kind === "weapon" ? WEAPONS[pickup.weapon].color : pickup.kind === "medkit" ? "#71f0ae" : "#ff8b59";
  ctx.shadowColor = color;
  ctx.shadowBlur = 17;
  ctx.fillStyle = "rgba(8,20,25,.84)";
  ctx.fillRect(-17, -16, 34, 32);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(-17, -16, 34, 32);
  ctx.fillStyle = color;
  if (pickup.kind === "weapon") {
    ctx.fillRect(-11, -3, 22, 7);
    ctx.fillRect(4, -7, 11, 4);
    ctx.fillRect(-4, 4, 5, 8);
  } else if (pickup.kind === "medkit") {
    ctx.fillRect(-4, -10, 8, 20);
    ctx.fillRect(-10, -4, 20, 8);
  } else {
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(4, -10, 5, 6);
  }
  ctx.restore();
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const particle of state.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    const x = Math.round(particle.x - cameraX());
    const y = Math.round(particle.y);
    ctx.globalAlpha = particle.kind === "smoke" ? alpha * 0.42 : alpha;
    ctx.fillStyle = particle.color;
    if (particle.kind === "smoke") {
      ctx.beginPath();
      ctx.arc(x, y, particle.size * (1.6 - alpha * 0.35), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, particle.size + (particle.kind === "debris" ? 1 : 0), particle.size);
    }
  }
  ctx.restore();
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 13px ui-monospace, monospace";
  for (const floater of state.floaters) {
    ctx.globalAlpha = clamp(floater.life * 2, 0, 1);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x - cameraX(), floater.y);
  }
  ctx.restore();
}

function drawLighting() {
  const stage = STAGES[state.stageIndex];
  const darkness = stage.weather === "lab" ? 0.27 : stage.weather === "storm" ? 0.2 : 0.16;
  ctx.save();
  ctx.fillStyle = `rgba(0,4,11,${clamp(darkness - state.lightning * 0.35, 0.04, 0.4)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";
  for (const bullet of state.bullets) drawGlow(bullet.x - cameraX(), bullet.y, bullet.weapon === "rocket" ? 55 : 22, `${bullet.color}66`);
  for (const bullet of state.enemyBullets) drawGlow(bullet.x - cameraX(), bullet.y, 30, `${bullet.color}55`);
  if (state.lightning > 0) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(174,215,255,${state.lightning})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawGlow(x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawWeather() {
  const weather = STAGES[state.stageIndex].weather;
  ctx.save();
  if (weather === "rain" || weather === "storm") {
    const intensity = weather === "storm" ? 1 : 0.62;
    const count = Math.floor(state.rain.length * intensity);
    ctx.globalCompositeOperation = "screen";
    ctx.lineWidth = weather === "storm" ? 1.6 : 1;
    for (let i = 0; i < count; i += 1) {
      const drop = state.rain[i];
      const wind = weather === "storm" ? 145 : 62;
      const x = ((drop.x + state.worldTime * wind * drop.layer - cameraX() * 0.06) % (W + 180)) - 90;
      const y = (drop.y + state.worldTime * drop.speed) % (H + 100) - 50;
      ctx.globalAlpha = drop.alpha;
      ctx.strokeStyle = weather === "storm" ? "#c4e8ff" : "#70d9e8";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - wind * 0.04, y + drop.length);
      ctx.stroke();
    }
  } else if (weather === "classroom") {
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 16; i += 1) {
      const drift = 8 + (i % 4) * 3;
      const x = ((i * 149 + state.worldTime * drift - cameraX() * 0.035) % (W + 90)) - 45;
      const y = 70 + ((i * 83 + state.worldTime * (7 + i % 3)) % 345);
      ctx.globalAlpha = 0.16 + (i % 3) * 0.05;
      ctx.fillStyle = i % 5 === 0 ? "#75eee7" : "#ffd59b";
      ctx.fillRect(Math.round(x), Math.round(y), i % 4 === 0 ? 3 : 2, i % 4 === 0 ? 3 : 2);
    }
    const warningPulse = 0.045 + (Math.sin(state.worldTime * 2.7) + 1) * 0.025;
    const glow = ctx.createLinearGradient(0, 0, W, 0);
    glow.addColorStop(0, "rgba(255,118,55,0)");
    glow.addColorStop(0.72, `rgba(255,118,55,${warningPulse})`);
    glow.addColorStop(1, "rgba(255,68,45,.13)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i += 1) {
      const x = ((state.worldTime * (18 + i * 7) + i * 260) % (W + 300)) - 150;
      const y = 270 + i * 45 + Math.sin(state.worldTime + i) * 12;
      const fog = ctx.createRadialGradient(x, y, 0, x, y, 160);
      fog.addColorStop(0, "rgba(155,205,212,.08)");
      fog.addColorStop(1, "rgba(155,205,212,0)");
      ctx.fillStyle = fog;
      ctx.beginPath();
      ctx.arc(x, y, 160, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBossHud() {
  const guardian = state.enemies.find((enemy) => enemy.guardian && enemy.dead <= 0 && enemy.hp > 0);
  if (!guardian) return;
  const width = guardian.type === "boss" ? 360 : 260;
  const x = (W - width) / 2;
  const y = 76;
  ctx.save();
  ctx.fillStyle = "rgba(3,9,14,.82)";
  ctx.fillRect(x - 3, y - 3, width + 6, 17);
  ctx.fillStyle = "#33171d";
  ctx.fillRect(x, y, width, 11);
  const ratio = clamp(guardian.hp / guardian.maxHp, 0, 1);
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, "#ffb341");
  gradient.addColorStop(0.55, "#ef5d45");
  gradient.addColorStop(1, "#c93363");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width * ratio, 11);
  ctx.fillStyle = "#ffe6b4";
  ctx.textAlign = "center";
  ctx.font = "900 9px ui-monospace, monospace";
  const bossLabel = state.stageIndex === STAGES.length - 1 ? "ROOFTOP NEST CORE" : "CLASSROOM HIVE QUEEN";
  ctx.fillText(guardian.type === "boss" ? bossLabel : "AREA GUARDIAN", W / 2, y - 7);
  ctx.restore();
}

function drawStageBanner() {
  if (state.stageBanner <= 0) return;
  const alpha = clamp(state.stageBanner < 0.45 ? state.stageBanner / 0.45 : (2.5 - state.stageBanner) / 0.45, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(3,10,16,.76)";
  ctx.fillRect(0, H * 0.43, W, 60);
  ctx.fillStyle = STAGES[state.stageIndex].accent;
  ctx.fillRect(0, H * 0.43, W, 2);
  ctx.fillStyle = "#fff0c3";
  ctx.textAlign = "center";
  ctx.font = "950 23px ui-monospace, monospace";
  ctx.fillText(STAGES[state.stageIndex].name, W / 2, H * 0.43 + 38);
  ctx.restore();
}

function draw() {
  ctx.save();
  const shakePixels = state.shake > 0 ? 1 + state.shake * 23 : 0;
  if (shakePixels) ctx.translate(randomBetween(-shakePixels, shakePixels), randomBetween(-shakePixels * 0.65, shakePixels * 0.65));
  if (state.cameraKickY) ctx.translate(0, state.cameraKickY);
  drawBackground();
  drawGround();
  for (const platform of state.platforms) drawPlatform(platform);
  for (const obstacle of state.obstacles) drawObstacle(obstacle);
  for (const pickup of state.pickups) drawPickup(pickup);
  for (const bullet of state.bullets) drawBullet(bullet);
  for (const bullet of state.enemyBullets) drawEnemyBullet(bullet);
  for (const grenade of state.grenades) drawGrenade(grenade);
  for (const enemy of state.enemies) drawEnemy(enemy);
  for (const image of state.afterimages) {
    drawStudentAt(image.x, image.y, image.facing, clamp(image.life / image.maxLife, 0, 1) * 0.3, true);
  }
  drawPlayer();
  drawParticles();
  drawLighting();
  drawWeather();
  drawBossHud();
  drawStageBanner();
  if (state.mode === "playing" && state.combo >= 3 && state.comboTimer > 0) {
    ctx.fillStyle = "#ffe089";
    ctx.textAlign = "right";
    ctx.font = "950 13px ui-monospace, monospace";
    ctx.fillText(`${state.combo} HIT COMBO`, W - 18, 100);
  }
  ctx.restore();
}

function setInput(control, pressed) {
  if (control === "jump" && pressed && !input.jump) queueJump();
  if (control === "dash" && pressed && !input.dash) dash();
  if (control === "weapon" && pressed && !input.weapon) cycleWeapon();
  if (control === "grenade" && pressed && !input.grenade) throwGrenade();
  input[control] = pressed;
}

const keyMap = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  KeyK: "dash",
  KeyJ: "fire",
  KeyZ: "fire",
  KeyX: "fire",
  KeyE: "weapon",
  KeyC: "weapon",
  KeyQ: "grenade",
};

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyM") {
    event.preventDefault();
    toggleAudio();
    return;
  }
  const control = keyMap[event.code];
  if (control) {
    event.preventDefault();
    setInput(control, true);
  }
  if ((event.code === "Enter" || event.code === "Space") && state.mode !== "playing") {
    event.preventDefault();
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  const control = keyMap[event.code];
  if (control) {
    event.preventDefault();
    setInput(control, false);
  }
});

window.addEventListener("blur", () => {
  Object.keys(input).forEach((key) => { input[key] = false; });
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const release = (event) => {
    button.classList.remove("is-pressed");
    setInput(control, false);
    if (event?.pointerId !== undefined && button.hasPointerCapture?.(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startAudio();
    button.setPointerCapture?.(event.pointerId);
    button.classList.add("is-pressed");
    setInput(control, true);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

ui.startButton.addEventListener("click", resetGame);
ui.restartButton.addEventListener("click", resetGame);
ui.audioToggle.addEventListener("click", (event) => {
  event.preventDefault();
  toggleAudio();
});
ui.volumeSlider.addEventListener("input", (event) => {
  startAudio();
  setAudioVolume(event.currentTarget.value);
});

function loop(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000 || 0);
  state.lastTime = now;
  update(dt, now);
  draw();
  requestAnimationFrame(loop);
}

try {
  const savedVolumeValue = window.localStorage.getItem("ccckl-game-volume");
  if (savedVolumeValue !== null) {
    const savedVolume = Number(savedVolumeValue);
    if (Number.isFinite(savedVolume)) audio.volume = clamp(savedVolume / 100, 0, 1);
  }
} catch (_error) {
  // Use the default when storage is unavailable.
}
syncHud();
setAudioButton();
requestAnimationFrame(loop);
