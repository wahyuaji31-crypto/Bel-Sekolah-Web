/**
 * Audio Engine: Web Audio API Bell Synthesizer & Speech Synthesis (TTS)
 */
class BellAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.9;
    this.isAudioUnlocked = false;
    this.ttsEnabled = true;
    this.selectedVoice = null;
    this.customAudioMap = {}; // id -> audio object

    this.initVoices();
  }

  // Ensure AudioContext is created & resumed upon user interaction
  initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isAudioUnlocked = true;
    return this.ctx;
  }

  initVoices() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Cari suara bahasa Indonesia terlebih dahulu
        this.selectedVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID')) ||
                             voices.find(v => v.lang.startsWith('en')) ||
                             voices[0];
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, parseFloat(vol)));
  }

  // Helper to play a single synthesized tone with realistic metallic bell envelope and harmonics
  playBellTone(freq, startTime, duration = 1.8, gainVal = 0.5) {
    if (!this.ctx) this.initAudioContext();
    const ctx = this.ctx;

    const mainGain = ctx.createGain();
    mainGain.connect(ctx.destination);
    
    // Envelope
    const effectiveGain = gainVal * this.masterVolume;
    mainGain.gain.setValueAtTime(0.0001, startTime);
    mainGain.gain.exponentialRampToValueAtTime(effectiveGain, startTime + 0.015);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Fundamental and metallic overtones for authentic bell timbre
    const harmonics = [
      { ratio: 1.0,  gain: 1.0 },
      { ratio: 2.0,  gain: 0.5 },
      { ratio: 2.76, gain: 0.35 },
      { ratio: 3.4,  gain: 0.2 },
      { ratio: 4.15, gain: 0.15 }
    ];

    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const hGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.ratio, startTime);

      hGain.gain.setValueAtTime(h.gain, startTime);
      hGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * (1 / (h.ratio * 0.5 + 0.5)));

      osc.connect(hGain);
      hGain.connect(mainGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }

  // 1. Westminster Quarters (Big Ben / Classic School Chimes)
  playWestminster() {
    this.initAudioContext();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;
    
    // Notes frequency: G#4 (415.3), F#4 (369.99), E4 (329.63), B3 (246.94)
    const Gs4 = 415.30;
    const Fs4 = 369.99;
    const E4 = 329.63;
    const B3 = 246.94;

    // Phrase 1: E4, G#4, F#4, B3
    // Phrase 2: E4, F#4, G#4, E4
    const sequence = [
      { note: E4,  delay: 0.0 },
      { note: Gs4, delay: 0.7 },
      { note: Fs4, delay: 1.4 },
      { note: B3,  delay: 2.1 },
      
      { note: E4,  delay: 3.2 },
      { note: Fs4, delay: 3.9 },
      { note: Gs4, delay: 4.6 },
      { note: E4,  delay: 5.3 }
    ];

    sequence.forEach(item => {
      this.playBellTone(item.note, now + item.delay, 2.0, 0.45);
    });

    return 6.5 * 1000; // Total duration in ms
  }

  // 2. Modern 3-Tone Chime
  play3Tone() {
    this.initAudioContext();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    // Do - Mi - Sol (C5, E5, G5, C6)
    const C5 = 523.25;
    const E5 = 659.25;
    const G5 = 783.99;
    const C6 = 1046.50;

    const sequence = [
      { note: C5, delay: 0.0 },
      { note: E5, delay: 0.4 },
      { note: G5, delay: 0.8 },
      { note: C6, delay: 1.2 }
    ];

    sequence.forEach(item => {
      this.playBellTone(item.note, now + item.delay, 1.8, 0.5);
    });

    return 2.5 * 1000;
  }

  // 3. Ding Dong Airport / Announce Chime
  playDingDong() {
    this.initAudioContext();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    const F5 = 698.46;
    const C5 = 523.25;

    this.playBellTone(F5, now, 1.6, 0.5);
    this.playBellTone(C5, now + 0.6, 2.0, 0.55);

    return 2.2 * 1000;
  }

  // 4. Electric Rapid Bell (Lonceng Listrik Kring)
  playElectricBell(rings = 18, duration = 3.5) {
    this.initAudioContext();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    const mainGain = ctx.createGain();
    mainGain.connect(ctx.destination);
    mainGain.gain.setValueAtTime(this.masterVolume * 0.6, now);

    const interval = duration / rings;
    for (let i = 0; i < rings; i++) {
      const strikeTime = now + (i * interval);
      this.playBellTone(880, strikeTime, 0.15, 0.4);
      this.playBellTone(1760, strikeTime, 0.12, 0.25);
    }

    return duration * 1000;
  }

  // 5. Sirine Darurat / Evakuasi
  playSiren(cycles = 3) {
    this.initAudioContext();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, now);

    const cycleDuration = 1.2;
    for (let c = 0; c < cycles; c++) {
      const t = now + (c * cycleDuration);
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.linearRampToValueAtTime(900, t + cycleDuration * 0.5);
      osc.frequency.linearRampToValueAtTime(450, t + cycleDuration);
    }

    gain.gain.setValueAtTime(this.masterVolume * 0.4, now + (cycles * cycleDuration) - 0.1);
    gain.gain.linearRampToValueAtTime(0.0001, now + (cycles * cycleDuration));

    osc.connect(gain);
    osc.start(now);
    osc.stop(now + (cycles * cycleDuration) + 0.1);

    return (cycles * cycleDuration) * 1000;
  }

  // 6. Text to Speech Announcement
  speak(text, delayMs = 0) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window) || !text || text.trim() === '') {
        resolve();
        return;
      }

      setTimeout(() => {
        try {
          window.speechSynthesis.cancel(); // cancel previous active speech
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.volume = this.masterVolume;
          utterance.rate = 0.95; // Sedikit lebih lambat & artikulatif
          utterance.pitch = 1.05;

          if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
          }

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('TTS Error:', e);
          resolve();
        }
      }, delayMs);
    });
  }

  // Play full bell action (Chime tone + optional TTS message)
  async ring({ toneType = 'westminster', announcement = '', customAudioUrl = null }) {
    this.initAudioContext();
    let chimeDuration = 2000;

    if (customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.volume = this.masterVolume;
        await audio.play();
        chimeDuration = (audio.duration || 3) * 1000;
      } catch (e) {
        console.warn('Custom audio playback failed, falling back to synthesizer:', e);
        chimeDuration = this.playChimeByType(toneType);
      }
    } else {
      chimeDuration = this.playChimeByType(toneType);
    }

    // Beri jeda sedikit setelah nada lonceng sebelum suara pengumuman berbicara
    if (this.ttsEnabled && announcement && announcement.trim() !== '') {
      await this.speak(announcement, chimeDuration > 1000 ? chimeDuration - 300 : chimeDuration);
    }
  }

  playChimeByType(toneType) {
    switch (toneType) {
      case 'westminster':
        return this.playWestminster();
      case '3tone':
        return this.play3Tone();
      case 'dingdong':
        return this.playDingDong();
      case 'electric':
        return this.playElectricBell();
      case 'siren':
        return this.playSiren();
      default:
        return this.playWestminster();
    }
  }
}

window.bellAudio = new BellAudioEngine();
