# Dropdown List Badge

A customizable Home Assistant Lovelace badge that displays the current value of an `input_select` (or similar entity) and allows users to quickly change its value from a dropdown menu. This badge is designed for a modern, accessible, and visually appealing experience, with advanced configuration and integration options.

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

- The `options` list is auto-filled from the selected entity in the editor. You can include/exclude options using checkboxes.
- The `name` and `icon` fields are optional and can be left blank.

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
```

## Changelog

- Added support for optional `name` and `icon` fields.
- Improved dropdown styling and accessibility.
- Enhanced editor with focus/caret preservation and dynamic option population.
- Integrated with Lovelace "Custom badges" picker.

---

For more details, see the comments in `dropdown-list-badge.js`.

