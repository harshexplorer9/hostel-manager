const HOSTEL_NAME = "B M Boys Hostel";
const STORAGE_KEY = "hostel-manager-data-v1";
const INSTALL_HINT_KEY = "hostel-manager-install-hint-dismissed";
const AUTH_STORAGE_KEY = "hostel-manager-auth-v1";
const NOTIFY_STORAGE_KEY = "hostel-manager-due-notifications-v1";
const CLOUD_CONFIG = window.HOSTEL_CLOUD_CONFIG || {};
const MAX_TENANTS_PER_ROOM = 4;

const defaultData = {
  settings: {
    electricityRate: 8.5,
    rentDueDay: 5,
    ownerWhatsapp: "9639875555",
    sheetSyncUrl: "",
    occupancyRent: {
      1: 2500,
      2: 2800,
      3: 3600,
      4: 3600
    }
  },
  rooms: [
    {
      id: crypto.randomUUID(),
      number: "101",
      floor: "Ground",
      capacity: 2,
      rent: 5500,
      deposit: 10000,
      notes: "Sample room. Edit or delete this record."
    },
    {
      id: crypto.randomUUID(),
      number: "102",
      floor: "Ground",
      capacity: 1,
      rent: 6500,
      deposit: 12000,
      notes: "Single occupancy"
    }
  ],
  tenants: [],
  payments: [],
  electricity: []
};

let cloudAuth = loadAuth();
let data = loadData();
let currentSearch = "";
let syncTimer;
let sheetSyncTimer;
ensureSettings();

