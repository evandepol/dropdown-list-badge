# copilot-brief.md

## Project Overview

**dropdown-list-badge** is a Home Assistant Lovelace custom badge that displays and allows changing the value of an `input_select` entity via a dropdown. It is designed for user-specific UI control, accessibility, and seamless integration with Home Assistant dashboards.

## Objectives

- Provide a visually appealing, accessible badge for quick selection of `input_select` values.
- Support user-specific dashboard customization using Home Assistant’s conditional visibility.
- Ensure robust build, test, and deployment workflows for maintainability and developer experience.
- Maintain compatibility with HACS and Home Assistant resource management.

## Key Constraints

- Must work as a Lovelace custom badge, globally registered via `globalThis.customCards`.
- No global Node.js/npm install required; all dev tools run in Docker/Colima containers.
- TypeScript code must be compatible with both Home Assistant and Playwright tests.
- Resource paths and configuration must support HACS deployment and Home Assistant’s `/local/` resource convention.

## Tech Stack

- **TypeScript**: Main implementation (`dropdown-list-badge.ts`)
- **esbuild**: Bundling to browser-compatible JS (`dropdown-list-badge.js`)
- **Docker/Colima**: Containerized dev/test environment
- **Playwright**: Automated UI and visual regression testing
- **GitHub Actions**: CI/CD, Docker layer caching, artifact upload
- **HACS**: Home Assistant Community Store deployment

## Naming Conventions

- Badge: `custom:dropdown-list-badge`
- Entity: `input_select.<user_or_context>`
- Main file: `dropdown-list-badge.ts` (source), `dropdown-list-badge.js` (dist)
- HACS config: `hacs.json`
- Versioning: `version.json`
- Scripts: `run-test.sh`, `start-docker-env.sh`, `stop-docker-env.sh`

## Specific Tasks

- Implement badge and editor components in TypeScript with robust event handling and accessibility.
- Register badge globally for Home Assistant compatibility.
- Bundle code for browser use and type-check with `tsc --noEmit`.
- Configure Dockerfile for multi-stage build, npm update, and Playwright support.
- Set up CI/CD with Docker caching and artifact extraction.
- Document installation, configuration, and user-specific UI setup in README.
- Provide scripts for environment setup/teardown and test execution.
- Enable user-specific dashboard control via conditional visibility and per-user `input_select` helpers.

## Modules and Constructs

- **Badge Component**: Renders current value, dropdown, optional icon/name, handles selection and state updates.
- **Editor Component**: Visual editor for entity, options, name, icon; preserves focus/caret.
- **Global Registration**: Uses `globalThis.customCards` for Home Assistant compatibility.
- **Dockerfile**: Multi-stage build, npm update, Playwright install, static server.
- **CI/CD Workflow**: Validates build, runs tests, caches Docker layers, uploads artifacts.
- **Scripts**: Local environment management and test orchestration.

## Design Decisions

- Defensive guards in rendering and dropdown logic to prevent errors when `hass` is not set.
- Combined build and test jobs in CI to ensure Docker image availability for Playwright.
- Artifact extraction from Docker image for reliable CI/CD.
- README and documentation focused on concise, developer-friendly onboarding.
- User-specific UI achieved via per-user `input_select` helpers and Home Assistant’s conditional visibility.

## Notable Development Use Cases

- **User-Specific UI**: Each user controls their own dashboard view via a dedicated `input_select` and badge.
- **Visual Regression Testing**: Playwright tests verify UI rendering and interaction, with persistent artifacts and snapshot management.
- **Containerized Development**: All dev/test tools run in Docker/Colima, enabling consistent environments and easy onboarding.
- **HACS Deployment**: Configuration and resource paths ensure compatibility with Home Assistant Community Store.

---

This file serves as a persistent project memory for future development, onboarding, and as a reference for maintaining and enhancing the project over time.