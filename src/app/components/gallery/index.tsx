"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Props = { paths?: string[] };

const ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "0deg", "-1.5deg", "2deg", "-0.5deg"];

type Size = "sm" | "md" | "lg" | "xs";

const LAYOUTS: [Size[], Size[]][] = [
  [["xs", "md", "xs"], ["xs", "xs", "xs", "xs"]],
  [["sm", "sm", "sm"], ["xs", "md", "xs"]],
  [["xs", "xs", "xs", "xs"], ["sm", "sm"]],
  [["xs", "lg"], ["xs", "xs", "xs", "xs"]],
  [["md", "xs", "xs"], ["xs", "xs", "md"]],
  [["xs", "xs"], ["xs", "xs", "xs", "xs"]],
  [["sm", "xs", "sm"], ["xs", "xs", "xs", "xs"]],
  [["xs", "xs", "xs", "xs"], ["xs", "xs", "xs", "xs"]],
  [["xs", "sm", "xs"], ["sm", "xs", "sm"]],
];

const SIZE_MAP: Record<Size, { w: number; h: number }> = {
  xs: { w: 75, h: 58 },
  sm: { w: 88, h: 68 },
  md: { w: 120, h: 88 },
  lg: { w: 160, h: 115 },
};

export default function Gallery({ paths }: Props) {
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
      .catch(() => {});
    return () => { mounted = false; };
  }, [paths]);

  const [page, setPage] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  const photosPerSpread = 8;
  const totalPages = Math.max(1, Math.ceil(images.length / photosPerSpread));

  const [layoutSeed, setLayoutSeed] = useState(0);

  const pickLayout = useCallback(() => {
    setLayoutSeed(Math.floor(Math.random() * LAYOUTS.length));
  }, []);

  const goForward = useCallback(() => {
    setPage((p) => {
      const next = Math.min(p + 1, totalPages - 1);
      if (next !== p) pickLayout();
      return next;
    });
  }, [totalPages, pickLayout]);

  const goBackward = useCallback(() => {
    setPage((p) => {
      const next = Math.max(p - 1, 0);
      if (next !== p) pickLayout();
      return next;
    });
  }, [pickLayout]);

  const openLightbox = useCallback((globalIdx: number) => {
    setActive(images[globalIdx]);
    setActiveIdx(globalIdx);
  }, [images]);

  const closeLightbox = useCallback(() => {
    setActive(null);
    setActiveIdx(-1);
  }, []);

  const prevPhoto = useCallback(() => {
    setActiveIdx((i) => {
      if (i <= 0) return i;
      const next = i - 1;
      setActive(images[next]);
      return next;
    });
  }, [images]);

  const nextPhoto = useCallback(() => {
    setActiveIdx((i) => {
      if (i >= images.length - 1) return i;
      const next = i + 1;
      setActive(images[next]);
      return next;
    });
  }, [images]);

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, closeLightbox, prevPhoto, nextPhoto]);

  const startIdx = page * photosPerSpread;
  const layout = LAYOUTS[layoutSeed];
  let photoIdx = 0;

  const renderPolaroid = (globalIdx: number, size: Size, rotIdx: number) => {
    if (globalIdx >= images.length) return null;
    const { w, h } = SIZE_MAP[size];
    const rot = ROTATIONS[rotIdx % ROTATIONS.length];
    return (
      <button
        className={`polaroid polaroid-${size}`}
        style={{ transform: `rotate(${rot})` }}
        onClick={() => openLightbox(globalIdx)}
        aria-label={`Open photo ${globalIdx + 1}`}
      >
        <span className="polaroid-img-wrap" style={{ width: w, height: h }}>
          <Image src={images[globalIdx]} alt="" width={w} height={h} className="polaroid-img" />
        </span>
        <span className="polaroid-caption">{globalIdx + 1}</span>
      </button>
    );
  };

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>
          <span className="gallery-icon">📸</span> Our Album
        </h2>
        <span className="gallery-count">{images.length} photos</span>
      </div>

      {images.length === 0 ? (
        <div className="gallery-empty">
          <span className="gallery-empty-icon">🖼️</span>
          <p>No photos yet — adding some soon!</p>
        </div>
      ) : (
        <div className="album" key={page}>
          <div className="album-spread album-enter">
            <div className="album-side album-side-left">
              <div className="album-side-inner">
                {layout[0].map((size, i) => {
                  const el = renderPolaroid(startIdx + photoIdx, size, photoIdx);
                  photoIdx++;
                  return <div key={i} className="polaroid-cell">{el}</div>;
                })}
              </div>
            </div>
            <div className="album-divider" />
            <div className="album-side album-side-right">
              <div className="album-side-inner">
                {layout[1].map((size, i) => {
                  const el = renderPolaroid(startIdx + photoIdx, size, photoIdx);
                  photoIdx++;
                  return <div key={i} className="polaroid-cell">{el}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="album-footer">
          <button className="album-nav-btn" onClick={goBackward} disabled={page === 0} aria-label="Previous page">‹</button>
          <span className="album-page-num">{page + 1} / {totalPages}</span>
          <button className="album-nav-btn" onClick={goForward} disabled={page >= totalPages - 1} aria-label="Next page">›</button>
        </div>
      )}

      {active && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLightbox} aria-label="Close">✕</button>
            <div className="lightbox-img-wrap">
              <Image src={active} alt="" width={900} height={600} className="lightbox-img" priority />
              <div className="lightbox-glow" />
            </div>
            <div className="lightbox-nav">
              <button className="lightbox-arrow" onClick={prevPhoto} aria-label="Previous" disabled={activeIdx <= 0}>‹</button>
              <span className="lightbox-label">{activeIdx + 1} / {images.length} ♡</span>
              <button className="lightbox-arrow" onClick={nextPhoto} aria-label="Next" disabled={activeIdx >= images.length - 1}>›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