const els = {
  loginGate: document.querySelector("#loginGate"),
  gateLoginForm: document.querySelector("#gateLoginForm"),
  gateEmail: document.querySelector("#gateEmail"),
  gatePassword: document.querySelector("#gatePassword"),
  gateCreateAccount: document.querySelector("#gateCreateAccount"),
  gateLoginMessage: document.querySelector("#gateLoginMessage"),
  viewTitle: document.querySelector("#viewTitle"),
  globalSearch: document.querySelector("#globalSearch"),
  exportData: document.querySelector("#exportData"),
  importData: document.querySelector("#importData"),
  toast: document.querySelector("#toast"),
  totalRooms: document.querySelector("#totalRooms"),
  occupiedRooms: document.querySelector("#occupiedRooms"),
  monthlyRent: document.querySelector("#monthlyRent"),
  pendingDues: document.querySelector("#pendingDues"),
  todayCollection: document.querySelector("#todayCollection"),
  vacantBeds: document.querySelector("#vacantBeds"),
  roomStatusList: document.querySelector("#roomStatusList"),
  activityList: document.querySelector("#activityList"),
  dailyCollectionList: document.querySelector("#dailyCollectionList"),
  backupHealthList: document.querySelector("#backupHealthList"),
  roomForm: document.querySelector("#roomForm"),
  roomId: document.querySelector("#roomId"),
  roomNumber: document.querySelector("#roomNumber"),
  roomFloor: document.querySelector("#roomFloor"),
  roomCapacity: document.querySelector("#roomCapacity"),
  roomRent: document.querySelector("#roomRent"),
  roomDeposit: document.querySelector("#roomDeposit"),
  roomNotes: document.querySelector("#roomNotes"),
  resetRoomForm: document.querySelector("#resetRoomForm"),
  roomsTable: document.querySelector("#roomsTable"),
  roomCount: document.querySelector("#roomCount"),
  rentSettingsForm: document.querySelector("#rentSettingsForm"),
  rentFor1: document.querySelector("#rentFor1"),
  rentFor2: document.querySelector("#rentFor2"),
  rentFor3: document.querySelector("#rentFor3"),
  rentFor4: document.querySelector("#rentFor4"),
  tenantForm: document.querySelector("#tenantForm"),
  tenantId: document.querySelector("#tenantId"),
  tenantName: document.querySelector("#tenantName"),
  tenantMobile: document.querySelector("#tenantMobile"),
  tenantAltMobile: document.querySelector("#tenantAltMobile"),
  tenantRoom: document.querySelector("#tenantRoom"),
  tenantRent: document.querySelector("#tenantRent"),
  tenantJoinDate: document.querySelector("#tenantJoinDate"),
  tenantLeaveDate: document.querySelector("#tenantLeaveDate"),
  tenantIdType: document.querySelector("#tenantIdType"),
  tenantIdNumber: document.querySelector("#tenantIdNumber"),
  tenantEmergency: document.querySelector("#tenantEmergency"),
  tenantAddress: document.querySelector("#tenantAddress"),
  docIdProof: document.querySelector("#docIdProof"),
  docPhoto: document.querySelector("#docPhoto"),
  docAgreement: document.querySelector("#docAgreement"),
  docDeposit: document.querySelector("#docDeposit"),
  tenantStatus: document.querySelector("#tenantStatus"),
  resetTenantForm: document.querySelector("#resetTenantForm"),
  tenantsTable: document.querySelector("#tenantsTable"),
  tenantCount: document.querySelector("#tenantCount"),
  tenantListMonth: document.querySelector("#tenantListMonth"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentRoom: document.querySelector("#paymentRoom"),
  paymentMonth: document.querySelector("#paymentMonth"),
  paymentListMonth: document.querySelector("#paymentListMonth"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentElectricityAmount: document.querySelector("#paymentElectricityAmount"),
  paymentDate: document.querySelector("#paymentDate"),
  paymentMode: document.querySelector("#paymentMode"),
  paymentRemarks: document.querySelector("#paymentRemarks"),
  paymentsTable: document.querySelector("#paymentsTable"),
  paymentCount: document.querySelector("#paymentCount"),
  electricityForm: document.querySelector("#electricityForm"),
  electricityRoom: document.querySelector("#electricityRoom"),
  electricityMonth: document.querySelector("#electricityMonth"),
  electricityListMonth: document.querySelector("#electricityListMonth"),
  electricityReadingDate: document.querySelector("#electricityReadingDate"),
  previousReading: document.querySelector("#previousReading"),
  currentReading: document.querySelector("#currentReading"),
  unitRate: document.querySelector("#unitRate"),
  saveDefaultRate: document.querySelector("#saveDefaultRate"),
  fixedCharge: document.querySelector("#fixedCharge"),
  calculatedUnits: document.querySelector("#calculatedUnits"),
  calculatedBill: document.querySelector("#calculatedBill"),
  electricityTable: document.querySelector("#electricityTable"),
  electricityCount: document.querySelector("#electricityCount"),
  reportMonth: document.querySelector("#reportMonth"),
  reportsTable: document.querySelector("#reportsTable"),
  dueSettingsForm: document.querySelector("#dueSettingsForm"),
  rentDueDay: document.querySelector("#rentDueDay"),
  ownerWhatsapp: document.querySelector("#ownerWhatsapp"),
  enableNotifications: document.querySelector("#enableNotifications"),
  previousDuesList: document.querySelector("#previousDuesList"),
  todayDuesList: document.querySelector("#todayDuesList"),
  upcomingDuesList: document.querySelector("#upcomingDuesList"),
  sendAllPreviousDues: document.querySelector("#sendAllPreviousDues"),
  sendTodayDues: document.querySelector("#sendTodayDues"),
  sendAllUpcomingDues: document.querySelector("#sendAllUpcomingDues"),
  iosInstallHint: document.querySelector("#iosInstallHint"),
  dismissInstallHint: document.querySelector("#dismissInstallHint"),
  contactSheet: document.querySelector("#contactSheet"),
  contactSheetTitle: document.querySelector("#contactSheetTitle"),
  contactSheetDetails: document.querySelector("#contactSheetDetails"),
  callTenantLink: document.querySelector("#callTenantLink"),
  whatsappTenantLink: document.querySelector("#whatsappTenantLink"),
  closeContactSheet: document.querySelector("#closeContactSheet"),
  openCloudSheet: document.querySelector("#openCloudSheet"),
  cloudStatus: document.querySelector("#cloudStatus"),
  cloudSheet: document.querySelector("#cloudSheet"),
  cloudSheetDetails: document.querySelector("#cloudSheetDetails"),
  cloudConfigNote: document.querySelector("#cloudConfigNote"),
  cloudLoginForm: document.querySelector("#cloudLoginForm"),
  cloudEmail: document.querySelector("#cloudEmail"),
  cloudPassword: document.querySelector("#cloudPassword"),
  cloudCreateAccount: document.querySelector("#cloudCreateAccount"),
  cloudDownload: document.querySelector("#cloudDownload"),
  cloudUpload: document.querySelector("#cloudUpload"),
  cloudLogout: document.querySelector("#cloudLogout"),
  sheetSyncForm: document.querySelector("#sheetSyncForm"),
  sheetSyncUrl: document.querySelector("#sheetSyncUrl"),
  sheetSyncNow: document.querySelector("#sheetSyncNow"),
  sheetSyncStatus: document.querySelector("#sheetSyncStatus"),
  closeCloudSheet: document.querySelector("#closeCloudSheet")
};

function loadData() {
  const saved = localStorage.getItem(userDataStorageKey()) || (cloudAuth?.localId ? localStorage.getItem(STORAGE_KEY) : null);
  if (!saved) return structuredClone(defaultData);

  try {
    return { ...structuredClone(defaultData), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(skipCloud = false) {
  ensureSettings();
  data.settings.lastLocalSaveAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (cloudAuth?.localId) localStorage.setItem(userDataStorageKey(), JSON.stringify(data));
  if (!skipCloud) {
    scheduleCloudSave();
    scheduleSheetSync();
  }
}

function userDataStorageKey(uid = cloudAuth?.localId) {
  return uid ? `${STORAGE_KEY}-${uid}` : STORAGE_KEY;
}

function loadAuth() {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveAuth(auth) {
  cloudAuth = auth;
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  renderCloudStatus();
  updateAuthGate();
}

function updateAuthGate() {
  const loggedIn = Boolean(cloudAuth?.idToken);
  els.loginGate.hidden = loggedIn;
  document.body.classList.toggle("auth-locked", !loggedIn);
  if (loggedIn) {
    els.gatePassword.value = "";
    els.cloudPassword.value = "";
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function electricityRate() {
  const rate = Number(data.settings?.electricityRate);
  return Number.isFinite(rate) && rate > 0 ? rate : 8.5;
}

function rentDueDay() {
  const day = Number(data.settings?.rentDueDay);
  return Math.min(Math.max(Number.isFinite(day) ? day : 5, 1), 30);
}

function ownerWhatsapp() {
  return data.settings?.ownerWhatsapp || "9639875555";
}

function ensureSettings() {
  data.settings = {
    ...structuredClone(defaultData.settings),
    ...(data.settings || {}),
    occupancyRent: {
      ...structuredClone(defaultData.settings.occupancyRent),
      ...(data.settings?.occupancyRent || {})
    }
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

function localDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function shiftMonth(month, offset) {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function daysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

function dueDayForRoom(roomId) {
  const days = roomTenants(roomId)
    .map((tenant) => Number(tenant.joinDate?.slice(8, 10)))
    .filter((day) => Number.isFinite(day) && day > 0);
  return days.length ? Math.min(...days) : 1;
}

function dueDateForMonth(month, roomId = "") {
  const day = Math.min(dueDayForRoom(roomId), daysInMonth(month));
  return `${month}-${String(day).padStart(2, "0")}`;
}

function lastDueMonthForRoom(roomId) {
  const current = thisMonth();
  return daysUntil(dueDateForMonth(current, roomId)) < 0 ? current : shiftMonth(current, -1);
}

function dateLabel(dateText) {
  if (!dateText) return "";
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function dateTimeLabel(dateText) {
  if (!dateText) return "Not yet";
  return new Date(dateText).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function daysUntil(dateText) {
  const todayDate = new Date(`${localDate()}T00:00:00`);
  const dueDate = new Date(`${dateText}T00:00:00`);
  return Math.round((dueDate - todayDate) / 86400000);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function whatsappPhone(value) {
  const cleaned = cleanPhone(value);
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

function monthLabel(month) {
  if (!month) return "";
  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function monthOptions(rangeBefore = 18, rangeAfter = 6) {
  const current = thisMonth();
  const months = new Set([current]);
  [...data.payments, ...data.electricity].forEach((item) => {
    if (item.month) months.add(item.month);
  });
  data.tenants.forEach((tenant) => {
    if (tenant.joinDate) months.add(tenant.joinDate.slice(0, 7));
    if (tenant.leaveDate) months.add(tenant.leaveDate.slice(0, 7));
  });

  for (let offset = -rangeBefore; offset <= rangeAfter; offset += 1) {
    months.add(shiftMonth(current, offset));
  }

  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function activeTenants() {
  return data.tenants.filter((tenant) => tenant.status === "Active");
}

function monthStart(month) {
  return `${month}-01`;
}

function monthEnd(month) {
  return `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
}

function tenantsForMonth(month) {
  const start = monthStart(month);
  const end = monthEnd(month);
  return data.tenants.filter((tenant) => {
    const joined = !tenant.joinDate || tenant.joinDate <= end;
    const notLeft = !tenant.leaveDate || tenant.leaveDate >= start;
    return joined && notLeft;
  });
}

function roomSortValue(roomId) {
  const room = findRoom(roomId);
  return room?.number || "zz";
}

function sortTenantsRoomWise(tenants) {
  return tenants.slice().sort((a, b) => {
    const roomSort = roomSortValue(a.roomId).localeCompare(roomSortValue(b.roomId), undefined, { numeric: true });
    return roomSort || (a.joinDate || "").localeCompare(b.joinDate || "") || a.name.localeCompare(b.name);
  });
}

function roomTenants(roomId) {
  return activeTenants().filter((tenant) => tenant.roomId === roomId);
}

function roomTenantsForMonth(roomId, month) {
  return tenantsForMonth(month).filter((tenant) => tenant.roomId === roomId);
}

function roomCapacity(room) {
  return Math.min(Math.max(Number(room?.capacity) || 1, 1), MAX_TENANTS_PER_ROOM);
}

function occupancyRent(count) {
  const normalized = Math.min(Math.max(Number(count) || 1, 1), MAX_TENANTS_PER_ROOM);
  const rent = Number(data.settings?.occupancyRent?.[normalized]);
  return Number.isFinite(rent) && rent >= 0 ? rent : Number(defaultData.settings.occupancyRent[normalized] || 0);
}

function findRoom(roomId) {
  return data.rooms.find((room) => room.id === roomId);
}

function findTenant(tenantId) {
  return data.tenants.find((tenant) => tenant.id === tenantId);
}

function tenantRoomLabel(tenant) {
  const room = findRoom(tenant.roomId);
  return room ? `Room ${room.number}` : "No room";
}

function tenantRentAmount(tenant) {
  const tenantRent = Number(tenant.rent);
  if (Number.isFinite(tenantRent) && tenantRent > 0) return tenantRent;
  const tenantCount = Math.max(roomTenants(tenant.roomId).length, 1);
  return occupancyRent(tenantCount) / tenantCount;
}

function tenantRentAmountForMonth(tenant, month) {
  const tenantRent = Number(tenant.rent);
  if (Number.isFinite(tenantRent) && tenantRent > 0) return tenantRent;
  const tenantCount = Math.max(roomTenantsForMonth(tenant.roomId, month).length, 1);
  return occupancyRent(tenantCount) / tenantCount;
}

function roomOccupantsHtml(tenants) {
  if (!tenants.length) return "<small>Vacant</small>";

  return `
    <div class="occupant-list">
      ${tenants
        .map(
          (tenant, index) => `
            <div>
              <strong>${index + 1}. ${escapeHtml(tenant.name)}</strong>
              <small>ID: ${escapeHtml(tenant.idNumber || "Not added")} | Rent: ${money(tenantRentAmount(tenant))}</small>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function tenantDocuments(tenant) {
  return {
    idProof: Boolean(tenant.docs?.idProof),
    photo: Boolean(tenant.docs?.photo),
    agreement: Boolean(tenant.docs?.agreement),
    deposit: Boolean(tenant.docs?.deposit)
  };
}

function documentChecklistText(tenant) {
  const docs = tenantDocuments(tenant);
  const labels = {
    idProof: "ID",
    photo: "Photo",
    agreement: "Agreement",
    deposit: "Deposit"
  };
  const entries = Object.entries(docs);
  const completed = entries.filter(([, value]) => value).length;
  const missing = entries.filter(([, value]) => !value).map(([key]) => labels[key]);
  return {
    completed,
    total: entries.length,
    missing: missing.length ? missing.join(", ") : "All done"
  };
}

function roomLeavingSoon(roomId, limitDays = 30) {
  return activeTenants()
    .filter((tenant) => tenant.roomId === roomId && tenant.leaveDate)
    .map((tenant) => ({ tenant, days: daysUntil(tenant.leaveDate) }))
    .filter((item) => item.days >= 0 && item.days <= limitDays)
    .sort((a, b) => a.days - b.days);
}

function roomVacantBeds(room) {
  return Math.max(roomCapacity(room) - roomTenants(room.id).length, 0);
}

function totalVacantBeds() {
  return data.rooms.reduce((sum, room) => sum + roomVacantBeds(room), 0);
}

function paymentsForDate(date = localDate()) {
  return data.payments.filter((payment) => payment.date === date);
}

function collectionSummary(date = localDate()) {
  const payments = paymentsForDate(date);
  const total = payments.reduce((sum, payment) => sum + paymentTotalAmount(payment), 0);
  const modes = payments.reduce((acc, payment) => {
    acc[payment.mode] = (acc[payment.mode] || 0) + paymentTotalAmount(payment);
    return acc;
  }, {});
  return { payments, total, modes };
}

function buildGeneralMessage(tenant) {
  return `Hello ${tenant.name}, this is regarding your hostel room ${tenantRoomLabel(tenant)}.`;
}

function buildDueMessage(row, month) {
  return [
    `Hello ${row.tenant.name},`,
    `Your hostel dues for ${monthLabel(month)} are pending.`,
    `Room: ${row.room?.number || "-"}`,
    `Rent: ${money(row.rentDue)}`,
    `Electricity bill: ${money(row.electricityDue)}`,
    `Paid: ${money(row.paidTotal)}`,
    `Total balance: ${money(row.balance)}`,
    "Please clear the due amount as soon as possible."
  ].join("\n");
}

function paymentRoom(payment) {
  if (payment.roomId) return findRoom(payment.roomId);
  const tenant = findTenant(payment.tenantId);
  return tenant ? findRoom(tenant.roomId) : null;
}

function paymentTenants(payment) {
  if (payment.roomId) return roomTenants(payment.roomId);
  const tenant = findTenant(payment.tenantId);
  return tenant ? [tenant] : [];
}

function paymentRentAmount(payment) {
  return Number(payment.rentAmount ?? payment.amount) || 0;
}

function paymentElectricityAmount(payment) {
  return Number(payment.electricityAmount) || 0;
}

function paymentTotalAmount(payment) {
  return paymentRentAmount(payment) + paymentElectricityAmount(payment);
}

function buildPaymentSlipMessage(payment) {
  const room = paymentRoom(payment);
  const rows = getMonthlyReport(payment.month).filter((row) => row.room?.id === room?.id);
  const tenants = rows.map((row) => row.tenant);
  const rentDue = rows.reduce((sum, row) => sum + row.rentDue, 0);
  const electricityDue = rows.reduce((sum, row) => sum + row.electricityDue, 0);
  const paidTotal = rows.reduce((sum, row) => sum + row.paidTotal, 0);
  const rentPaid = rows.reduce((sum, row) => sum + row.rentPaid, 0);
  const electricityPaid = rows.reduce((sum, row) => sum + row.electricityPaid, 0);
  const balance = Math.max(rentDue + electricityDue - paidTotal, 0);

  return [
    `${HOSTEL_NAME} Payment Slip`,
    `Room: ${room?.number || "-"}`,
    tenants.length ? `Tenants: ${tenants.map((item) => item.name).join(", ")}` : "",
    `Month: ${monthLabel(payment.month)}`,
    `Receipt amount: ${money(paymentTotalAmount(payment))}`,
    `Rent due: ${money(rentDue)}`,
    `Rent paid: ${money(rentPaid)}`,
    `Electricity due: ${money(electricityDue)}`,
    `Electricity paid: ${money(electricityPaid)}`,
    `Total due: ${money(rentDue + electricityDue)}`,
    `Total paid: ${money(paidTotal)}`,
    `Balance due: ${money(balance)}`,
    `Payment date: ${payment.date}`,
    `Mode: ${payment.mode}`,
    payment.remarks ? `Remarks: ${payment.remarks}` : "",
    "Thank you."
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMoveOutSettlementMessage(tenant) {
  const room = findRoom(tenant.roomId);
  const settlementDate = tenant.leaveDate || localDate();
  const month = settlementDate.slice(0, 7);
  const row = getMonthlyReport(month).find((item) => item.tenant.id === tenant.id);
  const rentDue = row?.rentDue ?? tenantRentAmount(tenant);
  const electricityDue = row?.electricityDue ?? 0;
  const paidTotal = row?.paidTotal ?? 0;
  const balance = Math.max(rentDue + electricityDue - paidTotal, 0);
  const deposit = Number(room?.deposit || 0);
  const suggestedRefund = Math.max(deposit - balance, 0);
  const deduction = Math.min(balance, deposit);

  return [
    `${HOSTEL_NAME} Move-Out Settlement`,
    `Tenant: ${tenant.name}`,
    `Mobile: ${tenant.mobile || "-"}`,
    `Room: ${room?.number || "-"}`,
    `Joining date: ${dateLabel(tenant.joinDate) || "-"}`,
    `Leaving date: ${dateLabel(settlementDate)}`,
    `Settlement month: ${monthLabel(month)}`,
    `Rent due: ${money(rentDue)}`,
    `Electricity due: ${money(electricityDue)}`,
    `Paid: ${money(paidTotal)}`,
    `Pending balance: ${money(balance)}`,
    `Deposit on record: ${money(deposit)}`,
    `Deposit deduction: ${money(deduction)}`,
    `Suggested refund: ${money(suggestedRefund)}`,
    "Please confirm final room handover and key return."
  ].join("\n");
}

function buildOwnerReminderMessage(summary, label = "Rent due reminder") {
  return [
    label,
    `Room: ${summary.roomNumber}`,
    `Month: ${monthLabel(summary.month)}`,
    `Due date: ${dateLabel(summary.dueDate)}`,
    `Tenants: ${summary.tenants.map((tenant) => `${tenant.name} (${tenant.mobile || "-"})`).join(", ")}`,
    `Rent: ${money(summary.rentTotal)}`,
    `Electricity: ${money(summary.electricityTotal)}`,
    `Paid: ${money(summary.paidTotal)}`,
    `Balance: ${money(summary.balanceTotal)}`,
    "Please call/follow up for rent."
  ].join("\n");
}

function buildOwnerSummaryMessage(title, summaries) {
  if (!summaries.length) return `${title}\nNo pending room dues.`;

  return [
    title,
    ...summaries.map(
      (summary) =>
        `Room ${summary.roomNumber}: ${money(summary.balanceTotal)} pending, due ${dateLabel(summary.dueDate)}, tenants: ${summary.tenants
          .map((tenant) => `${tenant.name} ${tenant.mobile || ""}`.trim())
          .join(", ")}`
    )
  ].join("\n");
}

function ownerWhatsappLink(message) {
  return `https://wa.me/${whatsappPhone(ownerWhatsapp())}?text=${encodeURIComponent(message)}`;
}

function openContactSheet(tenant, message) {
  const phone = cleanPhone(tenant.mobile);
  const waPhone = whatsappPhone(tenant.mobile);

  if (!phone) {
    toast("Mobile number missing");
    return;
  }

  els.contactSheetTitle.textContent = tenant.name;
  els.contactSheetDetails.textContent = `${tenant.mobile} - ${tenantRoomLabel(tenant)}`;
  els.callTenantLink.href = `tel:${phone}`;
  els.whatsappTenantLink.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(message || buildGeneralMessage(tenant))}`;
  els.contactSheet.hidden = false;
}

function closeContactSheet() {
  els.contactSheet.hidden = true;
}

function cloudReady() {
  return Boolean(CLOUD_CONFIG.apiKey && CLOUD_CONFIG.projectId);
}

function authUrl(action) {
  return `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(CLOUD_CONFIG.apiKey)}`;
}

function firestoreDocUrl() {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    CLOUD_CONFIG.projectId
  )}/databases/(default)/documents/users/${encodeURIComponent(cloudAuth.localId)}`;
}

function renderCloudStatus() {
  if (!cloudReady()) {
    els.cloudStatus.textContent = "Cloud setup needed";
    els.cloudStatus.classList.remove("online");
    els.cloudStatus.classList.remove("error");
    return;
  }

  if (cloudAuth?.email) {
    els.cloudStatus.textContent = `Synced: ${cloudAuth.email}`;
    els.cloudStatus.classList.add("online");
    els.cloudStatus.classList.remove("error");
  } else {
    els.cloudStatus.textContent = "Local only";
    els.cloudStatus.classList.remove("online");
    els.cloudStatus.classList.remove("error");
  }
}

function showCloudSheet() {
  els.cloudConfigNote.textContent = cloudReady()
    ? "Cloud is configured. Login, create an account, or manually upload/download this device data."
    : "Cloud is not configured yet. Add your Firebase apiKey and projectId in cloud-config.js, then open this app from an HTTPS link.";
  els.cloudLoginForm.hidden = Boolean(cloudAuth?.idToken);
  els.cloudUpload.disabled = !cloudReady() || !cloudAuth?.idToken;
  els.cloudDownload.disabled = !cloudReady() || !cloudAuth?.idToken;
  els.cloudLogout.disabled = !cloudAuth?.idToken;
  els.cloudSheetDetails.textContent = cloudAuth?.email
    ? `Logged in as ${cloudAuth.email}. Data will auto-sync after every save.`
    : "Use the same login on iPhone and laptop to keep hostel data synced.";
  els.cloudSheet.hidden = false;
}

function closeCloudSheet() {
  els.cloudSheet.hidden = true;
}

async function cloudRequest(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.error?.message || `Cloud request failed (${response.status})`;
    throw new Error(message.replaceAll("_", " ").toLowerCase());
  }

  return body;
}

function handleCloudError(error) {
  const message = String(error?.message || "cloud sync failed").toLowerCase();
  const sessionExpired = message.includes("invalid id token") || message.includes("user token expired") || message.includes("login expired");

  if (sessionExpired) {
    saveAuth(null);
    toast("Cloud login expired. Login again.");
    showCloudSheet();
    return;
  }

  els.cloudStatus.textContent = `Sync failed: ${message.slice(0, 42)}`;
  els.cloudStatus.classList.remove("online");
  els.cloudStatus.classList.add("error");
  if (els.cloudConfigNote) {
    els.cloudConfigNote.textContent = `Last sync error: ${message}. Check Firebase Auth authorized domain, Firestore rules, and login.`;
  }
  toast(`Cloud sync failed: ${message}`);
}

function markCloudSynced(label = "Synced") {
  if (!cloudAuth?.email) return;
  els.cloudStatus.textContent = `${label}: ${cloudAuth.email}`;
  els.cloudStatus.classList.add("online");
  els.cloudStatus.classList.remove("error");
}

function logoutCloud() {
  saveData(true);
  saveAuth(null);
  closeCloudSheet();
  toast("Logged out");
}

async function authenticateCloud(mode, credentials = {}) {
  if (!cloudReady()) {
    toast("Cloud config missing");
    return;
  }

  const email = (credentials.email || els.cloudEmail.value || els.gateEmail.value).trim();
  const password = credentials.password || els.cloudPassword.value || els.gatePassword.value;
  const action = mode === "signup" ? "signUp" : "signInWithPassword";
  const auth = await cloudRequest(authUrl(action), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  saveAuth({
    email: auth.email,
    idToken: auth.idToken,
    refreshToken: auth.refreshToken,
    localId: auth.localId,
    expiresAt: Date.now() + Number(auth.expiresIn || 3600) * 1000
  });

  data = loadData();
  ensureSettings();
  saveData(true);
  els.cloudPassword.value = "";
  els.gatePassword.value = "";
  await downloadCloudData(true);
  showCloudSheet();
  toast(`Logged in: ${auth.email}`);
}

async function refreshCloudToken() {
  if (!cloudAuth?.refreshToken || Date.now() < Number(cloudAuth.expiresAt || 0) - 60000) return;

  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(CLOUD_CONFIG.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: cloudAuth.refreshToken
      })
    }
  );
  const body = await response.json();

  if (!response.ok) throw new Error("login expired");

  saveAuth({
    email: cloudAuth.email,
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    localId: body.user_id,
    expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000
  });
}

async function uploadCloudData(showMessage = true) {
  if (!cloudReady() || !cloudAuth?.idToken) return;

  await refreshCloudToken();
  ensureSettings();
  data.settings.lastCloudSyncAt = new Date().toISOString();
  const hostelData = JSON.stringify(data);
  await cloudRequest(firestoreDocUrl(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${cloudAuth.idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        hostelData: { stringValue: hostelData },
        updatedAt: { timestampValue: new Date().toISOString() },
        ownerEmail: { stringValue: cloudAuth.email || "" }
      }
    })
  });

  markCloudSynced();
  saveData(true);
  if (showMessage) toast("Cloud sync complete");
}

async function downloadCloudData(uploadIfEmpty = false) {
  if (!cloudReady() || !cloudAuth?.idToken) return;

  await refreshCloudToken();
  const response = await fetch(firestoreDocUrl(), {
    headers: { Authorization: `Bearer ${cloudAuth.idToken}` }
  });

  if (response.status === 404) {
    if (uploadIfEmpty) {
      saveData(true);
      await uploadCloudData(false);
    }
    markCloudSynced();
    toast("New cloud account ready");
    return;
  }

  const body = await response.json();
  if (!response.ok) {
    const message = body.error?.message || "Could not download cloud data";
    throw new Error(message);
  }

  const remoteData = body.fields?.hostelData?.stringValue;
  if (remoteData) {
    const parsedRemote = JSON.parse(remoteData);
    const hasRemoteData =
      (parsedRemote.rooms?.length || 0) + (parsedRemote.tenants?.length || 0) + (parsedRemote.payments?.length || 0) + (parsedRemote.electricity?.length || 0) > 0;
    if (!hasRemoteData && (data.rooms.length || data.tenants.length || data.payments.length || data.electricity.length)) {
      await uploadCloudData(false);
      markCloudSynced();
      toast("Local data restored to cloud");
      return;
    }

    data = { ...structuredClone(defaultData), ...parsedRemote };
    ensureSettings();
    saveData(true);
    els.unitRate.value = electricityRate();
    renderAll();
    markCloudSynced();
    toast("Cloud data loaded");
  }
}

function scheduleCloudSave() {
  if (!cloudReady() || !cloudAuth?.idToken) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    uploadCloudData(false).catch(handleCloudError);
  }, 900);
}

function sheetSyncUrl() {
  return String(data.settings?.sheetSyncUrl || "").trim();
}

function renderSheetSyncStatus(message) {
  els.sheetSyncUrl.value = sheetSyncUrl();
  els.sheetSyncNow.disabled = !sheetSyncUrl();
  els.sheetSyncStatus.textContent = message || (sheetSyncUrl() ? "Google Sheet backup is enabled." : "Paste Apps Script Web App URL to auto-backup data in Google Sheet.");
}

function buildSpreadsheetPayload() {
  const month = thisMonth();
  const reportRows = getMonthlyReport(month);
  return {
    hostelName: HOSTEL_NAME,
    updatedAt: new Date().toISOString(),
    month,
    rooms: data.rooms.map((room) => ({
      number: room.number,
      floor: room.floor,
      capacity: roomCapacity(room),
      activeTenants: roomTenants(room.id).length,
      rentTotal: occupancyRent(roomTenants(room.id).length || 1),
      deposit: room.deposit,
      notes: room.notes
    })),
    tenants: data.tenants.map((tenant) => ({
      name: tenant.name,
      mobile: tenant.mobile,
      altMobile: tenant.altMobile,
      room: tenantRoomLabel(tenant),
      monthlyRent: tenantRentAmount(tenant),
      joiningDate: tenant.joinDate,
      leavingDate: tenant.leaveDate || "",
      idType: tenant.idType,
      idNumber: tenant.idNumber,
      documents: `${documentChecklistText(tenant).completed}/${documentChecklistText(tenant).total} - ${documentChecklistText(tenant).missing}`,
      emergency: tenant.emergency,
      address: tenant.address,
      status: tenant.status
    })),
    payments: data.payments.map((payment) => ({
      room: paymentRoom(payment)?.number || "",
      month: payment.month,
      rentAmount: paymentRentAmount(payment),
      electricityAmount: paymentElectricityAmount(payment),
      amount: paymentTotalAmount(payment),
      date: payment.date,
      mode: payment.mode,
      remarks: payment.remarks || ""
    })),
    electricity: data.electricity.map((bill) => ({
      room: findRoom(bill.roomId)?.number || "",
      month: bill.month,
      previousReading: bill.previousReading,
      currentReading: bill.currentReading,
      units: bill.units,
      rate: bill.rate,
      fixedCharge: bill.fixedCharge,
      readingDate: bill.readingDate || bill.createdAt || "",
      amount: bill.amount
    })),
    report: reportRows.map((row) => ({
      room: row.room?.number || "",
      tenant: row.tenant.name,
      mobile: row.tenant.mobile,
      rentDue: row.rentDue,
      electricityDue: row.electricityDue,
      rentPaid: row.rentPaid,
      electricityPaid: row.electricityPaid,
      paid: row.paidTotal,
      balance: row.balance
    }))
  };
}

async function syncSpreadsheet(showMessage = false) {
  const url = sheetSyncUrl();
  if (!url) return;
  const payload = JSON.stringify(buildSpreadsheetPayload());

  await sendSheetBackup(url, payload);

  ensureSettings();
  data.settings.lastSheetSyncAt = new Date().toISOString();
  saveData(true);
  renderSheetSyncStatus(`Sheet backup sent: ${new Date().toLocaleTimeString("en-IN")}`);
  if (showMessage) toast("Spreadsheet backup sent");
}

async function sendSheetBackup(url, payload) {
  const attempts = [];
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    if (navigator.sendBeacon(url, blob)) attempts.push(new Promise((resolve) => window.setTimeout(resolve, 1500)));
  }
  attempts.push(submitSheetBackup(url, payload));
  await Promise.all(attempts);
}

function submitSheetBackup(url, payload) {
  return new Promise((resolve, reject) => {
    const frameName = `sheet_backup_${Date.now()}`;
    const iframe = document.createElement("iframe");
    const form = document.createElement("form");
    const input = document.createElement("input");
    let finished = false;

    function cleanup() {
      window.setTimeout(() => {
        iframe.remove();
        form.remove();
      }, 1000);
    }

    function done(error) {
      if (finished) return;
      finished = true;
      cleanup();
      if (error) reject(error);
      else resolve();
    }

    iframe.name = frameName;
    iframe.hidden = true;
    form.hidden = true;
    form.method = "POST";
    form.action = url;
    form.target = frameName;
    form.enctype = "application/x-www-form-urlencoded";
    form.acceptCharset = "UTF-8";
    input.type = "hidden";
    input.name = "payload";
    input.value = payload;
    form.append(input);
    document.body.append(iframe, form);

    let submitted = false;
    iframe.addEventListener("load", () => {
      if (submitted) done();
    });
    iframe.addEventListener("error", () => done(new Error("sheet backup failed")));
    window.setTimeout(() => {
      submitted = true;
      form.submit();
    }, 50);
    window.setTimeout(() => done(), 6500);
  });
}

function scheduleSheetSync() {
  if (!sheetSyncUrl()) return;
  window.clearTimeout(sheetSyncTimer);
  sheetSyncTimer = window.setTimeout(() => {
    syncSpreadsheet(false).catch(() => renderSheetSyncStatus("Sheet sync failed. Check Apps Script URL."));
  }, 1200);
}

function tenantMatchesSearch(tenant) {
  const room = findRoom(tenant.roomId);
  return [tenant.name, tenant.mobile, tenant.altMobile, tenant.idNumber, tenant.leaveDate, room?.number]
    .join(" ")
    .toLowerCase()
    .includes(currentSearch);
}

function setView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  const label = document.querySelector(`[data-view="${viewId}"]`)?.textContent || "Dashboard";
  els.viewTitle.textContent = label;
}

function table(headers, rows, emptyMessage) {
  if (!rows.length) return `<div class="empty">${emptyMessage}</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function renderRoomOptions() {
  const roomOptions = data.rooms
    .slice()
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
    .map((room) => {
      const tenants = roomTenants(room.id).length;
      const capacity = roomCapacity(room);
      const label = `${room.number} - ${tenants}/${capacity} occupied`;
      return `<option value="${room.id}">${escapeHtml(label)}</option>`;
    })
    .join("");

  els.tenantRoom.innerHTML = roomOptions || '<option value="">Add a room first</option>';
  els.electricityRoom.innerHTML = roomOptions || '<option value="">Add a room first</option>';
  els.paymentRoom.innerHTML = roomOptions || '<option value="">Add a room first</option>';
}

function renderMonthOptions() {
  const months = monthOptions();
  const paymentValue = els.paymentMonth.value || thisMonth();
  const paymentListValue = els.paymentListMonth.value || paymentValue;
  const electricityValue = els.electricityMonth.value || thisMonth();
  const electricityListValue = els.electricityListMonth.value || electricityValue;
  const reportValue = els.reportMonth.value || thisMonth();
  const tenantListValue = els.tenantListMonth.value || thisMonth();
  const options = months.map((month) => `<option value="${month}">${escapeHtml(monthLabel(month))}</option>`).join("");

  els.paymentMonth.innerHTML = options;
  els.paymentListMonth.innerHTML = options;
  els.electricityMonth.innerHTML = options;
  els.electricityListMonth.innerHTML = options;
  els.reportMonth.innerHTML = options;
  els.tenantListMonth.innerHTML = options;
  els.paymentMonth.value = months.includes(paymentValue) ? paymentValue : thisMonth();
  els.paymentListMonth.value = months.includes(paymentListValue) ? paymentListValue : els.paymentMonth.value;
  els.electricityMonth.value = months.includes(electricityValue) ? electricityValue : thisMonth();
  els.electricityListMonth.value = months.includes(electricityListValue) ? electricityListValue : els.electricityMonth.value;
  els.reportMonth.value = months.includes(reportValue) ? reportValue : thisMonth();
  els.tenantListMonth.value = months.includes(tenantListValue) ? tenantListValue : thisMonth();
}

function renderTenantOptions() {
  return activeTenants()
    .slice()
    .sort((a, b) => {
      const roomSort = tenantRoomLabel(a).localeCompare(tenantRoomLabel(b), undefined, { numeric: true });
      return roomSort || a.name.localeCompare(b.name);
    });
}

function renderRentSettings() {
  els.rentFor1.value = occupancyRent(1);
  els.rentFor2.value = occupancyRent(2);
  els.rentFor3.value = occupancyRent(3);
  els.rentFor4.value = occupancyRent(4);
}

function renderDueSettings() {
  els.rentDueDay.value = rentDueDay();
  els.ownerWhatsapp.value = ownerWhatsapp();
  if (!("Notification" in window)) {
    els.enableNotifications.disabled = true;
    els.enableNotifications.textContent = "Notifications Not Supported";
  } else if (Notification.permission === "granted") {
    els.enableNotifications.textContent = "Notifications Enabled";
  }
}

function upcomingDueMonths(windowDays = rentDueDay()) {
  const todayDate = new Date(`${localDate()}T00:00:00`);
  const months = new Set();
  for (let offset = -1; offset <= windowDays + 31; offset += 1) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() + offset);
    months.add(date.toISOString().slice(0, 7));
  }
  return Array.from(months);
}

function roomRentTotal(roomId) {
  return roomTenants(roomId).reduce((sum, tenant) => sum + tenantRentAmount(tenant), 0);
}

function roomBalanceForMonth(roomId, month) {
  return getMonthlyReport(month)
    .filter((row) => row.room?.id === roomId)
    .reduce((sum, row) => sum + row.balance, 0);
}

function roomRentBalanceForMonth(roomId, month) {
  return getMonthlyReport(month)
    .filter((row) => row.room?.id === roomId)
    .reduce((sum, row) => sum + Math.max(row.rentDue - row.rentPaid, 0), 0);
}

function roomElectricityBalanceForMonth(roomId, month) {
  return getMonthlyReport(month)
    .filter((row) => row.room?.id === roomId)
    .reduce((sum, row) => sum + Math.max(row.electricityDue - row.electricityPaid, 0), 0);
}

function fillPaymentAmountFromRoom() {
  if (!els.paymentRoom.value) return;
  const month = els.paymentMonth.value || thisMonth();
  const rentBalance = roomRentBalanceForMonth(els.paymentRoom.value, month);
  const electricityBalance = roomElectricityBalanceForMonth(els.paymentRoom.value, month);
  els.paymentAmount.value = rentBalance || roomRentTotal(els.paymentRoom.value);
  els.paymentElectricityAmount.value = electricityBalance || 0;
}

function getRoomDueSummaries(month) {
  const grouped = new Map();
  getMonthlyReport(month).forEach((row) => {
    const key = row.room?.id || "no-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        roomId: row.room?.id || "",
        roomNumber: row.room?.number || "-",
        month,
        dueDate: dueDateForMonth(month, row.room?.id || ""),
        tenants: [],
        rentTotal: 0,
        electricityTotal: 0,
        paidTotal: 0,
        balanceTotal: 0
      });
    }

    const summary = grouped.get(key);
    summary.tenants.push(row.tenant);
    summary.rentTotal += row.rentDue;
    summary.electricityTotal += row.electricityDue;
    summary.paidTotal += row.paidTotal;
    summary.balanceTotal += row.balance;
  });

  return Array.from(grouped.values()).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
}

function getPreviousRoomDues() {
  return data.rooms
    .flatMap((room) => getRoomDueSummaries(lastDueMonthForRoom(room.id)).filter((summary) => summary.roomId === room.id))
    .filter((summary) => summary.balanceTotal > 0)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate) || a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
}

function getUpcomingRoomDues() {
  return upcomingDueMonths()
    .flatMap((month) => getRoomDueSummaries(month))
    .filter((summary) => summary.balanceTotal > 0 && daysUntil(summary.dueDate) >= 0 && daysUntil(summary.dueDate) <= rentDueDay())
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
}

function getTodayRoomDues() {
  return getUpcomingRoomDues().filter((summary) => daysUntil(summary.dueDate) === 0);
}

function renderDashboard() {
  const occupied = data.rooms.filter((room) => roomTenants(room.id).length > 0).length;
  const monthlyRent = activeTenants().reduce((sum, tenant) => sum + tenantRentAmount(tenant), 0);
  const report = getMonthlyReport(els.reportMonth.value || thisMonth());
  const pending = report.reduce((sum, row) => sum + row.balance, 0);
  const todaySummary = collectionSummary();

  els.totalRooms.textContent = data.rooms.length;
  els.occupiedRooms.textContent = occupied;
  els.monthlyRent.textContent = money(monthlyRent);
  els.pendingDues.textContent = money(pending);
  els.todayCollection.textContent = money(todaySummary.total);
  els.vacantBeds.textContent = totalVacantBeds();

  els.roomStatusList.innerHTML =
    data.rooms
      .slice(0, 8)
      .map((room) => {
        const count = roomTenants(room.id).length;
        const capacity = roomCapacity(room);
        const leaving = roomLeavingSoon(room.id);
        const status = count >= capacity ? "Full" : count > 0 ? "Partial" : "Vacant";
        const badgeClass = status === "Full" ? "red" : status === "Partial" ? "orange" : "green";
        const roomTotalRent = roomRentTotal(room.id);
        const tenantShare = count ? roomTotalRent / count : occupancyRent(1);
        return `
          <div class="status-item">
            <div>
              <strong>Room ${escapeHtml(room.number)}</strong>
              <span>${count}/${capacity} tenants, ${roomVacantBeds(room)} vacant beds, ${money(roomTotalRent || occupancyRent(1))} room rent, ${money(tenantShare)} each</span>
              ${
                leaving.length
                  ? `<span>Leaving soon: ${leaving.map((item) => `${escapeHtml(item.tenant.name)} on ${escapeHtml(dateLabel(item.tenant.leaveDate))}`).join(", ")}</span>`
                  : ""
              }
            </div>
            <span class="badge ${badgeClass}">${status}</span>
          </div>
        `;
      })
      .join("") || '<div class="empty">No rooms added yet.</div>';

  const activities = [
    ...data.payments.map((item) => ({
      date: item.date,
      title: `Rent received: ${money(item.amount)}`,
      sub: `${item.roomId ? `Room ${paymentRoom(item)?.number || ""}` : findTenant(item.tenantId)?.name || "Tenant"} for ${item.month}`
    })),
    ...data.electricity.map((item) => ({
      date: item.createdAt,
      title: `Electricity bill: ${money(item.amount)}`,
      sub: `Room ${findRoom(item.roomId)?.number || ""} for ${item.month}`
    })),
    ...data.tenants.map((item) => ({
      date: item.joinDate,
      title: `${item.name} joined`,
      sub: tenantRoomLabel(item)
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  els.activityList.innerHTML =
    activities
      .map(
        (item) => `
        <div class="activity-item">
          <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.sub)}</span></div>
          <span>${escapeHtml(item.date || "")}</span>
        </div>
      `
      )
      .join("") || '<div class="empty">Activity will appear here.</div>';

  const modeText = Object.entries(todaySummary.modes)
    .map(([mode, amount]) => `${escapeHtml(mode)} ${money(amount)}`)
    .join(" | ");
  els.dailyCollectionList.innerHTML = todaySummary.payments.length
    ? `
      <div class="status-item">
        <div><strong>${money(todaySummary.total)} collected today</strong><span>${modeText}</span></div>
        <span class="badge green">${todaySummary.payments.length} entries</span>
      </div>
      ${todaySummary.payments
        .slice(0, 6)
        .map((payment) => `<div class="status-item"><div><strong>Room ${escapeHtml(paymentRoom(payment)?.number || "-")}</strong><span>Rent ${money(paymentRentAmount(payment))} | Electricity ${money(paymentElectricityAmount(payment))}</span></div><span>${money(paymentTotalAmount(payment))}</span></div>`)
        .join("")}
    `
    : '<div class="empty">No collection recorded today.</div>';

  const backupItems = [
    {
      title: cloudAuth?.email ? `Cloud login: ${cloudAuth.email}` : "Cloud login missing",
      sub: data.settings.lastCloudSyncAt ? `Last cloud sync ${dateTimeLabel(data.settings.lastCloudSyncAt)}` : "No successful cloud sync saved yet",
      badge: cloudAuth?.idToken ? "Active" : "Login"
    },
    {
      title: sheetSyncUrl() ? "Google Sheet sync enabled" : "Google Sheet sync disabled",
      sub: data.settings.lastSheetSyncAt ? `Last sheet update ${dateTimeLabel(data.settings.lastSheetSyncAt)}` : "Sheet update not recorded yet",
      badge: sheetSyncUrl() ? "Sheet" : "Off"
    },
    {
      title: "Local backup on this device",
      sub: `Last local save ${dateTimeLabel(data.settings.lastLocalSaveAt)}`,
      badge: "Saved"
    },
    {
      title: "Manual JSON backup",
      sub: data.settings.lastExportAt ? `Last export ${dateTimeLabel(data.settings.lastExportAt)}` : "Use Export when you want an extra file backup",
      badge: data.settings.lastExportAt ? "Exported" : "Optional"
    }
  ];
  els.backupHealthList.innerHTML = backupItems
    .map(
      (item) => `
        <div class="status-item">
          <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.sub)}</span></div>
          <span class="badge ${["Off", "Login", "Optional"].includes(item.badge) ? "orange" : "green"}">${escapeHtml(item.badge)}</span>
        </div>
      `
    )
    .join("");
}

function renderRooms() {
  const rooms = data.rooms
    .filter((room) => {
      const tenants = roomTenants(room.id).map((tenant) => tenant.name).join(" ");
      return [room.number, room.floor, tenants].join(" ").toLowerCase().includes(currentSearch);
    })
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  els.roomCount.textContent = `${rooms.length} rooms`;
  els.roomsTable.innerHTML = table(
    ["Room", "Floor", "Occupancy", "Vacancy", "Rent Split", "Deposit", "Notes", "Actions"],
    rooms.map((room) => {
      const tenants = roomTenants(room.id);
      const capacity = roomCapacity(room);
      const totalRent = occupancyRent(tenants.length || 1);
      const tenantShare = tenants.length ? totalRent / tenants.length : totalRent;
      const leaving = roomLeavingSoon(room.id);
      return `
        <tr>
          <td><strong>${escapeHtml(room.number)}</strong></td>
          <td>${escapeHtml(room.floor || "-")}</td>
          <td>${tenants.length}/${capacity}${room.capacity > MAX_TENANTS_PER_ROOM ? " (max 4)" : ""}<br>${roomOccupantsHtml(tenants)}</td>
          <td>
            <strong>${roomVacantBeds(room)} vacant beds</strong>
            ${
              leaving.length
                ? `<br><small>Leaving soon: ${leaving.map((item) => `${escapeHtml(item.tenant.name)} (${escapeHtml(dateLabel(item.tenant.leaveDate))})`).join("<br>")}</small>`
                : "<br><small>No leaving notice</small>"
            }
          </td>
          <td><strong>${money(totalRent)}</strong><br><small>${tenants.length || 1} tenant split: ${money(tenantShare)} each</small></td>
          <td>${money(room.deposit)}</td>
          <td>${escapeHtml(room.notes || "-")}</td>
          <td class="row-actions">
            <button data-edit-room="${room.id}">Edit</button>
            <button class="danger" data-delete-room="${room.id}">Delete</button>
          </td>
        </tr>
      `;
    }),
    "No rooms found."
  );
}

function renderTenants() {
  const selectedMonth = els.tenantListMonth.value || thisMonth();
  const tenants = sortTenantsRoomWise(tenantsForMonth(selectedMonth).filter(tenantMatchesSearch));
  els.tenantCount.textContent = `${tenants.length} tenants`;

  if (!tenants.length) {
    els.tenantsTable.innerHTML = `<div class="empty">No tenants found for ${monthLabel(selectedMonth)}.</div>`;
    return;
  }

  const grouped = new Map();
  tenants.forEach((tenant) => {
    const room = findRoom(tenant.roomId);
    const key = room?.id || "no-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        room,
        roomNumber: room?.number || "No room",
        tenants: []
      });
    }
    grouped.get(key).tenants.push(tenant);
  });

  els.tenantsTable.innerHTML = Array.from(grouped.values())
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }))
    .map((group) => {
      const room = group.room;
      const capacity = room ? roomCapacity(room) : group.tenants.length;
      return `
        <section class="room-report tenant-room-group">
          <div class="room-report-head">
            <strong>${room ? `Room ${escapeHtml(group.roomNumber)} Tenants` : "No room assigned"}</strong>
            <span>${group.tenants.length}/${capacity} tenants | ${monthLabel(selectedMonth)}</span>
          </div>
          ${table(
            ["Name", "Mobile", "Rent", "Joining / Leaving", "ID Proof", "Documents", "Emergency", "Status", "Actions"],
            group.tenants.map((tenant) => {
              const docs = documentChecklistText(tenant);
              const leaveDays = tenant.leaveDate ? daysUntil(tenant.leaveDate) : null;
              const leavingBadge =
                tenant.leaveDate && leaveDays >= 0 && leaveDays <= 30 ? `<br><span class="badge orange">Leaving in ${leaveDays} days</span>` : "";
              return `
                <tr>
                  <td><strong>${escapeHtml(tenant.name)}</strong><br><small>${escapeHtml(tenant.address || "")}</small></td>
                  <td>
                    <div class="mobile-cell">
                      <strong>${escapeHtml(tenant.mobile)}</strong>
                      <small>${escapeHtml(tenant.altMobile || "")}</small>
                      <button class="contact-button" data-contact-tenant="${tenant.id}">Call / WhatsApp</button>
                    </div>
                  </td>
                  <td>${money(tenantRentAmountForMonth(tenant, selectedMonth))}</td>
                  <td>
                    Join: ${escapeHtml(tenant.joinDate || "-")}<br>
                    <small>Leave: ${escapeHtml(tenant.leaveDate || "-")}</small>
                    ${leavingBadge}
                  </td>
                  <td>${escapeHtml(tenant.idType || "-")}<br><small>${escapeHtml(tenant.idNumber || "")}</small></td>
                  <td><strong>${docs.completed}/${docs.total}</strong><br><small>${escapeHtml(docs.missing)}</small></td>
                  <td>${escapeHtml(tenant.emergency || "-")}</td>
                  <td><span class="badge ${tenant.status === "Active" ? "green" : "orange"}">${escapeHtml(tenant.status)}</span></td>
                  <td class="row-actions">
                    <button data-edit-tenant="${tenant.id}">Edit</button>
                    <button data-settlement-tenant="${tenant.id}">Settlement</button>
                    <button class="danger" data-delete-tenant="${tenant.id}">Delete</button>
                  </td>
                </tr>
              `;
            }),
            `No tenants found for Room ${group.roomNumber}.`
          )}
        </section>
      `;
    })
    .join("");
}

function renderPayments() {
  const selectedMonth = els.paymentListMonth.value || thisMonth();
  const payments = data.payments
    .filter((payment) => payment.month === selectedMonth)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  els.paymentCount.textContent = `${payments.length} payments`;

  if (!payments.length) {
    els.paymentsTable.innerHTML = `<div class="empty">No payments recorded for ${monthLabel(selectedMonth)}.</div>`;
    return;
  }

  const grouped = new Map();
  payments.forEach((payment) => {
    const room = paymentRoom(payment);
    const key = room?.id || "deleted-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        roomId: room?.id || "",
        roomNumber: room?.number || "Deleted room",
        payments: []
      });
    }
    grouped.get(key).payments.push({ payment, room });
  });

  els.paymentsTable.innerHTML = Array.from(grouped.values())
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }))
    .map((group) => {
      const rentTotal = group.payments.reduce((sum, item) => sum + paymentRentAmount(item.payment), 0);
      const electricityTotal = group.payments.reduce((sum, item) => sum + paymentElectricityAmount(item.payment), 0);
      const total = rentTotal + electricityTotal;
      return `
        <section class="room-report tenant-room-group">
          <div class="room-report-head">
            <strong>Room ${escapeHtml(group.roomNumber)} Payments</strong>
            <span>${group.payments.length} payments | Rent ${money(rentTotal)} | Electricity ${money(electricityTotal)}</span>
          </div>
          ${table(
            ["Room", "Month", "Rent Paid", "Electricity Paid", "Total", "Date", "Mode", "Remarks", "Slip"],
            group.payments.map(({ payment }) => `
              <tr>
                <td><strong>Room ${escapeHtml(group.roomNumber)}</strong></td>
                <td>${escapeHtml(payment.month)}</td>
                <td>${money(paymentRentAmount(payment))}</td>
                <td>${money(paymentElectricityAmount(payment))}</td>
                <td>${money(paymentTotalAmount(payment))}</td>
                <td>${escapeHtml(payment.date)}</td>
                <td>${escapeHtml(payment.mode)}</td>
                <td>${escapeHtml(payment.remarks || "-")}</td>
                <td class="row-actions">
                  <button data-payment-room-slip="${payment.id}">Room Slip</button>
                  <button class="danger" data-delete-payment="${payment.id}">Delete</button>
                </td>
              </tr>
            `),
            "No payments recorded."
          )}
        </section>
      `;
    })
    .join("");
}

function calculateElectricity() {
  const previous = Number(els.previousReading.value) || 0;
  const current = Number(els.currentReading.value) || 0;
  const rate = Number(els.unitRate.value) || 0;
  const fixed = Number(els.fixedCharge.value) || 0;
  const units = Math.max(current - previous, 0);
  const amount = units * rate + fixed;
  els.calculatedUnits.textContent = units;
  els.calculatedBill.textContent = money(amount);
  return { units, amount };
}

function lastElectricityBillBefore(roomId, month) {
  return data.electricity
    .filter((bill) => bill.roomId === roomId && bill.month && bill.month < month)
    .sort((a, b) => b.month.localeCompare(a.month) || String(b.readingDate || b.createdAt || "").localeCompare(String(a.readingDate || a.createdAt || "")))[0];
}

function fillPreviousReadingFromHistory() {
  if (!els.electricityRoom.value || !els.electricityMonth.value) return;
  const existing = data.electricity.find((bill) => bill.roomId === els.electricityRoom.value && bill.month === els.electricityMonth.value);
  const previousBill = lastElectricityBillBefore(els.electricityRoom.value, els.electricityMonth.value);
  els.previousReading.value = existing?.previousReading ?? previousBill?.currentReading ?? "";
  if (existing) {
    els.currentReading.value = existing.currentReading;
    els.unitRate.value = existing.rate || electricityRate();
    els.fixedCharge.value = existing.fixedCharge || 0;
    els.electricityReadingDate.value = existing.readingDate || existing.createdAt || today();
  }
  calculateElectricity();
}

function renderElectricity() {
  const selectedMonth = els.electricityListMonth.value || thisMonth();
  const bills = data.electricity
    .filter((bill) => bill.month === selectedMonth)
    .slice()
    .sort((a, b) => {
      const roomSort = (findRoom(a.roomId)?.number || "").localeCompare(findRoom(b.roomId)?.number || "", undefined, { numeric: true });
      return roomSort || String(a.readingDate || a.createdAt || "").localeCompare(String(b.readingDate || b.createdAt || ""));
    });
  els.electricityCount.textContent = `${bills.length} bills`;
  if (!bills.length) {
    els.electricityTable.innerHTML = `<div class="empty">No electricity readings recorded for ${monthLabel(selectedMonth)}.</div>`;
    return;
  }

  const grouped = new Map();
  bills.forEach((bill) => {
    const room = findRoom(bill.roomId);
    const key = room?.id || "deleted-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        roomNumber: room?.number || "Deleted",
        bills: []
      });
    }
    grouped.get(key).bills.push(bill);
  });

  els.electricityTable.innerHTML = Array.from(grouped.values())
    .map((group) => {
      const total = group.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
      return `
        <section class="room-report">
          <div class="room-report-head">
            <strong>Room ${escapeHtml(group.roomNumber)}</strong>
            <span>${group.bills.length} readings | ${money(total)}</span>
          </div>
          ${table(
            ["Month", "Reading Date", "Previous", "Current", "Units", "Rate", "Fixed", "Amount", "Actions"],
            group.bills.map(
              (bill) => `
                <tr>
                  <td>${escapeHtml(monthLabel(bill.month))}</td>
                  <td>${escapeHtml(bill.readingDate || bill.createdAt || "-")}</td>
                  <td>${bill.previousReading}</td>
                  <td>${bill.currentReading}</td>
                  <td>${bill.units}</td>
                  <td>${money(bill.rate)}</td>
                  <td>${money(bill.fixedCharge)}</td>
                  <td>${money(bill.amount)}</td>
                  <td class="row-actions"><button class="danger" data-delete-electricity="${bill.id}">Delete</button></td>
                </tr>
              `
            ),
            "No electricity readings recorded."
          )}
        </section>
      `;
    })
    .join("");
}

function getMonthlyReport(month) {
  return tenantsForMonth(month).map((tenant) => {
    const room = findRoom(tenant.roomId);
    const rentDue = tenantRentAmountForMonth(tenant, month);
    const tenantDirectPaid = data.payments
      .filter((payment) => payment.tenantId === tenant.id && payment.month === month)
      .reduce((sum, payment) => sum + paymentRentAmount(payment), 0);
    const roomRentPaymentTotal = data.payments
      .filter((payment) => payment.roomId === tenant.roomId && payment.month === month)
      .reduce((sum, payment) => sum + paymentRentAmount(payment), 0);
    const roomElectricityPaymentTotal = data.payments
      .filter((payment) => payment.roomId === tenant.roomId && payment.month === month)
      .reduce((sum, payment) => sum + paymentElectricityAmount(payment), 0);
    const electricityDue = data.electricity
      .filter((bill) => bill.roomId === tenant.roomId && bill.month === month)
      .reduce((sum, bill) => sum + Number(bill.amount), 0);
    const roomActiveTenants = Math.max(roomTenantsForMonth(tenant.roomId, month).length, 1);
    const roomPaidShare = roomRentPaymentTotal / roomActiveTenants;
    const roomElectricityPaidShare = roomElectricityPaymentTotal / roomActiveTenants;
    const rentPaid = tenantDirectPaid + roomPaidShare;
    const tenantElectricity = electricityDue / roomActiveTenants;
    const electricityPaid = roomElectricityPaidShare;
    const totalDue = rentDue + tenantElectricity;
    const paidTotal = rentPaid + electricityPaid;

    return {
      tenant,
      room,
      rentDue,
      rentPaid,
      electricityDue: tenantElectricity,
      electricityPaid,
      paidTotal,
      totalDue,
      balance: Math.max(totalDue - paidTotal, 0)
    };
  });
}

function renderReports() {
  const month = els.reportMonth.value || thisMonth();
  const rows = getMonthlyReport(month);

  if (!rows.length) {
    els.reportsTable.innerHTML = `<div class="empty">No active tenants for ${monthLabel(month)}.</div>`;
    return;
  }

  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.room?.id || "no-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        roomNumber: row.room?.number || "-",
        rows: []
      });
    }
    grouped.get(key).rows.push(row);
  });

  els.reportsTable.innerHTML = Array.from(grouped.values())
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }))
    .map((group) => {
      const rentTotal = group.rows.reduce((sum, row) => sum + row.rentDue, 0);
      const electricityTotal = group.rows.reduce((sum, row) => sum + row.electricityDue, 0);
      const rentPaidTotal = group.rows.reduce((sum, row) => sum + row.rentPaid, 0);
      const electricityPaidTotal = group.rows.reduce((sum, row) => sum + row.electricityPaid, 0);
      const paidTotal = group.rows.reduce((sum, row) => sum + row.paidTotal, 0);
      const balanceTotal = group.rows.reduce((sum, row) => sum + row.balance, 0);

      return `
        <section class="room-report">
          <div class="room-report-head">
            <strong>Room ${escapeHtml(group.roomNumber)}</strong>
            <span>Balance ${money(balanceTotal)}</span>
          </div>
          ${table(
            ["Tenant", "Rent Due", "Electricity", "Rent Paid", "Elec. Paid", "Balance", "Send Due"],
            [
              ...group.rows.map(
                (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.tenant.name)}</strong><br><small>${escapeHtml(row.tenant.mobile)}</small></td>
                  <td>${money(row.rentDue)}</td>
                  <td>${money(row.electricityDue)}</td>
                  <td>${money(row.rentPaid)}</td>
                  <td>${money(row.electricityPaid)}</td>
                  <td><strong>${money(row.balance)}</strong></td>
                  <td>
                    <button class="due-button" data-due-tenant="${row.tenant.id}" ${row.balance <= 0 ? "disabled" : ""}>
                      WhatsApp Due
                    </button>
                  </td>
                </tr>
              `
              ),
              `
                <tr class="total-row">
                  <td><strong>Room Total</strong></td>
                  <td>${money(rentTotal)}</td>
                  <td>${money(electricityTotal)}</td>
                  <td>${money(rentPaidTotal)}</td>
                  <td>${money(electricityPaidTotal)}</td>
                  <td><strong>${money(balanceTotal)}</strong></td>
                  <td></td>
                </tr>
              `
            ],
            `No active tenants for ${month}.`
          )}
        </section>
      `;
    })
    .join("");
}

function dueStatusText(summary) {
  const days = daysUntil(summary.dueDate);
  if (days < 0) return `${Math.abs(days)} days late`;
  if (days === 0) return "Due today";
  return `Due in ${days} days`;
}

function dueListHtml(summaries, emptyMessage, label) {
  if (!summaries.length) return `<div class="empty">${emptyMessage}</div>`;

  return summaries
    .map(
      (summary) => `
        <article class="due-item">
          <div>
            <strong>Room ${escapeHtml(summary.roomNumber)}</strong>
            <span>${escapeHtml(monthLabel(summary.month))} | ${escapeHtml(dateLabel(summary.dueDate))} | ${escapeHtml(dueStatusText(summary))}</span>
            <small>${summary.tenants
              .map((tenant, index) => `${index + 1}. ${escapeHtml(tenant.name)} | Join ${escapeHtml(tenant.joinDate || "-")} | ${escapeHtml(tenant.mobile || "-")}`)
              .join("<br>")}</small>
          </div>
          <div>
            <strong>${money(summary.balanceTotal)}</strong>
            <span>Rent ${money(summary.rentTotal)} + Electricity ${money(summary.electricityTotal)} - Paid ${money(summary.paidTotal)}</span>
          </div>
          <a class="sheet-action whatsapp" href="${ownerWhatsappLink(buildOwnerReminderMessage(summary, label))}" target="_blank" rel="noopener">Send to Owner WhatsApp</a>
        </article>
      `
    )
    .join("");
}

function renderDues() {
  renderDueSettings();
  const previousDues = getPreviousRoomDues();
  const upcomingDues = getUpcomingRoomDues();
  const todayDues = getTodayRoomDues();

  els.todayDuesList.innerHTML = dueListHtml(todayDues, "No room dues today.", "Rent due today");
  els.previousDuesList.innerHTML = dueListHtml(previousDues, "No previous billing-cycle pending dues.", "Previous billing-cycle rent pending");
  els.upcomingDuesList.innerHTML = dueListHtml(upcomingDues, `No room dues in the next ${rentDueDay()} days.`, "Upcoming rent due");
  els.sendTodayDues.disabled = todayDues.length === 0;
  els.sendAllPreviousDues.disabled = previousDues.length === 0;
  els.sendAllUpcomingDues.disabled = upcomingDues.length === 0;
  els.sendTodayDues.dataset.ownerSummary = "today";
  els.sendAllPreviousDues.dataset.ownerSummary = "previous";
  els.sendAllUpcomingDues.dataset.ownerSummary = "upcoming";
}

function renderAll() {
  renderRoomOptions();
  renderMonthOptions();
  renderTenantOptions();
  renderRentSettings();
  renderSheetSyncStatus();
  renderDashboard();
  renderRooms();
  renderTenants();
  renderPayments();
  renderElectricity();
  renderReports();
  renderDues();
}

function setupInstallExperience() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
  const dismissed = localStorage.getItem(INSTALL_HINT_KEY) === "1";

  if (isIos && !isStandalone && !dismissed) {
    els.iosInstallHint.hidden = false;
  }

  els.dismissInstallHint?.addEventListener("click", () => {
    localStorage.setItem(INSTALL_HINT_KEY, "1");
    els.iosInstallHint.hidden = true;
  });
}

async function showDueNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const dueToday = getTodayRoomDues();
  if (!dueToday.length) return;

  const notifyKey = `${localDate()}-${dueToday.map((summary) => summary.roomId).join("-")}`;
  if (localStorage.getItem(NOTIFY_STORAGE_KEY) === notifyKey) return;

  localStorage.setItem(NOTIFY_STORAGE_KEY, notifyKey);
  const body = dueToday.map((summary) => `Room ${summary.roomNumber}: ${money(summary.balanceTotal)}`).join(", ");

  if (navigator.serviceWorker?.ready) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification("Hostel rent due today", {
      body,
      tag: "hostel-rent-due",
      icon: "./icons/hostel-icon.svg"
    });
    return;
  }

  new Notification("Hostel rent due today", { body });
}

function resetRoomForm() {
  els.roomForm.reset();
  els.roomId.value = "";
  els.roomCapacity.value = 1;
}

function resetTenantForm() {
  els.tenantForm.reset();
  els.tenantId.value = "";
  els.tenantRent.value = "";
  els.tenantJoinDate.value = today();
  els.tenantLeaveDate.value = "";
  els.tenantStatus.value = "Active";
  els.docIdProof.checked = false;
  els.docPhoto.checked = false;
  els.docAgreement.checked = false;
  els.docDeposit.checked = false;
}

document.querySelectorAll(".nav-item, [data-view-link]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view || button.dataset.viewLink));
});

els.globalSearch.addEventListener("input", () => {
  currentSearch = els.globalSearch.value.trim().toLowerCase();
  renderRooms();
  renderTenants();
});

els.roomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const existing = data.rooms.find((room) => room.id === els.roomId.value);
  const room = {
    id: existing?.id || crypto.randomUUID(),
    number: els.roomNumber.value.trim(),
    floor: els.roomFloor.value.trim(),
    capacity: Math.min(Math.max(Number(els.roomCapacity.value) || 1, 1), MAX_TENANTS_PER_ROOM),
    rent: Number(els.roomRent.value) || 0,
    deposit: Number(els.roomDeposit.value) || 0,
    notes: els.roomNotes.value.trim()
  };

  const assignedTenants = existing ? roomTenants(existing.id).length : 0;
  if (assignedTenants > room.capacity) {
    toast(`Room already has ${assignedTenants} active tenants`);
    return;
  }

  if (existing) {
    Object.assign(existing, room);
    toast("Room updated");
  } else {
    data.rooms.push(room);
    toast("Room added");
  }

  saveData();
  resetRoomForm();
  renderAll();
});

