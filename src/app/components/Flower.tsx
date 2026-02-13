export default function Flower() {
  return (
    <section className="flower-sketch-card" aria-label="Valentine flower drawing">
      <svg
        className="flower-sketch"
        viewBox="0 0 220 280"
        role="img"
        aria-label="Flower drawn with animated line strokes"
      >
        <path className="draw draw-stem" d="M110 248 C107 195 106 150 110 108" />
        <path className="draw draw-leaf" d="M108 182 C74 168 64 196 101 204" />
        <path className="draw draw-leaf" d="M112 160 C147 148 160 176 122 186" />

        <path className="draw draw-petal" d="M110 108 C87 82 90 53 110 40 C130 53 133 82 110 108" />
        <path className="draw draw-petal" d="M110 108 C132 90 154 97 164 118 C145 131 125 128 110 108" />
        <path className="draw draw-petal" d="M110 108 C133 126 131 153 110 166 C90 152 88 125 110 108" />
        <path className="draw draw-petal" d="M110 108 C91 125 69 131 55 117 C65 97 87 90 110 108" />
        <circle className="draw draw-center" cx="110" cy="108" r="14" />
      </svg>

      <p className="flower-sketch-note">for anne, my pookie</p>
    </section>
  );
}
