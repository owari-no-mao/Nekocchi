// Retro 8-bit & synthesized audio engine using the Web Audio API

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Classic Tamagotchi Button Select (High crisp square wave blip)
  public playSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  }

  // Menu Confirm (Happy ascending two-note chirp)
  public playConfirm() {
    const ctx = this.getContext();
    if (!ctx) return;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const t = ctx.currentTime;
    playTone(1046.5, t, 0.06); // C6
    playTone(1567.98, t + 0.07, 0.1); // G6
  }

  // Cancel / Back (Descending pitch)
  public playCancel() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.085);
  }

  // Cat Meow synthesizer (Formant swept frequency)
  public playMeow(variant: 'kitten' | 'happy' | 'sleepy' | 'hungry' = 'happy') {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    if (variant === 'kitten') {
      // High pitch quick peep meow
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(1320, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.22);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (variant === 'sleepy') {
      // Low gentle mrrow
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.35);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (variant === 'hungry') {
      // Urging mrow-mrow
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.28);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.13, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else {
      // Standard happy meow!
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.28);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  }

  // Purring sound effect (Low rumble frequency modulation)
  public playPurr() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 65; // deep purr

    lfo.type = 'sine';
    lfo.frequency.value = 24; // fast flutter
    lfoGain.gain.value = 18;

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.52);
    osc.stop(now + 0.52);
  }

  // Munching / eating crunch
  public playEat() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const crunch = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.04);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.045);
    };

    crunch(now, 500);
    crunch(now + 0.08, 420);
    crunch(now + 0.16, 580);
  }

  // Water flush / cleaning broom sound
  public playClean() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startF = 400 + i * 150;
      osc.frequency.setValueAtTime(startF, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(startF * 1.6, now + (i + 1) * 0.05);
      gain.gain.setValueAtTime(0.08, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + (i + 1) * 0.05);
    }
  }

  // Soft brush / grooming rustle
  public playBrush() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Egg Tap
  public playEggTap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Hatching chime
  public playHatch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Evolution Celebration Fanfare (Epic 8-bit victory fanfare!)
  public playEvolutionFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Melody: C5, E5, G5, C6, G5, C6 (extended sustain)
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.18 },
      { f: 880.0, d: 0.12 },
      { f: 1046.5, d: 0.4 },
    ];

    let curr = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, curr);
      gain.gain.setValueAtTime(0.12, curr);
      gain.gain.exponentialRampToValueAtTime(0.001, curr + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(curr);
      osc.stop(curr + note.d);
      curr += note.d + 0.03;
    });
  }

  // Sick warning beep
  public playSickWarning() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const playLow = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, time);
      gain.gain.setValueAtTime(0.09, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.16);
    };

    playLow(now);
    playLow(now + 0.18);
  }

  // Mini-game point chime
  public playMiniGameScore() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.linearRampToValueAtTime(1318.51, now + 0.07); // E6
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }
}

export const soundManager = new SoundEffectsManager();
