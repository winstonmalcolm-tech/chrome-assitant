chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openModal") {
    createAndShowModal();
  }
});
function createAndShowModal() {
  const existingModal = document.querySelector("[data-extension-modal]");
  if (existingModal) {
    existingModal.remove();
  }
  if (!document.querySelector("#dtg-modal-styles")) {
    const style = document.createElement("style");
    style.id = "dtg-modal-styles";
    style.textContent = `
      @keyframes modalSlideIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes modalSlideOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("data-extension-modal", "true");
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    backdrop-filter: blur(2px);
    animation: modalSlideIn 0.3s ease-out;
    overflow-y: auto;
    box-sizing: border-box;
  `;
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    margin: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    max-height: calc(100vh - 40px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  modalContent.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0 24px; border-bottom: 1px solid #e5e7eb; margin-bottom: 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Document Template Generator</h2>
      </div>
      <button id="dtgCloseBtn" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: #6b7280; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 24px; padding-top: 20px;">
      <form id="dtgTemplateForm">
        <!-- Main Input Area -->
        <div style="margin-bottom: 24px;">
          <label for="dtgMainInput" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">What document do you need?</label>
          <div style="position: relative;">
            <textarea id="dtgMainInput" placeholder="Example: Create an NDA for sharing client data with a subcontractor" maxlength="500" style="width: 100%; height: 80px; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; transition: border-color 0.2s ease; box-sizing: border-box; background: white; color: #1f2937;"></textarea>
            <div id="dtgCharCounter" style="position: absolute; bottom: 8px; right: 12px; font-size: 12px; color: #6b7280; background: white; padding: 2px 4px; border-radius: 4px;">0/500</div>
          </div>
        </div>

        <!-- Examples Section -->
        <div style="margin-bottom: 24px;">
          <button type="button" id="dtgExamplesToggle" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #6b7280; display: flex; align-items: center; gap: 6px; padding: 8px 0; transition: color 0.2s ease;">
            <span>Examples</span>
            <svg id="dtgExamplesChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease;">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div id="dtgExamples" style="max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out;">
            <div style="padding-top: 8px;">
              <div class="dtg-example-item" data-example="Create a freelance web design contract with milestone payments" style="padding: 8px 12px; margin: 4px 0; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #4b5563; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;">
                Create a freelance web design contract with milestone payments
              </div>
              <div class="dtg-example-item" data-example="Generate a privacy policy for an e-commerce website" style="padding: 8px 12px; margin: 4px 0; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #4b5563; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;">
                Generate a privacy policy for an e-commerce website
              </div>
              <div class="dtg-example-item" data-example="Make API documentation template for a payment service" style="padding: 8px 12px; margin: 4px 0; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #4b5563; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;">
                Make API documentation template for a payment service
              </div>
              <div class="dtg-example-item" data-example="Create an employee remote work policy" style="padding: 8px 12px; margin: 4px 0; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #4b5563; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;">
                Create an employee remote work policy
              </div>
            </div>
          </div>
        </div>

        <!-- Refinement Options -->
        <div style="margin-bottom: 24px;">
          <button type="button" id="dtgRefinementToggle" style="width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; margin-bottom: 12px;">
            <span>Customize</span>
            <svg id="dtgRefinementChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease;">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div id="dtgRefinementOptions" style="max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out;">
            <!-- Document Complexity -->
            <div style="margin: 16px 0;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Document Complexity</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: white;">
                  <input type="radio" name="complexity" value="simple" checked style="display: none;">
                  <span style="font-size: 18px; margin-right: 4px;">🟢</span>
                  <div>
                    <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 2px;">Simple</div>
                    <div style="font-size: 12px; color: #6b7280;">Basic terms, easy to understand</div>
                  </div>
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: white;">
                  <input type="radio" name="complexity" value="standard" style="display: none;">
                  <span style="font-size: 18px; margin-right: 4px;">🟡</span>
                  <div>
                    <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 2px;">Standard</div>
                    <div style="font-size: 12px; color: #6b7280;">Comprehensive, professional language</div>
                  </div>
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: white;">
                  <input type="radio" name="complexity" value="complex" style="display: none;">
                  <span style="font-size: 18px; margin-right: 4px;">🔴</span>
                  <div>
                    <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 2px;">Complex</div>
                    <div style="font-size: 12px; color: #6b7280;">Detailed clauses, enterprise protection</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Jurisdiction -->
            <div style="margin: 16px 0;">
              <label for="dtgJurisdiction" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Legal jurisdiction (if applicable)</label>
              <select id="dtgJurisdiction" style="width: 100%; padding: 10px 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #374151; transition: border-color 0.2s ease; box-sizing: border-box;">
                <option value="generic">Generic</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Industry Context -->
            <div style="margin: 16px 0;">
              <label for="dtgIndustry" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Industry/Field</label>
              <select id="dtgIndustry" style="width: 100%; padding: 10px 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #374151; transition: border-color 0.2s ease; box-sizing: border-box;">
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="creative">Creative Services</option>
                <option value="consulting">Consulting</option>
                <option value="legal">Legal</option>
                <option value="realestate">Real Estate</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Options -->
        <div style="margin-bottom: 24px;">
          <button type="button" id="dtgAdvancedToggle" style="width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; margin-bottom: 12px;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Advanced
            </span>
            <svg id="dtgAdvancedChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease;">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div id="dtgAdvancedOptions" style="max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out;">
            <div style="margin: 16px 0;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Include in template</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #374151;">
                  <input type="checkbox" name="includes" value="signatures" style="display: none;">
                  <span class="checkbox-indicator" style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s ease;"></span>
                  Signature blocks
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #374151;">
                  <input type="checkbox" name="includes" value="appendix" style="display: none;">
                  <span class="checkbox-indicator" style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s ease;"></span>
                  Appendix sections
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #374151;">
                  <input type="checkbox" name="includes" value="compliance" style="display: none;">
                  <span class="checkbox-indicator" style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s ease;"></span>
                  Compliance checklists
                </label>
                <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #374151;">
                  <input type="checkbox" name="includes" value="comments" style="display: none;">
                  <span class="checkbox-indicator" style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s ease;"></span>
                  Explanatory comments
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <button type="button" id="dtgClearBtn" style="background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer; padding: 8px 0; transition: color 0.2s ease;">Clear All</button>
          <button type="submit" id="dtgGenerateBtn" disabled style="background: #9ca3af; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: not-allowed; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; min-width: 140px; justify-content: center;">
            <span id="dtgBtnText">Generate Template</span>
            <svg id="dtgSpinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none; animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </button>
        </div>
      </form>

      <!-- Generated Output Section -->
      <div id="dtgOutputSection" style="display: none; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 20px; animation: fadeIn 0.3s ease-out;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Generated Template</h3>
          <button type="button" id="dtgOutputToggle" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: #6b7280; transition: all 0.2s ease;">
            <svg id="dtgOutputChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease; transform: rotate(180deg);">
              <polyline points="18,15 12,9 6,15"></polyline>
            </svg>
          </button>
        </div>
        <div id="dtgOutputContent">
          <div id="dtgOutputPreview" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; max-height: 200px; overflow-y: auto;">
            <!-- Generated content preview will be inserted here -->
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" id="dtgCopyBtn" style="padding: 8px 16px; border: 1px solid #3b82f6; border-radius: 6px; background: #3b82f6; color: white; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; text-decoration: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2 2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Copy to Clipboard
            </button>
            <button type="button" id="dtgDownloadBtn" style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; text-decoration: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download as .docx
            </button>
            <button type="button" id="dtgGoogleDocsBtn" style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; text-decoration: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              Open in Google Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  initializeModal(modalOverlay);
}
function initializeModal(modalOverlay) {
  const textarea = modalOverlay.querySelector("#dtgMainInput");
  const charCounter = modalOverlay.querySelector("#dtgCharCounter");
  const generateBtn = modalOverlay.querySelector("#dtgGenerateBtn");
  const clearBtn = modalOverlay.querySelector("#dtgClearBtn");
  const closeBtn = modalOverlay.querySelector("#dtgCloseBtn");
  textarea.addEventListener("input", () => {
    const length = textarea.value.length;
    charCounter.textContent = `${length}/500`;
    if (length === 0) {
      generateBtn.disabled = true;
      generateBtn.style.background = "#9ca3af";
      generateBtn.style.cursor = "not-allowed";
    } else {
      generateBtn.disabled = false;
      generateBtn.style.background = "#3b82f6";
      generateBtn.style.cursor = "pointer";
    }
    if (length > 450) {
      charCounter.style.color = "#ef4444";
    } else if (length > 400) {
      charCounter.style.color = "#f59e0b";
    } else {
      charCounter.style.color = "#6b7280";
    }
  });
  textarea.addEventListener("focus", () => {
    textarea.style.borderColor = "#3b82f6";
    textarea.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
  });
  textarea.addEventListener("blur", () => {
    textarea.style.borderColor = "#d1d5db";
    textarea.style.boxShadow = "none";
  });
  const examplesToggle = modalOverlay.querySelector("#dtgExamplesToggle");
  const examplesContent = modalOverlay.querySelector("#dtgExamples");
  const examplesChevron = modalOverlay.querySelector("#dtgExamplesChevron");
  const exampleItems = modalOverlay.querySelectorAll(".dtg-example-item");
  examplesToggle.addEventListener("click", () => {
    const isExpanded = examplesContent.style.maxHeight !== "0px" && examplesContent.style.maxHeight !== "";
    if (isExpanded) {
      examplesContent.style.maxHeight = "0";
      examplesChevron.style.transform = "rotate(0deg)";
    } else {
      examplesContent.style.maxHeight = "500px";
      examplesChevron.style.transform = "rotate(180deg)";
    }
  });
  exampleItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.background = "#e0f2fe";
      item.style.borderColor = "#3b82f6";
      item.style.color = "#1e40af";
    });
    item.addEventListener("mouseleave", () => {
      item.style.background = "#f8fafc";
      item.style.borderColor = "transparent";
      item.style.color = "#4b5563";
    });
    item.addEventListener("click", () => {
      textarea.value = item.dataset.example;
      textarea.dispatchEvent(new Event("input"));
    });
  });
  const refinementToggle = modalOverlay.querySelector("#dtgRefinementToggle");
  const refinementContent = modalOverlay.querySelector("#dtgRefinementOptions");
  const refinementChevron = modalOverlay.querySelector("#dtgRefinementChevron");
  const advancedToggle = modalOverlay.querySelector("#dtgAdvancedToggle");
  const advancedContent = modalOverlay.querySelector("#dtgAdvancedOptions");
  const advancedChevron = modalOverlay.querySelector("#dtgAdvancedChevron");
  refinementToggle.addEventListener("click", () => {
    toggleSection(refinementContent, refinementChevron);
  });
  advancedToggle.addEventListener("click", () => {
    toggleSection(advancedContent, advancedChevron);
  });
  [refinementToggle, advancedToggle].forEach((toggle) => {
    toggle.addEventListener("mouseenter", () => {
      toggle.style.background = "#f3f4f6";
      toggle.style.borderColor = "#d1d5db";
    });
    toggle.addEventListener("mouseleave", () => {
      toggle.style.background = "#f9fafb";
      toggle.style.borderColor = "#e5e7eb";
    });
  });
  const radioOptions = modalOverlay.querySelectorAll('input[type="radio"]');
  radioOptions.forEach((radio) => {
    const label = radio.closest("label");
    radio.addEventListener("change", () => {
      modalOverlay.querySelectorAll('input[name="' + radio.name + '"]').forEach((r) => {
        const l = r.closest("label");
        l.style.borderColor = "#e5e7eb";
        l.style.background = "white";
        l.querySelector("div div").style.fontWeight = "500";
        l.querySelectorAll("div").forEach((div) => {
          div.style.color = "#374151";
        });
        l.querySelector("div div:last-child").style.color = "#6b7280";
      });
      if (radio.checked) {
        label.style.borderColor = "#3b82f6";
        label.style.background = "#eff6ff";
        label.querySelector("div div").style.fontWeight = "600";
        label.querySelectorAll("div").forEach((div) => {
          div.style.color = "#1e40af";
        });
      }
    });
  });
  const checkboxes = modalOverlay.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const indicator = checkbox.nextElementSibling;
    const label = checkbox.closest("label");
    label.addEventListener("mouseenter", () => {
      if (!checkbox.checked) {
        indicator.style.borderColor = "#9ca3af";
      }
    });
    label.addEventListener("mouseleave", () => {
      if (!checkbox.checked) {
        indicator.style.borderColor = "#d1d5db";
      }
    });
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        indicator.style.background = "#3b82f6";
        indicator.style.borderColor = "#3b82f6";
        indicator.innerHTML = '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>';
      } else {
        indicator.style.background = "white";
        indicator.style.borderColor = "#d1d5db";
        indicator.innerHTML = "";
      }
    });
  });
  const selects = modalOverlay.querySelectorAll("select");
  selects.forEach((select) => {
    select.addEventListener("focus", () => {
      select.style.borderColor = "#3b82f6";
      select.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
    });
    select.addEventListener("blur", () => {
      select.style.borderColor = "#d1d5db";
      select.style.boxShadow = "none";
    });
  });
  const form = modalOverlay.querySelector("#dtgTemplateForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleGenerateWithErrorHandling(modalOverlay);
  });
  clearBtn.addEventListener("click", () => {
    form.reset();
    textarea.value = "";
    textarea.dispatchEvent(new Event("input"));
    modalOverlay.querySelectorAll('input[type="radio"]').forEach((radio) => {
      const label = radio.closest("label");
      label.style.borderColor = "#e5e7eb";
      label.style.background = "white";
      label.querySelector("div div").style.fontWeight = "500";
      label.querySelectorAll("div").forEach((div) => {
        div.style.color = "#374151";
      });
      label.querySelector("div div:last-child").style.color = "#6b7280";
    });
    modalOverlay.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      const indicator = checkbox.nextElementSibling;
      indicator.style.background = "white";
      indicator.style.borderColor = "#d1d5db";
      indicator.innerHTML = "";
    });
    modalOverlay.querySelector('input[name="complexity"]').checked = true;
    modalOverlay.querySelector('input[name="complexity"]').dispatchEvent(new Event("change"));
    hideOutput(modalOverlay);
  });
  clearBtn.addEventListener("mouseenter", () => {
    clearBtn.style.color = "#ef4444";
  });
  clearBtn.addEventListener("mouseleave", () => {
    clearBtn.style.color = "#6b7280";
  });
  generateBtn.addEventListener("mouseenter", () => {
    if (!generateBtn.disabled) {
      generateBtn.style.background = "#2563eb";
      generateBtn.style.transform = "translateY(-1px)";
      generateBtn.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
    }
  });
  generateBtn.addEventListener("mouseleave", () => {
    if (!generateBtn.disabled) {
      generateBtn.style.background = "#3b82f6";
      generateBtn.style.transform = "none";
      generateBtn.style.boxShadow = "none";
    }
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#f3f4f6";
    closeBtn.style.color = "#374151";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "none";
    closeBtn.style.color = "#6b7280";
  });
  closeBtn.addEventListener("click", () => {
    closeModal(modalOverlay);
  });
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay);
    }
  });
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal(modalOverlay);
    }
  };
  document.addEventListener("keydown", handleEscape);
  modalOverlay._escapeHandler = handleEscape;
  modalOverlay.querySelector('input[name="complexity"]').dispatchEvent(new Event("change"));
  addTooltips(modalOverlay);
  loadUserPreferences(modalOverlay);
  const formElements = modalOverlay.querySelectorAll("input, select, textarea");
  formElements.forEach((element) => {
    element.addEventListener("change", () => {
      saveUserPreferences(modalOverlay);
    });
  });
  addKeyboardNavigation(modalOverlay);
  addInputValidation(modalOverlay);
}
function toggleSection(content, chevron) {
  const isExpanded = content.style.maxHeight !== "0px" && content.style.maxHeight !== "";
  if (isExpanded) {
    content.style.maxHeight = "0";
    chevron.style.transform = "rotate(0deg)";
  } else {
    content.style.maxHeight = "500px";
    chevron.style.transform = "rotate(180deg)";
  }
}
function collectFormData(modalOverlay) {
  const textarea = modalOverlay.querySelector("#dtgMainInput");
  const complexity = modalOverlay.querySelector('input[name="complexity"]:checked');
  const jurisdiction = modalOverlay.querySelector("#dtgJurisdiction");
  const industry = modalOverlay.querySelector("#dtgIndustry");
  const includes = Array.from(modalOverlay.querySelectorAll('input[name="includes"]:checked')).map((cb) => cb.value);
  return {
    description: textarea.value,
    complexity: complexity ? complexity.value : "simple",
    jurisdiction: jurisdiction.value,
    industry: industry.value,
    includes
  };
}
function generateMockTemplate(formData) {
  return `# ${formData.description.charAt(0).toUpperCase() + formData.description.slice(1)}

## Template Overview
This ${formData.complexity} template is designed for ${formData.industry} purposes under ${formData.jurisdiction} jurisdiction.

## Key Sections
1. Introduction and Purpose
2. Terms and Conditions
3. Rights and Obligations
4. Compliance Requirements
5. Termination Clauses

${formData.includes.includes("signatures") ? "\n## Signature Block\n[Signature lines and date fields]" : ""}
${formData.includes.includes("appendix") ? "\n## Appendix\n[Additional supporting documents]" : ""}
${formData.includes.includes("compliance") ? "\n## Compliance Checklist\n[ ] All terms reviewed\n[ ] Legal review completed" : ""}
${formData.includes.includes("comments") ? "\n## Explanatory Comments\n[Helpful guidance for users]" : ""}

---
*Generated by Document Template Generator*`;
}
function showOutput(modalOverlay, content) {
  const outputSection = modalOverlay.querySelector("#dtgOutputSection");
  const preview = modalOverlay.querySelector("#dtgOutputPreview");
  const copyBtn = modalOverlay.querySelector("#dtgCopyBtn");
  const downloadBtn = modalOverlay.querySelector("#dtgDownloadBtn");
  const googleDocsBtn = modalOverlay.querySelector("#dtgGoogleDocsBtn");
  const outputToggle = modalOverlay.querySelector("#dtgOutputToggle");
  const outputContent = modalOverlay.querySelector("#dtgOutputContent");
  const outputChevron = modalOverlay.querySelector("#dtgOutputChevron");
  outputSection._fullContent = content;
  const previewText = content.length > 200 ? content.substring(0, 200) + "..." : content;
  preview.innerHTML = `<pre style="margin: 0; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; color: #374151;">${previewText}</pre>`;
  outputSection.style.display = "block";
  let isOutputExpanded = true;
  outputToggle.addEventListener("click", () => {
    if (isOutputExpanded) {
      outputContent.style.display = "none";
      outputChevron.style.transform = "rotate(0deg)";
    } else {
      outputContent.style.display = "block";
      outputChevron.style.transform = "rotate(180deg)";
    }
    isOutputExpanded = !isOutputExpanded;
  });
  outputToggle.addEventListener("mouseenter", () => {
    outputToggle.style.background = "#f3f4f6";
    outputToggle.style.color = "#374151";
  });
  outputToggle.addEventListener("mouseleave", () => {
    outputToggle.style.background = "none";
    outputToggle.style.color = "#6b7280";
  });
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(content);
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
      }, 2e3);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  });
  const actionButtons = [copyBtn, downloadBtn, googleDocsBtn];
  actionButtons.forEach((btn) => {
    const isPrimary = btn === copyBtn;
    btn.addEventListener("mouseenter", () => {
      if (isPrimary) {
        btn.style.background = "#2563eb";
        btn.style.borderColor = "#2563eb";
      } else {
        btn.style.background = "#f9fafb";
        btn.style.borderColor = "#9ca3af";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (isPrimary) {
        btn.style.background = "#3b82f6";
        btn.style.borderColor = "#3b82f6";
      } else {
        btn.style.background = "white";
        btn.style.borderColor = "#d1d5db";
      }
    });
  });
  downloadBtn.addEventListener("click", () => {
    downloadAsDocx(content);
  });
  googleDocsBtn.addEventListener("click", () => {
    openInGoogleDocs(content);
  });
}
function hideOutput(modalOverlay) {
  const outputSection = modalOverlay.querySelector("#dtgOutputSection");
  outputSection.style.display = "none";
}
function downloadAsDocx(content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document-template.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function openInGoogleDocs(content) {
  const encodedContent = encodeURIComponent(content);
  const url = `https://docs.google.com/document/create?usp=chrome_app&title=Document Template&body=${encodedContent}`;
  window.open(url, "_blank");
}
function closeModal(modalElement) {
  saveUserPreferences(modalElement);
  modalElement.style.animation = "modalSlideOut 0.2s ease-in forwards";
  setTimeout(() => {
    if (modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
    }
    if (modalElement._escapeHandler) {
      document.removeEventListener("keydown", modalElement._escapeHandler);
    }
  }, 200);
}
function loadUserPreferences(modalOverlay) {
  try {
    const saved = localStorage.getItem("dtg_preferences");
    if (saved) {
      const prefs = JSON.parse(saved);
      if (prefs.complexity) {
        const complexityRadio = modalOverlay.querySelector(`input[name="complexity"][value="${prefs.complexity}"]`);
        if (complexityRadio) {
          complexityRadio.checked = true;
          complexityRadio.dispatchEvent(new Event("change"));
        }
      }
      if (prefs.jurisdiction) {
        const jurisdictionSelect = modalOverlay.querySelector("#dtgJurisdiction");
        if (jurisdictionSelect) jurisdictionSelect.value = prefs.jurisdiction;
      }
      if (prefs.industry) {
        const industrySelect = modalOverlay.querySelector("#dtgIndustry");
        if (industrySelect) industrySelect.value = prefs.industry;
      }
      if (prefs.includes && Array.isArray(prefs.includes)) {
        prefs.includes.forEach((value) => {
          const checkbox = modalOverlay.querySelector(`input[name="includes"][value="${value}"]`);
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change"));
          }
        });
      }
    }
  } catch (err) {
    console.warn("Could not load preferences:", err);
  }
}
function saveUserPreferences(modalOverlay) {
  try {
    const formData = collectFormData(modalOverlay);
    localStorage.setItem("dtg_preferences", JSON.stringify(formData));
  } catch (err) {
    console.warn("Could not save preferences:", err);
  }
}
function addTooltips(modalOverlay) {
  const tooltipData = [
    {
      selector: 'input[name="complexity"][value="complex"]',
      text: "Includes detailed legal clauses, liability protection, and enterprise-level terms"
    },
    {
      selector: "#dtgJurisdiction",
      text: "Selects appropriate legal language and compliance requirements for your region"
    },
    {
      selector: 'input[name="includes"][value="compliance"]',
      text: "Adds checklists to ensure all legal and regulatory requirements are met"
    }
  ];
  tooltipData.forEach(({ selector, text }) => {
    const element = modalOverlay.querySelector(selector);
    if (element) {
      const container = element.closest("label") || element;
      container.title = text;
    }
  });
}
function addKeyboardNavigation(modalOverlay) {
  modalOverlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      const generateBtn = modalOverlay.querySelector("#dtgGenerateBtn");
      if (!generateBtn.disabled) {
        generateBtn.click();
      }
    }
  });
  const toggleButtons = modalOverlay.querySelectorAll('[id$="Toggle"]');
  toggleButtons.forEach((button) => {
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    });
  });
}
function addInputValidation(modalOverlay) {
  const textarea = modalOverlay.querySelector("#dtgMainInput");
  modalOverlay.querySelector("#dtgGenerateBtn");
  textarea.addEventListener("input", () => {
    const value = textarea.value.trim();
    const length = value.length;
    textarea.style.borderColor = length === 0 ? "#d1d5db" : "#3b82f6";
    if (length > 0 && length < 10) {
      textarea.style.borderColor = "#f59e0b";
      showValidationMessage(modalOverlay, "Please provide more details (at least 10 characters)", "warning");
    } else if (length >= 10) {
      hideValidationMessage(modalOverlay);
    }
    if (value.toLowerCase().includes("untitled") || value.toLowerCase().includes("document")) {
      showValidationMessage(modalOverlay, "Try to be more specific about what type of document you need", "info");
    }
  });
}
function showValidationMessage(modalOverlay, message, type = "error") {
  hideValidationMessage(modalOverlay);
  const textarea = modalOverlay.querySelector("#dtgMainInput");
  const container = textarea.parentNode;
  const messageEl = document.createElement("div");
  messageEl.className = "dtg-validation-message";
  messageEl.style.cssText = `
    margin-top: 4px;
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 4px;
    animation: fadeIn 0.2s ease-out;
    ${type === "error" ? "background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;" : ""}
    ${type === "warning" ? "background: #fffbeb; color: #d97706; border: 1px solid #fde68a;" : ""}
    ${type === "info" ? "background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;" : ""}
  `;
  messageEl.textContent = message;
  container.appendChild(messageEl);
}
function hideValidationMessage(modalOverlay) {
  const existing = modalOverlay.querySelector(".dtg-validation-message");
  if (existing) {
    existing.remove();
  }
}
async function handleGenerateWithErrorHandling(modalOverlay) {
  const generateBtn = modalOverlay.querySelector("#dtgGenerateBtn");
  const btnText = modalOverlay.querySelector("#dtgBtnText");
  const spinner = modalOverlay.querySelector("#dtgSpinner");
  generateBtn.disabled = true;
  generateBtn.style.background = "#9ca3af";
  generateBtn.style.cursor = "not-allowed";
  btnText.textContent = "Generating...";
  spinner.style.display = "block";
  try {
    const formData = collectFormData(modalOverlay);
    if (!formData.description || formData.description.trim().length < 10) {
      throw new Error("Please provide a more detailed description (at least 10 characters).");
    }
    await simulateApiCall(formData);
    const generatedContent = generateMockTemplate(formData);
    showOutput(modalOverlay, generatedContent);
    showTemporaryMessage(modalOverlay, "Template generated successfully!", "success");
  } catch (error) {
    console.error("Generation error:", error);
    showTemporaryMessage(modalOverlay, error.message || "Failed to generate template. Please try again.", "error");
  } finally {
    const textarea = modalOverlay.querySelector("#dtgMainInput");
    if (textarea.value.trim().length >= 10) {
      generateBtn.disabled = false;
      generateBtn.style.background = "#3b82f6";
      generateBtn.style.cursor = "pointer";
    }
    btnText.textContent = "Generate Template";
    spinner.style.display = "none";
  }
}
async function simulateApiCall(formData) {
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1e3));
  if (Math.random() < 0.1) {
    throw new Error("Service temporarily unavailable. Please try again.");
  }
  if (formData.description.toLowerCase().includes("illegal")) {
    throw new Error("Cannot generate templates for illegal activities.");
  }
}
function showTemporaryMessage(modalOverlay, message, type = "info") {
  const messageEl = document.createElement("div");
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999999;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: fadeIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    ${type === "success" ? "background: #10b981; color: white;" : ""}
    ${type === "error" ? "background: #ef4444; color: white;" : ""}
    ${type === "info" ? "background: #3b82f6; color: white;" : ""}
  `;
  messageEl.textContent = message;
  document.body.appendChild(messageEl);
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.style.animation = "fadeOut 0.3s ease-in";
      setTimeout(() => messageEl.remove(), 300);
    }
  }, 3e3);
}
