"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type State = "idle" | "accepted" | "declined";

export default function Valentine() {
  const [state, setState] = useState<State>("idle");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const launchConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = (canvas.width = canvas.clientWidth);
    const H = (canvas.height = canvas.clientHeight);

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number; shape: "rect" | "heart" };
    const colors = ["#ff4d6d", "#ff9bb3", "#ffd6e0", "#ff7aa2", "#ffd166", "#c084fc"];
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 100,
        y: H / 2 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 7,
        vy: -5 - Math.random() * 9,
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? "heart" : "rect",
      });
    }

    let t0 = performance.now();
    const dur = 2800;

    function frame(t: number) {
      const dt = t - t0;
      t0 = t;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.vy += 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - (p.y - H / 2) / (H * 0.6));
        ctx.fillStyle = p.color;
        if (p.shape === "heart") {
          ctx.font = `${p.size * 1.4}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("♥", 0, 0);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(frame);
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
    setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, W, H);
    }, dur + 200);
  }, []);

  const launchMegaConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = (canvas.width = canvas.clientWidth);
    const H = (canvas.height = canvas.clientHeight);

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number; shape: "rect" | "heart" | "star" };
    const colors = ["#ff2d6f", "#ff7aa2", "#ffd6e0", "#ffb3d1", "#ffe066", "#9be7ff", "#c084fc", "#34d399"];
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      const shape = Math.random() > 0.5 ? "heart" : Math.random() > 0.5 ? "star" : "rect";
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 140,
        y: H / 2 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: -7 - Math.random() * 14,
        size: 5 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.6,
        shape,
      });
    }

    let t0 = performance.now();
    const dur = 3800;

    function frame(t: number) {
      const dt = t - t0;
      t0 = t;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - (p.y - H / 2) / (H * 0.7));
        ctx.fillStyle = p.color;
        if (p.shape === "heart") {
          ctx.font = `${p.size * 1.2}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("♥", 0, 0);
        } else if (p.shape === "star") {
          ctx.font = `${p.size * 1.2}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("✦", 0, 0);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(frame);
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
    setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, W, H);
    }, dur + 300);
  }, []);

  const handleHooray = useCallback(() => {
    launchMegaConfetti();
  }, [launchMegaConfetti]);

  useEffect(() => {
    if (state === "accepted") launchConfetti();
    if (state === "declined") launchMegaConfetti();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, launchConfetti, launchMegaConfetti]);

  return (
    <div className="valentine-wrap">
      <div className={`valentine-card ${state === "accepted" ? "valentine-accepted" : ""}`}>
        <canvas ref={canvasRef} className="valentine-canvas" />

        <div className="valentine-bunny-art">
          <div className="bunny-ear bunny-ear-left" />
          <div className="bunny-ear bunny-ear-right" />
          <div className="bunny-face">
            <div className="bunny-eye bunny-eye-left" />
            <div className="bunny-eye bunny-eye-right" />
            <div className="bunny-nose" />
            <div className="bunny-cheek bunny-cheek-left" />
            <div className="bunny-cheek bunny-cheek-right" />
          </div>
        </div>

        <h2 className="valentine-title">Will you be my Valentine, bunny? 💌</h2>
        <p className="valentine-sub">
          Because to me, you&apos;re the sweetest bunny in the whole garden.
        </p>

        {state === "idle" && (
          <div className="valentine-actions">
            <button className="valentine-btn valentine-btn-yes" onClick={() => setState("accepted")}>
              Yes, my bunny <span className="valentine-btn-icon">❤️</span>
            </button>
            <button className="valentine-btn valentine-btn-no" onClick={() => setState("declined")}>
              Hoppy yes! <span className="valentine-btn-icon">🐇</span>
            </button>
          </div>
        )}

        {state === "accepted" && (
          <div className="valentine-result">
            <div className="valentine-result-emoji">🐰💘🐰</div>
            <p className="valentine-result-text">
              I&apos;m over the moon! You&apos;re my forever Valentine, my sweet bunny.
            </p>
          </div>
        )}

        {state === "declined" && (
          <div className="valentine-result">
            <p className="valentine-result-text">
              No worries, bunny! I&apos;m still bringing extra cuddles.
            </p>
            <p className="valentine-result-text">
              Let&apos;s make this the hopp-iest Valentine&apos;s Day ever!! 🎉❤️
            </p>
            <button className="valentine-btn valentine-btn-hooray" onClick={handleHooray}>
              Hoppy hooray! 🎊
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
