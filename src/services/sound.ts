import { RepPillar } from '../types';

const SOUND_STORAGE_KEY = 'ego_rep_sound_enabled';

/**
 * EGO REP — Procedural Studio Sound Engine (Web Audio API)
 * Synthesizes tactile obsidian hardware clicks, basalt monolith resonance,
 * crystalline light-beam claim sweeps, and ceremonial ascension chords.
 * Zero external audio files, zero latency, graceful fallback if AudioContext is restricted.
 */
class EgoSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SOUND_STORAGE_KEY);
        if (stored !== null) {
          this.enabled = stored === '1';
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore restricted storage
      }
    }
    if (next) {
      this.select();
    }
  }

  private ensureContext(): { ctx: AudioContext; out: GainNode } | null {
    if (!this.enabled || typeof window === 'undefined') return null;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.14;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.52;

        this.masterGain.connect(compressor);
        compressor.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.masterGain) return null;
    return { ctx: this.ctx, out: this.masterGain };
  }

  /** Helper: play a sculpted tone with exponential decay */
  private tone(
    ctx: AudioContext,
    out: AudioNode,
    opts: {
      type?: OscillatorType;
      freqStart: number;
      freqEnd?: number;
      delay?: number;
      attack?: number;
      duration: number;
      gain: number;
      filterFreq?: number;
    }
  ): void {
    const start = ctx.currentTime + (opts.delay ?? 0);
    const attack = opts.attack ?? 0.006;
    const end = start + opts.duration;

    const osc = ctx.createOscillator();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freqStart, start);
    if (opts.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), end);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(opts.gain, start + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, end);

    if (opts.filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(opts.filterFreq, start);
      osc.connect(filter);
      filter.connect(env);
    } else {
      osc.connect(env);
    }

    env.connect(out);
    osc.start(start);
    osc.stop(end + 0.02);
  }

  /** Helper: filtered noise burst for stone texture & light-beam air */
  private airSweep(
    ctx: AudioContext,
    out: AudioNode,
    opts: {
      delay?: number;
      duration: number;
      gain: number;
      freqStart: number;
      freqEnd: number;
      q?: number;
    }
  ): void {
    const start = ctx.currentTime + (opts.delay ?? 0);
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * opts.duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = opts.q ?? 2.4;
    filter.frequency.setValueAtTime(opts.freqStart, start);
    filter.frequency.exponentialRampToValueAtTime(opts.freqEnd, start + opts.duration);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(opts.gain, start + Math.min(0.04, opts.duration * 0.25));
    env.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    src.connect(filter);
    filter.connect(env);
    env.connect(out);

    src.start(start);
    src.stop(start + opts.duration + 0.02);
  }

  /** Ultra-crisp obsidian hardware micro-click */
  public tap(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    this.tone(ctx, out, {
      type: 'triangle',
      freqStart: 920,
      freqEnd: 340,
      duration: 0.032,
      attack: 0.002,
      gain: 0.12,
      filterFreq: 1800,
    });
  }

  /** Delicate crystalline glass-slate switch tick */
  public select(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 740,
      freqEnd: 880,
      duration: 0.055,
      attack: 0.003,
      gain: 0.095,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 1480,
      freqEnd: 1760,
      duration: 0.045,
      attack: 0.003,
      gain: 0.035,
    });
  }

  /** Intro ENTER cinematic arrival swell */
  public enter(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    // Deep monolith bass anchor
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 65.41,
      freqEnd: 55,
      duration: 0.95,
      attack: 0.05,
      gain: 0.28,
    });
    // Wide minor-9th studio chord shimmer (A3 - E4 - B4)
    const chord = [220, 329.63, 493.88];
    chord.forEach((freq, idx) => {
      this.tone(ctx, out, {
        type: 'triangle',
        freqStart: freq,
        delay: idx * 0.065,
        attack: 0.035,
        duration: 0.78,
        gain: 0.075,
        filterFreq: 1600,
      });
    });
    this.airSweep(ctx, out, {
      duration: 0.55,
      gain: 0.06,
      freqStart: 320,
      freqEnd: 1800,
      q: 1.8,
    });
  }

  /** Heavy basalt monolith strike + cold fissure ring */
  public strike(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    // Low stone thud
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 92,
      freqEnd: 38,
      duration: 0.24,
      attack: 0.004,
      gain: 0.3,
    });
    // Crystalline crack ring
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 1174.66, // D6
      duration: 0.34,
      attack: 0.003,
      gain: 0.06,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 1760, // A6 harmonic
      delay: 0.015,
      duration: 0.26,
      attack: 0.003,
      gain: 0.03,
    });
  }

  /** Ascending harmonic chime mapped to Execute / Growth / Obsession */
  public rep(pillar: RepPillar): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const map: Record<RepPillar, [number, number]> = {
      execute: [261.63, 392.0],   // C4 + G4
      growth: [293.66, 440.0],    // D4 + A4
      obsession: [329.63, 493.88], // E4 + B4
    };
    const [root, fifth] = map[pillar];

    this.tone(ctx, out, {
      type: 'triangle',
      freqStart: root,
      duration: 0.36,
      attack: 0.006,
      gain: 0.14,
      filterFreq: 1400,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: fifth,
      delay: 0.04,
      duration: 0.42,
      attack: 0.008,
      gain: 0.11,
    });
  }

  /** Rewarding bloom when all 3 Daily Reps complete */
  public triadComplete(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, i) => {
      this.tone(ctx, out, {
        type: 'sine',
        freqStart: freq,
        delay: i * 0.055,
        attack: 0.01,
        duration: 0.56,
        gain: 0.11,
      });
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 130.81,
      duration: 0.65,
      attack: 0.02,
      gain: 0.18,
    });
  }

  /** Signature Forge CLAIM light-beam eruption & count-up resonance */
  public claim(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    // Rising airy light beam sweep
    this.airSweep(ctx, out, {
      duration: 0.52,
      gain: 0.085,
      freqStart: 420,
      freqEnd: 3200,
      q: 2.2,
    });
    // Deep sub release
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 110,
      freqEnd: 55,
      duration: 0.55,
      attack: 0.012,
      gain: 0.24,
    });
    // Luminous ascending crystalline fifths (D4 -> A4 -> D5 -> A5)
    const arpeggio = [293.66, 440.0, 587.33, 880.0];
    arpeggio.forEach((freq, idx) => {
      this.tone(ctx, out, {
        type: idx % 2 === 0 ? 'triangle' : 'sine',
        freqStart: freq,
        delay: idx * 0.055,
        attack: 0.008,
        duration: 0.52,
        gain: 0.115 - idx * 0.012,
        filterFreq: 2600,
      });
    });
  }

  /** Heavy metallic Forge upgrade / TON boost activation lock */
  public upgrade(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    // Anvil weight anchor
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 146.83,
      freqEnd: 73.42,
      duration: 0.34,
      attack: 0.004,
      gain: 0.26,
    });
    // Precision harmonic lock
    this.tone(ctx, out, {
      type: 'triangle',
      freqStart: 440,
      delay: 0.05,
      duration: 0.38,
      attack: 0.006,
      gain: 0.12,
      filterFreq: 2100,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 659.25,
      delay: 0.11,
      duration: 0.48,
      attack: 0.008,
      gain: 0.12,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 880,
      delay: 0.17,
      duration: 0.54,
      attack: 0.008,
      gain: 0.09,
    });
  }

  /** Ceremonial Rank-Up ascension chord */
  public rankUp(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    this.airSweep(ctx, out, {
      duration: 0.75,
      gain: 0.09,
      freqStart: 280,
      freqEnd: 2600,
      q: 1.9,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 82.41,
      duration: 1.15,
      attack: 0.04,
      gain: 0.28,
    });
    const notes = [220, 329.63, 440, 493.88, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.tone(ctx, out, {
        type: 'sine',
        freqStart: freq,
        delay: idx * 0.07,
        attack: 0.015,
        duration: 0.85,
        gain: 0.1,
      });
    });
  }

  /** Clean double-chime for task claim or invite copy */
  public confirm(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 659.25,
      duration: 0.14,
      attack: 0.004,
      gain: 0.1,
    });
    this.tone(ctx, out, {
      type: 'sine',
      freqStart: 987.77,
      delay: 0.06,
      duration: 0.24,
      attack: 0.005,
      gain: 0.1,
    });
  }

  /** Muted low double-thud for errors or rejected actions */
  public error(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    this.tone(ctx, out, {
      type: 'triangle',
      freqStart: 175,
      freqEnd: 135,
      duration: 0.12,
      attack: 0.004,
      gain: 0.14,
      filterFreq: 480,
    });
    this.tone(ctx, out, {
      type: 'triangle',
      freqStart: 140,
      freqEnd: 105,
      delay: 0.11,
      duration: 0.16,
      attack: 0.004,
      gain: 0.14,
      filterFreq: 420,
    });
  }
}

export const sound = new EgoSoundEngine();