els.resetRoomForm.addEventListener("click", resetRoomForm);

els.rentSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureSettings();
  data.settings.occupancyRent = {
    1: Number(els.rentFor1.value) || 0,
    2: Number(els.rentFor2.value) || 0,
    3: Number(els.rentFor3.value) || 0,
    4: Number(els.rentFor4.value) || 0
  };
  saveData();
  renderAll();
  toast("Rent settings updated");
});

els.dueSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureSettings();
  data.settings.rentDueDay = Math.min(Math.max(Number(els.rentDueDay.value) || 5, 1), 28);
  data.settings.ownerWhatsapp = cleanPhone(els.ownerWhatsapp.value) || "9639875555";
  saveData();
  renderAll();
  toast("Due settings updated");
});

els.enableNotifications.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    toast("Notifications are not supported on this device");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    toast("Due notifications enabled");
    renderDueSettings();
    showDueNotification().catch(() => {});
  } else {
    toast("Notification permission not allowed");
  }
});

els.tenantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!els.tenantRoom.value) {
    toast("Add a room before adding tenants");
    return;
  }

  const existing = data.tenants.find((tenant) => tenant.id === els.tenantId.value);
  const selectedRoom = findRoom(els.tenantRoom.value);
  const selectedRoomTenants = roomTenants(els.tenantRoom.value).filter((tenant) => tenant.id !== existing?.id);
  if (els.tenantStatus.value === "Active" && selectedRoomTenants.length >= roomCapacity(selectedRoom)) {
    toast(`Room ${selectedRoom?.number || ""} is full. Max ${roomCapacity(selectedRoom)} tenants allowed.`);
    return;
  }

  const tenant = {
    id: existing?.id || crypto.randomUUID(),
    name: els.tenantName.value.trim(),
    mobile: els.tenantMobile.value.trim(),
    altMobile: els.tenantAltMobile.value.trim(),
    roomId: els.tenantRoom.value,
    rent: Number(els.tenantRent.value) || 0,
    joinDate: els.tenantJoinDate.value,
    leaveDate: els.tenantLeaveDate.value,
    idType: els.tenantIdType.value.trim(),
    idNumber: els.tenantIdNumber.value.trim(),
    emergency: els.tenantEmergency.value.trim(),
    address: els.tenantAddress.value.trim(),
    docs: {
      idProof: els.docIdProof.checked,
      photo: els.docPhoto.checked,
      agreement: els.docAgreement.checked,
      deposit: els.docDeposit.checked
    },
    status: els.tenantStatus.value
  };

  if (existing) {
    Object.assign(existing, tenant);
    toast("Tenant updated");
  } else {
    data.tenants.push(tenant);
    toast("Tenant added");
  }

  saveData();
  resetTenantForm();
  renderAll();
});

