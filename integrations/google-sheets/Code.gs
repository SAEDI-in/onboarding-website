/**
 * SAEDI waitlist -> Google Sheet
 *
 * Paste this into the Apps Script editor of the Google Sheet that should hold
 * the entries (Extensions > Apps Script), then deploy it as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into website/js/config.js (waitlistEndpoint).
 *
 * Full steps: README.md next to this file.
 */

var SHEET_NAME = 'Waitlist';

// Optional. Put your email here to get a short email for every new sign-up.
// Leave empty to disable. (Enabling it adds a "send email" permission to the script.)
var NOTIFY_EMAIL = '';

var COLUMNS = [
  'Timestamp',
  'Name',
  'Email',
  'Role',
  'College',
  'Skills',
  'Page',
  'Submitted at (browser)',
  'User agent'
];

/** Handles the form POST from the website. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var data = parseBody_(e);

    // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
    if (data.website) return json_({ ok: true });

    var email = String(data.email || '').trim();
    if (!email) return json_({ ok: false, error: 'Email is required.' });

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      String(data.name || '').trim(),
      email,
      String(data.role || '').trim(),
      String(data.college || '').trim(),
      String(data.skills || '').trim(),
      String(data.page || '').trim(),
      String(data.submittedAt || '').trim(),
      String(data.userAgent || '').trim()
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'New SAEDI waitlist sign-up: ' + (data.name || email),
        'Name: ' + (data.name || '') + '\n' +
        'Email: ' + email + '\n' +
        'Role: ' + (data.role || '') + '\n' +
        'College: ' + (data.college || '') + '\n' +
        'Skills: ' + (data.skills || '') + '\n' +
        'Page: ' + (data.page || '') + '\n\n' +
        'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      );
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the Web app URL in a browser shows this. Handy to confirm the deployment is live. */
function doGet() {
  return json_({ ok: true, service: 'SAEDI waitlist', sheet: SHEET_NAME });
}

/** Run this once from the editor (Run > setup) to create the sheet tab and grant permissions. */
function setup() {
  getSheet_();
}

/** Optional. Run from the editor to append one test row without touching the website. */
function testAppend() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        name: 'Test Student',
        email: 'test@example.com',
        role: 'build',
        college: 'Test College',
        skills: 'Testing',
        page: '/index.html',
        submittedAt: new Date().toISOString(),
        userAgent: 'Apps Script editor'
      })
    }
  };
  Logger.log(doPost(fake).getContent());
}

/* ---- helpers ---------------------------------------------------------- */

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents;
  if (raw) {
    try { return JSON.parse(raw); } catch (ignore) { /* fall through */ }
  }
  return (e && e.parameter) || {};
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
