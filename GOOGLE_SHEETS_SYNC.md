# Google Sheets Auto Backup

Use this to keep a live Google Sheet backup in Drive whenever the app data changes.

## 1. Create Apps Script

1. Open https://script.google.com/
2. Click `New project`.
3. Rename it to `B M Boys Hostel Sheet Sync`.
4. Delete the default code.
5. Paste this code:

```js
const SPREADSHEET_NAME = "B M Boys Hostel Backup";

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const spreadsheet = getOrCreateSpreadsheet();

  writeSheet(spreadsheet, "Rooms", [
    ["Room", "Floor", "Capacity", "Active Tenants", "Room Rent Total", "Deposit", "Notes"],
    ...(payload.rooms || []).map((row) => [
      row.number,
      row.floor,
      row.capacity,
      row.activeTenants,
      row.rentTotal,
      row.deposit,
      row.notes
    ])
  ]);

  writeSheet(spreadsheet, "Tenants", [
    ["Name", "Mobile", "Alt Mobile", "Room", "Monthly Rent", "Joining Date", "ID Type", "ID Number", "Emergency", "Address", "Status"],
    ...(payload.tenants || []).map((row) => [
      row.name,
      row.mobile,
      row.altMobile,
      row.room,
      row.monthlyRent,
      row.joiningDate,
      row.idType,
      row.idNumber,
      row.emergency,
      row.address,
      row.status
    ])
  ]);

  writeSheet(spreadsheet, "Payments", [
    ["Room", "Month", "Amount", "Date", "Mode", "Remarks"],
    ...(payload.payments || []).map((row) => [row.room, row.month, row.amount, row.date, row.mode, row.remarks])
  ]);

  writeSheet(spreadsheet, "Electricity", [
    ["Room", "Month", "Previous", "Current", "Units", "Rate", "Fixed Charge", "Amount"],
    ...(payload.electricity || []).map((row) => [
      row.room,
      row.month,
      row.previousReading,
      row.currentReading,
      row.units,
      row.rate,
      row.fixedCharge,
      row.amount
    ])
  ]);

  writeSheet(spreadsheet, "Current Report", [
    ["Room", "Tenant", "Mobile", "Rent Due", "Electricity Due", "Paid", "Balance"],
    ...(payload.report || []).map((row) => [
      row.room,
      row.tenant,
      row.mobile,
      row.rentDue,
      row.electricityDue,
      row.paid,
      row.balance
    ])
  ]);

  writeSheet(spreadsheet, "Sync Info", [
    ["Hostel", payload.hostelName || ""],
    ["Month", payload.month || ""],
    ["Updated At", payload.updatedAt || ""],
    ["Spreadsheet URL", spreadsheet.getUrl()]
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, url: spreadsheet.getUrl() })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

function writeSheet(spreadsheet, name, values) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  sheet.clearContents();
  if (!values.length) return;
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  sheet.getRange(1, 1, 1, values[0].length).setFontWeight("bold");
  sheet.autoResizeColumns(1, values[0].length);
}
```

## 2. Deploy Web App

1. Click `Deploy` > `New deployment`.
2. Select type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Click `Deploy`.
6. Allow permissions.
7. Copy the Web app URL.

## 3. Connect In Hostel App

1. Open the hostel app.
2. Click `Cloud Login`.
3. Paste the Web app URL into `Google Sheet Web App URL`.
4. Click `Save Sheet Sync`.
5. Click `Update Sheet Now`.

After this, every room, tenant, payment, electricity, or settings change will send the latest data to the Google Sheet in Drive.

## Notes

- The sheet will be named `B M Boys Hostel Backup`.
- Apps Script creates a Google Sheet, not an `.xlsx` file. From Google Sheets, you can download Excel anytime using `File > Download > Microsoft Excel`.
- If the script deployment URL changes, paste the new URL in the app again.
