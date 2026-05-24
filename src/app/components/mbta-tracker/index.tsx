"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

const MBTA_API_BASE = "https://api-v3.mbta.com";
const MBTA_API_KEY = "c246650beb044b66bd3c1d54d312b768";

const VIEWBOX_W = 460;
const VIEWBOX_H = 400;

interface StationConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
  lx: number;
  ly: number;
  textAnchor?: "start" | "end" | "middle";
}

interface RouteConfig {
  id: string;
  color: string;
  stations: { x: number; y: number }[];
}

interface PredictionData {
  id: string;
  arrivalTime: string | null;
  departureTime: string | null;
  directionId: number;
  routeId: string;
}

interface RouteInfo {
  id: string;
  color: string;
  directionDestinations: [string, string];
}

interface ApiData {
  data: Array<{
    id: string;
    attributes: {
      arrival_time: string | null;
      departure_time: string | null;
      direction_id: number;
    };
    relationships: {
      route: { data: { id: string } };
    };
  }>;
  included: Array<{
    type: string;
    id: string;
    attributes: {
      color: string;
      direction_destinations: [string, string];
    };
  }>;
}

const STATIONS: StationConfig[] = [
  // Red Line (vertical at X=175)
  { id: "place-harsq", name: "Harvard", x: 175, y: 30, lines: ["Red"], lx: 163, ly: 34, textAnchor: "end" },
  { id: "place-cntsq", name: "Central", x: 175, y: 70, lines: ["Red"], lx: 163, ly: 74, textAnchor: "end" },
  { id: "place-knncl", name: "Kendall/MIT", x: 175, y: 110, lines: ["Red"], lx: 189, ly: 114 },
  { id: "place-chmnl", name: "Charles/MGH", x: 175, y: 148, lines: ["Red"], lx: 189, ly: 152 },
  { id: "place-pktrm", name: "Park Street", x: 175, y: 185, lines: ["Red", "Green-B", "Green-C", "Green-D", "Green-E"], lx: 185, ly: 191 },
  { id: "place-dwnxg", name: "Downtown Crossing", x: 175, y: 255, lines: ["Red", "Orange"], lx: 163, ly: 259, textAnchor: "end" },
  { id: "place-sstat", name: "South Station", x: 175, y: 295, lines: ["Red"], lx: 163, ly: 299, textAnchor: "end" },
  { id: "place-brdwy", name: "Broadway", x: 175, y: 335, lines: ["Red"], lx: 163, ly: 339, textAnchor: "end" },
  { id: "place-andrw", name: "Andrew", x: 175, y: 370, lines: ["Red"], lx: 163, ly: 374, textAnchor: "end" },
  // Orange Line (top vertical at X=315)
  { id: "place-north", name: "North Station", x: 315, y: 55, lines: ["Orange"], lx: 329, ly: 59 },
  { id: "place-haecl", name: "Haymarket", x: 315, y: 100, lines: ["Orange"], lx: 329, ly: 104 },
  { id: "place-state", name: "State Street", x: 315, y: 185, lines: ["Orange", "Blue"], lx: 315, ly: 202 },
  // Orange Line (lower vertical at X=210 — closer to Red)
  { id: "place-chncl", name: "Chinatown", x: 210, y: 285, lines: ["Orange"], lx: 224, ly: 289 },
  { id: "place-tumnl", name: "Tufts Med Center", x: 210, y: 315, lines: ["Orange"], lx: 224, ly: 319 },
  { id: "place-bbsta", name: "Back Bay", x: 210, y: 345, lines: ["Orange"], lx: 224, ly: 349 },
  { id: "place-masta", name: "Mass Ave", x: 210, y: 370, lines: ["Orange"], lx: 224, ly: 374 },
  { id: "place-rugg", name: "Ruggles", x: 210, y: 390, lines: ["Orange"], lx: 224, ly: 394 },
  // Green Line (horizontal at Y=185, VERTICAL — centered, dy=9)
  { id: "place-kencl", name: "Kenmore", x: 15, y: 185, lines: ["Green-B", "Green-C", "Green-D"], lx: 15, ly: 124 },
  { id: "place-hymnl", name: "Hynes", x: 50, y: 185, lines: ["Green-B", "Green-C", "Green-D"], lx: 50, ly: 140 },
  { id: "place-coecl", name: "Copley", x: 80, y: 185, lines: ["Green-B", "Green-C", "Green-D", "Green-E"], lx: 80, ly: 124 },
  { id: "place-armnl", name: "Arlington", x: 110, y: 185, lines: ["Green-B", "Green-C", "Green-D", "Green-E"], lx: 110, ly: 108 },
  { id: "place-boyls", name: "Boylston", x: 140, y: 185, lines: ["Green-B", "Green-C", "Green-D", "Green-E"], lx: 140, ly: 116 },
  { id: "place-gover", name: "Government Center", x: 280, y: 185, lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Blue"], lx: 280, ly: 44 },
  // Blue Line (horizontal at Y=185, VERTICAL — centered, dy=9)
  { id: "place-aqucl", name: "Aquarium", x: 360, y: 185, lines: ["Blue"], lx: 360, ly: 199 },
  { id: "place-mvbcl", name: "Maverick", x: 405, y: 185, lines: ["Blue"], lx: 405, ly: 116 },
];

const ROUTES: RouteConfig[] = [
  {
    id: "Red",
    color: "#DA291C",
    stations: [
      { x: 175, y: 30 }, { x: 175, y: 70 }, { x: 175, y: 110 },
      { x: 175, y: 148 }, { x: 175, y: 185 }, { x: 175, y: 255 },
      { x: 175, y: 295 }, { x: 175, y: 335 }, { x: 175, y: 370 },
    ],
  },
  {
    id: "Orange",
    color: "#ED8B00",
    stations: [
      { x: 315, y: 55 }, { x: 315, y: 100 }, { x: 315, y: 185 },
      { x: 175, y: 255 }, { x: 210, y: 285 }, { x: 210, y: 315 },
      { x: 210, y: 345 }, { x: 210, y: 370 }, { x: 210, y: 390 },
    ],
  },
  {
    id: "Green",
    color: "#00843D",
    stations: [
      { x: 15, y: 185 }, { x: 50, y: 185 }, { x: 80, y: 185 },
      { x: 110, y: 185 }, { x: 140, y: 185 }, { x: 175, y: 185 },
      { x: 280, y: 185 },
    ],
  },
  {
    id: "Blue",
    color: "#003DA5",
    stations: [
      { x: 280, y: 185 }, { x: 315, y: 185 },
      { x: 360, y: 185 }, { x: 405, y: 185 },
    ],
  },
];

const TRANSFER_IDS = new Set([
  "place-pktrm", "place-gover", "place-state", "place-dwnxg",
]);

const VERTICAL_GREEN_BLUE = new Set([
  "place-kencl", "place-hymnl", "place-coecl", "place-armnl",
  "place-boyls", "place-aqucl", "place-mvbcl",
  "place-gover", "place-state",
]);

const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));

