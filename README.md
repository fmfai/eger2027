# FMF–AI 2027 — website, version 7.1 (three-dot contrast icon)

This archive is a static, GitHub Pages–compatible conference website. Upload **the files and folders inside the archive to the repository root**, including `.github` and `.nojekyll`. It replaces version 6; don't upload the ZIP itself as the website.

## What's changed in v7

- Persistent left-hand navigation on desktops, in the spirit of the Processing teaching website. A compact menu button opens an accessible, dismissible sidebar on mobile/tablet devices (960px and below).
- Less wasted space: the reading area is centered in the space remaining beside the sidebar. Tables and schedules have more usable width, while paragraphs stay readable.
- Modern typography: **Outfit** for headings and **Source Sans 3** for body text, each with system-font fallbacks. These fonts are loaded through Google Fonts when online.
- New restrained colours: warm off-white background, grey-blue navigation, teal links and a subtle copper highlight. Headings are slightly darker than body text.
- The high-contrast black/yellow mode is retained, with a toggle both in the desktop sidebar and in the mobile bar.
- Menu transitions continue to swap only the main content on a deployed site, without reloading the sidebar and masthead.
- All existing content and functional areas are preserved (registration form, review dialog, abstract search/sort, programme tabs, template ZIP, admin CSV export link).

## Registration

The bundled site is **in local test mode by default**. It saves fictional test submissions in the current browser only and can export a test CSV. It is **not a shared registration database**. Avoid actual attendee personal data until the live backend is configured.

To enable live registration, create a private Google Sheet and deploy `backend/Code.gs` as described in `backend/SETUP.md`. Paste the resulting `/exec` URL into `assets/settings.js`. Verify with fictional entries first. Never commit attendee CSV files or secrets to the public GitHub Pages repository.

Categories preserved from v6: Regular (300 EUR), PhD (200 EUR), Poster Only (provisionally 200 EUR), and Accompanying Person (100 EUR). The poster-only rate requires organizer confirmation.

## Abstracts

The `abstracts/entries.json` file and `scripts/build_abstracts.py` script produce searchable/sortable listings and individual detail pages from trusted LaTeX inputs using Pandoc, including the new sidebar layout. GitHub Actions rebuilds them after changes. A downloadable LaTeX template is under `downloads/`.

## Dates requiring correction before publication

The dates retained from the previous version are **Notification of Acceptance: 1 January 2026** and **Registration Opens: 5 January 2026**. Both predate the abstract deadline of 15 December 2026; confirm the intended years before publishing.

## Version 7.1 icon update

The high-contrast toggle now uses the familiar yellow circle with three black dots on desktop and mobile. The button retains its English accessible name (`Enable high-contrast view` / `Disable high-contrast view`) and keyboard support. The symbol itself is not an internationally recognized web-accessibility standard; the readable label is essential.
