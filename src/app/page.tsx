import Gallery from "./components/gallery";
import Valentine from "./components/valentine";
import ValentineRunner from "./components/valentine-runner";
import Flower from "./components/flower";
import HappyBirthday from "./components/birthday";
import ForgetList from "./components/forget-list";
import HydrationTracker from "./components/hydration-tracker";
import { getPhotos } from "@/lib/getPhotos";

export default async function Home() {
  const images = await getPhotos();

  return (
    <main className="app">
      <header className="hero">
        <h1>
          Sheng <span className="ampersand">&amp;</span> Anne
        </h1>
        <p>our little corner on the web ✦</p>
      </header>

      <div className="layout layout-grid">
        <div className="uniform-tile grid-hydrate">
          <HydrationTracker />
        </div>

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
