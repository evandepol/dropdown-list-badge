# Dropdown List Badge

A customizable Home Assistant Lovelace badge that displays the current value of an `input_select` (or similar entity) and allows users to quickly change its value from a dropdown menu. This badge is designed for a modern, accessible, and visually appealing experience, with advanced configuration and integration options.

[![Validate HACS](https://github.com/evandepol/dropdown-list-badge/actions/workflows/validate.yaml/badge.svg)](https://github.com/evandepol/dropdown-list-badge/actions/workflows/validate.yaml)
[![GitHub Release](https://img.shields.io/github/release/tterb/PlayMusic.svg?style=flat)]()  


## Downloads
#### GitHub (All Releases)
[![Github All Releases](https://img.shields.io/github/downloads/atom/atom/total.svg?style=flat)]()  
## Screenshots

The "add badge" edit dialog:
![Add badge dialog Screenshot](https://raw.githubusercontent.com/evandepol/dropdown-list-badge/main/dialog.png)


The rendered result before clicking the arrow:
![Rendered badge with dropdown menu](https://raw.githubusercontent.com/evandepol/dropdown-list-badge/main/dropdown.png)

## Features

- Displays the current value of a selectable entity (e.g., `input_select`).
- Click to open a dropdown and select a new value.
- Options are auto-populated from the selected entity and can be included/excluded via checkboxes in the editor.
- Optional `name` field to display a label above the badge.
- Optional `icon` field to display a Home Assistant icon to the left of the value.
- Animated dropdown arrow and flash effect using the Home Assistant accent color.
- Fully integrated with the Lovelace "Custom badges" picker. TODO
- Responsive, accessible, and keyboard-navigable UI with up, down, enter, and escape keys supported.
- Preserves focus and caret position in the editor for smooth editing.
- Compact layout: badge height is always at least 36px, and adapts to content.

## Configuration

Add the badge to your Lovelace dashboard using YAML or the UI editor. Example YAML:

```yaml
type: custom:dropdown-list-badge
entity: input_select.your_entity
options:
  - Option 1
  - Option 2
  - Option 3
name: My Dropdown      # (optional) Displayed above the badge
icon: mdi:star         # (optional) Home Assistant icon to show left of value
```

### Options

| Option   | Required | Description                                                                 |
|----------|----------|-----------------------------------------------------------------------------|
| entity   | Yes      | The entity ID of the `input_select` or compatible entity.                   |
| options  | Yes      | List of options to display in the dropdown. Auto-populated from the entity. |
| name     | No       | Optional label shown above the badge.                                       |
| icon     | No       | Optional icon (e.g., `mdi:star`) shown to the left of the value.            |
| default  | No       | Option to select when the badge is double-clicked.                          |

- The `options` list is auto-filled from the selected entity in the editor. You can include/exclude options using checkboxes.
- The `name` and `icon` fields are optional and can be left blank.
- The `default` option, if set, will be selected when the badge is double-clicked.

## Advanced Usage

- The badge supports Home Assistant template sensors to abstract user-specific input_selects into a single helper sensor.
- The dropdown width automatically adapts to the widest option.
- The badge is accessible via keyboard and screen readers.

## Installation

1. Copy `dropdown-list-badge.js` to your Home Assistant `www` folder.
2. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/dropdown-list-badge.js
    type: module
```

3. Add the badge to your dashboard via the UI or YAML.

## Editor

The badge includes a visual editor:
- Start typing an entity ID; options will auto-populate.
- Use checkboxes to include/exclude options.
- Set an optional name and icon.
- Editor preserves focus and caret position for smooth editing.

## Example

```yaml
type: custom:dropdown-list-badge
entity: input_select.living_room_mode
options:
  - Off
  - Movie
  - Reading
  - Party
name: Living Room Mode
icon: mdi:sofa
default: Movie
```

## Changelog

- Added support for optional `name` and `icon` fields.
- Improved dropdown styling and accessibility.
- Enhanced editor with focus/caret preservation and dynamic option population.
- Integrated with Lovelace "Custom badges" picker.

## Development & Testing

### Requirements

- [Colima](https://github.com/abiosoft/colima) (or Docker Desktop) is the **only** system requirement.
- **If using Colima, you must also install [lima-additional-guestagents](https://github.com/lima-vm/lima-additional-guestagents):**
  ```sh
  brew install lima-additional-guestagents
  ```
- All development and testing tools (Node.js, npm, Playwright, etc.) run inside a container. No global Node/npm install needed.

### Quick Start

1. **Install lima-additional-guestagents (if using Colima):**
   ```sh
   brew install lima-additional-guestagents
   ```

2. **Start Colima (or Docker):**
   ```sh
   colima start
   ```

3. **Build and run the test suite:**
   ```sh
   ./run-test.sh
   ```
   This script will:
   - Clean up any previous test containers.
   - Build the Docker image.
   - Start a static server in a container.
   - Run the Playwright test suite in a separate container.
   - Map the `tests/`, `tests/__snapshots__/`, and `tests/results/` directories for persistent test artifacts and visual regression snapshots.
   - Stop the server container after tests complete.

   Alternatively, you can run the steps manually:
   ```sh
   docker build -t dropdown-list-badge-test .
   docker run --rm -p 5000:5000 dropdown-list-badge-test npx serve -l 5000 . &
   # Wait a moment for the server to start, then in another terminal:
   docker run --rm --network host \
     -v "$(pwd)/tests:/app/tests" \
     -v "$(pwd)/tests/__snapshots__:/app/tests/__snapshots__" \
     -v "$(pwd)/tests/results:/app/tests/results" \
     dropdown-list-badge-test npx playwright test --output=tests/results
   ```

   Or, with a `docker-compose.yml`:
   ```sh
   docker-compose up --build
   ```

4. **Edit and re-run:**
   - All code and tests are mounted into the container for live development (if using `docker-compose` with volumes).
   - Test files are in the `tests/` directory (see `badge.spec.ts` for Playwright examples).
   - The test page is at `test/index.html` and uses a mock Home Assistant environment.

### Visual Regression & Test Artifacts

- Playwright is configured to:
  - Write all test artifacts (screenshots, videos, traces, HTML reports) to `tests/results/`.
  - Store and compare reference ("approved") screenshots in `tests/__snapshots__/`.
  - Use the config file at `tests/playwright.config.ts` to ensure all paths match the Docker volume mappings.
- After running tests, you can review:
  - Visual diffs and new/failed screenshots in `tests/results/`.
  - HTML reports in `tests/results/html-report/`.
  - Update reference images in `tests/__snapshots__/` as needed.

### What’s Tested

- Visual rendering of the badge (with Playwright screenshot comparison)
- Dropdown interaction (mouse and keyboard)
- Option display and selection
- Editor population, selection, and config propagation

### Local Development

- You can run the static server and Playwright tests inside the container, so no Node.js or Playwright install is needed on your host.
- For advanced debugging, you can run Playwright in headed mode or open a shell in the container.

---

For more details, see the comments in `dropdown-list-badge.js` and the test files.
