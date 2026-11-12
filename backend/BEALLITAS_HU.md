# FMF-AI 2027 – Google Sheets regisztráció beállítása

A weboldal feltöltése **önmagában még nem kapcsolja be az adatmentést**. A regisztrációs űrlap éles használatához két külön Google Apps Script-alkalmazást kell telepíteni.

## 1. Privát táblázat létrehozása

1. A konferencia Google-fiókjával nyisd meg a https://sheets.google.com oldalt.
2. Hozz létre új táblázatot `FMF-AI 2027 Registrations` néven.
3. A megosztása maradjon **Korlátozott (Restricted)**.
4. Másold ki a táblázat azonosítóját az URL-ből: a `/d/` és az `/edit` közti hosszú szöveget.

## 2. Nyilvános regisztrációfogadó alkalmazás

1. Nyisd meg a https://script.google.com oldalt, és hozz létre **új projektet**.
2. A `Code.gs` fájl tartalmát cseréld le a csomag `backend/Code.gs` fájljára.
3. Írd be a táblázat azonosítóját a `SPREADSHEET_ID` változóba.
4. A `SITE_URL` változóba írd be a GitHub Pages-en elérhető **registration.html** teljes URL-jét.
5. Mentés → **Deploy → New deployment → Web app**.
6. **Execute as: Me**, **Who has access: Anyone**. Engedélyezd a hozzáférést a Google-fiókodban.
7. Másold ki a kapott, `/exec` végű URL-t.
8. A weboldal `assets/settings.js` fájljában a `registrationEndpoint: ''` helyére írd be ezt az URL-t idézőjelek közé.
9. Mentsd, majd töltsd fel a módosított `assets/settings.js` fájlt a GitHubra.

**Fontos:** a fenti nyilvános projektbe ne másold az adminfelület kódját!

## 3. Külön, védett adminfelület

1. A https://script.google.com oldalon hozz létre egy **második, külön projektet**.
2. A második projekt `Code.gs` fájljába másold a `backend/private-admin/Code.gs` tartalmát.
3. Itt is állítsd be ugyanazt a `SPREADSHEET_ID` értéket.
4. A szerkesztőben hozz létre új **HTML** fájlt `Admin` néven. Másold bele a `backend/private-admin/Admin.html` tartalmát.
5. **Deploy → New deployment → Web app**.
6. **Execute as: Me**, **Who has access: Only myself**. Ez alapvető adatvédelmi követelmény, ne állítsd át „Anyone” értékre!
7. Másold ki a második `/exec` URL-t.
8. A weboldal `conference-office-bda12c0a169d50bac3421d.html` fájljában a `const PRIVATE_DASHBOARD_URL = '';` sorba írd be ezt az URL-t.
9. Mentsd, és töltsd fel a módosított HTML-fájlt a GitHubra.

A szervezői bejárat webcíme a GitHub Pages címéhez hozzáfűzve:

`https://FELHASZNALONEV.github.io/REPOSITORY/conference-office-bda12c0a169d50bac3421d.html`

Ez a cím **nincs belinkelve** a nyilvános weboldalra, de a GitHub repository fájllistájában látható lehet. Az igazi védelem a Google-fiókos jogosultság.

## 4. Próbaregisztráció

1. Nyisd meg a közzétett `registration.html` oldalt.
2. Töltsd ki **kitalált tesztadatokkal**. Például `Jane Test`, `jane@example.test`.
3. Kattints a `Review Registration`, majd a `Submit Registration` gombra.
4. Egy új lapon a Google visszajelzése jelenik meg. A mentés **akkor sikeres, ha a „Registration received” feliratot látod**.
5. Nyisd meg a szervezői bejáratot, és lépj tovább a Google-alkalmazásba.
6. Ellenőrizd a tesztsort, próbáld ki a keresést és a **Download Excel (.xlsx)** gombot.
7. A tesztsort végül töröld a privát Google-táblázatból.

## Ha valami nem működik

- **Registration is temporarily unavailable:** ellenőrizd az `assets/settings.js` fájlban a publikus `/exec` URL-t.
- **Service not configured:** a publikus `Code.gs` fájlban hiányzik a `SPREADSHEET_ID`, vagy az Apps Script módosítását még nem telepítetted új verzióként.
- **Access denied / Bejelentkezés:** az adminfelülethez a telepítést végző konferencia Google-fiókkal kell bejelentkezni.
- **Nem jelenik meg sor:** a publikus Apps Script projektben nézd meg az **Executions** naplót, és ellenőrizd a táblázatazonosítót.
- **Excel nem töltődik le:** a védett táblázatban használd a **Fájl → Letöltés → Microsoft Excel (.xlsx)** menüpontot.

**Adatvédelem:** az ételérzékenységre vonatkozó mező esetleg különösen érzékeny adatot tartalmaz. Valós jelentkezések előtt az adatkezelési tájékoztatót és a hozzáféréseket ellenőrizni kell. A nyilvános GitHub repositoryba semmilyen személyes regisztrációs adatot ne ments.
