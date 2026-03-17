export default function HappyBirthday() {
  return (
    <section className="birthday-card" aria-label="Happy Birthday celebration card">
      <div className="birthday-confetti" aria-hidden="true">
        <span>🎉</span>
        <span>✨</span>
        <span>🎈</span>
        <span>💜</span>
      </div>

      <h2>Happy Birthday!!!</h2>
      <p>
        Happy Birthday to my favorite girl / korean / twitch streamer / league player /
        brainrotter. Here&apos;s to your past year and more!
      </p>

      <div className="cake" aria-hidden="true">
        <div className="cake-candle">
          <span className="cake-flame" />
        </div>
        <div className="cake-top" />
        <div className="cake-body" />
        <div className="cake-plate" />
      </div>
    </section>
  );
}
