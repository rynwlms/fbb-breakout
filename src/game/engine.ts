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

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly events: GameEvents;

  private paddle: Paddle = createPaddle();
  private ball: Ball = createBall();
  private bricks: Brick[] = createBricks();

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
      return;
    }
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    if (collideWalls(this.ball, WORLD) === "floor") {
      this.loseLife();
      return;
    }
    collidePaddle(this.ball, this.paddle);
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

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = BRICK_ROW_COLORS[brick.row % BRICK_ROW_COLORS.length]!;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }

    ctx.fillStyle = "#e6e8eb";
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
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
