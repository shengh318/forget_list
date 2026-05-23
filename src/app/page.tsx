import Gallery from "./components/Gallery";
import Valentine from "./components/Valentine";
import ValentineRunner from "./components/ValentineRunner";
import Flower from "./components/Flower";
import HappyBirthday from "./components/HappyBirthday";
import ForgetList from "./components/ForgetList";
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
  } catch {
    images = [];
  }

  return (
    <main className="app">
      <header className="hero">
        <h1>
          Sheng <span className="ampersand">&amp;</span> Anne
        </h1>
        <p>our little corner on the web ✦</p>
      </header>

      <div className="layout layout-grid">
        <ForgetList />

        <div className="uniform-tile grid-photos">
          <Gallery paths={images} />
        </div>

        <div className="uniform-tile grid-valentine-ask">
          <Valentine />
        </div>

        <div className="uniform-tile grid-valentine-card">
          <Flower />
        </div>

        <div className="uniform-tile grid-valentine-game">
          <ValentineRunner />
        </div>
        <div className="uniform-tile grid-birthday">
          <HappyBirthday />
        </div>
      </div>
    </main>
  );
}
