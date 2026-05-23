export default function HappyBirthday() {
  return (
    <section className="birthday-card" aria-label="Happy Birthday celebration card">
      <div className="birthday-bg-sparkles" aria-hidden="true">
        <span>✨</span><span>💫</span><span>✨</span><span>🌟</span>
        <span>💜</span><span>✨</span><span>🎉</span><span>✨</span>
      </div>

      <div className="birthday-confetti" aria-hidden="true">
        <span>🎉</span>
        <span>✨</span>
        <span>🎈</span>
        <span>💜</span>
        <span>🎊</span>
        <span>🌟</span>
      </div>

      <h2>
        Happy Birthday
        <span className="birthday-name"> Anne!!!</span>
      </h2>

      <div className="birthday-divider" aria-hidden="true">♡ ✦ ♡</div>

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

      <div className="birthday-footer" aria-hidden="true">
        <span>with love, sheng ♡</span>
      </div>
    </section>
  );
}
