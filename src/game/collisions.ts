import type { Ball, Brick, Paddle, World } from "./entities";

export interface BrickHit {
  brick: Brick;
  axis: "x" | "y";
}

export function collideWalls(ball: Ball, world: World): "floor" | null {
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.radius > world.width) {
    ball.x = world.width - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }
  if (ball.y - ball.radius > world.height) {
    return "floor";
  }
  return null;
}

export function collidePaddle(ball: Ball, paddle: Paddle): boolean {
  if (ball.vy <= 0) return false;
  const withinX = ball.x >= paddle.x && ball.x <= paddle.x + paddle.width;
  const touchingY =
    ball.y + ball.radius >= paddle.y && ball.y + ball.radius <= paddle.y + paddle.height + 6;
  if (!withinX || !touchingY) return false;

  const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
  const maxAngle = (60 * Math.PI) / 180;
  const angle = hitPoint * maxAngle;
  const speed = Math.hypot(ball.vx, ball.vy);
  ball.vx = speed * Math.sin(angle);
  ball.vy = -Math.abs(speed * Math.cos(angle));
  ball.y = paddle.y - ball.radius - 0.1;
  return true;
}

export function collideBricks(ball: Ball, bricks: Brick[]): BrickHit | null {
  for (const brick of bricks) {
    if (!brick.alive) continue;
    if (
      ball.x + ball.radius < brick.x ||
      ball.x - ball.radius > brick.x + brick.width ||
      ball.y + ball.radius < brick.y ||
      ball.y - ball.radius > brick.y + brick.height
    ) {
      continue;
    }
    const prevX = ball.x - ball.vx * (1 / 60);
    const prevY = ball.y - ball.vy * (1 / 60);
    const wasOutsideX = prevX + ball.radius < brick.x || prevX - ball.radius > brick.x + brick.width;
    const wasOutsideY = prevY + ball.radius < brick.y || prevY - ball.radius > brick.y + brick.height;
    const axis: "x" | "y" = wasOutsideX && !wasOutsideY ? "x" : "y";
    brick.alive = false;
    if (axis === "x") ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    return { brick, axis };
  }
  return null;
}
