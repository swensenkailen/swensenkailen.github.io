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

// Hero video — the poster frame shows immediately; the video itself only
// loads on larger screens without reduced-motion or data-saver, and pauses
// when scrolled out of view.
(() => {
  const v = document.querySelector(".hero-video");
  if (!v) return;
  const skip = matchMedia("(prefers-reduced-motion: reduce), (max-width: 640px)").matches
            || navigator.connection?.saveData;
  if (skip) return;
  for (const [type, src] of [["video/webm", v.dataset.webm], ["video/mp4", v.dataset.mp4]]) {
    const s = document.createElement("source"); s.type = type; s.src = src; v.append(s);
  }
  v.load();
  new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())).observe(v);
})();
