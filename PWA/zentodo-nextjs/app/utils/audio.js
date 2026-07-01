let audioCtx = null;
let rainSource = null;
let rainFilter = null;
let noiseSource = null;
let noiseFilter = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const createNoiseBuffer = (ctx) => {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

export const playRain = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    if (rainSource) return;
    rainSource = ctx.createBufferSource();
    rainSource.buffer = createNoiseBuffer(ctx);
    rainSource.loop = true;
    rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 750;
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 150;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.25;
    rainSource.connect(rainFilter);
    rainFilter.connect(hpFilter);
    hpFilter.connect(gainNode);
    gainNode.connect(ctx.destination);
    rainSource.start(0);
  } catch (error) {
    console.error('Failed to start rain ambient sound:', error);
  }
};

export const stopRain = () => {
  if (rainSource) {
    try { rainSource.stop(); } catch (e) {}
    rainSource = null;
    rainFilter = null;
  }
};

export const playWhiteNoise = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    if (noiseSource) return;
    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx);
    noiseSource.loop = true;
    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 0.5;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start(0);
  } catch (error) {
    console.error('Failed to start white noise sound:', error);
  }
};

export const stopWhiteNoise = () => {
  if (noiseSource) {
    try { noiseSource.stop(); } catch (e) {}
    noiseSource = null;
    noiseFilter = null;
  }
};

let forestSource = null;
let forestOsc = null;

export const playForest = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    if (forestSource) return;
    forestSource = ctx.createBufferSource();
    forestSource.buffer = createNoiseBuffer(ctx);
    forestSource.loop = true;
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.value = 400;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.2;
    forestOsc = ctx.createOscillator();
    forestOsc.frequency.value = 0.08;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 150;
    forestOsc.connect(oscGain);
    oscGain.connect(lpFilter.frequency);
    forestSource.connect(lpFilter);
    lpFilter.connect(gainNode);
    gainNode.connect(ctx.destination);
    forestOsc.start(0);
    forestSource.start(0);
  } catch (error) {
    console.error('Failed to start forest wind sound:', error);
  }
};

export const stopForest = () => {
  if (forestSource) {
    try { forestSource.stop(); } catch (e) {}
    if (forestOsc) { try { forestOsc.stop(); } catch (e) {} }
    forestSource = null;
    forestOsc = null;
  }
};
