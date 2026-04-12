export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  launched: boolean;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  alive: boolean;
}

export interface World {
  width: number;
  height: number;
}

export const WORLD: World = { width: 800, height: 600 };

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_TOP = 60;
const BRICK_SIDE_PADDING = 32;
const BRICK_GAP = 6;
const BRICK_HEIGHT = 22;

export function createPaddle(): Paddle {
  const width = 110;
  const height = 14;
  return {
    width,
    height,
    x: (WORLD.width - width) / 2,
    y: WORLD.height - 40,
    speed: 520,
  };
}

export function createBall(): Ball {
  return {
    x: WORLD.width / 2,
    y: WORLD.height - 54,
    radius: 8,
    vx: 0,
    vy: 0,
    launched: false,
  };
}

export function createBricks(): Brick[] {
  const usableWidth = WORLD.width - BRICK_SIDE_PADDING * 2;
  const brickWidth = (usableWidth - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS;
  const bricks: Brick[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_SIDE_PADDING + col * (brickWidth + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        width: brickWidth,
        height: BRICK_HEIGHT,
        row,
        alive: true,
      });
    }
  }
  return bricks;
}

export function brickPoints(row: number): number {
  return (BRICK_ROWS - row) * 10;
}

export const BRICK_ROW_COLORS = [
  "#ff5577",
  "#ff8a3d",
  "#ffd23d",
  "#6bd968",
  "#4ec1ff",
  "#a178ff",
];
