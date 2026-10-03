// Web synth: four detunable oscillators (sine/square/triangle/saw) through an
// ADSR envelope into a shared feedback delay. The audio context is created on
// the first key press, as browsers require.
(() => {
  const root = document.getElementById("synth");
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const val = (id) => parseFloat($(id).value);
  const MAX = 0.3;
  const WAVES = ["sine", "square", "triangle", "sawtooth"];
  const LEVEL = ["sineLevel", "squareLevel", "triangleLevel", "sawLevel"];
  const DETUNE = ["detuneSine", "detuneSquare", "detuneTriangle", "detuneSaw"];

  let ctx, out, delay, fb;
  const voices = new Map();

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createGain(); out.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    out.connect(comp).connect(ctx.destination);
    delay = ctx.createDelay(2); fb = ctx.createGain();
    delay.connect(fb).connect(delay);
    delay.connect(comp);
    updateDelay();
  }
  function updateDelay() {
    if (!ctx) return;
    delay.delayTime.setTargetAtTime(val("delayTime"), ctx.currentTime, 0.02);
    fb.gain.setTargetAtTime(Math.min(val("delayFeedback"), 0.9), ctx.currentTime, 0.02);
  }

  function noteOn(id, freq) {
    init();
    if (ctx.state === "suspended") ctx.resume();
    if (voices.has(id)) noteOff(id);
    const now = ctx.currentTime;
    const a = val("att"), d = val("dec"), s = val("suslevel");
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(MAX, now + Math.max(a, 0.005));
    env.gain.setTargetAtTime(s * MAX, now + Math.max(a, 0.005), Math.max(d, 0.01) / 3);
    env.connect(out); env.connect(delay);
    const oscs = WAVES.map((type, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = val(DETUNE[i]);
      g.gain.value = val(LEVEL[i]);
      o.connect(g).connect(env); o.start(now);
      return o;
    });
    voices.set(id, { env, oscs });
  }

  function noteOff(id) {
    const v = voices.get(id);
    if (!v) return;
    voices.delete(id);
    const now = ctx.currentTime, r = Math.max(val("rel"), 0.01);
    v.env.gain.cancelScheduledValues(now);
    v.env.gain.setValueAtTime(v.env.gain.value, now);
    v.env.gain.setTargetAtTime(0, now, r / 3);
    v.oscs.forEach((o) => o.stop(now + r * 2 + 0.05));   // free the voice
    setTimeout(() => v.env.disconnect(), (r * 2 + 0.2) * 1000);
  }

  // Slider read-outs
  root.querySelectorAll("input[type=range]").forEach((inp) => {
    const o = inp.parentElement.querySelector("output");
    const show = () => (o.textContent = inp.value);
    inp.addEventListener("input", show); show();
  });
  $("delayTime").addEventListener("input", updateDelay);
  $("delayFeedback").addEventListener("input", updateDelay);

  // Keys — pointer (mouse + touch) and computer keyboard
  const piano = root.querySelector(".piano");
  const keyEls = [...piano.querySelectorAll(".key")];
  const freqOf = (el) => 261.63 * Math.pow(2, +el.dataset.n / 12);
  const press = (el) => { el.classList.add("on"); noteOn(el.dataset.n, freqOf(el)); };
  const lift = (el) => { el.classList.remove("on"); noteOff(el.dataset.n); };

  let down = null;
  piano.addEventListener("pointerdown", (e) => {
    const k = e.target.closest(".key"); if (!k) return;
    try { piano.setPointerCapture(e.pointerId); } catch {}
    down = k; press(k);
  });
  piano.addEventListener("pointermove", (e) => {
    if (!down) return;
    const k = document.elementFromPoint(e.clientX, e.clientY)?.closest(".key");
    if (k && k !== down && piano.contains(k)) { lift(down); down = k; press(k); }
  });
  const end = () => { if (down) { lift(down); down = null; } };
  piano.addEventListener("pointerup", end);
  piano.addEventListener("pointercancel", end);

  const MAP = "awsedftgyhujkolp;'".split("");   // two rows, C4 upward
  const byN = (n) => keyEls.find((k) => +k.dataset.n === n);
  const held = new Set();
  addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const n = MAP.indexOf(e.key.toLowerCase());
    const k = n >= 0 && byN(n);
    if (k && !held.has(n)) { held.add(n); press(k); }
  });
  addEventListener("keyup", (e) => {
    const n = MAP.indexOf(e.key.toLowerCase());
    if (held.delete(n)) lift(byN(n));
  });
  addEventListener("blur", () => { held.forEach((n) => lift(byN(n))); held.clear(); end(); });
})();
