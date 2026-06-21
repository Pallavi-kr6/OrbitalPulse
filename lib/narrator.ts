type QueueItem = { text: string; priority: boolean };

class Narrator {
  private static instance: Narrator;
  private queue: QueueItem[] = [];
  private speaking: boolean = false;
  private isMuted: boolean = false;
  private spokenEvents = new Set<string>();
  private isSupported: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  private waitingForInteraction = false;
  private interactionUnlocked = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const handleInteraction = () => {
        if (this.interactionUnlocked) return;
        this.interactionUnlocked = true;

        // Try unlocking speech engine silently
        if (this.isSupported) {
          const unlockUtter = new SpeechSynthesisUtterance('');
          unlockUtter.volume = 0;
          window.speechSynthesis.speak(unlockUtter);
        }

        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('pointerdown', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);

        if (this.waitingForInteraction) {
          this.waitingForInteraction = false;
          if (!this.speaking && this.queue.length > 0) {
            this.dequeue();
          }
        }
      };

      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('pointerdown', handleInteraction, { once: true });
      window.addEventListener('keydown', handleInteraction, { once: true });
    }
  }

  static getInstance(): Narrator {
    if (!Narrator.instance) {
      Narrator.instance = new Narrator();
    }
    return Narrator.instance;
  }

  private dequeue() {
    if (this.speaking || this.isMuted || !this.isSupported || this.waitingForInteraction) return;
    const next = this.queue.shift();
    if (!next) return;

    this.speaking = true;
    const utter = new SpeechSynthesisUtterance(next.text);
    utter.rate = 0.9;
    utter.pitch = 0.95;

    let started = false;
    let startTimeout: number;

    // Detect if blocked by autoplay policy
    startTimeout = window.setTimeout(() => {
      if (!started && !this.interactionUnlocked) {
        window.speechSynthesis.cancel();
        this.queue.unshift(next);
        this.speaking = false;
        this.waitingForInteraction = true;
      }
    }, 500);

    utter.onstart = () => {
      started = true;
      clearTimeout(startTimeout);
    };

    utter.onend = () => {
      started = true;
      clearTimeout(startTimeout);
      this.speaking = false;
      this.dequeue();
    };

    utter.onerror = (e) => {
      started = true;
      clearTimeout(startTimeout);
      this.speaking = false;

      if (e.error === 'not-allowed') {
        this.queue.unshift(next);
        this.waitingForInteraction = true;
      } else {
        this.dequeue();
      }
    };

    window.speechSynthesis.speak(utter);
  }

  private enqueue(text: string, priority: boolean = false) {
    if (!this.isSupported) {
      console.log('[Narrator]', text);
      return;
    }
    const item: QueueItem = { text, priority };
    if (priority) {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }
    
    // Safety check: sometimes the browser leaves speechSynthesis.speaking true incorrectly
    if (this.speaking && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      this.speaking = false;
    }
    
    this.dequeue();
  }

  speak(text: string) {
    this.enqueue(text, false);
  }

  speakPriority(text: string) {
    this.enqueue(text, true);
  }

  speakOnce(eventId: string, text: string, priority: boolean = false) {
    if (this.spokenEvents.has(eventId)) return;
    this.spokenEvents.add(eventId);
    this.enqueue(text, priority);
  }

  mute() {
    this.isMuted = true;
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  unmute() {
    this.isMuted = false;
    if (!this.speaking && this.queue.length > 0) {
       this.dequeue();
    }
  }

  stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.speaking = false;
  }

  announcePage(pageId: string) {
    const introductions: Record<string, string> = {
      landing: "Welcome to Orbital Pulse. Your real-time operating system for the sky above you. We analyze visibility conditions, track satellites, monitor solar weather, and explain what is happening overhead right now.",
      dashboard: "I'm now monitoring your local sky conditions. Below you'll find visibility analysis, satellite activity, space weather information, and live orbital telemetry.",
      globe: "This globe displays real-time orbital activity around Earth. Watch satellites move across the planet and explore current space traffic.",
      iss_compass: "The ISS Compass helps you locate the International Space Station relative to your current position.",
      solar_weather: "This section monitors solar activity and geomagnetic conditions that may affect satellites, communications, and GPS systems.",
      satellite_explorer: "Satellite Explorer allows you to browse active satellites currently orbiting Earth.",
    };
    const msg = introductions[pageId];
    if (msg) {
      this.speakOnce(`page_${pageId}`, msg, true);
    }
  }

  announceEvent(event: string, priority: boolean = false) {
    this.enqueue(event, priority);
  }

  getMuted() {
    return this.isMuted;
  }

  getSupported() {
    return this.isSupported;
  }
}

export default Narrator.getInstance();
