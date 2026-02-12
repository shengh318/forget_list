export default function Flower() {
  return (
    <section className="flower-card" aria-label="Animated Valentine flower">
      <div className="flower-wrap" role="img" aria-label="Blooming pink flower">
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
      <p className="flower-note">A little bloom for my favorite bunny 🌸</p>
    </section>
  );
}