els.resetTenantForm.addEventListener("click", resetTenantForm);

els.closeContactSheet.addEventListener("click", closeContactSheet);
els.contactSheet.addEventListener("click", (event) => {
  if (event.target === els.contactSheet) closeContactSheet();
});

els.openCloudSheet.addEventListener("click", showCloudSheet);
els.closeCloudSheet.addEventListener("click", closeCloudSheet);
els.cloudSheet.addEventListener("click", (event) => {
  if (event.target === els.cloudSheet) closeCloudSheet();
});

els.gateLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.gateLoginMessage.textContent = "Logging in and syncing data...";
  try {
    await authenticateCloud("signin", {
      email: els.gateEmail.value.trim(),
      password: els.gatePassword.value
    });
    els.gateLoginMessage.textContent = `Logged in to ${HOSTEL_NAME}`;
  } catch (error) {
    els.gateLoginMessage.textContent = `Login failed: ${error.message}`;
    handleCloudError(error);
  }
});

els.gateCreateAccount.addEventListener("click", async () => {
  els.gateLoginMessage.textContent = "Creating login...";
  try {
    await authenticateCloud("signup", {
      email: els.gateEmail.value.trim(),
      password: els.gatePassword.value
    });
    els.gateLoginMessage.textContent = `Login created for ${HOSTEL_NAME}`;
  } catch (error) {
    els.gateLoginMessage.textContent = `Account failed: ${error.message}`;
    handleCloudError(error);
  }
});

