// Jetpack Compose VaaniSnapApp UI State Controller & Web Gateway Orchestration
import { SUPPORTED_LANGUAGES, QUICK_PHRASES, SVG_FLAGS } from "../model/languages.js";
import { WebSpeechRecognizerGateway } from "../speech/speechRecognizer.js";
import { TranslationGateway } from "../translation/translationGateway.js";
import { WebTextToSpeechGateway } from "../tts/textToSpeechGateway.js";

export class AppController {
  constructor() {
    this.sourceLanguage = SUPPORTED_LANGUAGES[0]; // English
    this.targetLanguage = SUPPORTED_LANGUAGES[1]; // Hindi
    this.sourceTranscript = "";
    this.translatedText = "";
    this.speechState = "idle";
    this.translationState = "idle";
    this.ttsState = "idle";
    this.currentProfileView = "menu"; // 'menu' | 'settings' | 'about' | 'version'

    // Gateways
    this.speechGateway = new WebSpeechRecognizerGateway();
    this.translationGateway = new TranslationGateway();
    this.ttsGateway = new WebTextToSpeechGateway();

    // DOM Elements Cache
    this.elements = {};
  }

  init() {
    this.cacheDom();
    this.setupGatewayListeners();
    this.bindEvents();
    this.renderLanguageSelection();
    this.renderQuickPhrases();
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
  }

  cacheDom() {
    this.elements = {
      // Clock
      phoneClock: document.getElementById("phoneClock"),

      // Header & Profile
      btnProfileTrigger: document.getElementById("btnProfileTrigger"),
      profileModal: document.getElementById("profileModal"),
      profileModalContent: document.getElementById("profileModalContent"),

      // Languages
      fromLangCard: document.getElementById("fromLangCard"),
      fromFlag: document.getElementById("fromFlag"),
      fromName: document.getElementById("fromName"),
      fromCode: document.getElementById("fromCode"),
      fromDropdown: document.getElementById("fromDropdown"),

      toLangCard: document.getElementById("toLangCard"),
      toFlag: document.getElementById("toFlag"),
      toName: document.getElementById("toName"),
      toCode: document.getElementById("toCode"),
      toDropdown: document.getElementById("toDropdown"),

      btnSwapLang: document.getElementById("btnSwapLang"),

      // Voice Input Card
      voiceActionCard: document.getElementById("voiceActionCard"),
      voiceActionIcon: document.getElementById("voiceActionIcon"),
      voiceHeadline: document.getElementById("voiceHeadline"),
      voiceSubtext: document.getElementById("voiceSubtext"),
      audioBarsWrapper: document.getElementById("audioBarsWrapper"),
      audioBars: document.querySelectorAll(".audio-bar"),

      // Quick Prompts
      promptsChipsContainer: document.getElementById("promptsChipsContainer"),
      btnToggleManualInput: document.getElementById("btnToggleManualInput"),
      manualInputBox: document.getElementById("manualInputBox"),
      manualInputField: document.getElementById("manualInputField"),
      btnManualSend: document.getElementById("btnManualSend"),

      // Conversation Area
      sectionStatusTag: document.getElementById("sectionStatusTag"),
      sectionSubtitle: document.getElementById("sectionSubtitle"),

      // Source Card
      sourceCard: document.getElementById("sourceCard"),
      sourceKicker: document.getElementById("sourceKicker"),
      sourceLangTag: document.getElementById("sourceLangTag"),
      sourceSpeechText: document.getElementById("sourceSpeechText"),

      // Translation Card
      translationCard: document.getElementById("translationCard"),
      transLangTag: document.getElementById("transLangTag"),
      translatedResultText: document.getElementById("translatedResultText"),
      engineCheckPill: document.getElementById("engineCheckPill"),
      ttsControlsRow: document.getElementById("ttsControlsRow"),
      ttsLabelText: document.getElementById("ttsLabelText"),
      ttsSpeakerIcon: document.getElementById("ttsSpeakerIcon"),
      btnTtsPlay: document.getElementById("btnTtsPlay"),
      btnTtsPlayIcon: document.getElementById("btnTtsPlayIcon")
    };
  }

