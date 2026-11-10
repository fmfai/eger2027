# Configure registration (Google Sheets + Apps Script)

The `registration.html` page and its **Review Registration** dialog are fully implemented, but the final **Submit Registration** button needs the conference Google account's web-app endpoint. No data are stored by GitHub Pages.

1. Sign in to the Google account designated for conference registrations. Create a **private Google Sheet** (e.g. `FMF-AI 2027 Registrations`). Do not publish it or grant link-wide viewer access.
2. Open [script.google.com](https://script.google.com/) and create a new Apps Script project. Copy **all of `backend/Code.gs`** into its script editor.
3. Replace `PASTE_PRIVATE_GOOGLE_SPREADSHEET_ID_HERE` with the ID of your Sheet (the part between `/d/` and `/edit` in its URL). Set `SITE_URL` to the actual public conference website address.
4. In Apps Script select **Deploy → New deployment → Web app**, **Execute as: Me**, **Who has access: Anyone**. Authorize it in the account that owns the Sheet. Copy the deployment URL ending in `/exec`.
5. Edit **`assets/settings.js`** and paste this URL as `registrationEndpoint`. Do not add any private API token, password or spreadsheet edit credentials to the public website.
6. Publish the website on GitHub Pages and submit several **fictional test registrations**. After confirming in the browser's *new tab* that the result says **Registration received**, open the private Sheet and verify every column, including the distinct presentation and poster titles. Also test an error (Poster only + Presentation) and an invoice.
7. When the form changes or is closed for registration, update the Apps Script accordingly and use **Manage deployments → Edit → New version** to deploy the new code. To close the form, set `REGISTRATION_OPEN = false` and redeploy.
8. For CSV, open the private Sheet in the organizer Google account: **File → Download → Comma-separated values (.csv)**. GitHub access alone does not grant access to the private registration file.

Security details: the backend validates the category, contribution and billing rules independently of browser JavaScript; writes under a lock, prevents accidental duplicate submission using `Request ID`, and escapes spreadsheet formulas. The form uses a honeypot to reduce casual spam. A public endpoint can still receive malicious automated submissions; for a larger event consider a rate-limited backend and monitoring. The optional dietary field may contain sensitive health data: review the privacy notice, access controls, consent/legal basis and retention policy before inviting real attendees.

**Pricing note:** the original fee schedule included `Regular participant / PhD student — 200 EUR` but not a distinct poster-only fee. To support the requested category restriction, this version uses `Poster only — 200 EUR` based on the previous draft. Confirm the amount and designation before the site goes live.

**Date note:** the original `Notification of Acceptance — 5 January 2026` and `Registration Opens — 1 January 2026` have had their dates swapped as instructed; both are past dates for a January 2027 conference. Check these two before publishing externally.