els.cloudLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await authenticateCloud("signin");
  } catch (error) {
    handleCloudError(error);
  }
});

els.cloudCreateAccount.addEventListener("click", async () => {
  try {
    await authenticateCloud("signup");
  } catch (error) {
    handleCloudError(error);
  }
});

els.cloudUpload.addEventListener("click", async () => {
  try {
    await uploadCloudData(true);
  } catch (error) {
    handleCloudError(error);
  }
});

els.cloudDownload.addEventListener("click", async () => {
  try {
    await downloadCloudData(false);
  } catch (error) {
    handleCloudError(error);
  }
});

els.sheetSyncForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureSettings();
  data.settings.sheetSyncUrl = els.sheetSyncUrl.value.trim();
  saveData();
  renderSheetSyncStatus(data.settings.sheetSyncUrl ? "Google Sheet sync saved." : "Google Sheet sync disabled.");
  toast(data.settings.sheetSyncUrl ? "Sheet sync saved" : "Sheet sync disabled");
});

els.sheetSyncNow.addEventListener("click", async () => {
  try {
    await syncSpreadsheet(true);
  } catch {
    renderSheetSyncStatus("Sheet sync failed. Check Apps Script deployment URL.");
    toast("Sheet sync failed");
  }
});

els.cloudLogout.addEventListener("click", () => {
  logoutCloud();
});

