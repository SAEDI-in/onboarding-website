# Waitlist entries in a Google Sheet

The waitlist form posts each entry to a Google Apps Script attached to a sheet.
The script appends a row. No server, no cost, and you own the data.

Takes about five minutes. You need to be signed in to the Google account that
should own the sheet.

## 1. Create the sheet

1. Go to <https://sheets.new> and name the spreadsheet, for example **SAEDI waitlist**.
2. In the menu, open **Extensions > Apps Script**. A script editor opens in a new tab.

## 2. Add the script

1. Delete the placeholder code in the editor.
2. Paste the whole contents of `Code.gs` (next to this file) and save (Ctrl+S).
3. In the toolbar, pick the function **setup** in the dropdown and click **Run**.
   - Google asks you to authorise the script. Choose your account, then **Advanced > Go to (project name)** if it warns that the app is unverified (it is your own script), then **Allow**.
   - This creates a **Waitlist** tab in the sheet with the header row.

Optional: to get an email for each sign-up, set `NOTIFY_EMAIL` at the top of the
script to your address and save. The next **Run** will ask for the extra
"send email" permission.

## 3. Deploy it as a web app

1. Click **Deploy > New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Settings:
   - Description: anything, for example `waitlist v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Copy** the Web app URL. It looks like
   `https://script.google.com/macros/s/AKfy.../exec`.

Open that URL in a browser tab. You should see `{"ok":true,"service":"SAEDI waitlist",...}`.

## 4. Connect the website

Open `website/js/config.js` and paste the URL:

```js
window.SAEDI_CONFIG = {
  waitlistEndpoint: 'https://script.google.com/macros/s/AKfy.../exec'
};
```

Reload the site, submit the form once with your own details, and check the
**Waitlist** tab. The row should appear within a second or two.

## Updating the script later

Apps Script web apps are versioned. After editing `Code.gs` in the editor:
**Deploy > Manage deployments > (pencil icon) > Version: New version > Deploy.**
The URL stays the same, so the website needs no change.

## What gets stored

| Column                  | Source                                      |
| ----------------------- | ------------------------------------------- |
| Timestamp               | Server time when the row was written        |
| Name, Email, Role       | Form fields (role is `ideas`, `build` or `both`) |
| College, Skills         | Optional form fields                        |
| Page                    | Which page the form was on                  |
| Submitted at (browser)  | The visitor's clock, ISO format             |
| User agent              | Browser string, useful for spotting bots    |

Spam protection: the form has a hidden "website" field that people never see.
If a bot fills it, the site shows the success message and sends nothing, and the
script also ignores any request where it is filled.

## Troubleshooting

- **Form shows the red error line.** Open the browser console (F12). A CORS error
  usually means the deployment is not set to "Anyone", or the URL is a
  `/dev` URL instead of `/exec`.
- **Rows are not appearing but no error shows.** Check **Executions** in the
  Apps Script editor's left sidebar for failed runs and their messages.
- **"Authorisation required" after editing the script.** Run **setup** again from
  the editor and approve the prompt, then create a new deployment version.
