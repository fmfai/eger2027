# FMF-AI 2027: Activate Google Sheets registration and organizer dashboard

The website can run on **GitHub Pages**, but the registry cannot be stored safely on a public repository. Google Apps Script is the receiver, and the spreadsheet stays private.

## Step 1 — Spreadsheet

1. Log into the **conference Google account**.
2. Create a spreadsheet at https://sheets.google.com; name it `FMF-AI 2027 Registrations`.
3. Keep it **Restricted** under Share. Do not publish it to the web.
4. From its URL `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`, copy `THIS_IS_THE_ID`.

## Step 2 — Public receiver

1. At https://script.google.com create a **new Apps Script project** called `FMF-AI 2027 Public Registration`.
2. Replace `Code.gs` with the contents of `backend/Code.gs`.
3. Set `SPREADSHEET_ID = '...'` and `SITE_URL` to the actual conference registration page URL.
4. Save, then choose **Deploy → New deployment → Web app**.
5. Set **Execute as: Me** and **Who has access: Anyone** (anonymous visitors must be able to register). Authorize when prompted.
6. Copy the Web app URL ending in `/exec`. **Do not** use the `/dev` test deployment URL.
7. In the website, open `assets/settings.js`, paste the URL into `registrationEndpoint: '...'`.
8. Commit/push these updated site files to GitHub Pages.

The public receiver is **write-only**: do not copy the private dashboard code into this Apps Script project.

## Step 3 — Private organizer dashboard (separate app)

1. At https://script.google.com create **another**, separate project: `FMF-AI 2027 Private Dashboard`.
2. Replace `Code.gs` with `backend/private-admin/Code.gs`, and put the same private `SPREADSHEET_ID` in this file.
3. Create a new HTML file in this project named exactly `Admin`, and paste in `backend/private-admin/Admin.html` (the HTML editor creates the file with `.html` automatically).
4. Deploy → New deployment → Web app.
5. Set **Execute as: Me** and **Who has access: Only myself**. **DO NOT USE Anyone** here. Authorize when prompted.
6. Copy the resulting private URL ending in `/exec`.
7. In `conference-office-bda12c0a169d50bac3421d.html`, set `const PRIVATE_DASHBOARD_URL = 'YOUR_PRIVATE_EXEC_URL';`.
8. Commit/push this HTML file to GitHub Pages. The public site deliberately does not link to it.

Your organizer URL will be:
`https://YOUR_GITHUB_USER.github.io/YOUR_REPOSITORY/conference-office-bda12c0a169d50bac3421d.html`

A hidden URL is not a password: GitHub Pages files are public and publicly browseable in the repository. **The real protection is Google’s “Only myself” access** on the private Apps Script deployment and keeping the Google spreadsheet Restricted.

The dashboard lists registration records with search, sorting, detail view, and a **Download Excel (.xlsx)** button. The download uses Google’s built-in spreadsheet Excel export and includes all spreadsheet rows.

## Step 4 — Test with fictional data

1. Open `registration.html` on your published site.
2. Choose Regular participant or PhD student (Presentation required), Poster only (only poster required), or Accompanying person (neither).
3. Enter fictional details and Review Registration.
4. Click Submit Registration. A new Google Apps Script tab opens. **Success is confirmed only if the new tab says “Registration received”.**
5. Open `conference-office-bda12c0a169d50bac3421d.html` as the conference Google account, then click **Open registration dashboard**.
6. Confirm the fictional row appears in the dashboard and click **Download Excel (.xlsx)**.
7. Delete the fictional row from your private sheet before announcing registration.

## Common issues

- **Registration is temporarily unavailable**: missing or incorrect endpoint in `assets/settings.js`, or changes not pushed to Pages.
- **Service not configured**: missing `SPREADSHEET_ID` in public `Code.gs` or the deployment was not updated after a code change.
- **Permission required / access denied**: wrong account or private deployment not set to `Only myself`.
- **Page not updated**: if Apps Script source changes, deploy a **new version** through Manage deployments; editing code alone does not update a versioned `/exec` deployment.
- **Nothing appears in Sheets**: inspect Apps Script → Executions in the public project; check that it runs as the Google account owning the sheet and that Spreadsheet ID is correct.
- **Private dashboard link opens an unexpected sign-in page**: make sure you are logged into the account that deployed the private Apps Script.
- **Excel download fails**: sign in to the authorized Google account and try Open Google Sheets → File → Download → Microsoft Excel (.xlsx).

## Note on privacy and operational limits

Public Apps Script endpoints can receive automated/spam submissions. The provided implementation uses a honeypot field, server validation, a request identifier, deduplication, and a lock, but it is not a replacement for an abuse-control service. The website is a technical prototype and its data processing notice must be adapted to the organizer's actual GDPR obligations before collecting personal data.