els.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!els.paymentRoom.value) {
    toast("Add a room before recording payment");
    return;
  }
  const paymentMonth = els.paymentMonth.value;
  const rentAmount = Number(els.paymentAmount.value) || 0;
  const electricityAmount = Number(els.paymentElectricityAmount.value) || 0;

  data.payments.push({
    id: crypto.randomUUID(),
    roomId: els.paymentRoom.value,
    month: paymentMonth,
    rentAmount,
    electricityAmount,
    amount: rentAmount + electricityAmount,
    date: els.paymentDate.value,
    mode: els.paymentMode.value,
    remarks: els.paymentRemarks.value.trim()
  });

  saveData();
  els.paymentForm.reset();
  els.paymentMonth.value = paymentMonth;
  els.paymentListMonth.value = paymentMonth;
  els.paymentDate.value = today();
  els.paymentElectricityAmount.value = 0;
  toast("Payment recorded");
  renderAll();
});

els.paymentRoom.addEventListener("change", fillPaymentAmountFromRoom);
els.paymentMonth.addEventListener("change", fillPaymentAmountFromRoom);
els.paymentListMonth.addEventListener("change", renderAll);

["input", "change"].forEach((eventName) => {
  [els.previousReading, els.currentReading, els.unitRate, els.fixedCharge].forEach((input) => {
    input.addEventListener(eventName, calculateElectricity);
  });
});

