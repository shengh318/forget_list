import Image from "next/image";
import Gallery from "./components/Gallery";
import { readdir } from "fs/promises";
import path from "path";

export default async function Home() {
    const dir = path.join(process.cwd(), "public", "photos");
    let images: string[] = [];
    try {
        const names = await readdir(dir);
        images = names
            .filter((n) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(n))
            .map((n) => `./photos/${n}`);
    } catch (err) {
        images = [];
    }

    const DEFAULT_TEXTS = ["Long Indoor Sweatpants"];

    return (
        <main className="app">
            <div className="layout">
                <div className="card">
                    <Image src="./bear.png" alt="bear" width={250} height={180} className="decor bear" priority />
                    <Image src="./bunny.png" alt="bunny" width={140} height={140} className="decor bunny" priority />
                    <h1>Anne's Forget List</h1>
                    <p className="subtitle">Don't forget these items when coming over!!</p>

                    <ul className="item-list">
                        {DEFAULT_TEXTS.map((t, i) => (
                            <li key={i} className="item">
                                <label className="checkbox">
                                    <input type="checkbox" defaultChecked={false} />
                                    <span className="label-text">{t}</span>
                                </label>
                            </li>
                        ))}
                    </ul>

                    <div className="actions">
                        <button className="ghost">Remove checked</button>
                        <span className="count">{DEFAULT_TEXTS.length} remaining</span>
                    </div>
                </div>

                <Gallery paths={images} />
            </div>
        </main>
    );
}