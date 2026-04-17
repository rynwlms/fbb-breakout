import {
  BRICK_ROW_COLORS,
  WORLD,
  brickPoints,
  createBall,
  createBricks,
  createPaddle,
  type Ball,
  type Brick,
  type Paddle,
} from "./entities";
import { collideBricks, collidePaddle, collideWalls } from "./collisions";

export type GameState = "ready" | "playing" | "gameover" | "won";

export interface GameEvents {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onStateChange: (state: GameState) => void;
}

const INITIAL_LIVES = 3;
const INITIAL_SPEED = 340;
const MAX_SPEED = 620;
const SPEED_PER_BRICK = 2.2;

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly events: GameEvents;

  private paddle: Paddle = createPaddle();
  private ball: Ball = createBall();
  private bricks: Brick[] = createBricks();
  private sparks: Spark[] = [];

  private state: GameState = "ready";
  private score = 0;
  private lives = INITIAL_LIVES;
  private speed = INITIAL_SPEED;

  private keys = new Set<string>();
  private pointerX: number | null = null;
  private lastFrame = 0;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement, events: GameEvents) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.events = events;
    this.bindInput();
  }

  start(): void {
    this.reset();
    this.setState("ready");
    this.lastFrame = performance.now();
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.tick);
  }

  launchBall(): void {
    if (this.state !== "ready") return;
    const angle = (-60 + Math.random() * 120) * (Math.PI / 180);
    this.ball.vx = Math.sin(angle) * this.speed;
    this.ball.vy = -Math.abs(Math.cos(angle)) * this.speed;
    this.ball.launched = true;
    this.setState("playing");
  }

  private reset(): void {
    this.paddle = createPaddle();
    this.ball = createBall();
    this.bricks = createBricks();
    this.sparks = [];
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.speed = INITIAL_SPEED;
    this.events.onScoreChange(this.score);
    this.events.onLivesChange(this.lives);
  }

  private setState(state: GameState): void {
    this.state = state;
    this.events.onStateChange(state);
  }

  getScore(): number {
    return this.score;
  }

  private tick = (now: number): void => {
    const dt = Math.min(0.033, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.state === "playing" || this.state === "ready") {
      this.update(dt);
    }
    this.draw();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private update(dt: number): void {
    this.updatePaddle(dt);
    if (this.state === "ready") {
      this.ball.x = this.paddle.x + this.paddle.width / 2;
      this.ball.y = this.paddle.y - this.ball.radius - 1;
      this.updateSparks(dt);
      return;
    }
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    if (collideWalls(this.ball, WORLD) === "floor") {
      this.loseLife();
      return;
    }
    const paddleHit = collidePaddle(this.ball, this.paddle);
    if (paddleHit) {
      // Spawn sparks at the bottom of the ball near the paddle surface.
      this.spawnSparks(this.ball.x, this.paddle.y, this.ball.vx);
    }
    const hit = collideBricks(this.ball, this.bricks);
    if (hit) {
      this.score += brickPoints(hit.brick.row);
      this.events.onScoreChange(this.score);
      this.speed = Math.min(MAX_SPEED, this.speed + SPEED_PER_BRICK);
      const currentSpeed = Math.hypot(this.ball.vx, this.ball.vy);
      if (currentSpeed > 0) {
        const scale = this.speed / currentSpeed;
        this.ball.vx *= scale;
        this.ball.vy *= scale;
      }
      if (this.bricks.every((b) => !b.alive)) {
        this.setState("won");
      }
    }

    this.updateSparks(dt);
  }

  private spawnSparks(x: number, y: number, ballVx: number): void {
    // Keep it cheap: small burst, short lifetime, capped total particles.
    const count = 10 + Math.floor(Math.random() * 6);
    const baseDir = ballVx >= 0 ? 1 : -1;
    for (let i = 0; i < count; i++) {
      const speed = 140 + Math.random() * 220;
      const angle = (-Math.PI / 2 + (Math.random() - 0.5) * 0.9) + baseDir * (Math.random() - 0.5) * 0.25;
      const maxLife = 0.18 + Math.random() * 0.14;
      this.sparks.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: 2.0 + Math.random() * 2.6,
      });
    }
    if (this.sparks.length > 220) this.sparks.splice(0, this.sparks.length - 220);
  }

  private updateSparks(dt: number): void {
    if (this.sparks.length === 0) return;
    const gravity = 900;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i]!;
      s.life -= dt;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      s.vy += gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      // simple air drag
      s.vx *= 0.98;
      s.vy *= 0.98;
    }
  }

  private updatePaddle(dt: number): void {
    let dx = 0;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) dx -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) dx += 1;
    if (dx !== 0) {
      this.paddle.x += dx * this.paddle.speed * dt;
    } else if (this.pointerX !== null) {
      const target = this.pointerX - this.paddle.width / 2;
      this.paddle.x += (target - this.paddle.x) * Math.min(1, dt * 18);
    }
    if (this.paddle.x < 0) this.paddle.x = 0;
    const maxX = WORLD.width - this.paddle.width;
    if (this.paddle.x > maxX) this.paddle.x = maxX;
  }

  private loseLife(): void {
    this.lives -= 1;
    this.events.onLivesChange(this.lives);
    if (this.lives <= 0) {
      this.setState("gameover");
      return;
    }
    this.ball = createBall();
    this.speed = INITIAL_SPEED;
    this.setState("ready");
  }

  private draw(): void {
    const { ctx, canvas } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / WORLD.width;
    const scaleY = canvas.height / WORLD.height;
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Sparks (behind everything except background)
    if (this.sparks.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const s of this.sparks) {
        const t = Math.max(0, s.life / s.maxLife);
        const alpha = Math.min(1, t * 1.2);
        // Warmer orange sparks for visibility.
        ctx.strokeStyle = `rgba(255, 122, 26, ${alpha})`;
        ctx.lineWidth = Math.max(1.1, s.size);
        ctx.beginPath();
        // Short streak in direction of travel
        const dx = -s.vx * 0.015;
        const dy = -s.vy * 0.015;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx, s.y + dy);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = BRICK_ROW_COLORS[brick.row % BRICK_ROW_COLORS.length]!;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }

    ctx.fillStyle = "#e6e8eb";
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    const bx = this.ball.x;
    const by = this.ball.y;
    const br = this.ball.radius;

    // Baseball-like ball: stronger seams/stitches for readability.
    ctx.beginPath();
    const highlightX = bx - br * 0.35;
    const highlightY = by - br * 0.35;
    const ballGrad = ctx.createRadialGradient(highlightX, highlightY, br * 0.2, bx, by, br);
    ballGrad.addColorStop(0, "#ffffff");
    ballGrad.addColorStop(0.65, "#f4f6f8");
    ballGrad.addColorStop(1, "#d8dde3");
    ctx.fillStyle = ballGrad;
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = Math.max(0.6, br * 0.12);
    ctx.stroke();

    // Seam rendering (clipped to ball for a cleaner look).
    const seamColor = "#c1121f";
    const seamShadow = "rgba(0,0,0,0.18)";
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.clip();

    // Slight rotation so the seams aren't perfectly vertical.
    ctx.translate(bx, by);
    ctx.rotate(-0.45);
    ctx.translate(-bx, -by);

    const seamOffsetX = br * 0.58;
    const seamOffsetY = br * 0.82;
    const seamCpX = br * 1.02;
    const seamCpY = br * 0.12;

    // Draw seam shadow for contrast.
    ctx.strokeStyle = seamShadow;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(0.9, br * 0.22);
    ctx.beginPath();
    ctx.moveTo(bx - seamOffsetX, by - seamOffsetY);
    ctx.bezierCurveTo(bx - seamCpX, by - seamCpY, bx - seamCpX, by + seamCpY, bx - seamOffsetX, by + seamOffsetY);
    ctx.moveTo(bx + seamOffsetX, by - seamOffsetY);
    ctx.bezierCurveTo(bx + seamCpX, by - seamCpY, bx + seamCpX, by + seamCpY, bx + seamOffsetX, by + seamOffsetY);
    ctx.stroke();

    // Main seam line.
    ctx.strokeStyle = seamColor;
    ctx.lineWidth = Math.max(0.9, br * 0.18);
    ctx.beginPath();
    ctx.moveTo(bx - seamOffsetX, by - seamOffsetY);
    ctx.bezierCurveTo(bx - seamCpX, by - seamCpY, bx - seamCpX, by + seamCpY, bx - seamOffsetX, by + seamOffsetY);
    ctx.moveTo(bx + seamOffsetX, by - seamOffsetY);
    ctx.bezierCurveTo(bx + seamCpX, by - seamCpY, bx + seamCpX, by + seamCpY, bx + seamOffsetX, by + seamOffsetY);
    ctx.stroke();

    // Stitch marks.
    const stitchCount = 11;
    const stitchLen = br * 0.26;
    ctx.lineWidth = Math.max(0.8, br * 0.12);
    for (let i = 0; i < stitchCount; i++) {
      const t = (i + 1) / (stitchCount + 1);
      const y = by - seamOffsetY + t * (seamOffsetY * 2);
      const wobble = Math.sin(t * Math.PI) * br * 0.11;

      const lx = bx - seamOffsetX - wobble;
      const la = (i % 2 === 0 ? 1 : -1) * 0.9;
      ctx.beginPath();
      ctx.moveTo(lx - Math.cos(la) * stitchLen * 0.5, y - Math.sin(la) * stitchLen * 0.5);
      ctx.lineTo(lx + Math.cos(la) * stitchLen * 0.5, y + Math.sin(la) * stitchLen * 0.5);
      ctx.stroke();

      const rx = bx + seamOffsetX + wobble;
      const ra = (i % 2 === 0 ? -1 : 1) * 0.9;
      ctx.beginPath();
      ctx.moveTo(rx - Math.cos(ra) * stitchLen * 0.5, y - Math.sin(ra) * stitchLen * 0.5);
      ctx.lineTo(rx + Math.cos(ra) * stitchLen * 0.5, y + Math.sin(ra) * stitchLen * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  private bindInput(): void {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (e.code === "Space") {
        e.preventDefault();
        this.launchBall();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * WORLD.width;
      this.pointerX = localX;
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.pointerX = null;
    });
    this.canvas.addEventListener("click", () => this.launchBall());
  }
}
