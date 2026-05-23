"use client";

import { useState, useCallback, useRef } from "react";

interface Item {
  id: number;
  text: string;
  done: boolean;
}

let nextId = 1;

const DEFAULT_ITEMS: Item[] = [
  { id: nextId++, text: "Winter Gloves 🧤", done: false },
];

export default function ForgetList() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [input, setInput] = useState("");
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { id: nextId++, text: trimmed, done: false }]);
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const toggleItem = useCallback((id: number) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 300);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }, []);

  const removeChecked = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.done));
  }, []);

  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const remaining = total - done;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") addItem();
    },
    [addItem]
  );

  return (
    <div className="card uniform-tile grid-forgetlist">
      <img src="./bear.png" alt="" className="fl-bear" aria-hidden="true" />
      <img src="./bunny.png" alt="" className="fl-bunny" aria-hidden="true" />

      <div className="fl-header">
        <div className="fl-title-row">
          <h1>Forget List</h1>
          <span className="fl-badge">{remaining} left</span>
        </div>
        <p className="subtitle">Don&apos;t forget these when coming over, Anne! ♡</p>
      </div>

      <div className="fl-add-wrap">
        <input
          ref={inputRef}
          className="fl-input"
          placeholder="Add something to bring..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="fl-add-btn" onClick={addItem} disabled={!input.trim()}>+</button>
      </div>

      {total > 0 && (
        <div className="fl-progress-wrap">
          <div className="fl-progress-bar">
            <div className="fl-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="fl-progress-label">{done}/{total}</span>
        </div>
      )}

      {total === 0 ? (
        <div className="fl-empty">
          <span className="fl-empty-icon">🎒</span>
          <p>Nothing to forget! Time to pack~</p>
        </div>
      ) : (
        <ul className="fl-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`fl-item ${item.done ? "fl-item-done" : ""} ${animatingId === item.id ? "fl-item-pop" : ""}`}
            >
              <button
                className={`fl-check ${item.done ? "fl-checked" : ""}`}
                onClick={() => toggleItem(item.id)}
                aria-label={item.done ? "Mark as not done" : "Mark as done"}
              >
                {item.done ? "✓" : ""}
              </button>
              <span className="fl-text">{item.text}</span>
              <span className={`fl-status ${item.done ? "fl-status-done" : ""}`}>
                {item.done ? "packed 🎒" : "to pack 📦"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="fl-actions">
        <button className="fl-remove-btn" onClick={removeChecked} disabled={done === 0}>
          ✕ remove checked
        </button>
        <span className="fl-encourage">
          {remaining === 0 && total > 0
            ? "All packed! See you soon! 💕"
            : remaining === 1
              ? `${remaining} more thing to grab`
              : `${remaining} more things to grab`}
        </span>
      </div>
    </div>
  );
}
