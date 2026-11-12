/**
 * FMF–AI 2027 — PRIVATE organizer dashboard.
 * IMPORTANT: A completely SEPARATE Apps Script project from public Code.gs.
 * Deploy Web app: Execute as Me; Who has access: ONLY MYSELF.
 * Never deploy this project as "Anyone" or "Anyone with Google Account".
 */
const SPREADSHEET_ID = 'PASTE_PRIVATE_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Registrations';
const MAX_DISPLAYED_ROWS = 2000;
const HEADERS = [
 'Timestamp','Request ID','First name','Family name','Email','Institution',
 'Category','Presentation','Presentation title','Poster','Poster title',
 'Invoice required','Billing name','Billing address','Tax/VAT number',
 'Dietary requirements','Additional comments'
];
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Admin')
    .setTitle('FMF-AI 2027 — Organizer Dashboard')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function dashboardData() {
  if(SPREADSHEET_ID.startsWith('PASTE_')) throw new Error('Set the private Spreadsheet ID in Code.gs.');
  const book=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet=book.getSheetByName(SHEET_NAME);
  const total=sheet?Math.max(0,sheet.getLastRow()-1):0;
  const limit=Math.min(total,MAX_DISPLAYED_ROWS);
  const rows=limit ? sheet.getRange(sheet.getLastRow()-limit+1,1,limit,HEADERS.length).getDisplayValues().reverse():[];
  return {
    headers:HEADERS,
    rows:rows,
    total:total,
    displayed:limit,
    generatedAt:new Date().toISOString(),
    excelUrl:'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(SPREADSHEET_ID)+'/export?format=xlsx',
    sheetUrl:'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(SPREADSHEET_ID)+'/edit'
  };
}
