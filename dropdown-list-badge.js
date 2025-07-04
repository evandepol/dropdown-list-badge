class DropdownListBadge extends HTMLElement {
  // This is not documented in the main Home Assistant docs, but it is used 
  // internally by the Lovelace UI to filter and list custom badges.
  static type = "dropdown-list-badge";

  constructor() {
    super();
    this._dropdownOpen = false;
    this._highlightedIndex = -1;
    this._longPressTimer = null; // Timer for long-press detection
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
  }

  setConfig(config) {
    if (!config.entity || !Array.isArray(config.options)) {
      throw new Error("dropdown-list-badge requires 'entity' and 'options'");
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._render();
  }

  static getConfigElement() {
    return document.createElement('dropdown-list-badge-editor');
  }

  static getStubConfig() {
    return { entity: 'input_select.example', options: ['Option 1', 'Option 2', 'Option 3']  };
  }

  _openDropdown() {
    this._dropdownOpen = true;
    // Set highlighted index to current value or first option
    const state = this._hass.states[this._config.entity];
    const current = state ? state.state : null;
    const options = this._config.options;
    this._highlightedIndex = Math.max(0, options.indexOf(current));
    this._render();
    document.addEventListener("mousedown", this._handleOutsideClick);
    document.addEventListener("keydown", this._handleKeyDown);
    // Focus the first option for accessibility
    setTimeout(() => {
      const el = this.querySelector(".dropdown-option.highlighted");
      if (el) el.focus();
    }, 0);
  }

  _closeDropdown() {
    this._dropdownOpen = false;
    this._highlightedIndex = -1;
    this._render();
    document.removeEventListener("mousedown", this._handleOutsideClick);
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  _handleOutsideClick(e) {
    // Debug: log the selected option to the browser console
    //console.debug("DropdownListBadge: _handleOutsideClick");

    // Only close if the click is truly outside the dropdown
    if (!this.contains(e.target)) {
      this._closeDropdown();
    }
  }

  _handleKeyDown(e) {
    if (!this._dropdownOpen) return;
    const options = this._config.options;
    if (e.key === "Escape") {
      this._closeDropdown();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this._highlightedIndex = (this._highlightedIndex + 1) % options.length;
      this._updateHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._highlightedIndex = (this._highlightedIndex - 1 + options.length) % options.length;
      this._updateHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (this._highlightedIndex >= 0 && this._highlightedIndex < options.length) {
        this._selectOption(options[this._highlightedIndex]);
      }
    }
  }

  _updateHighlight() {
    this._render();
    // Scroll highlighted option into view
    setTimeout(() => {
      const el = this.querySelector(".dropdown-option.highlighted");
      if (el) el.focus();
    }, 0);
  }

  _selectOption(opt) {
    // Debug: log the selected option to the browser console
    //console.debug("DropdownListBadge: Selected option", opt);

    // Visual feedback: flash the selected option
    const options = this._config.options;
    const idx = options.indexOf(opt);
    if (this._dropdownOpen && idx !== -1) {
      const optionEls = this.querySelectorAll(".dropdown-option");
      const el = optionEls[idx];
      if (el) {
        el.classList.add("just-selected");
        setTimeout(() => {
          el.classList.remove("just-selected");
          // Now close the dropdown and call the service
          this._hass.callService("input_select", "select_option", {
            entity_id: this._config.entity,
            option: opt
          });
          this._closeDropdown();
        }, 300);
        return; // Prevent immediate close
      }
    }

    // Fallback: if not found, just proceed
    this._hass.callService("input_select", "select_option", {
      entity_id: this._config.entity,
      option: opt
    });
    this._closeDropdown();
  }

  _render() {
    if (!this._hass || !this._config) return;
    const state = this._hass.states[this._config.entity];
    if (!state) {
      this.innerHTML = `<span style="color: red;">Entity not found</span>`;
      return;
    }

    const current = state.state;
    const options = this._config.options;
    const name = this._config.name || "";
    const icon = this._config.icon || "";
    const defaultOption = this._config.default;

    this.innerHTML = `
      <style>
        .badge-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .dropdown-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 36px;   /* Always at least 36px */
          height: auto;
          font-size: 11px;
          font-weight: 500;
          line-height: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          border: 2px solid var(--primary-color, #2196f3);
          background: var(--ha-card-background, #fff);
          color: var(--primary-text-color, #212121);
          box-sizing: border-box;
          cursor: pointer;
          user-select: none;
          transition: box-shadow 0.2s, border-color 0.2s;
          position: relative;
        }
        .dropdown-badge.open, .dropdown-badge:focus {
          outline: none;
          border-color: var(--primary-color, #1976d2);
          box-shadow: 0 0 0 2px var(--primary-color, #1976d2, 0.2);
        }
        .badge-content-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin: 0; /* remove any default margin */
        }
        .badge-name-inside {
          font-size: 10px;
          color: var(--secondary-text-color, #888);
          text-align: center;
          font-weight: 400;
          letter-spacing: 0.02em;
          margin-bottom: 1px; /* reduced margin */
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .badge-icon {
          margin-right: 4px; /* slightly reduced */
          font-size: 18px;
          width: 18px;
          height: 18px;
          vertical-align: middle;
          --mdc-icon-size: 18px;
          color: var(--primary-color, #2196f3);
          display: inline-block;
        }
        .dropdown-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--primary-text-color, #212121);
        }
        .dropdown-arrow {
          margin-left: 8px;
          display: inline-block;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          vertical-align: middle;
        }
        .dropdown-badge.open .dropdown-arrow {
          transform: rotate(180deg);
        }
        .dropdown-list {
          font-size: 14px;
          font-weight: 500;
          min-width: 180px;
          width: max-content;
          border-radius: 10px;
          z-index: 1000;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ha-card-background, var(--card-background-color, #222));
          /* border: 2px solid var(--primary-color, #2196f3); */ /* Removed border */
          box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0,0,0,0.18));
          margin-top: 8px;
          max-height: 320px;
          overflow-y: auto;
          white-space: nowrap;
          padding: 6px 0;
        }
        .dropdown-option {
          padding: 12px 24px;
          cursor: pointer;
          color: var(--primary-text-color, inherit);
          outline: none;
          text-align: left;
          background: none;
          border: none;
          font-size: inherit;
          font-family: inherit;
          white-space: nowrap;
          border-radius: 8px;
          margin: 0 4px;
          transition: background 0.15s, color 0.15s;
        }
        .dropdown-measure {
          position: absolute;
          visibility: hidden;
          height: 0;
          overflow: visible;
          white-space: nowrap;
          pointer-events: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          padding: 12px 24px;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .dropdown-option.selected,
        .dropdown-option.highlighted,
        .dropdown-option:hover {
          background: var(--primary-color, #03a9f4);
          color: var(--text-primary-color, #fff);
        }
        .dropdown-option.just-selected {
          animation: flash-selected 0.2s;
          background: var(--accent-color, #ff9800) !important;
          color: white !important;
        }
        @keyframes flash-selected {
          from { background: var(--accent-color, #ff9800); }
          to { background: var(--primary-color, #03a9f4); }
        }
        .badge-name {
          font-size: 11px;
          color: var(--secondary-text-color, #888);
          margin-bottom: 2px;
          text-align: center;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .badge-icon {
          margin-right: 8px;
          font-size: 18px;
          width: 18px;
          height: 18px;
          vertical-align: middle;
          --mdc-icon-size: 18px;
          color: var(--primary-color, #2196f3);
          display: inline-block;
        }
      </style>
      <div class="badge-wrapper">
        <div
          class="dropdown-badge${this._dropdownOpen ? " open" : ""}"
          tabindex="0"
          role="button"
          aria-label="Select option"
          aria-haspopup="listbox"
          aria-expanded="${this._dropdownOpen ? "true" : "false"}"
        >
          ${name ? `<div class="badge-name-inside">${name}</div>` : ""}
          <div class="badge-content-row">
            ${icon ? `<ha-icon class="badge-icon" icon="${icon}"></ha-icon>` : ""}
            <span class="dropdown-value">${current}</span>
            <span class="dropdown-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
        ${this._dropdownOpen ? `
          <div class="dropdown-list" role="listbox">
            ${options.map((opt, i) => {
              const selectedClass = (!this._dropdownOpen && opt === current) ? ' selected' : '';
              const highlightedClass = (i === this._highlightedIndex) ? ' highlighted' : '';
              const defaultClass = (opt === defaultOption) ? ' default-option' : '';
              return `
                <div
                  class="dropdown-option${selectedClass}${highlightedClass}${defaultClass}"
                  data-value="${opt}"
                  tabindex="0"
                  role="option"
                  aria-selected="${opt === current ? "true" : "false"}"
                >${opt}${opt === defaultOption ? ' <span style="color:#888;font-size:10px;">(default)</span>' : ''}</div>
              `;
            }).join('')}
          </div>
          <div class="dropdown-measure">
            ${options.map(opt => `<div>${opt}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Attach event handler to the custom badge
    const badge = this.querySelector(".dropdown-badge");
    if (badge) {
      badge.onclick = () => this._openDropdown();
      badge.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this._openDropdown();
        }
      };
      badge.ondblclick = () => {
        if (defaultOption && options.includes(defaultOption)) {
          this._selectOption(defaultOption);
        }
      };
    }

    if (this._dropdownOpen) {
      this.querySelectorAll(".dropdown-option").forEach((optEl, i) => {
        optEl.onmousedown = (e) => {
          const value = e.currentTarget.getAttribute("data-value");
          this._highlightedIndex = i;
          this._updateHighlight();
          this._selectOption(value);
          e.stopPropagation();
        };
        optEl.onmouseover = () => {
          this.querySelectorAll('.dropdown-option').forEach(el => el.classList.remove('highlighted'));
          optEl.classList.add('highlighted');
          this._highlightedIndex = i;
        };
      });
    }

    // Dynamically set dropdown-list width to match the widest option
    if (this._dropdownOpen) {
      const measure = this.querySelector('.dropdown-measure');
      const dropdown = this.querySelector('.dropdown-list');
      if (measure && dropdown) {
        let maxWidth = 0;
        measure.childNodes.forEach(child => {
          if (child.offsetWidth > maxWidth) maxWidth = child.offsetWidth;
        });
        dropdown.style.width = maxWidth + 'px';
      }
    }
  }

  getCardSize() {
    return 1;
  }

  // Add event listeners for long-press detection
  connectedCallback() {
    this.addEventListener("mousedown", this._handleMouseDown);
    this.addEventListener("mouseup", this._handleMouseUp);
    this.addEventListener("mouseleave", this._handleMouseLeave);
  }

  disconnectedCallback() {
    this.removeEventListener("mousedown", this._handleMouseDown);
    this.removeEventListener("mouseup", this._handleMouseUp);
    this.removeEventListener("mouseleave", this._handleMouseLeave);
  }

  _handleMouseDown() {
    this._longPressTimer = setTimeout(() => {
      const defaultOption = this._config.default;
      if (defaultOption) {
        this._selectOption(defaultOption);
      }
    }, 500); // 500ms for long-press
  }

  _handleMouseUp() {
    clearTimeout(this._longPressTimer);
  }

  _handleMouseLeave() {
    clearTimeout(this._longPressTimer);
  }
}



// Visual editor for dropdown-list-badge
class DropdownListBadgeEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._entities = [];
    this._debounceTimer = null;
    this._lastEntity = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    // console.log("DropdownListBadgeEditor: setConfig", config);
    const changed = JSON.stringify(this._config) !== JSON.stringify(config);
    this._config = { ...config };
    if (changed) this._render();
  }

  set hass(hass) {
    // console.log("DropdownListBadgeEditor: set hass");
    const oldEntities = this._entities ? this._entities.join(",") : "";
    const newEntities = Object.keys(hass.states)
      .filter(eid => hass.states[eid].attributes.options)
      .sort();
    const changed = oldEntities !== newEntities.join(",");
    this._hass = hass;
    this._entities = newEntities;
    if (changed) this._render();
  }

  get config() {
    return this._config;
  }

  _onEntityChanged(e) {
    const value = e.target.value;
    // console.log("DropdownListBadgeEditor: entity input changed", value);
    this._config.entity = value;
    this._emitConfigChanged();

    // Debounce: wait after last keystroke before trying to fetch options
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      // console.log("DropdownListBadgeEditor: debounce timer fired for entity", value);
      if (this._hass && value && this._hass.states[value]) {
        const opts = this._hass.states[value].attributes.options;
        if (Array.isArray(opts)) {
          // If entity changed, select all by default
          if (this._lastEntity !== value) {
            this._config.options = [...opts];
            this._lastEntity = value;
          } else {
            // If entity did not change, preserve current selections (intersection)
            const current = Array.isArray(this._config.options) ? this._config.options : [];
            this._config.options = opts.filter(opt => current.includes(opt));
          }
          // console.log("DropdownListBadgeEditor: options updated from entity", opts);
          this._emitConfigChanged();
          this._render();
        }
      }
    }, 300);
  }

  _onOptionToggled(e) {
    const value = e.target.value;
    const checked = e.target.checked;
    let options = Array.isArray(this._config.options) ? [...this._config.options] : [];
    if (checked) {
      if (!options.includes(value)) options.push(value);
    } else {
      options = options.filter(opt => opt !== value);
    }
    this._config.options = options;
    this._emitConfigChanged();
  }

  _emitConfigChanged() {
    // console.log("DropdownListBadgeEditor: config-changed", this._config);
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }
    }));
  }

  _render() {
    // console.log("DropdownListBadgeEditor: _render");
    if (!this.shadowRoot) return;

    // Focus/caret preservation
    let focusId = null;
    let caretPos = null;
    const active = this.shadowRoot.activeElement;
    if (active && active.id) {
      focusId = active.id;
      if (active.selectionStart !== undefined) {
        caretPos = active.selectionStart;
      }
    }

    const entity = this._config.entity || "";
    // Get possible options from entity, or empty array
    let possibleOptions = [];
    if (this._hass && entity && this._hass.states[entity]) {
      possibleOptions = this._hass.states[entity].attributes.options || [];
    }
    // Get selected options from config
    const selectedOptions = Array.isArray(this._config.options) ? this._config.options : [];
    const name = this._config.name || "";
    const icon = this._config.icon || "";

    this.shadowRoot.innerHTML = `
      <style>
        .editor-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-size: 14px;
        }
        label {
          font-weight: 500;
          margin-bottom: 4px;
        }
        input[type="text"] {
          width: 100%;
          font-size: 14px;
          padding: 6px;
          border-radius: 4px;
          border: 1px solid var(--divider-color, #e0e0e0);
          box-sizing: border-box;
        }
        .hint {
          color: #888;
          font-size: 12px;
        }
        .options-list {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .option-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .option-row label {
          font-weight: 400;
          margin: 0;
        }
      </style>
      <div class="editor-root">
        <div>
          <label for="entity">Entity</label>
          <input id="entity" type="text" value="${entity}" placeholder="e.g. input_select.my_select" list="entity-list" autocomplete="off" />
          <datalist id="entity-list">
            ${this._entities.map(eid => `<option value="${eid}">`).join("")}
          </datalist>
          <div class="hint">Options will auto-populate from the entity. Use checkboxes to include/exclude.</div>
        </div>
        <div>
          <label for="badge-name">Name (optional)</label>
          <input id="badge-name" type="text" value="${name}" placeholder="Badge name (optional)" />
        </div>
        <div>
          <label for="badge-icon">Icon (optional, e.g. mdi:star)</label>
          <input id="badge-icon" type="text" value="${icon}" placeholder="mdi:star" />
        </div>
        <div>
          <label for="badge-default">Default option (double-click badge to select)</label>
          <select id="badge-default">
            <option value="">(none)</option>
            ${possibleOptions.map(opt => `
              <option value="${opt}" ${opt === this._config.default ? "selected" : ""}>${opt}</option>
            `).join("")}
          </select>
          <div class="hint">This option will be selected when the badge is double-clicked.</div>
        </div>
        <div class="options-list">
          <label>Options:</label>
          ${possibleOptions.length === 0
            ? `<div class="hint"><i>No options found for this entity.</i></div>`
            : possibleOptions.map(opt => `
              <div class="option-row">
                <input type="checkbox" id="opt-${opt}" value="${opt}" ${selectedOptions.includes(opt) ? "checked" : ""}/>
                <label for="opt-${opt}">${opt}</label>
              </div>
            `).join("")}
        </div>
      </div>
    `;

    // Attach event listeners
    const entityInput = this.shadowRoot.getElementById("entity");
    entityInput.oninput = this._onEntityChanged.bind(this);
    // entityInput.onfocus = () => console.log("DropdownListBadgeEditor: entity input focused");
    // entityInput.onblur = () => console.log("DropdownListBadgeEditor: entity input blurred");
    entityInput.onkeydown = (e) => {
      if (e.key === "Tab") {
        const val = entityInput.value.trim().toLowerCase();
        if (val.length > 0) {
          const matches = this._entities.filter(eid => eid.toLowerCase().startsWith(val));
          if (matches.length === 1 && matches[0] !== entityInput.value) {
            entityInput.value = matches[0];
            entityInput.setSelectionRange(matches[0].length, matches[0].length);
            entityInput.dispatchEvent(new Event("input", { bubbles: true }));
            e.preventDefault();
          }
        }
      }
    };

    // Checkbox listeners
    possibleOptions.forEach(opt => {
      const cb = this.shadowRoot.getElementById(`opt-${opt}`);
      if (cb) cb.onchange = this._onOptionToggled.bind(this);
    });

    // Restore focus/caret if possible
    if (focusId) {
      const toFocus = this.shadowRoot.getElementById(focusId);
      if (toFocus) {
        toFocus.focus();
        if (caretPos !== null && toFocus.setSelectionRange) {
          toFocus.setSelectionRange(caretPos, caretPos);
        }
      }
    }

    const nameInput = this.shadowRoot.getElementById("badge-name");
    if (nameInput) {
      nameInput.oninput = (e) => {
        this._config.name = e.target.value;
        this._emitConfigChanged();
      };
    }
    const iconInput = this.shadowRoot.getElementById("badge-icon");
    if (iconInput) {
      iconInput.oninput = (e) => {
        this._config.icon = e.target.value;
        this._emitConfigChanged();
      };
    }
    const defaultSelect = this.shadowRoot.getElementById("badge-default");
    if (defaultSelect) {
      defaultSelect.onchange = (e) => {
        this._config.default = e.target.value || undefined;
        this._emitConfigChanged();
      };
    }
  }
}

customElements.define("dropdown-list-badge", DropdownListBadge);
customElements.define("dropdown-list-badge-editor", DropdownListBadgeEditor);

// register the custom card in Home Assistant so it shows up as a custom bade
window.customCards = window.customCards || [];
window.customCards.push({
  type: "dropdown-list-badge",
  name: "Dropdown List Badge",
  description: "A badge with a dropdown for input_select entities."
});
