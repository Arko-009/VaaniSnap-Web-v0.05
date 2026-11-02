// Publishing Website Controller: Showcase, View Switcher, APK Download & Matrix
import { SUPPORTED_LANGUAGES, SVG_FLAGS } from "../model/languages.js";
import { WebTextToSpeechGateway } from "../tts/textToSpeechGateway.js";

export class PublishingController {
  constructor(appController) {
    this.appController = appController;
    this.previewTts = new WebTextToSpeechGateway();
    this.isPhoneView = true;
  }

  init() {
    this.bindViewSwitcher();
    this.bindDownloadModal();
    this.bindCopyButtons();
    this.renderLanguagesMatrix();
  }

  bindViewSwitcher() {
    const btnPhoneView = document.getElementById("btnPhoneView");
    const btnFullView = document.getElementById("btnFullView");
    const phoneMockup = document.getElementById("phoneMockup");

    if (btnPhoneView && btnFullView && phoneMockup) {
      btnPhoneView.addEventListener("click", () => {
        btnPhoneView.classList.add("active");
        btnFullView.classList.remove("active");
        phoneMockup.className = "phone-mockup";
        document.getElementById("phoneStatusBar").style.display = "flex";
      });

      btnFullView.addEventListener("click", () => {
        btnFullView.classList.add("active");
        btnPhoneView.classList.remove("active");
        phoneMockup.className = "app-full-view";
        document.getElementById("phoneStatusBar").style.display = "none";
      });
    }
  }

  bindDownloadModal() {
    const modal = document.getElementById("downloadModal");
    const closeBtn = document.getElementById("btnCloseDownloadModal");
    const downloadTriggers = document.querySelectorAll(".trigger-download-modal");

    downloadTriggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (modal) modal.classList.add("show");
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show");
        }
      });
    }
  }

  bindCopyButtons() {
    const copyBtns = document.querySelectorAll(".btn-copy-code");
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const textToCopy = btn.getAttribute("data-copy");
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const original = btn.textContent;
            btn.textContent = "Copied!";
            btn.style.color = "#2DD4BF";
            setTimeout(() => {
              btn.textContent = original;
              btn.style.color = "";
            }, 1800);
          });
        }
      });
    });
  }

  renderLanguagesMatrix() {
    const container = document.getElementById("langMatrixGrid");
    if (!container) return;

    container.innerHTML = "";
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const card = document.createElement("div");
      card.className = "lang-matrix-card";
      const flagSvg = SVG_FLAGS[lang.code] || lang.flag;
      card.innerHTML = `
        <div class="matrix-top">
          <div class="matrix-flag-name">
            <span class="matrix-flag" style="display:flex; align-items:center;">${flagSvg}</span>
            <div class="matrix-name">${lang.name}</div>
          </div>
          <span class="matrix-locale">${lang.locale}</span>
        </div>
        <div class="matrix-sample">"${lang.sampleSentence}"</div>
        <button class="matrix-btn-listen" data-lang="${lang.code}">
          <svg style="width:16px; height:16px; fill:currentColor;" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>Hear Pronunciation</span>
        </button>
      `;

      const btnListen = card.querySelector(".matrix-btn-listen");
      btnListen.addEventListener("click", () => {
        this.previewTts.speak(lang.sampleSentence, lang);
      });

      container.appendChild(card);
    });
  }
}
