# FMF-AI 2027 Conference Website — v6

This is a static, responsive website designed for GitHub Pages. The header remains in place during internal page navigation. It includes the conference program, searchable LaTeX-generated abstracts, registration and a high-contrast theme.

## Test the registration now

Open `registration.html` from the deployed website, or run the website on a local web server (for example, `python -m http.server 8000`). The default **test mode** works without Google setup: complete the form, choose **Review Registration**, then **Submit Registration**. The result is saved to **this browser's localStorage**, not to GitHub or a shared server. Use **Download test CSV** after a test submission. Do **not** use real participant personal information in test mode; test data are device-local and can be cleared with browser site data. This is an end-to-end user-interface test, **not live conference registration**.

## Enable real registration

For conference use, create a **private** Google Sheet, deploy the `backend/Code.gs` Google Apps Script as described in `backend/SETUP.md`, and set the deployed `/exec` URL in `assets/settings.js` under `registrationEndpoint`. When the endpoint is configured, the browser posts to the private Sheet and does not use browser-local test saving. The organizer must verify the endpoint with fictional submissions and protect the sheet. Never place a credential or the CSV of registration details into the public GitHub Pages repository.

## Categories

- Regular participant: 300 EUR — presentation required; optional poster with no additional charge.
- PhD student: 200 EUR — presentation required; optional poster with no additional charge.
- Poster only: 200 EUR — poster required, presentation forbidden. The 200 EUR amount follows the previous draft; confirm it before publishing.
- Accompanying person: 100 EUR — no contribution.

Presentation title and poster title are separate fields. An invoice adds recipient and billing address. All validation messages are in English. All categories are revalidated in Apps Script.

## Other assets

- `abstracts/entries.json` and `scripts/build_abstracts.py`: searchable abstract list and generated detail pages (Pandoc used by GitHub Actions).
- `downloads/FMF-AI-2027-abstract-template.zip`: downloadable LaTeX template.
- `organizer.html`: private Google Sheet CSV export helper (access to the Sheet still required).

The footer's previous navigation links have been removed. Existing URLs such as `organizer.html` and `privacy.html` remain directly accessible if organizers need them.

## Important date issue

Notification of Acceptance and Registration Opens are currently **1 January 2026** and **5 January 2026** after the earlier instructed swap. Both predate the December 2026 abstract deadline. Correct them before going live.
