const SPREADSHEET_NAME = "B M Boys Hostel Backup";

function doPost(e) {
  const rawPayload = (e && e.parameter && e.parameter.payload) || (e && e.postData && e.postData.contents) || "{}";
  const payload = JSON.parse(rawPayload);
  const spreadsheet = getOrCreateSpreadsheet();

  writeSheet(spreadsheet, "Rooms", [
    ["Room", "Floor", "Capacity", "Active Tenants", "Room Rent Total", "Deposit", "Notes"],
    ...(payload.rooms || []).map((row) => [row.number, row.floor, row.capacity, row.activeTenants, row.rentTotal, row.deposit, row.notes])
  ]);

  writeSheet(spreadsheet, "Tenants", [
    [
      "Name",
      "Mobile",
      "Alt Mobile",
      "Room",
      "Monthly Rent",
      "Joining Date",
      "Leaving Date",
      "ID Type",
      "ID Number",
      "Documents",
      "Emergency",
      "Address",
      "Status"
    ],
    ...(payload.tenants || []).map((row) => [
      row.name,
      row.mobile,
      row.altMobile,
      row.room,
      row.monthlyRent,
      row.joiningDate,
      row.leavingDate,
      row.idType,
      row.idNumber,
      row.documents,
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
    ...(payload.report || []).map((row) => [row.room, row.tenant, row.mobile, row.rentDue, row.electricityDue, row.paid, row.balance])
  ]);

  writeSheet(spreadsheet, "Sync Info", [
    ["Hostel", payload.hostelName || ""],
    ["Month", payload.month || ""],
    ["Updated At", payload.updatedAt || ""],
    ["Spreadsheet URL", spreadsheet.getUrl()]
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, url: spreadsheet.getUrl() })).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const spreadsheet = getOrCreateSpreadsheet();
  return ContentService.createTextOutput(`Google Sheet backup is ready: ${spreadsheet.getUrl()}`);
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
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
