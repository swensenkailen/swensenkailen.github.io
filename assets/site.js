// Click-to-load YouTube: shows a thumbnail until clicked, so no YouTube
// scripts or iframes load with the page.
document.querySelectorAll(".yt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
    f.title = btn.getAttribute("aria-label") || "YouTube video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    btn.replaceChildren(f);
    btn.style.cursor = "default";
  }, { once: true });
});

// Only one audio player at a time.
document.addEventListener("play", (e) => {
  document.querySelectorAll("audio").forEach((a) => { if (a !== e.target) a.pause(); });
}, true);

// Hero waveform — a few layered sines on a canvas, paused off-screen and
// skipped entirely for reduced-motion users.
(() => {
  const c = document.querySelector(".hero canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, visible = true, t = 0;
  const waves = [
    { amp: .16, freq: 1.3, speed: .6,  color: "rgba(255,111,174,.55)" },
    { amp: .10, freq: 2.4, speed: -.9, color: "rgba(140,200,255,.35)" },
    { amp: .07, freq: 4.1, speed: 1.4, color: "rgba(255,255,255,.18)" },
  ];
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const mid = h * .62;
    for (const wv of waves) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const u = x / w;
        const env = Math.sin(Math.PI * u);          // taper at both edges
        const y = mid + Math.sin(u * Math.PI * 2 * wv.freq + t * wv.speed) * wv.amp * h * env
                      * (0.8 + 0.2 * Math.sin(t * .5 + wv.freq));
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = wv.color; ctx.lineWidth = 2; ctx.stroke();
    }
  };
  const loop = () => { if (visible) { t += 0.016; draw(); } requestAnimationFrame(loop); };
  size(); addEventListener("resize", size);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
  reduce ? draw() : loop();
})();
