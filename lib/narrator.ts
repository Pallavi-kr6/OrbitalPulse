type QueueItem = { text: string; priority: boolean };

class Narrator {
  private static instance: Narrator;
  private queue: QueueItem[] = [];
  private speaking: boolean = false;
  private isMuted: boolean = false;
  private spokenPages = new Set<string>();
  private isSupported: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;

  private constructor() {}

  static getInstance(): Narrator {
    if (!Narrator.instance) {
      Narrator.instance = new Narrator();
    }
    return Narrator.instance;
  }

  private dequeue() {
    if (this.speaking || this.isMuted || !this.isSupported) return;
    const next = this.queue.shift();
    if (!next) return;
    this.speaking = true;
    const utter = new SpeechSynthesisUtterance(next.text);
    utter.rate = 0.9;
    utter.pitch = 0.95;
    utter.onend = () => {
      this.speaking = false;
      this.dequeue();
    };
    utter.onerror = () => {
      this.speaking = false;
      this.dequeue();
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
    this.dequeue();
  }

  speak(text: string) {
    this.enqueue(text, false);
  }

  speakPriority(text: string) {
    this.enqueue(text, true);
  }

  mute() {
    this.isMuted = true;
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  unmute() {
    this.isMuted = false;
  }

  stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.speaking = false;
  }

  announcePage(pageId: string) {
    if (this.spokenPages.has(pageId)) return;
    this.spokenPages.add(pageId);
    const introductions: Record<string, string> = {
      landing: "Welcome to Orbital Pulse. Your real-time operating system for the sky above you. We analyze visibility conditions, track satellites, monitor solar weather, and explain what is happening overhead right now.",
      dashboard: "I'm now monitoring your local sky conditions. Below you'll find visibility analysis, satellite activity, space weather information, and live orbital telemetry.",
      globe: "This globe displays real-time orbital activity around Earth. Watch satellites move across the planet and explore current space traffic.",
      iss_compass: "The ISS Compass helps you locate the International Space Station relative to your current position.",
      solar_weather: "This section monitors solar activity and geomagnetic conditions that may affect satellites, communications, and GPS systems.",
      satellite_explorer: "Satellite Explorer allows you to browse active satellites currently orbiting Earth.",
    };
    const msg = introductions[pageId];
    if (msg) this.speakPriority(msg);
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