els.electricityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!els.electricityRoom.value) {
    toast("Add a room before recording electricity");
    return;
  }

  const billMonth = els.electricityMonth.value;
  const { units, amount } = calculateElectricity();
  const existing = data.electricity.find((bill) => bill.roomId === els.electricityRoom.value && bill.month === billMonth);
  const bill = {
    id: existing?.id || crypto.randomUUID(),
    roomId: els.electricityRoom.value,
    month: billMonth,
    readingDate: els.electricityReadingDate.value,
    previousReading: Number(els.previousReading.value) || 0,
    currentReading: Number(els.currentReading.value) || 0,
    units,
    rate: Number(els.unitRate.value) || 0,
    fixedCharge: Number(els.fixedCharge.value) || 0,
    amount,
    createdAt: today()
  };

  if (existing) {
    Object.assign(existing, bill);
  } else {
    data.electricity.push(bill);
  }

  saveData();
  els.electricityForm.reset();
  els.electricityMonth.value = billMonth;
  els.electricityListMonth.value = billMonth;
  els.electricityReadingDate.value = today();
  els.unitRate.value = electricityRate();
  els.fixedCharge.value = 0;
  fillPreviousReadingFromHistory();
  calculateElectricity();
  toast(existing ? "Electricity reading updated" : "Electricity reading recorded");
  renderAll();
});
els.electricityListMonth.addEventListener("change", renderAll);
els.electricityRoom.addEventListener("change", fillPreviousReadingFromHistory);
els.electricityMonth.addEventListener("change", fillPreviousReadingFromHistory);
els.tenantListMonth.addEventListener("change", renderAll);

