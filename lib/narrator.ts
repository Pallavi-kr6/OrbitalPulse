type QueueItem = { text: string; priority: boolean; pauseMs?: number };

class Narrator {
  private static instance: Narrator;
  private queue: QueueItem[] = [];
  private speaking: boolean = false;
  private isMuted: boolean = false;
  private isPaused: boolean = false;
  private currentText: string = "";
  private spokenEvents = new Set<string>();
  private isSupported: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  private waitingForInteraction = false;
  private interactionUnlocked = false;

  private listeners = new Set<() => void>();

  private introductions: Record<string, string> = {
    landing: "Welcome to OrbitalPulse, your living window into the sky above. Here, we bridge the gap between Earth and orbit, monitoring everything from the ISS cruising overhead to solar storms and weather conditions right in your backyard. Explore our live tracking globe, search for active satellites, or run a personalized scan of your sky to see the cosmos in action.",
    dashboard: "Welcome to your personal sky dashboard. Here is what we are tracking for you right now: In the center, our orbital globe maps satellites passing directly above your local coordinates. To your right, the Sky Observation Score grades your current viewing conditions, taking into account clouds, light pollution, and moon phase. Below it, the Space Weather panel tracks solar wind and geomagnetic Kp indices—vital for predicting auroras and satellite disruptions. Further down, the ISS Compass acts as your pointer, showing exactly which direction to look to spot the International Space Station, along with the precise times of its upcoming passes.",
    globe: "Welcome to Orbital Pulse Mission Control. You are viewing a real-time simulation of Earth's orbital space. Every moving beacon represents an active spacecraft traveling at thousands of kilometers per hour. You can rotate and zoom this globe to survey space traffic, or click on any satellite path to identify its mission—whether it's the ISS laboratory or a Starlink communications node.",
    explorer: "Welcome to the Satellite Database and Explorer. This interface allows you to search and filter through thousands of active payloads in orbit. Use the search bar to locate specific spacecraft, or filter by constellations like Starlink. Hovering or selecting any satellite in the list will reveal its telemetry, including altitude, speed, and real-time path.",
  };

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

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  private dequeue() {
    if (this.speaking || this.isMuted || !this.isSupported || this.waitingForInteraction) return;
    const next = this.queue.shift();
    if (!next) return;

    this.speaking = true;
    this.isPaused = false;
    this.currentText = next.text;
    this.notifyListeners();

    // Handle cinematic pause
    if (next.text === '' && next.pauseMs) {
      setTimeout(() => {
        this.speaking = false;
        this.currentText = "";
        this.notifyListeners();
        this.dequeue();
      }, next.pauseMs);
      return;
    }

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
        this.currentText = "";
        this.waitingForInteraction = true;
        this.notifyListeners();
      }
    }, 500);

    utter.onstart = () => {
      started = true;
      clearTimeout(startTimeout);
      this.speaking = true;
      this.isPaused = false;
      this.currentText = next.text;
      this.notifyListeners();
    };

    utter.onend = () => {
      started = true;
      clearTimeout(startTimeout);
      this.speaking = false;
      this.currentText = "";
      this.notifyListeners();
      this.dequeue();
    };

    utter.onerror = (e) => {
      started = true;
      clearTimeout(startTimeout);
      this.speaking = false;
      this.currentText = "";
      this.notifyListeners();

      if (e.error === 'not-allowed') {
        this.queue.unshift(next);
        this.waitingForInteraction = true;
      } else {
        this.dequeue();
      }
    };

    window.speechSynthesis.speak(utter);
  }

  private enqueue(text: string, priority: boolean = false, pauseMs?: number) {
    if (!this.isSupported) {
      if (text) console.log('[Narrator]', text);
      return;
    }
    const item: QueueItem = { text, priority, pauseMs };
    if (priority) {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }
    
    // Safety check: sometimes the browser leaves speechSynthesis.speaking true incorrectly
    if (this.speaking && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      this.speaking = false;
      this.currentText = "";
      this.notifyListeners();
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

  pause(ms: number) {
    this.enqueue('', false, ms);
  }

  pauseSpeech() {
    if (this.isSupported && this.speaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notifyListeners();
    }
  }

  resumeSpeech() {
    if (this.isSupported && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notifyListeners();
    }
  }

  mute() {
    this.isMuted = true;
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
    this.speaking = false;
    this.isPaused = false;
    this.currentText = "";
    this.notifyListeners();
  }

  unmute() {
    this.isMuted = false;
    this.notifyListeners();
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
    this.isPaused = false;
    this.currentText = "";
    this.notifyListeners();
  }

  announcePage(pageId: string) {
    // Normalise pathname routes to key IDs
    let key = pageId;
    if (key === "/" || key === "landing") key = "landing";
    else if (key === "/dashboard") key = "dashboard";
    else if (key === "/globe") key = "globe";
    else if (key === "/explorer" || key === "satellite_explorer") key = "explorer";

    const msg = this.introductions[key];
    if (msg) {
      this.speakOnce(`page_${key}`, msg, true);
    }
  }

  replay(pageId: string) {
    this.stop();

    // Normalise pathname routes to key IDs
    let key = pageId;
    if (key === "/" || key === "landing") key = "landing";
    else if (key === "/dashboard") key = "dashboard";
    else if (key === "/globe") key = "globe";
    else if (key === "/explorer" || key === "satellite_explorer") key = "explorer";

    if (key === "globe") {
      // Clear all globe intro event keys to allow replay
      this.spokenEvents.delete("globe_intro_1");
      this.spokenEvents.delete("globe_intro_2");
      this.spokenEvents.delete("globe_intro_3");
      this.spokenEvents.delete("globe_intro_4");
      this.spokenEvents.delete("globe_intro_5");
      this.spokenEvents.delete("globe_intro_6");
      this.spokenEvents.delete("globe_weather_high");
      this.spokenEvents.delete("globe_weather_low");

      // Enqueue the globe intro sequence
      this.speakOnce("globe_intro_1", "Welcome to Orbital Pulse Mission Control.", true);
      this.pause(1500);
      this.speakOnce("globe_intro_2", "You are currently viewing Earth from orbit. Every moving point around the globe represents a real object being tracked in space at this moment.");
      this.pause(1500);
      this.speakOnce("globe_intro_3", "Our network is monitoring thousands of satellites, scientific missions, and pieces of orbital debris traveling around the planet.");
      this.pause(1500);
      this.speakOnce("globe_intro_4", "Different orbital regions serve different purposes. Low Earth orbit hosts spacecraft such as the International Space Station, while higher orbits support navigation, communications, and Earth observation systems.");
      this.pause(1500);
      this.speakOnce("globe_intro_5", "The telemetry panel provides live space weather and solar activity data, while the satellite panels display active objects currently visible within the simulation.");
      this.pause(1500);
      this.speakOnce("globe_intro_6", "Rotate the globe to explore Earth's orbital environment. Select any satellite to learn its mission, altitude, speed, and purpose.");
    } else {
      this.spokenEvents.delete(`page_${key}`);
      this.announcePage(key);
    }
  }

  announceEvent(event: string, priority: boolean = false) {
    this.enqueue(event, priority);
  }

  getMuted() {
    return this.isMuted;
  }

  getSpeaking() {
    return this.speaking;
  }

  getPaused() {
    return this.isPaused;
  }

  getCurrentText() {
    return this.currentText;
  }

  getSupported() {
    return this.isSupported;
  }
}

export default Narrator.getInstance();
