// Web Speech Recognition Gateway with Real-Time Audio Decibel Analyzer
// Replicating Android SpeechRecognizerGateway & decibel visualization

export class WebSpeechRecognizerGateway {
  constructor() {
    this.recognition = null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.rafId = null;
    this.isListening = false;
    this.hasPermission = false;

    this.onStateChange = null;
    this.onInterimResult = null;
    this.onFinalResult = null;
    this.onRmsChange = null;
    this.onError = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;

    if (this.isSupported) {
      this.initRecognition(SpeechRecognition);
    }
  }

  initRecognition(SpeechRecognitionClass) {
    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyState("listening");
        this.startAudioAnalyzer();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript && this.onInterimResult) {
          this.onInterimResult(interimTranscript);
        }

        if (finalTranscript) {
          this.notifyState("processing");
          if (this.onFinalResult) {
            this.onFinalResult(finalTranscript.trim());
          }
        }
      };

      this.recognition.onerror = (event) => {
        let message = "Speech recognition encountered an issue.";
        if (event.error === "no-speech") {
          message = "No speech detected. Please speak into your microphone.";
        } else if (event.error === "audio-capture") {
          message = "No microphone was found or microphone is muted.";
        } else if (event.error === "not-allowed") {
          message = "Microphone access was denied. Please allow microphone permissions.";
        } else if (event.error === "network") {
          message = "Network connection needed for browser speech engine.";
        }
        this.stopAudioAnalyzer();
        this.isListening = false;
        this.notifyState("error", message);
        if (this.onError) {
          this.onError(message);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.stopAudioAnalyzer();
        this.notifyState("idle");
      };
    } catch (err) {
      console.warn("SpeechRecognition initialization failed:", err);
      this.isSupported = false;
    }
  }

  async startListening(languageTag, languageName, onFinalResult) {
    this.onFinalResult = onFinalResult;

    if (!this.isSupported) {
      const msg = "Web Speech Recognition is not supported on this browser (Chrome, Edge, or Safari recommended).";
      if (this.onError) this.onError(msg);
      this.notifyState("error", msg);
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.lang = languageTag;
        this.recognition.start();
        return true;
      }
    } catch (err) {
      // If already started or aborting
      if (err.name === "InvalidStateError") {
        try {
          this.recognition.stop();
          setTimeout(() => {
            if (this.recognition) {
              this.recognition.lang = languageTag;
              this.recognition.start();
            }
          }, 150);
          return true;
        } catch (inner) {
          console.error("Retry start failed:", inner);
        }
      }
      this.notifyState("error", err.message || "Failed to start microphone.");
      return false;
    }
    return false;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.notifyState("processing");
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Stop recognition error:", e);
      }
    }
    this.stopAudioAnalyzer();
  }

  cancelListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn("Abort recognition error:", e);
      }
    }
    this.isListening = false;
    this.stopAudioAnalyzer();
    this.notifyState("idle");
  }

  async startAudioAnalyzer() {
    try {
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.hasPermission = true;
      }

      if (!this.audioContext || this.audioContext.state === "closed") {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      } else if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.5;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!this.isListening) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map average (0 - 255) to decibel level (0 to 10)
        const rmsDb = Math.min(10, Math.max(0, (average / 25.5)));

        if (this.onRmsChange) {
          this.onRmsChange(rmsDb);
        }

        this.rafId = requestAnimationFrame(updateMeter);
      };

      this.rafId = requestAnimationFrame(updateMeter);
    } catch (err) {
      // Audio analyzer is an enhancement; if denied or fails, fallback to animated oscillation
      console.info("Web Audio decibel meter bypassed:", err.message);
      this.simulateDecibels();
    }
  }

  simulateDecibels() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    let step = 0;
    const loop = () => {
      if (!this.isListening) return;
      step += 0.2;
      const fakeRms = 3 + Math.sin(step) * 3 + Math.random() * 2;
      if (this.onRmsChange) {
        this.onRmsChange(Math.max(1, Math.min(9, fakeRms)));
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stopAudioAnalyzer() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.onRmsChange) {
      this.onRmsChange(0);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }

  notifyState(state, message = "") {
    if (this.onStateChange) {
      this.onStateChange({ state, message });
    }
  }
}
