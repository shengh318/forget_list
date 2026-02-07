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

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number };
    const colors = ["#ff4d6d", "#ff9bb3", "#ffd6e0", "#ff7aa2", "#ffd166"];
    const particles: Particle[] = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 80,
        y: H / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: -6 - Math.random() * 8,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }

    let t0 = performance.now();
    const dur = 2400;

    function frame(t: number) {
      const dt = t - t0;
      t0 = t;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.vy += 0.18; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (t - (performance.now() - dt) < performance.now() + dur) {
        animRef.current = requestAnimationFrame(frame);
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
    // stop after dur ms
    setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (ctx) ctx.clearRect(0, 0, W, H);
    }, dur + 200);
  }, []);

  const launchMegaConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = (canvas.width = canvas.clientWidth);
    const H = (canvas.height = canvas.clientHeight);

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number; shape: 'rect' | 'circle' };
    const colors = ["#ff2d6f", "#ff7aa2", "#ffd6e0", "#ffb3d1", "#ffe066", "#9be7ff"];
    const particles: Particle[] = [];
    const count = 140;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * 120,
        y: H / 2 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 10,
        vy: -8 - Math.random() * 12,
        size: 6 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.6,
        shape: Math.random() > 0.6 ? 'circle' : 'rect',
      });
    }

    let t0 = performance.now();
    const dur = 3200;

    function frame(t: number) {
      const dt = t - t0;
      t0 = t;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.vy += 0.24; // stronger gravity for bigger effect
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') ctx.beginPath(), ctx.arc(0, 0, p.size / 1.6, 0, Math.PI * 2), ctx.fill();
        else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(frame);
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
    setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (ctx) ctx.clearRect(0, 0, W, H);
    }, dur + 300);
  }, []);

  const handleHooray = useCallback(() => {
    // fire the big celebration and move to accepted view
    launchMegaConfetti();
  }, [launchMegaConfetti]);

  useEffect(() => {
    if (state === "accepted") {
      launchConfetti();
    }
    if (state === "declined") {
      launchMegaConfetti();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, launchConfetti, launchMegaConfetti]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
      <div
        style={{
          position: "relative",
          maxWidth: 560,
          width: "100%",
          background: "linear-gradient(180deg,#fff5fb 0%,#ffe8f1 40%, #ffe0ec 100%)",
          borderRadius: 20,
          boxShadow: "0 16px 40px rgba(255, 112, 148, 0.25)",
          padding: 24,
          textAlign: "center",
          transform: state === "accepted" ? "scale(1.02)" : "none",
          transition: "transform 260ms ease",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: 20 }}
        />

        <div
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            color: "#ff7aa2",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          🐇💖
        </div>
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 20,
            color: "#ff9bb3",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          💞🐰
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 150,
              height: 150,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                left: 18,
                width: 46,
                height: 86,
                borderRadius: 40,
                background: "linear-gradient(180deg,#fff 0%,#ffe3ec 100%)",
                border: "2px solid #ff9bb3",
                transform: "rotate(-8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -30,
                right: 18,
                width: 46,
                height: 86,
                borderRadius: 40,
                background: "linear-gradient(180deg,#fff 0%,#ffe3ec 100%)",
                border: "2px solid #ff9bb3",
                transform: "rotate(8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 12,
                borderRadius: 999,
                background: "white",
                boxShadow: "0 8px 20px rgba(255, 122, 162, 0.2)",
                border: "2px solid #ffd1df",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  left: 38,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: "#5b2a3a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 38,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: "#5b2a3a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 70,
                  left: "50%",
                  width: 20,
                  height: 14,
                  borderRadius: "50% 50% 60% 60%",
                  background: "#ff7aa2",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 80,
                  left: 26,
                  width: 24,
                  height: 14,
                  borderRadius: 999,
                  background: "#ffd1df",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 80,
                  right: 26,
                  width: 24,
                  height: 14,
                  borderRadius: 999,
                  background: "#ffd1df",
                }}
              />
            </div>
          </div>

          <h2 style={{ margin: 0, fontSize: 24, color: "#4a1a2a" }}>Will you be my Valentine, bunny? 💌</h2>
          <p style={{ marginTop: 4, marginBottom: 16, color: "#5b2a3a" }}>
            Because to me, you’re the sweetest bunny in the whole garden.
          </p>
        </div>

        {state === "idle" && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setState("accepted")}
              style={{
                background: "linear-gradient(135deg,#ff6b9d,#ff2d6f)",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 10px 20px rgba(255,45,111,0.25)",
              }}
            >
              Yes, my bunny ❤️
            </button>
            <button
              onClick={() => setState("declined")}
              style={{
                background: "white",
                color: "#ff2d6f",
                border: "2px solid #ff9bb3",
                padding: "10px 18px",
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Hoppy yes! 🐇
            </button>
          </div>
        )}

        {state === "accepted" && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 36 }}>🐰💘🐰</div>
            <p style={{ marginTop: 8, color: "#4a1a2a", fontWeight: 600 }}>
              I’m over the moon! You’re my forever Valentine, my sweet bunny.
            </p>
          </div>
        )}

        {state === "declined" && (
          <div style={{ marginTop: 6 }}>
            <p style={{ marginTop: 8, color: "#4a1a2a", fontWeight: 700, fontSize: 18 }}>
              No worries, bunny! I’m still bringing extra cuddles.
            </p>
            <p style={{ marginTop: 8, color: "#4a1a2a", fontWeight: 700, fontSize: 18 }}>
              Let’s make this the hopp-iest Valentine’s Day ever!! 🎉❤️🎉
            </p>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleHooray}
                style={{
                  background: '#ff2d6f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(255,45,111,0.18)',
                  transform: 'translateY(2px)',
                }}
              >
                Hoppy hooray!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