  setupGatewayListeners() {
    // 1. Speech Gateway Callbacks
    this.speechGateway.onStateChange = ({ state, message }) => {
      this.speechState = state;
      this.updateSpeechUi(message);
    };

    this.speechGateway.onInterimResult = (partialText) => {
      if (this.elements.sourceSpeechText) {
        this.elements.sourceSpeechText.textContent = partialText;
        this.elements.sourceSpeechText.className = "source-speech-text streaming";
      }
      if (this.elements.sourceKicker) {
        this.elements.sourceKicker.textContent = "LISTENING LIVE";
      }
    };

    this.speechGateway.onFinalResult = (finalText) => {
      this.sourceTranscript = finalText;
      this.ttsGateway.stop();
      this.renderSourceText(finalText);
      this.executeTranslation(finalText);
    };

    this.speechGateway.onRmsChange = (rmsDb) => {
      this.updateAudioBars(rmsDb);
    };

    // 2. TTS Gateway Callbacks
    this.ttsGateway.onStateChange = ({ state, languageName, message }) => {
      this.ttsState = state;
      this.updateTtsUi(state, languageName, message);
    };
  }

  bindEvents() {
    // Voice Input Toggle
    if (this.elements.voiceActionCard) {
      this.elements.voiceActionCard.addEventListener("click", () => {
        this.handleVoiceButtonClick();
      });
    }

    // Language Dropdown Open/Close
    if (this.elements.fromLangCard) {
      this.elements.fromLangCard.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleDropdown("from");
      });
    }

    if (this.elements.toLangCard) {
      this.elements.toLangCard.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleDropdown("to");
      });
    }

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
      this.closeAllDropdowns();
    });

    // Language Swap
    if (this.elements.btnSwapLang) {
      this.elements.btnSwapLang.addEventListener("click", () => {
        this.swapLanguages();
      });
    }

    // TTS Play/Stop Button
    if (this.elements.btnTtsPlay) {
      this.elements.btnTtsPlay.addEventListener("click", () => {
        this.handleTtsPlayClick();
      });
    }

    // Profile Trigger
    if (this.elements.btnProfileTrigger) {
      this.elements.btnProfileTrigger.addEventListener("click", () => {
        this.openProfileModal("menu");
      });
    }

    // Manual input toggle
    if (this.elements.btnToggleManualInput) {
      this.elements.btnToggleManualInput.addEventListener("click", () => {
        if (this.elements.manualInputBox) {
          const isShown = this.elements.manualInputBox.classList.toggle("show");
          if (isShown && this.elements.manualInputField) {
            this.elements.manualInputField.focus();
          }
        }
      });
    }

    // Manual send
    if (this.elements.btnManualSend) {
      this.elements.btnManualSend.addEventListener("click", () => {
        this.submitManualInput();
      });
    }

    if (this.elements.manualInputField) {
      this.elements.manualInputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.submitManualInput();
        }
      });
    }
  }

  handleVoiceButtonClick() {
    this.ttsGateway.stop();

    if (this.speechState === "listening") {
      this.speechGateway.stopListening();
    } else {
      this.speechGateway.startListening(
        this.sourceLanguage.locale,
        this.sourceLanguage.name,
        (finalText) => {
          this.sourceTranscript = finalText;
          this.renderSourceText(finalText);
          this.executeTranslation(finalText);
        }
      );
    }
  }

  submitManualInput() {
    if (!this.elements.manualInputField) return;
    const text = this.elements.manualInputField.value.trim();
    if (!text) return;

    this.ttsGateway.stop();
    if (this.speechState === "listening") {
      this.speechGateway.cancelListening();
    }
    this.sourceTranscript = text;
    this.renderSourceText(text);
    this.executeTranslation(text);
    this.elements.manualInputField.value = "";
  }

  async executeTranslation(text) {
    if (!text || !text.trim()) return;

    this.updateStatusTag("translating");
    this.elements.sectionSubtitle.textContent = `Translating into ${this.targetLanguage.name}...`;

    await this.translationGateway.translate(
      text,
      this.sourceLanguage,
      this.targetLanguage,
      ({ state, translatedText, message, engine }) => {
        this.translationState = state;

        if (state === "downloading") {
          this.updateStatusTag("model");
          this.elements.translatedResultText.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; color:var(--color-teal-dark);">
              <span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--color-teal-dark); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
              <span>${message}</span>
            </div>
            <div style="font-size:0.7rem; color:var(--color-muted-ink); margin-top:4px;">First-time on-device model preparation (~30MB). Runs offline once loaded.</div>
          `;
        } else if (state === "translating") {
          this.updateStatusTag("translating");
          this.elements.translatedResultText.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; color:var(--color-teal-dark);">
              <span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--color-teal-dark); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
              <span>Translating into ${this.targetLanguage.name}...</span>
            </div>
          `;
        } else if (state === "success") {
          this.translatedText = translatedText;
          this.updateStatusTag("success");
          this.elements.sectionSubtitle.textContent = "Recognized speech & on-device translation";
          this.renderTranslationResult(translatedText, engine);
        } else if (state === "error") {
          this.updateStatusTag("live");
          this.elements.translatedResultText.innerHTML = `
            <div style="color:var(--color-error-red); font-size:0.85rem;">
              ${message || "Translation could not be completed."}
              <button id="btnRetryTrans" style="margin-left:8px; padding:2px 8px; border-radius:4px; border:1px solid var(--color-teal); background:var(--color-surface-white); color:var(--color-teal-dark); font-weight:700; cursor:pointer;">Retry</button>
            </div>
          `;
          const btnRetry = document.getElementById("btnRetryTrans");
          if (btnRetry) {
            btnRetry.onclick = () => this.executeTranslation(text);
          }
        }
      }
    );
  }

  renderTranslationResult(text, engine = "On-Device Engine") {
    if (this.elements.translatedResultText) {
      this.elements.translatedResultText.textContent = text;
      this.elements.translatedResultText.className = "translated-result-text";
    }

    if (this.elements.engineCheckPill) {
      this.elements.engineCheckPill.style.display = "inline-flex";
      this.elements.engineCheckPill.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        <span>${engine}</span>
      `;
    }
  }

  handleTtsPlayClick() {
    if (this.ttsState === "speaking") {
      this.ttsGateway.stop();
    } else {
      if (this.translatedText && this.translatedText.trim()) {
        this.ttsGateway.speak(this.translatedText, this.targetLanguage);
      } else {
        // Offer feedback
        this.showToast("Speak or choose a phrase first to translate and hear playback.");
      }
    }
  }

  swapLanguages() {
    this.ttsGateway.stop();
    if (this.speechState === "listening") {
      this.speechGateway.cancelListening();
    }

    const oldSource = this.sourceLanguage;
    this.sourceLanguage = this.targetLanguage;
    this.targetLanguage = oldSource;

    this.renderLanguageSelection();

    // If a valid translation exists, reverse the text and translate back!
    if (this.translatedText && this.translatedText.trim()) {
      const prevTranslation = this.translatedText;
      this.sourceTranscript = prevTranslation;
      this.renderSourceText(prevTranslation);
      this.executeTranslation(prevTranslation);
    } else {
      this.sourceTranscript = "";
      this.translatedText = "";
      this.renderSourceText("");
      this.resetTranslationCard();
    }
  }

  renderLanguageSelection() {
    if (this.elements.fromFlag) this.elements.fromFlag.innerHTML = SVG_FLAGS[this.sourceLanguage.code] || this.sourceLanguage.flag;
    if (this.elements.fromName) this.elements.fromName.textContent = this.sourceLanguage.name;
    if (this.elements.fromCode) this.elements.fromCode.textContent = this.sourceLanguage.code;

    if (this.elements.toFlag) this.elements.toFlag.innerHTML = SVG_FLAGS[this.targetLanguage.code] || this.targetLanguage.flag;
    if (this.elements.toName) this.elements.toName.textContent = this.targetLanguage.name;
    if (this.elements.toCode) this.elements.toCode.textContent = this.targetLanguage.code;

    if (this.elements.sourceLangTag) {
      this.elements.sourceLangTag.innerHTML = `${SVG_FLAGS[this.sourceLanguage.code] || this.sourceLanguage.flag} &nbsp;${this.sourceLanguage.name}`;
    }
    if (this.elements.transLangTag) {
      this.elements.transLangTag.innerHTML = `${SVG_FLAGS[this.targetLanguage.code] || this.targetLanguage.flag} &nbsp;${this.targetLanguage.name}`;
    }

    this.renderVoiceButtonLabels();
  }

  renderVoiceButtonLabels() {
    if (!this.elements.voiceHeadline) return;

    if (this.speechState === "listening") {
      this.elements.voiceHeadline.textContent = "Listening... Tap to finish";
      this.elements.voiceSubtext.textContent = `Speak in ${this.sourceLanguage.name} now`;
    } else if (this.speechState === "processing") {
      this.elements.voiceHeadline.textContent = "Processing speech...";
      this.elements.voiceSubtext.textContent = "Converting audio into words...";
    } else if (this.speechState === "error") {
      this.elements.voiceHeadline.textContent = "Recognition issue";
      this.elements.voiceSubtext.textContent = `Tap to try again in ${this.sourceLanguage.name}`;
    } else {
      this.elements.voiceHeadline.textContent = "Tap to start speaking";
      this.elements.voiceSubtext.textContent = `Speak in ${this.sourceLanguage.name} (${this.sourceLanguage.code})`;
    }
  }

  renderSourceText(text) {
    if (!this.elements.sourceSpeechText) return;

    if (text && text.trim()) {
      this.elements.sourceSpeechText.textContent = text;
      this.elements.sourceSpeechText.className = "source-speech-text";
      if (this.elements.sourceCard) this.elements.sourceCard.classList.add("has-text");
      if (this.elements.sourceKicker) this.elements.sourceKicker.textContent = "YOU SAID";
    } else {
      this.elements.sourceSpeechText.textContent = `Tap the microphone and speak in ${this.sourceLanguage.name}. Your words will appear here in real time.`;
      this.elements.sourceSpeechText.className = "source-speech-text placeholder";
      if (this.elements.sourceCard) this.elements.sourceCard.classList.remove("has-text");
      if (this.elements.sourceKicker) this.elements.sourceKicker.textContent = "YOU SAID";
    }
  }

  resetTranslationCard() {
    if (this.elements.translatedResultText) {
      this.elements.translatedResultText.textContent = "Translation will appear here after speaking...";
      this.elements.translatedResultText.className = "translated-result-text placeholder";
    }
    if (this.elements.engineCheckPill) {
      this.elements.engineCheckPill.style.display = "none";
    }
    this.updateStatusTag("live");
    this.elements.sectionSubtitle.textContent = `Speak in ${this.sourceLanguage.name} to translate into ${this.targetLanguage.name}`;
  }

  updateSpeechUi(errorMessage = "") {
    if (!this.elements.voiceActionCard) return;

    this.elements.voiceActionCard.className = `voice-action-card ${this.speechState}`;

    if (this.elements.sourceCard) {
      if (this.speechState === "listening") {
        this.elements.sourceCard.classList.add("listening");
        this.updateStatusTag("rec");
        this.elements.sectionSubtitle.textContent = `Listening in ${this.sourceLanguage.name}...`;
      } else {
        this.elements.sourceCard.classList.remove("listening");
        if (this.speechState === "idle" && !this.sourceTranscript) {
          this.updateStatusTag("live");
        }
      }
    }

    if (this.speechState === "listening") {
      this.elements.voiceActionIcon.innerHTML = `<path d="M6 6h12v12H6z"/>`; // Stop icon
    } else {
      this.elements.voiceActionIcon.innerHTML = `<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>`;
    }

    this.renderVoiceButtonLabels();
  }

  updateAudioBars(rmsDb) {
    if (!this.elements.audioBars || this.elements.audioBars.length === 0) return;
    const heights = [
      Math.min(26, 6 + rmsDb * 2),
      Math.min(28, 10 + rmsDb * 2.4),
      Math.min(26, 8 + rmsDb * 2.1),
      Math.min(24, 7 + rmsDb * 1.8)
    ];
    this.elements.audioBars.forEach((bar, idx) => {
      bar.style.height = `${heights[idx]}px`;
    });
  }

  updateTtsUi(state, languageName = "", message = "") {
    if (!this.elements.btnTtsPlay) return;

    if (state === "speaking") {
      this.elements.btnTtsPlay.classList.add("speaking");
      this.elements.btnTtsPlayIcon.innerHTML = `<path d="M6 6h12v12H6z"/>`; // Stop icon
      if (this.elements.ttsLabelText) {
        this.elements.ttsLabelText.textContent = `Speaking in ${languageName || this.targetLanguage.name}...`;
        this.elements.ttsLabelText.parentElement.classList.add("speaking");
      }
    } else {
      this.elements.btnTtsPlay.classList.remove("speaking");
      this.elements.btnTtsPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play icon
      if (this.elements.ttsLabelText) {
        this.elements.ttsLabelText.textContent = "Hear translation";
        this.elements.ttsLabelText.parentElement.classList.remove("speaking");
      }
    }

    if (state === "error" && message) {
      this.showToast(message);
    }
  }

  updateStatusTag(tag) {
    if (!this.elements.sectionStatusTag) return;
    const tagMap = {
      live: { text: "LIVE", cls: "live" },
      rec: { text: "REC", cls: "rec" },
      translating: { text: "TRANSLATING", cls: "translating" },
      model: { text: "MODEL", cls: "model" },
      success: { text: "ML KIT", cls: "success" }
    };
    const current = tagMap[tag] || tagMap.live;
    this.elements.sectionStatusTag.textContent = current.text;
    this.elements.sectionStatusTag.className = `status-tag ${current.cls}`;
  }

  toggleDropdown(type) {
    const isFrom = type === "from";
    const targetDropdown = isFrom ? this.elements.fromDropdown : this.elements.toDropdown;
    const otherDropdown = isFrom ? this.elements.toDropdown : this.elements.fromDropdown;

    if (otherDropdown) otherDropdown.classList.remove("show");

    if (targetDropdown) {
      const willShow = !targetDropdown.classList.contains("show");
      if (willShow) {
        this.populateDropdown(targetDropdown, isFrom);
        targetDropdown.classList.add("show");
      } else {
        targetDropdown.classList.remove("show");
      }
    }
  }

  closeAllDropdowns() {
    if (this.elements.fromDropdown) this.elements.fromDropdown.classList.remove("show");
    if (this.elements.toDropdown) this.elements.toDropdown.classList.remove("show");
  }

  populateDropdown(container, isSource) {
    container.innerHTML = "";
    const activeCode = isSource ? this.sourceLanguage.code : this.targetLanguage.code;

    SUPPORTED_LANGUAGES.forEach((lang) => {
      const li = document.createElement("li");
      li.className = "lang-menu-item";
      const flagSvg = SVG_FLAGS[lang.code] || lang.flag;
      li.innerHTML = `
        <div class="lang-menu-left">
          <span style="display:flex; align-items:center;">${flagSvg}</span>
          <div>
            <div class="lang-menu-name">${lang.name}</div>
            <div class="lang-menu-region">${lang.region}</div>
          </div>
        </div>
        ${lang.code === activeCode ? '<span class="lang-selected-check">✓</span>' : ""}
      `;
      li.onclick = (e) => {
        e.stopPropagation();
        this.selectLanguage(lang, isSource);
        container.classList.remove("show");
      };
      container.appendChild(li);
    });
  }

  selectLanguage(lang, isSource) {
    this.ttsGateway.stop();

    if (isSource) {
      if (this.speechState === "listening") {
        this.speechGateway.cancelListening();
      }
      this.sourceLanguage = lang;
      this.sourceTranscript = "";
      this.translatedText = "";
      this.renderSourceText("");
      this.resetTranslationCard();
    } else {
      this.targetLanguage = lang;
      if (this.sourceTranscript && this.sourceTranscript.trim()) {
        this.executeTranslation(this.sourceTranscript);
      } else {
        this.resetTranslationCard();
      }
    }
    this.renderLanguageSelection();
  }

  renderQuickPhrases() {
    if (!this.elements.promptsChipsContainer) return;
    this.elements.promptsChipsContainer.innerHTML = "";

    QUICK_PHRASES.forEach((item) => {
      const chip = document.createElement("button");
      chip.className = "prompt-chip";
      chip.innerHTML = `<span>${item.icon}</span> <span>${item.label}</span>`;
      chip.title = item.text;
      chip.onclick = () => {
        this.ttsGateway.stop();
        if (this.speechState === "listening") {
          this.speechGateway.cancelListening();
        }
        this.sourceTranscript = item.text;
        this.renderSourceText(item.text);
        this.executeTranslation(item.text);
      };
      this.elements.promptsChipsContainer.appendChild(chip);
    });
  }

  updateClock() {
    if (!this.elements.phoneClock) return;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    this.elements.phoneClock.textContent = `${hours}:${minutes}`;
  }

  // Profile Modal Views Management
  openProfileModal(view = "menu") {
    this.currentProfileView = view;
    if (this.elements.profileModal) {
      this.elements.profileModal.classList.add("show");
      this.renderProfileModalContent();
    }
  }

  closeProfileModal() {
    if (this.elements.profileModal) {
      this.elements.profileModal.classList.remove("show");
    }
  }

  renderProfileModalContent() {
    if (!this.elements.profileModalContent) return;

    if (this.currentProfileView === "menu") {
      this.elements.profileModalContent.innerHTML = `
        <div class="modal-avatar-box">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        <div class="modal-title">My Profile</div>
        <div class="modal-subtitle">GUEST USER • PRIVACY-FIRST</div>
        <div class="modal-memo">Transcripts are stored in volatile RAM only</div>
        <div class="modal-divider"></div>

        <div class="profile-menu-list">
          <button class="profile-menu-item" id="pMenuSettings">
            <div class="menu-icon-box teal">
              <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            </div>
            <div class="menu-text-col">
              <div class="menu-item-title">Settings</div>
              <div class="menu-item-sub">Speech engine & memory options</div>
            </div>
            <svg class="menu-item-arrow" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>

          <button class="profile-menu-item" id="pMenuAbout">
            <div class="menu-icon-box indigo">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div class="menu-text-col">
              <div class="menu-item-title">About</div>
              <div class="menu-item-sub">Privacy disclosures & features</div>
            </div>
            <svg class="menu-item-arrow" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>

          <button class="profile-menu-item" id="pMenuVersion">
            <div class="menu-icon-box green">
              <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <div class="menu-text-col">
              <div class="menu-item-title">Version</div>
              <div class="menu-item-sub">v0.1.0 • Milestone 4 Verified</div>
            </div>
            <svg class="menu-item-arrow" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 1.41-1.41z"/></svg>
          </button>
        </div>

        <div class="modal-action-row">
          <button class="btn-modal-text" id="btnCloseModal">Close</button>
        </div>
      `;

      document.getElementById("pMenuSettings").onclick = () => this.openProfileModal("settings");
      document.getElementById("pMenuAbout").onclick = () => this.openProfileModal("about");
      document.getElementById("pMenuVersion").onclick = () => this.openProfileModal("version");
      document.getElementById("btnCloseModal").onclick = () => this.closeProfileModal();
    } else if (this.currentProfileView === "settings") {
      this.elements.profileModalContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <div class="menu-icon-box teal" style="width:32px; height:32px;"><svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg></div>
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-ink);">Settings</h3>
        </div>
        <div class="modal-divider"></div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.82rem;">
          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:12px; padding:12px;">
            <div style="font-weight:700; color:var(--color-ink);">Speech Recognition Engine</div>
            <div style="color:var(--color-teal-dark); font-weight:600; margin-top:2px;">Browser Web Speech & Audio Decibel Meter</div>
            <div style="color:var(--color-muted-ink); font-size:0.75rem; margin-top:4px;">Main-thread safe audio decibel analysis with point-of-use permissions.</div>
          </div>

          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:12px; padding:12px;">
            <div style="font-weight:700; color:var(--color-ink);">On-Device Translation Gateway</div>
            <div style="color:var(--color-teal-dark); font-weight:600; margin-top:2px;">Local & Client Translation Gateway</div>
            <div style="color:var(--color-muted-ink); font-size:0.75rem; margin-top:4px;">Emulates Google ML Kit (~30MB on-demand model download) with zero remote server tracking.</div>
          </div>

          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:12px; padding:12px;">
            <div style="font-weight:700; color:var(--color-ink);">Volatile RAM Session Memory</div>
            <div style="color:var(--color-muted-ink); font-size:0.75rem; margin-top:2px;">All spoken transcripts exist in volatile RAM only and are never saved to disk.</div>
            <button id="btnClearRam" style="margin-top:8px; padding:5px 10px; background:var(--color-soft-amber); color:var(--color-amber-ink); border:none; border-radius:8px; font-weight:700; font-size:0.75rem; cursor:pointer;">Clear Current Session</button>
          </div>
        </div>

        <div class="modal-action-row">
          <button class="btn-modal-text" id="btnBackToMenu">Back to Profile</button>
        </div>
      `;

      document.getElementById("btnClearRam").onclick = () => {
        this.sourceTranscript = "";
        this.translatedText = "";
        this.translationGateway.clearMemory();
        this.ttsGateway.stop();
        this.renderSourceText("");
        this.resetTranslationCard();
        this.showToast("Spoken words & translation cleared");
      };
      document.getElementById("btnBackToMenu").onclick = () => this.openProfileModal("menu");
    } else if (this.currentProfileView === "about") {
      this.elements.profileModalContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <div class="menu-icon-box indigo" style="width:32px; height:32px;"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div>
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-ink);">About VaaniSnap</h3>
        </div>
        <div class="modal-divider"></div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.82rem; color:var(--color-ink); line-height:1.5;">
          <p><strong>VaaniSnap</strong> is a native Android voice translator built privacy-first.</p>
          <p style="color:var(--color-muted-ink); font-size:0.78rem;">• <strong>Speech Recognition:</strong> Built using native Android SpeechRecognizer & Web Speech APIs with live audio decibels.</p>
          <p style="color:var(--color-muted-ink); font-size:0.78rem;">• <strong>Translation:</strong> Powered by Google ML Kit on-device translation SDK. Language models are downloaded on-demand and execute 100% on-device.</p>
          <p style="color:var(--color-muted-ink); font-size:0.78rem;">• <strong>Privacy:</strong> Audio and text are processed in volatile memory only. Transcripts are never saved to disk or sent to surveillance servers.</p>
          <p style="color:var(--color-muted-ink); font-size:0.78rem;">• <strong>Audio Playback:</strong> Built-in platform TextToSpeech engine with native accents for 7 major world languages.</p>
        </div>

        <div class="modal-action-row">
          <button class="btn-modal-text" id="btnBackToMenu">Back to Profile</button>
        </div>
      `;
      document.getElementById("btnBackToMenu").onclick = () => this.openProfileModal("menu");
    } else if (this.currentProfileView === "version") {
      this.elements.profileModalContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <div class="menu-icon-box green" style="width:32px; height:32px;"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg></div>
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-ink);">Version Details</h3>
        </div>
        <div class="modal-divider"></div>

        <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:0.8rem;">
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Application</span><strong>VaaniSnap Live Translation</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Release</span><strong>v0.1.0 (Milestone 4)</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Android Engine</span><strong>Google ML Kit Translate 17.0.3</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Target SDK</span><strong>API 36 (Android 15+)</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Min SDK</span><strong>API 26 (Android 8.0)</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">Toolchain</span><strong>AGP 8.13.2 • Kotlin 2.3.21</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-muted-ink);">License</span><strong>Apache 2.0 (Open Source)</strong></div>
        </div>

        <div class="modal-action-row">
          <button class="btn-modal-text" id="btnBackToMenu">Back to Profile</button>
        </div>
      `;
      document.getElementById("btnBackToMenu").onclick = () => this.openProfileModal("menu");
    }
  }

  showToast(message) {
    const existing = document.getElementById("vsToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "vsToast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-ink);
      color: #FFFFFF;
      padding: 10px 18px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 2000;
      animation: fadeIn 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  }
}
