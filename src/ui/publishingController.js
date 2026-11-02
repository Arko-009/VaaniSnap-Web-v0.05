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
    this.bindMobileNav();
    this.bindScrollSpy();
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

    // 8th Roadmap Card for a balanced, visually complete 4x2 grid
    const roadmapCard = document.createElement("div");
    roadmapCard.className = "lang-matrix-card roadmap-matrix-card";
    roadmapCard.style.cssText = "border-style:dashed; border-color:rgba(14,165,164,0.35); background:linear-gradient(135deg, #FFFFFF, rgba(228,247,245,0.35)); display:flex; flex-direction:column;";
    roadmapCard.innerHTML = `
      <div class="matrix-top">
        <div class="matrix-flag-name">
          <span class="matrix-flag" style="display:flex; align-items:center; font-size:1.35rem;">🌍</span>
          <div class="matrix-name">More Languages</div>
        </div>
        <span class="matrix-locale" style="background:var(--color-teal-pale); color:var(--color-teal-dark); font-weight:800; border:1px solid rgba(14,165,164,0.25);">v0.06 ROADMAP</span>
      </div>
      <div class="matrix-sample" style="color:var(--color-muted-ink); font-style:italic;">"German, Portuguese, Tamil, Telugu, and Russian models in validation pipeline."</div>
      <div style="margin-top:auto; padding-top:10px; display:flex; align-items:center; gap:6px; font-size:0.75rem; font-weight:700; color:var(--color-teal-dark);">
        <span>✨ Community Driven</span>
        <span>•</span>
        <span>On-Device Models</span>
      </div>
    `;
    container.appendChild(roadmapCard);
  }

  bindMobileNav() {
    const toggleBtn = document.getElementById("btnNavMobileToggle");
    const drawer = document.getElementById("navMobileDrawer");
    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      toggleBtn.classList.toggle("active");
      drawer.classList.toggle("show");
    });

    // Close when clicking mobile links
    drawer.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("active");
        drawer.classList.remove("show");
      });
    });
  }

  bindScrollSpy() {
    const navWrapper = document.getElementById("navWrapper");
    const navLinks = document.querySelectorAll(".nav-links .nav-link");
    const sections = ["liveApp", "whyVaaniSnap", "howItWorks", "languages"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    window.addEventListener(
      "scroll",
      () => {
        if (navWrapper) {
          if (window.scrollY > 15) {
            navWrapper.classList.add("scrolled");
          } else {
            navWrapper.classList.remove("scrolled");
          }
        }

        // Active link tracking
        let currentSectionId = "";
        const scrollPos = window.scrollY + 160;
        sections.forEach((sec) => {
          if (sec.offsetTop <= scrollPos) {
            currentSectionId = sec.getAttribute("id");
          }
        });

        if (currentSectionId) {
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${currentSectionId}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      },
      { passive: true }
    );
  }
}

