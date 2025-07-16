"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // dropdown-list-badge.ts
  var DropdownListBadge = class extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._hass = {};
      this._dropdownOpen = false;
      this._highlightedIndex = -1;
      this._handleOutsideClick = this._handleOutsideClick.bind(this);
      this._handleKeyDown = this._handleKeyDown.bind(this);
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
      return document.createElement("dropdown-list-badge-editor");
    }
    static getStubConfig() {
      return { entity: "input_select.example", options: ["Option 1", "Option 2", "Option 3"] };
    }
    _openDropdown() {
      this._dropdownOpen = true;
      const state = this._hass.states[this._config.entity];
      const current = state ? state.state : null;
      const options = this._config.options;
      this._highlightedIndex = Math.max(0, options.indexOf(current != null ? current : ""));
      this._render();
      document.addEventListener("mousedown", this._handleOutsideClick);
      document.addEventListener("keydown", this._handleKeyDown);
      setTimeout(() => {
        const el = this.querySelector(".dropdown-option.highlighted");
        if (el) el.focus();
      }, 0);
    }
    // Close the open dropdown: reset highlight, rerender, and remove global listeners
    _closeDropdown() {
      this._dropdownOpen = false;
      this._highlightedIndex = -1;
      this._render();
      document.removeEventListener("mousedown", this._handleOutsideClick);
      document.removeEventListener("keydown", this._handleKeyDown);
    }
    _handleOutsideClick(e) {
      if (!this.contains(e.target)) {
        this._closeDropdown();
      }
    }
    // Handle keyboard navigation when dropdown is open
    _handleKeyDown(e) {
      if (!this._dropdownOpen) return;
      const options = this._config.options;
      switch (e.key) {
        case "Escape":
          this._closeDropdown();
          break;
        case "ArrowDown":
          e.preventDefault();
          this._highlightedIndex = (this._highlightedIndex + 1) % options.length;
          this._updateHighlight();
          break;
        case "ArrowUp":
          e.preventDefault();
          this._highlightedIndex = (this._highlightedIndex - 1 + options.length) % options.length;
          this._updateHighlight();
          break;
        case "Enter":
          if (this._highlightedIndex >= 0 && this._highlightedIndex < options.length) {
            this._selectOption(options[this._highlightedIndex]);
          }
          break;
      }
    }
    _updateHighlight() {
      this._render();
      setTimeout(() => {
        const el = this.querySelector(".dropdown-option.highlighted");
        if (el) el.focus();
      }, 0);
    }
    _selectOption(opt) {
      const options = this._config.options;
      const idx = options.indexOf(opt);
      if (this._dropdownOpen && idx !== -1) {
        const optionEls = this.querySelectorAll(".dropdown-option");
        const el = optionEls[idx];
        if (el) {
          el.classList.add("just-selected");
          setTimeout(() => {
            el.classList.remove("just-selected");
            this._hass.callService("input_select", "select_option", {
              entity_id: this._config.entity,
              option: opt
            });
            this._closeDropdown();
          }, 300);
          return;
        }
      }
      this._hass.callService("input_select", "select_option", {
        entity_id: this._config.entity,
        option: opt
      });
      this._closeDropdown();
    }
    _render() {
      if (!this._hass || !this._hass.states || !this._config) return;
      const state = this._hass.states[this._config.entity];
      if (!state) {
        this.innerHTML = `<span style="color: red;">Entity not found</span>`;
        return;
      }
      const current = state.state;
      const options = this._config.options;
      const name = this._config.name || "";
      const icon = this._config.icon || "";
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
        .dropdown-badge:focus {
          outline: none;
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
        const selectedClass = !this._dropdownOpen && opt === current ? " selected" : "";
        const highlightedClass = i === this._highlightedIndex ? " highlighted" : "";
        return `
                <div
                  class="dropdown-option${selectedClass}${highlightedClass}"
                  data-value="${opt}"
                  tabindex="0"
                  role="option"
                  aria-selected="${opt === current ? "true" : "false"}"
                >${opt}</div>
              `;
      }).join("")}
          </div>
          <div class="dropdown-measure">
            ${options.map((opt) => `<div>${opt}</div>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
      const badge = this.querySelector(".dropdown-badge");
      if (badge) {
        badge.onclick = null;
        badge.onclick = (e) => {
          if (!this._dropdownOpen) {
            this._openDropdown();
          }
        };
        badge.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._openDropdown();
          }
        };
      }
      if (this._dropdownOpen) {
        this.querySelectorAll(".dropdown-option").forEach((optEl, i) => {
          optEl.onmousedown = (e) => {
            const value = e.currentTarget.getAttribute("data-value");
            this._highlightedIndex = i;
            this._updateHighlight();
            if (value !== null) {
              this._selectOption(value);
            }
            e.stopPropagation();
          };
          optEl.onmouseover = () => {
            this.querySelectorAll(".dropdown-option").forEach((el) => el.classList.remove("highlighted"));
            optEl.classList.add("highlighted");
            this._highlightedIndex = i;
          };
        });
      }
      if (this._dropdownOpen) {
        const measure = this.querySelector(".dropdown-measure");
        const dropdown = this.querySelector(".dropdown-list");
        if (measure && dropdown) {
          let maxWidth = 0;
          Array.from(measure.children).forEach((child) => {
            const el = child;
            if (el.offsetWidth > maxWidth) maxWidth = el.offsetWidth;
          });
          dropdown.style.width = maxWidth + "px";
        }
      }
    }
    getCardSize() {
      return 1;
    }
  };
  // This is not documented in the main Home Assistant docs, but it is used 
  // internally by the Lovelace UI to filter and list custom badges.
  DropdownListBadge.type = "dropdown-list-badge";
  var DropdownListBadgeEditor = class extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._entities = [];
      this._debounceTimer = null;
      this._lastEntity = null;
      this.attachShadow({ mode: "open" });
    }
    setConfig(config) {
      const changed = JSON.stringify(this._config) !== JSON.stringify(config);
      this._config = __spreadValues({}, config);
      if (changed) this._render();
    }
    set hass(hass) {
      const oldEntities = this._entities ? this._entities.join(",") : "";
      const newEntities = Object.keys(hass.states).filter((eid) => hass.states[eid].attributes.options).sort();
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
      this._config.entity = value;
      this._emitConfigChanged();
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        if (this._hass && value && this._hass.states[value]) {
          const opts = this._hass.states[value].attributes.options;
          if (Array.isArray(opts)) {
            if (this._lastEntity !== value) {
              this._config.options = [...opts];
              this._lastEntity = value;
            } else {
              const current = Array.isArray(this._config.options) ? this._config.options : [];
              this._config.options = opts.filter((opt) => current.includes(opt));
            }
            this._emitConfigChanged();
            this._render();
          }
        }
      }, 300);
    }
    _onOptionToggled(e) {
      if (!e.target) return;
      const value = e.target.value;
      const checked = e.target.checked;
      let options = Array.isArray(this._config.options) ? [...this._config.options] : [];
      if (checked) {
        if (!options.includes(value)) options.push(value);
      } else {
        options = options.filter((opt) => opt !== value);
      }
      this._config.options = options;
      this._emitConfigChanged();
    }
    _emitConfigChanged() {
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: this._config }
      }));
    }
    _render() {
      if (!this.shadowRoot) return;
      let focusId = null;
      let caretPos = null;
      const active = this.shadowRoot.activeElement;
      if (active && active.id) {
        focusId = active.id;
        if (active.selectionStart !== void 0) {
          caretPos = active.selectionStart;
        }
      }
      const entity = this._config.entity || "";
      let possibleOptions = [];
      if (this._hass && entity && this._hass.states[entity]) {
        possibleOptions = this._hass.states[entity].attributes.options || [];
      }
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
            ${this._entities.map((eid) => `<option value="${eid}">`).join("")}
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
        <div class="options-list">
          <label>Options:</label>
          ${possibleOptions.length === 0 ? `<div class="hint"><i>No options found for this entity.</i></div>` : possibleOptions.map((opt) => `
              <div class="option-row">
                <input type="checkbox" id="opt-${opt}" value="${opt}" ${selectedOptions.includes(opt) ? "checked" : ""}/>
                <label for="opt-${opt}">${opt}</label>
              </div>
            `).join("")}
        </div>
        <div id="badge-version" style="text-align:right; color:#bbb; font-size:11px; margin-top:16px;">
          ${BADGE_VERSION}
        </div>
      </div>
    `;
      const entityInput = this.shadowRoot.getElementById("entity");
      entityInput.oninput = this._onEntityChanged.bind(this);
      entityInput.onkeydown = (e) => {
        if (e.key === "Tab") {
          const val = entityInput.value.trim().toLowerCase();
          if (val.length > 0) {
            const matches = this._entities.filter((eid) => eid.toLowerCase().startsWith(val));
            if (matches.length === 1 && matches[0] !== entityInput.value) {
              entityInput.value = matches[0];
              entityInput.setSelectionRange(matches[0].length, matches[0].length);
              entityInput.dispatchEvent(new Event("input", { bubbles: true }));
              e.preventDefault();
            }
          }
        }
      };
      possibleOptions.forEach((opt) => {
        const cb = this.shadowRoot.getElementById(`opt-${opt}`);
        if (cb !== null) {
          cb.onchange = this._onOptionToggled.bind(this);
        }
      });
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
    }
  };
  var BADGE_VERSION = "0.3.8-10";
  customElements.define("dropdown-list-badge", DropdownListBadge);
  customElements.define("dropdown-list-badge-editor", DropdownListBadgeEditor);
  var cards = globalThis.customCards = globalThis.customCards || [];
  cards.push({
    type: "dropdown-list-badge",
    name: "Dropdown List Badge",
    description: "A badge with a dropdown for input_select entities."
  });
})();
