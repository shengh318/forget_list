"use client";

import { useEffect, useMemo, useState } from "react";

type Point = { x: number; y: number };

type Keys = {
  up: boolean;
  left: boolean;
  down: boolean;
  right: boolean;
};

const BOARD = { width: 360, height: 260 };
const PLAYER_SIZE = 34;
const HEART_SIZE = 24;
const STAR_SIZE = 24;
const BOMB_SIZE = 26;
const ARROW_SIZE = 20;
const SPEED = 9;
const ROUND_SECONDS = 8;
const GOAL = 24;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomPos(size: number): Point {
  return {
    x: Math.floor(Math.random() * (BOARD.width - size)),
    y: Math.floor(Math.random() * (BOARD.height - size)),
  };
}

function overlaps(a: Point, aw: number, b: Point, bw: number) {
  return a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bw && a.y + aw > b.y;
}

export default function ValentineRunner() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [player, setPlayer] = useState<Point>({ x: 20, y: 110 });
  const [heart, setHeart] = useState<Point>({ x: 270, y: 130 });
  const [star, setStar] = useState<Point>({ x: 170, y: 50 });
  const [bomb, setBomb] = useState<Point>({ x: 240, y: 210 });
  const [arrows, setArrows] = useState<Point[]>([]);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [keys, setKeys] = useState<Keys>({ up: false, left: false, down: false, right: false });

  useEffect(() => {
    const resolveDirection = (event: KeyboardEvent): keyof Keys | null => {
      const typed = event.key.toLowerCase();
      if (typed === "arrowup") return "up";
      if (typed === "arrowleft") return "left";
      if (typed === "arrowdown") return "down";
      if (typed === "arrowright") return "right";

      if (event.code === "ArrowUp") return "up";
      if (event.code === "ArrowLeft") return "left";
      if (event.code === "ArrowDown") return "down";
      if (event.code === "ArrowRight") return "right";

      return null;
    };

    const handleDown = (event: KeyboardEvent) => {
      const direction = resolveDirection(event);
      if (!direction) return;
      event.preventDefault();
      setKeys((prev) => ({ ...prev, [direction]: true }));
    };

    const handleUp = (event: KeyboardEvent) => {
      const direction = resolveDirection(event);
      if (!direction) return;
      setKeys((prev) => ({ ...prev, [direction]: false }));
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

        if (keys.up) nextY -= SPEED;
        if (keys.down) nextY += SPEED;
        if (keys.left) nextX -= SPEED;
        if (keys.right) nextX += SPEED;

        const next = {
          x: clamp(nextX, 0, BOARD.width - PLAYER_SIZE),
          y: clamp(nextY, 0, BOARD.height - PLAYER_SIZE),
        };

        if (overlaps(next, PLAYER_SIZE, bomb, BOMB_SIZE)) {
          setScore((prevScore) => Math.max(0, prevScore - 3));
          setStreak(0);
          setBomb(randomPos(BOMB_SIZE));
        }

        setArrows((prevArrows) => {
          const moved = prevArrows
            .map((arrow) => ({ ...arrow, x: arrow.x - 8 }))
            .filter((arrow) => arrow.x > -ARROW_SIZE);

          const hitByArrow = moved.some((arrow) => overlaps(next, PLAYER_SIZE, arrow, ARROW_SIZE));

          if (hitByArrow && !isInvulnerable) {
            setIsInvulnerable(true);
            setTimeout(() => setIsInvulnerable(false), 900);
            setScore((prevScore) => Math.max(0, prevScore - 2));
            setStreak(0);
          }

          return moved;
        });

        if (overlaps(next, PLAYER_SIZE, heart, HEART_SIZE)) {
          setStreak((prevStreak) => {
            const nextStreak = prevStreak + 1;
            const bonus = nextStreak >= 4 ? 2 : 1;
            setScore((prevScore) => {
              const updated = prevScore + bonus;
              setBestScore((best) => Math.max(best, updated));
              return updated;
            });
            return nextStreak;
          });
          setHeart(randomPos(HEART_SIZE));
        }

        if (overlaps(next, PLAYER_SIZE, star, STAR_SIZE)) {
          setScore((prevScore) => {
            const updated = prevScore + 5;
            setBestScore((best) => Math.max(best, updated));
            return updated;
          });
          setStreak(0);
          setStar(randomPos(STAR_SIZE));
          setTimeLeft((prev) => Math.min(ROUND_SECONDS + 8, prev + 3));
        }

        return next;
      });
    }, 28);

    return () => clearInterval(movement);
  }, [running, keys, heart, star, bomb, isInvulnerable]);

  useEffect(() => {
    if (!running) return;
    const shuffler = setInterval(() => {
      setHeart(randomPos(HEART_SIZE));
      setBomb(randomPos(BOMB_SIZE));
    }, 2200);

    return () => clearInterval(shuffler);
  }, [running]);


  useEffect(() => {
    if (!running) return;

    const launcher = setInterval(() => {
      setArrows((prev) => [
        ...prev,
        {
          x: BOARD.width - ARROW_SIZE,
          y: Math.floor(Math.random() * (BOARD.height - ARROW_SIZE)),
        },
      ]);
    }, 900);

    return () => clearInterval(launcher);
  }, [running]);
  const start = () => {
    setRunning(true);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setStreak(0);
    setPlayer({ x: 20, y: 110 });
    setHeart(randomPos(HEART_SIZE));
    setStar(randomPos(STAR_SIZE));
    setBomb(randomPos(BOMB_SIZE));
    setArrows([]);
    setIsInvulnerable(false);
  };

  const won = !running && timeLeft === 0 && score >= GOAL;

  const status = useMemo(() => {
    if (running) return "Arrow keys to move. Dodge flying arrows! 💖 +1, 🌟 +5/+3s, 💣 -3, 🏹 -2.";
    if (won) return "You win! You are now the Supreme Bunny of Love 💘";
    if (timeLeft === 0) return "Round over! Chase streaks and stars for huge points.";
    return "Press start, then use your arrow keys.";
  }, [running, timeLeft, won]);

  return (
    <section className="runner" aria-label="Arrow key valentine game">
      <div className="runner-head">
        <h3>🐇 Heart Dash Deluxe</h3>
        <button className="runner-btn" onClick={start}>{running ? "Restart" : "Start"}</button>
      </div>

      <p className="runner-status">{status}</p>
      <div className="runner-stats">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
        <span>Time: {timeLeft}s</span>
        <span>Streak: {streak}</span>
      </div>

      <div className="runner-board" role="application" aria-label="Game board controlled by keyboard arrow keys">
        <div className="runner-heart" style={{ transform: `translate(${heart.x}px, ${heart.y}px)` }}>💖</div>
        <div className="runner-star" style={{ transform: `translate(${star.x}px, ${star.y}px)` }}>🌟</div>
        <div className="runner-bomb" style={{ transform: `translate(${bomb.x}px, ${bomb.y}px)` }}>💣</div>
        {arrows.map((arrow, index) => (
          <div key={`arrow-${index}`} className="runner-arrow" style={{ transform: `translate(${arrow.x}px, ${arrow.y}px)` }}>➤</div>
        ))}
        <div className={`runner-player ${isInvulnerable ? "runner-player-hit" : ""}`} style={{ transform: `translate(${player.x}px, ${player.y}px)` }}>🐰</div>
      </div>

      <p className="runner-goal">Goal: score {GOAL}+ before time ends. Build 4+ streaks, grab stars, and dodge arrows.</p>
    </section>
  );
}
