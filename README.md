# Dropdown Badge

A custom Lovelace badge that renders an `input_select` as a dropdown directly in the badge area.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]
[![Community Forum][forum-shield]][forum]


## Features

- One-click dropdown for `input_select` entities
- Works in Lovelace `badges:` section
- Fully HACS-compatible

![Dropdown List Badge Preview](https://raw.githubusercontent.com/evandepol/dropdown-list-badge/main/dialog.png)


## Options

| Name              | Type    | Requirement  | Description                                 | Default             |
| ----------------- | ------- | ------------ | ------------------------------------------- | ------------------- |
| type              | string  | **Required** | `custom:dropdown-list-card`                 |
| entity            | string  | **Required** | Home Assistant entity ID.                   | `none`              |
| options           | list    | **Required** | List of options to show                     | `none`              |
| tap_action        | object  | **Optional** | Action to take on tap                       | `action: more-info` |
| hold_action       | object  | **Optional** | Action to take on hold                      | `none`              |
| double_tap_action | object  | **Optional** | Action to take on double tap                | `none`              |


## Example

```yaml
badges:
  - type: custom:dropdown-list-badge
    entity: input_select.room_filter
    options:
      - Living Room
      - Kitchen
      - Office