els.saveDefaultRate.addEventListener("click", () => {
  const rate = Number(els.unitRate.value);
  if (!Number.isFinite(rate) || rate <= 0) {
    toast("Enter a valid electricity rate first");
    return;
  }

  ensureSettings();
  data.settings.electricityRate = rate;
  saveData();
  calculateElectricity();
  toast(`Default electricity rate saved at ${rate}`);
});

els.reportMonth.addEventListener("change", renderAll);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const contactTenantId = target.dataset.contactTenant;
  if (contactTenantId) {
    const tenant = findTenant(contactTenantId);
    if (tenant) openContactSheet(tenant);
  }

  const dueTenantId = target.dataset.dueTenant;
  if (dueTenantId) {
    const tenant = findTenant(dueTenantId);
    const month = els.reportMonth.value || thisMonth();
    const row = getMonthlyReport(month).find((item) => item.tenant.id === dueTenantId);
    if (tenant && row) openContactSheet(tenant, buildDueMessage(row, month));
  }

  const paymentSlipId = target.dataset.paymentSlip;
  if (paymentSlipId) {
    const payment = data.payments.find((item) => item.id === paymentSlipId);
    const tenant = target.dataset.paymentSlipTenant ? findTenant(target.dataset.paymentSlipTenant) : null;
    if (payment && tenant) openContactSheet(tenant, buildPaymentSlipMessage(payment));
  }

  const paymentRoomSlipId = target.dataset.paymentRoomSlip;
  if (paymentRoomSlipId) {
    const payment = data.payments.find((item) => item.id === paymentRoomSlipId);
    if (payment) window.open(ownerWhatsappLink(buildPaymentSlipMessage(payment)), "_blank", "noopener");
  }

  const ownerSummary = target.dataset.ownerSummary;
  if (ownerSummary) {
    const titles = {
      today: "Room rent due today",
      previous: "Previous pending room dues",
      upcoming: "Upcoming room rent dues"
    };
    const summaryGroups = {
      today: getTodayRoomDues,
      previous: getPreviousRoomDues,
      upcoming: getUpcomingRoomDues
    };
    const summaries = (summaryGroups[ownerSummary] || getUpcomingRoomDues)();
    const title = titles[ownerSummary] || "Room rent dues";
    window.open(ownerWhatsappLink(buildOwnerSummaryMessage(title, summaries)), "_blank", "noopener");
  }

  const editRoomId = target.dataset.editRoom;
  if (editRoomId) {
    const room = findRoom(editRoomId);
    if (!room) return;
    els.roomId.value = room.id;
    els.roomNumber.value = room.number;
    els.roomFloor.value = room.floor;
    els.roomCapacity.value = room.capacity;
    els.roomRent.value = room.rent;
    els.roomDeposit.value = room.deposit;
    els.roomNotes.value = room.notes;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const deleteRoomId = target.dataset.deleteRoom;
  if (deleteRoomId && confirm("Delete this room? Tenants assigned to it will keep their records but lose room assignment.")) {
    data.rooms = data.rooms.filter((room) => room.id !== deleteRoomId);
    data.tenants = data.tenants.map((tenant) => (tenant.roomId === deleteRoomId ? { ...tenant, roomId: "" } : tenant));
    data.electricity = data.electricity.filter((bill) => bill.roomId !== deleteRoomId);
    saveData();
    renderAll();
    toast("Room deleted");
  }

  const editTenantId = target.dataset.editTenant;
  if (editTenantId) {
    const tenant = findTenant(editTenantId);
    if (!tenant) return;
    els.tenantId.value = tenant.id;
    els.tenantName.value = tenant.name;
    els.tenantMobile.value = tenant.mobile;
    els.tenantAltMobile.value = tenant.altMobile;
    els.tenantRoom.value = tenant.roomId;
    els.tenantRent.value = tenant.rent || "";
    els.tenantJoinDate.value = tenant.joinDate;
    els.tenantLeaveDate.value = tenant.leaveDate || "";
    els.tenantIdType.value = tenant.idType;
    els.tenantIdNumber.value = tenant.idNumber;
    els.tenantEmergency.value = tenant.emergency;
    els.tenantAddress.value = tenant.address;
    const docs = tenantDocuments(tenant);
    els.docIdProof.checked = docs.idProof;
    els.docPhoto.checked = docs.photo;
    els.docAgreement.checked = docs.agreement;
    els.docDeposit.checked = docs.deposit;
    els.tenantStatus.value = tenant.status;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const settlementTenantId = target.dataset.settlementTenant;
  if (settlementTenantId) {
    const tenant = findTenant(settlementTenantId);
    if (tenant) openContactSheet(tenant, buildMoveOutSettlementMessage(tenant));
  }

  const deleteTenantId = target.dataset.deleteTenant;
  if (deleteTenantId && confirm("Delete this tenant and their rent payments?")) {
    data.tenants = data.tenants.filter((tenant) => tenant.id !== deleteTenantId);
    data.payments = data.payments.filter((payment) => payment.tenantId !== deleteTenantId);
    saveData();
    renderAll();
    toast("Tenant deleted");
  }

  const deletePaymentId = target.dataset.deletePayment;
  if (deletePaymentId && confirm("Delete this rent payment?")) {
    data.payments = data.payments.filter((payment) => payment.id !== deletePaymentId);
    saveData();
    renderAll();
    toast("Payment deleted");
  }

  const deleteElectricityId = target.dataset.deleteElectricity;
  if (deleteElectricityId && confirm("Delete this electricity bill?")) {
    data.electricity = data.electricity.filter((bill) => bill.id !== deleteElectricityId);
    saveData();
    renderAll();
    toast("Electricity bill deleted");
  }
});

els.exportData.addEventListener("click", () => {
  ensureSettings();
  data.settings.lastExportAt = new Date().toISOString();
  saveData(true);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hostel-manager-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

els.importData.addEventListener("change", async () => {
  const file = els.importData.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    data = { ...structuredClone(defaultData), ...imported };
    ensureSettings();
    data.settings.lastImportAt = new Date().toISOString();
    els.unitRate.value = electricityRate();
    saveData();
    renderAll();
    toast("Data imported");
  } catch {
    toast("Could not import this file");
  } finally {
    els.importData.value = "";
  }
});

els.paymentMonth.value = thisMonth();
els.paymentListMonth.value = thisMonth();
els.paymentDate.value = today();
els.electricityMonth.value = thisMonth();
els.electricityListMonth.value = thisMonth();
els.electricityReadingDate.value = today();
els.reportMonth.value = thisMonth();
els.tenantListMonth.value = thisMonth();
els.unitRate.value = electricityRate();
resetTenantForm();
fillPreviousReadingFromHistory();
calculateElectricity();
setupInstallExperience();
renderCloudStatus();
renderAll();
updateAuthGate();
showDueNotification().catch(() => {});

if (cloudReady() && cloudAuth?.idToken) {
  downloadCloudData(false).catch(handleCloudError);
}
