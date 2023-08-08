const ctx = new (window.AudioContext || window.webkitAudioContext)();

let env = null;
let maxGain = 0.5

const keyFrequencies = {
  "C": 261.63,
  "Csharp": 277.18,
  "D": 293.66,
  "Dsharp": 311.13,
  "E": 329.63,
  "F": 349.23,
  "Fsharp": 369.99,
  "G": 392.00,
  "Gsharp": 415.30,
  "A": 440.00,
  "Asharp": 466.16,
  "B": 493.88,
  "C2": 523.25,
  "Csharp2": 554.37,
  "D2": 587.33,
  "Dsharp2": 622.25,
  "E2": 659.25,
  "F2": 698.46,
  "Fsharp2": 739.99,
  "G2": 783.99,
  "Gsharp2": 830.61,
  "A2": 880.00,
  "Asharp2": 932.33,
  "B2": 987.77
};


function play(freq) {
  const attack = parseFloat(document.getElementById('att').value);
  const decay = parseFloat(document.getElementById('dec').value);
  const sustainLevel = parseFloat(document.getElementById('suslevel').value);
  const release = parseFloat(document.getElementById('rel').value);

  const sineLevel = parseFloat(document.getElementById('sineLevel').value);
  const squareLevel = parseFloat(document.getElementById('squareLevel').value);
  const triangleLevel = parseFloat(document.getElementById('triangleLevel').value);
  const sawLevel = parseFloat(document.getElementById('sawLevel').value);

  const detuneSine = parseFloat(document.getElementById('detuneSine').value);
  const detuneSquare = parseFloat(document.getElementById('detuneSquare').value);
  const detuneTriangle = parseFloat(document.getElementById('detuneTriangle').value);
  const detuneSaw = parseFloat(document.getElementById('detuneSaw').value);

  const dt = parseFloat(document.getElementById('delayTime').value);
  const df = parseFloat(document.getElementById('delayFeedback').value);

  const oscillatorCount = 4; // Number of oscillators
  const oscillators = [];
  const gains = [];

  // Create ADSR envelope
  env = ctx.createGain();
  env.gain.setValueAtTime(0, ctx.currentTime);
  env.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + attack);
  env.gain.exponentialRampToValueAtTime(sustainLevel * maxGain, ctx.currentTime + attack + decay);
  env.gain.setValueAtTime(sustainLevel * maxGain, ctx.currentTime + attack + decay);


  // Create a DelayNode
  const delay = ctx.createDelay();
  delay.delayTime.value = dt; // Default delay time in seconds (500ms)

  // Create a GainNode for the feedback
  const feedbackGain = ctx.createGain();
  feedbackGain.gain.value = df; // Default feedback level (30%)

  // Connect the nodes for the delay feedback loop
  delay.connect(feedbackGain);
  feedbackGain.connect(delay);

  // Connect the feedback loop to the destination
  delay.connect(ctx.destination);

  env.connect(delay);

  env.connect(ctx.destination);

  // Create and connect oscillators and gains
  for (let i = 0; i < oscillatorCount; i++) {
    const oscillator = ctx.createOscillator();

    const gainNode = ctx.createGain();
    gainNode.gain.value = i === 0 ? sineLevel * maxGain : (i === 1 ? squareLevel * maxGain : (i === 2 ? triangleLevel * maxGain : sawLevel * maxGain));
    oscillator.type = i === 0 ? 'sine' : (i === 1 ? 'square' : (i === 2 ? 'triangle' : 'sawtooth'));
    oscillator.frequency.value = i === 0 ? freq + detuneSine : (i === 1 ? freq + detuneSquare : (i === 2 ? freq + detuneTriangle : freq + detuneSaw));

    oscillator.connect(gainNode);

    // Connect gain node to envelope
    gainNode.connect(env);

    oscillators.push(oscillator);
    gains.push(gainNode);

    oscillator.start();
  }

}

function release() {
  const attack = parseFloat(document.getElementById('att').value);
  const decay = parseFloat(document.getElementById('dec').value);
  const sustainLevel = parseFloat(document.getElementById('suslevel').value);
  const release = parseFloat(document.getElementById('rel').value);

  if (env) {
    if (env.gain.value == sustainLevel * maxGain) {
      env.gain.setValueAtTime(sustainLevel * maxGain, ctx.currentTime);
    }

    env.gain.linearRampToValueAtTime(0, ctx.currentTime + attack + decay + release);
    env = null; // Reset envelope
  }
}

function stop() {
  if (env) {
    env.gain.cancelScheduledValues(ctx.currentTime);
    env.gain.setValueAtTime(env.gain.value, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1); // Fast release
    env = null;
  }
}