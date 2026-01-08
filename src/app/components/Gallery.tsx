"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

type Props = { paths?: string[] };

export default function Gallery({ paths }: Props) {
  // Use passed-in paths if provided; otherwise fetch /api/photos on mount
  const [images, setImages] = useState<string[]>(paths && paths.length > 0 ? paths : []);

  useEffect(() => {
    if (paths && paths.length > 0) return;
    let mounted = true;
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data.paths)) setImages(data.paths);
      })
      .catch(() => {
        /* keep empty on error */
      });
    return () => {
      mounted = false;
    };
  }, [paths]);

  const [active, setActive] = useState<string | null>(null);

  const open = (p: string) => setActive(p);
  const close = () => setActive(null);

  return (
    <div className="gallery">
      <h2>Photos</h2>
      <div className="thumb-grid">
        {images.map((p) => (
          <button key={p} className="thumb" onClick={() => open(p)} aria-label={`Open ${p}`}>
            <Image src={p} alt={p} width={80} height={80} style={{ objectFit: "cover", borderRadius: 8 }} />
          </button>
        ))}
      </div>

      {active && (
        <div className="lightbox-overlay" onClick={close} role="dialog" aria-modal="true">
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={close} aria-label="Close">✕</button>
            <Image src={active} alt={active} width={900} height={600} className="lightbox-img" />
            <div className="lightbox-actions">
              {/* reserved for future actions */}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
