export function playRollSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const notes = [880, 1174.66, 1567.98];

    notes.forEach((frequency, index) => {
      const start = audio.currentTime + index * 0.07;
      const gain = audio.createGain();
      const oscillator = audio.createOscillator();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.1);
    });
  } catch (err) {
    console.warn('Audio playback not supported:', err);
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
