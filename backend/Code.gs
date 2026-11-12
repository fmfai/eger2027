/**
 * FMF–AI 2027 — PUBLIC registration receiver.
 * This Apps Script project must be separate from the private admin project.
 * Deploy Web app: Execute as Me; Who has access: Anyone.
 * Do not add any read/list/export function to this publicly accessible project.
 */
const SPREADSHEET_ID = 'PASTE_PRIVATE_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Registrations';
const REGISTRATION_OPEN = true;
const SITE_URL = 'https://YOUR_USER.github.io/YOUR_REPO/registration.html';

const HEADERS = [
  'Timestamp','Request ID','First name','Family name','Email','Institution',
  'Category','Presentation','Presentation title','Poster','Poster title',
  'Invoice required','Billing name','Billing address','Tax/VAT number',
  'Dietary requirements','Additional comments'
];
const CATEGORIES = ['Regular participant','PhD student','Poster only','Accompanying person'];

function clean_(value, maxLength) {
  const s = String(value == null ? '' : value).trim().slice(0,maxLength);
  // Prevent CSV/Excel formula injection (Sheets interprets =,+,-,@ as formulas).
  return /^[\u0000-\u0020]*[=+\-@]/.test(s) ? "'" + s : s;
}
function receipt_(title, text, success, requestId) {
  // Never interpolate free-form registration data into HTML.
  const status = success ? '#1e7667' : '#aa4242';
  const idInfo = success && /^[a-zA-Z0-9-]{15,120}$/.test(String(requestId || ''))
    ? '<p class="reference">Reference: ' + requestId + '</p>' : '';
  const url = /^https:\/\/[^"'<>]+$/.test(SITE_URL) ? SITE_URL : 'https://github.com/';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>FMF–AI 2027 · Registration</title><style>
  body{background:#f6f8fa;color:#243b4f;margin:0;font:17px/1.6 Arial,system-ui,sans-serif}
  main{max-width:640px;margin:10vh auto;padding:36px 34px;background:#fff;border:1px solid #d9e2e8;border-top:5px solid ${status}}
  h1{font-size:1.75rem;line-height:1.2;color:${status};margin:0 0 15px}
  p{margin:0 0 16px}.reference{font-size:.84rem;color:#526b80}
  a{color:#17658e;font-weight:700} @media(max-width:650px){main{margin:20px 12px;padding:25px 20px}}
  </style></head><body><main><h1>${title}</h1><p>${text}</p>${idInfo}<a href="${url}" target="_top" rel="noopener">Back to conference registration</a></main></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle('FMF-AI 2027 Registration');
}
function doGet(e) {
  return receipt_('FMF-AI 2027 Registration','Please submit the registration form on the conference website.',false,'');
}
function doPost(e) {
  let requestId='';
  try {
    if(!REGISTRATION_OPEN) return receipt_('Registration is closed','Please contact the organizing committee.',false,'');
    if(SPREADSHEET_ID.startsWith('PASTE_')) return receipt_('Service not configured','The organizer has not connected the registration spreadsheet yet.',false,'');
    const p=(e && e.parameter)||{};
    if(p.website) return receipt_('Registration not recorded','Please return to the form.',false,'');
    requestId=String(p.requestId||'').trim();
    const first=clean_(p.firstName,100),last=clean_(p.familyName,100),email=clean_(p.email,200),institution=clean_(p.institution,220);
    const category=String(p.category||''),invoice=String(p.invoice||'');
    const presentation=p.presentation==='Yes',poster=p.poster==='Yes';
    const presentationTitle=clean_(p.presentationTitle,350),posterTitle=clean_(p.posterTitle,350);
    const billingName=clean_(p.billingName,220),billingAddress=clean_(p.billingAddress,350);
    if(!first||!last||!institution||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
        !CATEGORIES.includes(category)||!['Yes','No'].includes(invoice)||
        !/^[a-zA-Z0-9-]{15,120}$/.test(requestId)) {
      return receipt_('Please check your details','The registration was not saved. Check the required fields and try again.',false,'');
    }
    if(category==='Accompanying person') {
      if(presentation||poster||presentationTitle||posterTitle) return receipt_('Invalid contribution','Accompanying persons cannot submit presentations or posters.',false,'');
    } else if(category==='Poster only') {
      if(presentation||!poster||presentationTitle||!posterTitle) return receipt_('Invalid contribution','Poster-only registration requires a poster title and does not include a presentation.',false,'');
    } else if(category==='Regular participant'||category==='PhD student') {
      if(!presentation||!presentationTitle||(poster&&!posterTitle)||(!poster&&posterTitle))
        return receipt_('Invalid contribution','A presentation title is required. Enter a poster title only if submitting a poster as well.',false,'');
    }
    if(invoice==='Yes'&&(!billingName||!billingAddress)) return receipt_('Invoice information missing','Please enter the billing recipient and address.',false,'');
    const lock=LockService.getScriptLock();
    if(!lock.tryLock(20000))return receipt_('Please retry','The registration service is temporarily busy. Your registration was not saved.',false,'');
    try {
      const book=SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet=book.getSheetByName(SHEET_NAME);
      if(!sheet) sheet=book.insertSheet(SHEET_NAME);
      if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);}
      const n=sheet.getLastRow()-1;
      if(n>0){
        const ids=sheet.getRange(2,2,n,1).getDisplayValues();
        if(ids.some(row=>row[0]===requestId)) return receipt_('Registration already received','This registration was saved previously. Please do not submit it again.',true,requestId);
      }
      sheet.appendRow([
        new Date(),requestId,first,last,email,institution,category,
        presentation?'Yes':'No',presentation?presentationTitle:'',poster?'Yes':'No',poster?posterTitle:'',
        invoice,invoice==='Yes'?billingName:'',invoice==='Yes'?billingAddress:'',
        invoice==='Yes'?clean_(p.taxNumber,100):'',clean_(p.dietary,700),clean_(p.comments,1400)
      ]);
      SpreadsheetApp.flush();
    } finally {lock.releaseLock();}
    return receipt_('Registration received','Your registration has been saved successfully. Thank you!',true,requestId);
  } catch(err) {
    console.error('Registration failed',err);
    return receipt_('Registration not recorded','A server error occurred. Please contact the organizers or try again.',false,'');
  }
}
