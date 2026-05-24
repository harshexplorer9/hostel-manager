# Google Sheets Auto Backup

Use this to keep a live Google Sheet backup in Drive whenever hostel app data changes.

## Apps Script Code

Copy the full code from [`google-sheets-backup-script.js`](./google-sheets-backup-script.js) into Google Apps Script.

This updated script supports the app's more reliable hidden-form backup request and includes:

- Rooms
- Tenants with leaving date and document checklist
- Room-wise payments
- Room-wise electricity
- Current dues report
- Sync info

## Setup

1. Open https://script.google.com/
2. Click `New project`.
3. Rename it to `B M Boys Hostel Sheet Backup`.
4. Delete the default code.
5. Paste the code from `google-sheets-backup-script.js`.
6. Click `Deploy` > `New deployment`.
7. Select type: `Web app`.
8. Set `Execute as` to `Me`.
9. Set `Who has access` to `Anyone`.
10. Click `Deploy` and allow permissions.
11. Copy the Web app URL ending with `/exec`.

## Connect In App

1. Open the hostel app.
2. Click `Cloud Login`.
3. Paste the Web app URL in `Google Sheet Web App URL`.
4. Click `Save Sheet Sync`.
5. Click `Update Sheet Now`.

After that, every room, tenant, payment, electricity, rent setting, or due setting change sends the latest backup to Google Sheet.

## Check

- Open Google Drive and search `B M Boys Hostel Backup`.
- The sheet should contain tabs: `Rooms`, `Tenants`, `Payments`, `Electricity`, `Current Report`, `Sync Info`.
- If you update Apps Script code later, deploy again as a new version and keep the same Web app URL if Apps Script allows it.
