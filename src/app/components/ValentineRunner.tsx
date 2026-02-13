"use client";

import { useEffect, useMemo, useState } from "react";

type Point = { x: number; y: number };

type Keys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
};

const BOARD = { width: 360, height: 260 };
const PLAYER_SIZE = 34;
const HEART_SIZE = 24;
const SPEED = 9;
const ROUND_SECONDS = 25;
const GOAL = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomHeart(): Point {
  return {
    x: Math.floor(Math.random() * (BOARD.width - HEART_SIZE)),
    y: Math.floor(Math.random() * (BOARD.height - HEART_SIZE)),
  };
}

export default function ValentineRunner() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [player, setPlayer] = useState<Point>({ x: 20, y: 110 });
  const [heart, setHeart] = useState<Point>({ x: 270, y: 130 });
  const [keys, setKeys] = useState<Keys>({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!["w", "a", "s", "d"].includes(key)) return;
      event.preventDefault();
      setKeys((prev) => ({ ...prev, [key]: true }));
    };

    const handleUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!["w", "a", "s", "d"].includes(key)) return;
      setKeys((prev) => ({ ...prev, [key]: false }));
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const movement = setInterval(() => {
      setPlayer((prev) => {
        let nextX = prev.x;
        let nextY = prev.y;

        if (keys.w) nextY -= SPEED;
        if (keys.s) nextY += SPEED;
        if (keys.a) nextX -= SPEED;
        if (keys.d) nextX += SPEED;

        const next = {
          x: clamp(nextX, 0, BOARD.width - PLAYER_SIZE),
          y: clamp(nextY, 0, BOARD.height - PLAYER_SIZE),
        };

        const hitX = next.x < heart.x + HEART_SIZE && next.x + PLAYER_SIZE > heart.x;
        const hitY = next.y < heart.y + HEART_SIZE && next.y + PLAYER_SIZE > heart.y;

        if (hitX && hitY) {
          setScore((prevScore) => {
            const updated = prevScore + 1;
            setBestScore((best) => Math.max(best, updated));
            return updated;
          });
          setHeart(randomHeart());
        }

        return next;
      });
    }, 28);

    return () => clearInterval(movement);
  }, [running, keys, heart.x, heart.y]);


  const start = () => {
    setRunning(true);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setPlayer({ x: 20, y: 110 });
    setHeart(randomHeart());
  };

  const won = !running && timeLeft === 0 && score >= GOAL;

  const status = useMemo(() => {
    if (running) return "Use W A S D to move your bunny and collect hearts.";
    if (won) return "You win! Bunny love legend 💝";
    if (timeLeft === 0) return "Round over! Try again and beat your best score.";
    return "Press start, then use W A S D keys.";
  }, [running, timeLeft, won]);

  return (
    <section className="runner" aria-label="WASD valentine game">
      <div className="runner-head">
        <h3>🐇 Heart Dash</h3>
        <button className="runner-btn" onClick={start}>{running ? "Restart" : "Start"}</button>
      </div>

      <p className="runner-status">{status}</p>
      <div className="runner-stats">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className="runner-board" role="application" aria-label="Game board controlled by keyboard">
        <div className="runner-heart" style={{ transform: `translate(${heart.x}px, ${heart.y}px)` }}>
          💖
        </div>
        <div className="runner-player" style={{ transform: `translate(${player.x}px, ${player.y}px)` }}>
          🐰
        </div>
      </div>

      <p className="runner-goal">Goal: collect {GOAL} hearts in {ROUND_SECONDS} seconds.</p>
    </section>
  );
}
