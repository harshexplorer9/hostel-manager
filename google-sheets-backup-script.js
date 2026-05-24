const SPREADSHEET_NAME = "B M Boys Hostel Backup";

function doPost(e) {
  const spreadsheet = getOrCreateSpreadsheet();
  const rawPayload = getRawPayload(e);
  const debugRows = [
    ["Received At", new Date()],
    ["Raw Payload Length", rawPayload.length],
    ["Post Content Type", (e && e.postData && e.postData.type) || ""],
    ["Parameter Keys", e && e.parameter ? Object.keys(e.parameter).join(", ") : ""],
    ["Raw Sample", rawPayload.slice(0, 300)]
  ];
  let payload;

  try {
    payload = rawPayload ? JSON.parse(rawPayload) : {};
  } catch (error) {
    writeSheet(spreadsheet, "Backup Debug", [...debugRows, ["Parse Error", error.message]]);
    return jsonResponse({ ok: false, error: error.message, rawLength: rawPayload.length, url: spreadsheet.getUrl() });
  }

  const counts = {
    rooms: (payload.rooms || []).length,
    tenants: (payload.tenants || []).length,
    payments: (payload.payments || []).length,
    electricity: (payload.electricity || []).length,
    report: (payload.report || []).length
  };
  writeSheet(spreadsheet, "Backup Debug", [
    ...debugRows,
    ["Hostel", payload.hostelName || ""],
    ["Rooms", counts.rooms],
    ["Tenants", counts.tenants],
    ["Payments", counts.payments],
    ["Electricity", counts.electricity],
    ["Report Rows", counts.report]
  ]);

  if (!payload.hostelName && counts.rooms + counts.tenants + counts.payments + counts.electricity + counts.report === 0) {
    return jsonResponse({ ok: false, error: "empty payload", rawLength: rawPayload.length, url: spreadsheet.getUrl() });
  }

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

  return jsonResponse({ ok: true, url: spreadsheet.getUrl(), counts });
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

function getRawPayload(e) {
  if (e && e.parameter && e.parameter.payload) return e.parameter.payload;
  const contents = (e && e.postData && e.postData.contents) || "";
  if (contents.indexOf("payload=") === 0) {
    const encoded = contents.replace(/^payload=/, "").replace(/\+/g, "%20");
    return decodeURIComponent(encoded);
  }
  return contents;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function writeSheet(spreadsheet, name, values) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  sheet.clearContents();
  if (!values.length) return;
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  sheet.getRange(1, 1, 1, values[0].length).setFontWeight("bold");
  sheet.autoResizeColumns(1, values[0].length);
}
