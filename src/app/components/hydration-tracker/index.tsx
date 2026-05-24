"use client";

import { useState, useCallback, useEffect } from "react";

const GLASS_ML = 250;
const GOAL_ML = 2000;

const INTERVAL_OPTIONS = [
  { label: "15 min", ms: 15 * 60 * 1000 },
  { label: "30 min", ms: 30 * 60 * 1000 },
  { label: "1 hr", ms: 60 * 60 * 1000 },
  { label: "2 hr", ms: 2 * 60 * 60 * 1000 },
  { label: "4 hr", ms: 4 * 60 * 60 * 1000 },
] as const;

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface WaterData {
  date: string;
  totalMl: number;
}

function loadWater(): WaterData {
  try {
    const raw = localStorage.getItem("hydrate-data");
    if (raw) {
      const data = JSON.parse(raw) as WaterData;
      if (data.date === todayKey()) return data;
    }
  } catch { /* ignore */ }
  return { date: todayKey(), totalMl: 0 };
}

function loadInterval(): number {
  try {
    const saved = localStorage.getItem("hydrate-interval");
    if (saved) return Number(saved);
  } catch { /* ignore */ }
  return 60 * 60 * 1000;
}

export default function HydrationTracker() {
  const [waterData, setWaterData] = useState<WaterData>(loadWater);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">("default");
  const [intervalMs, setIntervalMs] = useState(loadInterval);
  const [animating, setAnimating] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    try { localStorage.setItem("hydrate-interval", String(intervalMs)); } catch { /* ignore */ }
  }, [intervalMs]);

  useEffect(() => {
    try { localStorage.setItem("hydrate-data", JSON.stringify(waterData)); } catch { /* ignore */ }
  }, [waterData]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifStatus(Notification.permission);
    } else {
      setNotifStatus("unsupported");
    }
  }, []);

  // Day rollover
  useEffect(() => {
    const id = setInterval(() => {
      setWaterData((prev) => {
        const current = loadWater();
        if (current.date !== prev.date) {
          localStorage.setItem("hydrate-last-notified", "0");
          setCountdown(-1);
          return current;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto reminder
  useEffect(() => {
    if (notifStatus !== "granted") return;
    const check = () => {
      try {
        const lastStr = localStorage.getItem("hydrate-last-notified");
        const last = lastStr ? Number(lastStr) : 0;
        if (Date.now() - last >= intervalMs) {
          const n = new Notification("💧 Reminder", {
            body: "Time to drink some water~ 🫧",
          });
          localStorage.setItem("hydrate-last-notified", String(Date.now()));
        }
      } catch { /* ignore */ }
    };
    const tick = setInterval(check, 30000);
    check();
    return () => clearInterval(tick);
  }, [notifStatus, intervalMs]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => {
      const lastStr = localStorage.getItem("hydrate-last-notified");
      const last = lastStr ? Number(lastStr) : 0;
      if (!last) { setCountdown(-1); return; }
      const remaining = Math.max(0, intervalMs - (Date.now() - last));
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(tick);
  }, [intervalMs]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setNotifStatus(result);
      if (result === "granted") {
        localStorage.setItem("hydrate-last-notified", String(Date.now()));
      }
    } catch { /* ignore */ }
  }, []);

  const logGlass = useCallback(() => {
    setWaterData((prev) => ({
      ...prev,
      totalMl: Math.min(prev.totalMl + GLASS_ML, GOAL_ML),
    }));
    localStorage.setItem("hydrate-last-notified", String(Date.now()));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
  }, []);

  const sendTestNotification = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("💧 Test Notification", {
      body: "This is a test~ ty ty 🫧",
    });
  }, []);

  const resetToday = useCallback(() => {
    setWaterData((prev) => ({ ...prev, totalMl: 0 }));
    localStorage.setItem("hydrate-last-notified", String(Date.now()));
  }, []);

  const percent = Math.min(Math.round((waterData.totalMl / GOAL_ML) * 100), 100);
  const glasses = Math.floor(waterData.totalMl / GLASS_ML);
  const totalGlasses = GOAL_ML / GLASS_ML;

function fmtCountdown(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}hr ${m}min ${s}sec`;
  if (m > 0) return `${m}min ${s}sec`;
  return `${s}sec`;
}

  return (
    <div className="card hydrate-card">
      <div className="hydrate-header">
        <div className="hydrate-title-row">
          <h1>💧 Hydration</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {notifStatus === "granted" && (
              <button className="hydrate-test-btn" onClick={sendTestNotification}>
                Test
              </button>
            )}
            <span className="hydrate-notif-badge" title={
              notifStatus === "granted" ? "Notifications on" :
              notifStatus === "denied" ? "Notifications blocked" :
              notifStatus === "unsupported" ? "Not supported" :
              "Notifications off"
            }>
              {notifStatus === "granted" ? "🔔" :
               notifStatus === "denied" ? "🔕" :
               notifStatus === "unsupported" ? "🚫" : "🔇"}
            </span>
          </div>
        </div>
        <p className="subtitle">stay hydrated, ty ty ♡</p>
      </div>

      {notifStatus !== "granted" && notifStatus !== "unsupported" && (
        <button className="hydrate-notif-request" onClick={requestPermission}>
          {notifStatus === "denied"
            ? "Notifications blocked (enable in browser settings)"
            : "🔔 Enable reminders"}
        </button>
      )}

      <div className={`hydrate-bottle-wrap ${animating ? "hydrate-log-splash" : ""}`}>
        <div className="hydrate-bottle">
          <div className="hydrate-bottle-cap">♡</div>
          <div className="hydrate-bottle-neck" />
          <div className="hydrate-bottle-body">
            {percent > 0 && (
              <div className="hydrate-water" style={{ height: `${percent}%` }}>
                <div className="hydrate-bubble" style={{ left: "20%", bottom: "60%", animationDelay: "0s" }} />
                <div className="hydrate-bubble" style={{ left: "65%", bottom: "35%", animationDelay: "0.6s" }} />
                <div className="hydrate-bubble" style={{ left: "40%", bottom: "70%", animationDelay: "1.2s" }} />
                <div className="hydrate-bubble" style={{ left: "75%", bottom: "55%", animationDelay: "0.3s" }} />
              </div>
            )}
            {percent === 0 && (
              <div className="hydrate-empty-msg">so empty...</div>
            )}
          </div>
        </div>

        <div className="hydrate-stats">
          <div className="hydrate-percent">{percent}%</div>
          <div className="hydrate-glasses">{glasses} / {totalGlasses} glass{glasses !== 1 ? "es" : ""}</div>
          <div className="hydrate-ml">{waterData.totalMl} / {GOAL_ML} ml</div>
        </div>
      </div>

      {percent >= 100 && (
        <div className="hydrate-full-msg">✦ Fully hydrated! Shine on, ty ty ⋆✨</div>
      )}

      {countdown >= 0 && percent < 100 && (
        <div className={`hydrate-countdown ${countdown === 0 ? "hydrate-countdown-now" : ""}`}>
          {countdown > 0
            ? <>Next reminder in <strong>{fmtCountdown(countdown)}</strong></>
            : <>🫧 Time to drink!</>}
        </div>
      )}

      <div className="hydrate-actions">
        <button className="hydrate-log-btn" onClick={logGlass} disabled={percent >= 100}>
          <span className={animating ? "hydrate-splash" : ""}>+</span> Log a Glass
        </button>
        <button className="hydrate-reset-btn" onClick={resetToday}>
          Reset Today
        </button>
      </div>

      <div className="hydrate-interval">
        <label>Remind me every:</label>
        <select value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value))}>
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={opt.ms} value={opt.ms}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