function getRouteDisplayName(routeId: string): string {
  if (routeId === "Green-B") return "Green Line B";
  if (routeId === "Green-C") return "Green Line C";
  if (routeId === "Green-D") return "Green Line D";
  if (routeId === "Green-E") return "Green Line E";
  if (routeId === "Mattapan") return "Mattapan";
  return `${routeId} Line`;
}

function getRouteColor(routeId: string): string {
  if (routeId === "Red") return "#DA291C";
  if (routeId === "Orange") return "#ED8B00";
  if (routeId === "Blue") return "#003DA5";
  if (routeId.startsWith("Green") || routeId === "Mattapan") return "#00843D";
  return "#999";
}

function getDirectionArrow(routeId: string, directionId: number): string {
  if (routeId === "Blue" || routeId.startsWith("Green")) {
    return directionId === 0 ? "⬅" : "➡";
  }
  return directionId === 0 ? "⬇" : "⬆";
}

function formatMinutesUntil(arrivalTime: string | null): string {
  if (!arrivalTime) return "--";
  const diffMs = new Date(arrivalTime).getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins <= 0) return "Due";
  if (diffMins === 1) return "1 min";
  return `${diffMins} min`;
}

function formatTimeAgo(timestamp: number): string {
  const sec = Math.round((Date.now() - timestamp) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)}m ago`;
}

export default function MbtaTracker() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [routeInfoMap, setRouteInfoMap] = useState<Map<string, RouteInfo>>(new Map());
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<() => void>(() => {});
  const cancelledRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!selectedStop) {
      setPredictions([]);
      setRouteInfoMap(new Map());
      setLastUpdated(null);
      setError(null);
      return;
    }

    cancelledRef.current = false;

    const fetchData = async () => {
      setRefreshing(true);
      try {
        const url = `${MBTA_API_BASE}/predictions?filter[stop]=${selectedStop}&include=route&api_key=${MBTA_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiData = await res.json();
        if (cancelledRef.current) return;

        setPredictions(
          data.data.map((item) => ({
            id: item.id,
            arrivalTime: item.attributes.arrival_time,
            departureTime: item.attributes.departure_time,
            directionId: item.attributes.direction_id,
            routeId: item.relationships.route.data.id,
          }))
        );

        const routeMap = new Map<string, RouteInfo>();
        for (const incl of data.included) {
          if (incl.type === "route") {
            routeMap.set(incl.id, {
              id: incl.id,
              color: `#${incl.attributes.color}`,
              directionDestinations: incl.attributes.direction_destinations,
            });
          }
        }
        setRouteInfoMap(routeMap);
        setError(null);
        setLastUpdated(Date.now());
      } catch {
        if (!cancelledRef.current) setError("Couldn't load MBTA data");
      } finally {
        if (!cancelledRef.current) setRefreshing(false);
      }
    };

    fetchRef.current = fetchData;
    fetchData();

    return () => {
      cancelledRef.current = true;
    };
  }, [selectedStop]);

  const handleRefresh = useCallback(() => {
    fetchRef.current();
  }, []);

  const handleStationClick = useCallback(
    (station: StationConfig, e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedStop === station.id) {
        setSelectedStop(null);
        return;
      }
      setSelectedStop(station.id);
    },
    [selectedStop]
  );

  const handleClose = useCallback(() => {
    setSelectedStop(null);
  }, []);

  const handleOutsideClick = useCallback(
    (e: React.MouseEvent) => {
      if (selectedStop && e.target === e.currentTarget) {
        setSelectedStop(null);
      }
    },
    [selectedStop]
  );

  const groupedPredictions = useMemo(() => {
    const groups: Record<
      string,
      { routeId: string; directions: Record<number, PredictionData[]> }
    > = {};
    for (const pred of predictions) {
      if (!groups[pred.routeId]) {
        groups[pred.routeId] = { routeId: pred.routeId, directions: { 0: [], 1: [] } };
      }
      groups[pred.routeId].directions[pred.directionId].push(pred);
    }
    for (const routeId of Object.keys(groups)) {
      for (const dirId of [0, 1]) {
        groups[routeId].directions[dirId].sort(
          (a, b) =>
            new Date(a.arrivalTime || 0).getTime() -
            new Date(b.arrivalTime || 0).getTime()
        );
      }
    }
    return groups;
  }, [predictions]);

  const routeOrder = useMemo(() => {
    const order = ["Red", "Orange", "Blue", "Green-B", "Green-C", "Green-D", "Green-E"];
    const present = new Set(predictions.map((p) => p.routeId));
    return order.filter((id) => present.has(id));
  }, [predictions]);

  const selectedStation = selectedStop ? STATION_BY_ID.get(selectedStop) ?? null : null;

  const renderSkeleton = () => (
    <div className="mbta-skeleton">
      {[70, 85, 75, 90, 65].map((w, i) => (
        <div
          key={i}
          className="mbta-skeleton-line"
          style={{ width: `${w}%` }}
        />
      ))}
      <div className="mbta-skeleton-station" />
    </div>
  );

  const renderError = () => (
    <div className="mbta-error">
      <p>{error}</p>
      <button
        className="mbta-retry-btn"
        onClick={() => selectedStop && setSelectedStop(selectedStop)}
      >
        Retry
      </button>
    </div>
  );

  const renderPopup = () => {
    if (!selectedStation) return null;

    const hasPredictions = predictions.length > 0;

    return (
      <div className="mbta-popup-overlay" onClick={handleClose}>
        <div className="mbta-popup" onClick={(e) => e.stopPropagation()}>
        <div className="mbta-popup-header">
          <span>🚇 {selectedStation.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="mbta-popup-refresh" onClick={handleRefresh}>
              ↻
            </button>
            <button className="mbta-popup-close" onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

        {refreshing && predictions.length === 0 && (
          <div className="mbta-popup-empty">
            <div className="mbta-popup-spinner" />
          </div>
        )}

        {error && (
          <div className="mbta-popup-empty">{error}</div>
        )}

        {!refreshing && !error && !hasPredictions && (
          <div className="mbta-popup-empty">No trains scheduled</div>
        )}

        {hasPredictions &&
          routeOrder.map((routeId) => {
            const group = groupedPredictions[routeId];
            if (!group) return null;
            const info = routeInfoMap.get(routeId);
            const color = getRouteColor(routeId);

            return (
              <div key={routeId} className="mbta-popup-section" style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
                <div className="mbta-popup-route-header">
                  <span className="mbta-popup-route-dot" style={{ background: color }} />
                  {getRouteDisplayName(routeId)}
                </div>
                {[0, 1].map((dirId) => {
                  const preds = group.directions[dirId];
                  if (preds.length === 0) return null;
                  const dest =
                    info?.directionDestinations[dirId] ??
                    (dirId === 0 ? "Outbound" : "Inbound");
                  const arrow = getDirectionArrow(routeId, dirId);
                  return (
                    <div key={dirId}>
                      <div className="mbta-popup-dir-header" style={{ color }}>
                        {arrow} {dest}
                      </div>
                      {preds.slice(0, 3).map((pred) => (
                        <div key={pred.id} className="mbta-popup-row">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {formatMinutesUntil(pred.arrivalTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}

        {lastUpdated && (
          <div className="mbta-popup-footer">
            <span className={refreshing ? "mbta-refreshing" : ""}>
              Updated {formatTimeAgo(lastUpdated)}
            </span>
          </div>
        )}
      </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="card mbta-card">
        <div className="mbta-header">
          <h1>🚇 MBTA</h1>
          <p className="subtitle">tap a station for live times</p>
        </div>
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className="card mbta-card">
      <div className="mbta-header">
        <h1>🚇 MBTA</h1>
        <p className="subtitle">tap a station for live times</p>
      </div>

      <div className="mbta-map-wrap" ref={wrapRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {ROUTES.map((route) => (
            <polyline
              key={route.id}
              points={route.stations.map((s) => `${s.x},${s.y}`).join(" ")}
              fill="none"
              stroke={route.color}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ))}

          {STATIONS.map((station) => {
            const isTransfer = TRANSFER_IDS.has(station.id);
            const isSelected = selectedStop === station.id;

            return (
              <g
                key={station.id}
                className="mbta-station"
                onClick={(e) => handleStationClick(station, e)}
              >
                {isTransfer && (
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={9}
                    fill="var(--bg)"
                    stroke={
                      isSelected ? "var(--accent)" : "var(--text-secondary)"
                    }
                    strokeWidth={2.5}
                  />
                )}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isTransfer ? 6 : 4.5}
                  fill={isSelected ? "var(--accent)" : "#fff"}
                  stroke={
                    isTransfer
                      ? station.lines[0] === "Red"
                        ? "#DA291C"
                        : "#888"
                      : "none"
                  }
                  strokeWidth={isTransfer ? 1.5 : 0}
                />
                {VERTICAL_GREEN_BLUE.has(station.id) ? (
                  <text
                    x={station.lx}
                    y={station.ly}
                    textAnchor="middle"
                    fontSize={9}
                    fill={isSelected ? "var(--accent)" : "var(--text)"}
                    className="mbta-station-label mbta-station-label-vertical"
                  >
                    {station.name.split('').map((char, i) => (
                      <tspan key={i} x={station.lx} dy={i === 0 ? 0 : 9}>
                        {char}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text
                    x={station.lx}
                    y={station.ly}
                    textAnchor={station.textAnchor ?? "start"}
                    className={`mbta-station-label ${
                      isTransfer ? "mbta-station-label-transfer" : ""
                    }`}
                    fontSize={isTransfer ? 10 : 9}
                    fill={isSelected ? "var(--accent)" : "var(--text)"}
                    transform={station.id === "place-pktrm" ? `rotate(45,${station.lx},${station.ly})` : undefined}
                  >
                    {station.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {selectedStation && renderPopup()}
      </div>
    </div>
  );
}
