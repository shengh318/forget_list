"use client";

import { useState } from "react";

export default function Flower() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`love-card-shell ${isOpen ? "is-open" : ""}`} aria-label="Valentine card with flower">
      <div className="love-card">
        <div className="love-card-front" aria-hidden={isOpen}>
          <div className="love-card-front-decor">
            <span>🌸</span><span>💖</span><span>🌸</span>
          </div>
          <h3>For my bunny</h3>
          <p>A tiny surprise from my heart to yours</p>
          <button className="love-card-btn" onClick={() => setIsOpen(true)}>
            ✦ open me ✦
          </button>
          <div className="love-card-front-bg">
            <span className="floating-heart" style={{ left: "10%", animationDelay: "0s" }}>♥</span>
            <span className="floating-heart" style={{ right: "10%", animationDelay: "0.8s" }}>♥</span>
            <span className="floating-heart" style={{ left: "25%", animationDelay: "1.6s" }}>♥</span>
          </div>
        </div>

        <div className="love-card-inside" aria-hidden={!isOpen}>
          <div className="love-card-inside-bg">
            <span className="float-glow" style={{ left: "5%", top: "20%", animationDelay: "0s" }}>✨</span>
            <span className="float-glow" style={{ right: "8%", top: "30%", animationDelay: "0.6s" }}>💫</span>
            <span className="float-glow" style={{ left: "15%", bottom: "25%", animationDelay: "1.2s" }}>✨</span>
            <span className="float-glow" style={{ right: "15%", bottom: "30%", animationDelay: "0.3s" }}>💕</span>
          </div>

          <div className="flower-wrap" role="img" aria-label="Animated blooming flower">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">💞</div>
            <div className="sparkle sparkle-3">✨</div>
            <div className="petal petal-1" />
            <div className="petal petal-2" />
            <div className="petal petal-3" />
            <div className="petal petal-4" />
            <div className="petal petal-5" />
            <div className="petal petal-6" />
            <div className="flower-center" />
            <div className="stem" />
            <div className="leaf leaf-left" />
            <div className="leaf leaf-right" />
          </div>

          <p className="flower-note">
            Happy Valentine&apos;s Day, bunny. You make every day feel warmer, brighter, and softer.
            I&apos;m so grateful for your smile, your hugs, and your heart. 🌸
          </p>
        </div>
      </div>
    </section>
  );
}
