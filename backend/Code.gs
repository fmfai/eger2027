/**
 * FMF-AI 2027 conference registration endpoint.
 * Deploy as Google Apps Script Web App: Execute as Me, Who has access Anyone.
 * All records stay in a PRIVATE Google Sheet. Never publish the sheet itself.
 * Test with fictional names before enabling public registration.
 */
const SPREADSHEET_ID = 'PASTE_PRIVATE_GOOGLE_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Registrations';
const REGISTRATION_OPEN = true;
const SITE_URL = 'https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY/';

const HEADERS = [
  'Timestamp', 'Request ID', 'First name', 'Family name', 'Email', 'Institution',
  'Category', 'Presentation', 'Presentation title', 'Poster', 'Poster title',
  'Invoice required', 'Billing name', 'Billing address', 'Tax/VAT number',
  'Dietary requirements', 'Additional comments'
];
const CATEGORIES = ['Regular participant','PhD student','Poster only','Accompanying person'];

function safe(v, limit) {
  let s = String(v == null ? '' : v).trim().slice(0, limit);
  // Avoid interpreting untrusted participant data as spreadsheet formulas.
  if (/^[\u0000-\u0020]*[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function resultPage(message, success) {
  const colour = success ? '#0d588e' : '#a32636';
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>FMF-AI Registration</title></head>' +
    '<body style="font:16px/1.7 system-ui,sans-serif;color:#163c5b;max-width:620px;margin:50px auto;padding:0 22px">' +
    '<h1 style="color:' + colour + ';font-size:1.8rem">' + message + '</h1>' +
    '<p>' + (success ? 'Your registration has been recorded.' : 'No new registration was recorded.') + '</p>' +
    '<p><a href="' + SITE_URL + '" target="_top">Back to the conference website</a></p></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('FMF-AI 2027 Registration');
}
function doPost(e) {
  try {
    if (!REGISTRATION_OPEN) return resultPage('Registration is not yet open', false);
    if (SPREADSHEET_ID.indexOf('PASTE_') === 0) return resultPage('Registration service is not configured', false);
    const p=(e && e.parameter) || {};
    if (p.website) return resultPage('Registration could not be processed',false);
    const first=safe(p.firstName,100),last=safe(p.familyName,100);
    const email=safe(p.email,200),institution=safe(p.institution,220);
    const category=String(p.category||''),invoice=String(p.invoice||'');
    const presentation=p.presentation==='Yes',poster=p.poster==='Yes';
    const presTitle=safe(p.presentationTitle,350),posterTitle=safe(p.posterTitle,350);
    const billingName=safe(p.billingName,220),billingAddress=safe(p.billingAddress,350);
    const requestId=String(p.requestId||'').trim();
    if (!first||!last||!institution||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
        !CATEGORIES.includes(category)||!['Yes','No'].includes(invoice)||
        !/^[a-zA-Z0-9-]{15,120}$/.test(requestId)) {
      return resultPage('Please check the required information',false);
    }
    if(category==='Accompanying person') {
      if(presentation||poster) return resultPage('Accompanying persons cannot register contributions',false);
    } else {
      if(!presentation&&!poster) return resultPage('Choose a presentation or a poster',false);
      if(category==='Poster only'&&(!poster||presentation)) return resultPage('Poster-only registration does not include a presentation',false);
      if(['Regular participant','PhD student'].includes(category)&&!presentation) return resultPage('This registration category requires a presentation',false);
      if(presentation&&!presTitle) return resultPage('Presentation title is required',false);
      if(poster&&!posterTitle) return resultPage('Poster title is required',false);
    }
    if(invoice==='Yes'&&(!billingName||!billingAddress)) return resultPage('Please provide your invoice details',false);
    const lock=LockService.getScriptLock();lock.waitLock(15000);
    try{
      const book=SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet=book.getSheetByName(SHEET_NAME);
      if(!sheet)sheet=book.insertSheet(SHEET_NAME);
      if(sheet.getLastRow()===0)sheet.appendRow(HEADERS);
      // A repeated click or browser retry must not create a duplicate registration.
      const n=sheet.getLastRow()-1;
      if(n>0){
        const ids=sheet.getRange(2,2,n,1).getDisplayValues();
        if(ids.some(row=>row[0]===requestId))return resultPage('Registration already received',true);
      }
      sheet.appendRow([
        new Date(),requestId,first,last,email,institution,category,
        presentation?'Yes':'No',presentation?presTitle:'',poster?'Yes':'No',poster?posterTitle:'',
        invoice,invoice==='Yes'?billingName:'',invoice==='Yes'?billingAddress:'',
        invoice==='Yes'?safe(p.taxNumber,100):'',safe(p.dietary,700),safe(p.comments,1400)
      ]);
    } finally {lock.releaseLock();}
    return resultPage('Registration received',true);
  } catch(error) {
    console.error('FMF-AI registration failed',error);
    return resultPage('Registration could not be processed',false);
  }
}
function doGet(){return resultPage('Please use the conference registration form',false);}
