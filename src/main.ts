import { Game, type GameState } from "./game/engine";
import { getLocalBest, getSavedName, setLocalBest, setSavedName } from "./scores/local";
import { fetchLeaderboard, submitScore } from "./scores/remote";
import {
  hideOverlay,
  hud,
  renderLeaderboard,
  setBest,
  setLives,
  setRound,
  setScore,
  showOverlay,
} from "./ui/hud";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Missing #game canvas");

let best = getLocalBest();
setBest(best);

const game = new Game(canvas, {
  onScoreChange: (score) => setScore(score),
  onLivesChange: (lives) => setLives(lives),
  onRoundChange: (round, total) => setRound(round, total),
  onStateChange: (state) => handleStateChange(state),
});

let lastState: GameState = "ready";
let hasStarted = false;

async function refreshLeaderboard(): Promise<void> {
  const { entries, enabled } = await fetchLeaderboard();
  renderLeaderboard(entries, enabled);
}

function handleStateChange(state: GameState): void {
  lastState = state;
  if (state === "ready") {
    showOverlay(
      "Get Ready",
      "Click the board or press Space to launch the ball. Move with the mouse or arrow keys.",
      "Launch",
    );
  } else if (state === "playing") {
    hideOverlay();
  } else if (state === "won") {
    void handleGameEnd("You cleared the board!");
  } else if (state === "gameover") {
    void handleGameEnd("Game Over");
  }
}

async function handleGameEnd(title: string): Promise<void> {
  const finalScore = game.getScore();
  const newBest = setLocalBest(finalScore);
  if (newBest !== best) {
    best = newBest;
    setBest(best);
  }
  showOverlay(title, `Final score: ${finalScore}. Submit to the global board or play again.`, "Play Again");
  renderSubmitPanel(finalScore);
}

function renderSubmitPanel(score: number): void {
  const existing = document.getElementById("submit-form");
  if (existing) existing.remove();
  if (score <= 0) return;

  const form = document.createElement("form");
  form.id = "submit-form";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 3;
  input.placeholder = "AAA";
  input.value = getSavedName();
  input.required = true;
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit";
  form.append(input, submit);
  hud.startBtn.before(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = input.value.trim().toUpperCase().slice(0, 3);
    if (!/^[A-Z0-9]{1,3}$/.test(name)) {
      input.focus();
      return;
    }
    setSavedName(name);
    submit.disabled = true;
    submit.textContent = "Submitting…";
    const { entries, enabled } = await submitScore(name, score);
    renderLeaderboard(entries, enabled);
    form.remove();
  });
}

hud.startBtn.addEventListener("click", () => {
  document.getElementById("submit-form")?.remove();
  if (!hasStarted) {
    hasStarted = true;
    game.start();
    return;
  }
  if (lastState === "ready") {
    game.launchBall();
    return;
  }
  game.start();
});

showOverlay(
  "FBB Breakout",
  "Clear every brick. Paddle follows your mouse or arrow keys. Click or press Space to launch.",
  "Start",
);
setScore(0);
setLives(3);
setRound(1, 3);
void refreshLeaderboard();
