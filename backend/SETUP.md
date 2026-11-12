# FMF-AI 2027 — regisztrációk Google Táblázatba

A honlap GitHub Pages-en fut; a jelentkezés adatmentése Google Apps Script + privát Google Táblázat segítségével történik. Az Excel-exportot közvetlenül a Google Táblázatokban végezd el. Külön CSV-adminoldal nincs.

## Beállítás lépésről lépésre

1. A konferencia Google-fiókjával nyisd meg a https://sheets.google.com oldalt, és hozz létre egy **privát** táblázatot, például `FMF-AI 2027 Registrations` néven. Ne tedd nyilvánossá és ne válaszd az „Anyone with the link” megosztási módot.
2. Másold ki a táblázat azonosítóját az URL-ből: `https://docs.google.com/spreadsheets/d/IDE_JÖN_AZ_AZONOSÍTÓ/edit`.
3. Nyisd meg a https://script.google.com oldalt ugyanazzal a fiókkal, hozz létre egy új Apps Script-projektet. A `backend/Code.gs` teljes tartalmát illeszd be a Code.gs szerkesztőbe.
4. A script elején a `SPREADSHEET_ID` értékét cseréld a táblázat azonosítójára. A `SITE_URL` értéke legyen a konferencia valódi, publikált GitHub Pages-címe.
5. Mentés után **Deploy → New deployment → Web app**. Válaszd az **Execute as: Me**, **Who has access: Anyone** lehetőségeket. Hagyd jóvá a kért Google-jogosultságokat. Másold ki a web app **`/exec` végű URL-jét**. Így a látogatók Google-bejelentkezés nélkül is jelentkezhetnek, de a táblázathoz nem kapnak hozzáférést.
6. Az oldal `assets/settings.js` fájljában add meg: `registrationEndpoint: 'https://script.google.com/macros/s/SAJÁT_AZONOSÍTÓ/exec'`.
7. Publikáld a GitHub Pages weboldalt, majd próbálj ki **kitalált tesztadatokkal** több regisztrációt. A Submit Registration gomb új lapon jeleníti meg a Google Apps Script eredményoldalát. Csak a **Registration received** felirat és a privát táblázatban ténylegesen megjelent új sor után tekintsd sikeresnek.
8. Ellenőrizd külön a regular + poster, PhD, poster only, accompanying person és számlázási eseteket. A tesztadatokat az éles indulás előtt töröld a táblázatból.
9. Excel export: **Google Táblázatok → Fájl → Letöltés → Microsoft Excel (.xlsx)**. Minden regisztráció külön sorban lesz.

## Üzemeltetés és biztonság

- Soha ne tedd a GitHub repositoryba a regisztrációs adatokat, a privát táblázat tartalmát vagy belépési adatokat. Az Apps Script URL publikus végpont, **nem titkos jelszó**.
- A fogadóoldal önállóan ellenőrzi a kötelező mezőket és a jelentkezési kategóriák szabályait, alapvető duplikációvédelmet alkalmaz, és védi a táblázatot a képletértelmezéstől. Ugyanakkor a nyilvános végpontot automatizált spam érheti, ezért kövesd a beérkezéseket.
- Az ételérzékenységi adatok egészségre vonatkozó érzékeny személyes információk lehetnek. Rendezd az adatkezelési tájékoztatást, jogalapot, hozzáféréseket, megőrzési időt a valódi adatok gyűjtése előtt.
- Változtatás után az Apps Scriptet új verzióként telepítsd a **Manage deployments → Edit → New version** menüponttal. Lezáráshoz a `REGISTRATION_OPEN` értéke `false` legyen, majd telepítsd újra.
- A korábban megadott 2026-os regisztrációs/értesítési dátumok nem illeszkednek a 2027-es konferenciához; publikálás előtt ellenőrizd őket.
- A `Poster only — 200 EUR` díj az előző változatból átvett, egyelőre megerősítendő összeg.

**Google Apps Script dokumentáció:** https://developers.google.com/apps-script/guides/web
