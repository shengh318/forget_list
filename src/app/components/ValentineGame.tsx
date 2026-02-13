"use client";

import { useEffect, useMemo, useState } from "react";

type Position = { x: number; y: number };

const BOARD_WIDTH = 320;
const BOARD_HEIGHT = 220;
const TARGET_SIZE = 56;
const GAME_SECONDS = 10;

function randomPosition(): Position {
  return {
    x: Math.floor(Math.random() * (BOARD_WIDTH - TARGET_SIZE)),
    y: Math.floor(Math.random() * (BOARD_HEIGHT - TARGET_SIZE)),
  };
}

export default function ValentineGame() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 120, y: 80 });

  const goal = 14;
  const won = !running && score >= goal;

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

  const feedback = useMemo(() => {
    if (running) return "Catch as many hearts as you can!";
    if (won) return "You won! Cupid approves this romance 💘";
    if (score > 0) return "Time's up! Try again and beat your score.";
    return "Press start and help Cupid collect hearts.";
  }, [running, score, won]);

  const startGame = () => {
    setRunning(true);
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setPosition(randomPosition());
  };

  const collectHeart = () => {
    if (!running) return;
    setScore((prev) => {
      const next = prev + 1;
      setBestScore((best) => Math.max(best, next));
      return next;
    });
    setPosition(randomPosition());
  };

  const percent = Math.min(100, Math.round((score / goal) * 100));

  return (
    <section className="val-game" aria-label="Cupid Catch mini game">
      <div className="val-game-header">
        <h3>💘 Cupid Catch</h3>
        <button className="val-game-btn" onClick={startGame}>
          {running ? "Restart" : "Start Game"}
        </button>
      </div>

      <p className="val-game-copy">{feedback}</p>

      <div className="val-game-stats">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className="val-game-bar" aria-hidden>
        <div className="val-game-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="val-game-board" role="group" aria-label="Tap the moving heart target">
        <button
          type="button"
          className="val-game-heart"
          onClick={collectHeart}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          aria-label="Catch heart"
          disabled={!running}
        >
          💗
        </button>
      </div>

      <p className="val-game-goal">Goal: 14 hearts before the timer ends.</p>
    </section>
  );
}
