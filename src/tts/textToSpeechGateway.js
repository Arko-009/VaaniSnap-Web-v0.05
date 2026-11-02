// Web Speech Synthesis Gateway
// Mirrors AndroidTextToSpeechGateway with native accent matching and utterance tracking

export class WebTextToSpeechGateway {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isSpeaking = false;

    this.onStateChange = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getVoiceForLanguage(locale) {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const cleanLocale = locale.toLowerCase().replace("_", "-");
    const langPrefix = cleanLocale.split("-")[0];

    // 1. Exact match (e.g., 'hi-in')
    let match = this.voices.find((v) => v.lang.toLowerCase().replace("_", "-") === cleanLocale);
    if (match) return match;

    // 2. Prefix match (e.g., 'hi')
    match = this.voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (match) return match;

    // 3. Fallback
    return null;
  }

  speak(text, language) {
    if (!this.synth) {
      this.notifyState("error", "Speech synthesis is not supported on this browser.");
      return;
    }

    // Stop ongoing speech
    this.stop();

    if (!text || !text.trim()) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = language.locale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voice = this.getVoiceForLanguage(language.locale);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentUtterance = utterance;
        this.notifyState("speaking", { languageName: language.name });
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.notifyState("idle");
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        // Ignore canceled errors triggered by user pressing stop
        if (event.error !== "canceled" && event.error !== "interrupted") {
          this.notifyState("error", `Voice output issue: ${event.error}`);
        } else {
          this.notifyState("idle");
        }
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis failed:", err);
      this.isSpeaking = false;
      this.notifyState("error", "Unable to speak translated text.");
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notifyState("idle");
  }

  notifyState(state, data = {}) {
    if (this.onStateChange) {
      this.onStateChange({ state, ...data });
    }
  }
}
