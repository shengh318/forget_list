"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Item = { id: string; text: string; done: boolean };

export default function Home() {
  // Define the items here — edit this array in code to change what's shown on the page.
  const DEFAULT_TEXTS = ["Pillow", "Winter Gloves"];
  const [items, setItems] = useState<Item[]>(() => DEFAULT_TEXTS.map((t) => ({ id: idGen(), text: t, done: false })));

  function idGen() {
    return Math.random().toString(36).slice(2, 9);
  }

  // Entry box removed per request; items are added via code only

  const toggle = (id: string) => setItems((s) => s.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const remove = (id: string) => setItems((s) => s.filter((it) => it.id !== id));
  const clearDone = () => setItems((s) => s.filter((it) => !it.done));

  return (
    <main className="app">
      <div className="card">
        <Image src="./bear.png" alt="bear" width={250} height={180} className="decor bear" priority />
        <Image src="./bunny.png" alt="bunny" width={140} height={140} className="decor bunny" priority />
        <h1>Anne's Forget List</h1>
        <p className="subtitle">Don't forget these items when coming over!!</p>

        {/* entry form removed - example item added by default */}

        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} className={`item ${item.done ? "done" : ""}`}>
              <label className="checkbox">
                <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
                <span className="label-text">{item.text}</span>
              </label>
              <button className="remove-btn" onClick={() => remove(item.id)} aria-label={`Remove ${item.text}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="actions">
          <button className="ghost" onClick={clearDone}>Remove checked</button>
          <span className="count">{items.filter((i) => !i.done).length} remaining</span>
        </div>
      </div>
    </main>
  );
}
