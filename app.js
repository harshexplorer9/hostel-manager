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
  roomStatusList: document.querySelector("#roomStatusList"),
  activityList: document.querySelector("#activityList"),
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
  tenantIdType: document.querySelector("#tenantIdType"),
  tenantIdNumber: document.querySelector("#tenantIdNumber"),
  tenantEmergency: document.querySelector("#tenantEmergency"),
  tenantAddress: document.querySelector("#tenantAddress"),
  tenantStatus: document.querySelector("#tenantStatus"),
  resetTenantForm: document.querySelector("#resetTenantForm"),
  tenantsTable: document.querySelector("#tenantsTable"),
  tenantCount: document.querySelector("#tenantCount"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentRoom: document.querySelector("#paymentRoom"),
  paymentMonth: document.querySelector("#paymentMonth"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentDate: document.querySelector("#paymentDate"),
  paymentMode: document.querySelector("#paymentMode"),
  paymentRemarks: document.querySelector("#paymentRemarks"),
  paymentsTable: document.querySelector("#paymentsTable"),
  paymentCount: document.querySelector("#paymentCount"),
  electricityForm: document.querySelector("#electricityForm"),
  electricityRoom: document.querySelector("#electricityRoom"),
  electricityMonth: document.querySelector("#electricityMonth"),
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
  upcomingDuesList: document.querySelector("#upcomingDuesList"),
  sendAllPreviousDues: document.querySelector("#sendAllPreviousDues"),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (cloudAuth?.localId) localStorage.setItem(userDataStorageKey(), JSON.stringify(data));
  if (!skipCloud) scheduleCloudSave();
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
  return Math.min(Math.max(Number.isFinite(day) ? day : 5, 1), 28);
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

function dueDateForMonth(month) {
  return `${month}-${String(rentDueDay()).padStart(2, "0")}`;
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

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function activeTenants() {
  return data.tenants.filter((tenant) => tenant.status === "Active");
}

function roomTenants(roomId) {
  return activeTenants().filter((tenant) => tenant.roomId === roomId);
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
    `Paid: ${money(row.rentPaid)}`,
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

function buildPaymentSlipMessage(payment, tenant) {
  const room = paymentRoom(payment);
  const rows = getMonthlyReport(payment.month).filter((row) => row.room?.id === room?.id);
  const tenants = rows.map((row) => row.tenant);
  const rentDue = rows.reduce((sum, row) => sum + row.rentDue, 0);
  const electricityDue = rows.reduce((sum, row) => sum + row.electricityDue, 0);
  const paidTotal = rows.reduce((sum, row) => sum + row.rentPaid, 0);
  const rentPaid = Math.min(paidTotal, rentDue);
  const electricityPaid = Math.min(Math.max(paidTotal - rentDue, 0), electricityDue);
  const balance = Math.max(rentDue + electricityDue - paidTotal, 0);

  return [
    `${HOSTEL_NAME} Payment Slip`,
    `Room: ${room?.number || "-"}`,
    `Tenants: ${(tenants.length ? tenants : tenant ? [tenant] : []).map((item) => item.name).join(", ")}`,
    `Month: ${monthLabel(payment.month)}`,
    `Receipt amount: ${money(payment.amount)}`,
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

function buildOwnerReminderMessage(summary, label = "Rent due reminder") {
  return [
    label,
    `Room: ${summary.roomNumber}`,
    `Month: ${monthLabel(summary.month)}`,
    `Due date: ${summary.dueDate}`,
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
        `Room ${summary.roomNumber}: ${money(summary.balanceTotal)} pending, due ${summary.dueDate}, tenants: ${summary.tenants
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
    const message = body.error?.message || "Cloud request failed";
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

  els.cloudStatus.textContent = "Sync failed";
  els.cloudStatus.classList.remove("online");
  els.cloudStatus.classList.add("error");
  toast(`Cloud sync failed: ${message}`);
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
      toast("Local data restored to cloud");
      return;
    }

    data = { ...structuredClone(defaultData), ...parsedRemote };
    ensureSettings();
    saveData(true);
    els.unitRate.value = electricityRate();
    renderAll();
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

function tenantMatchesSearch(tenant) {
  const room = findRoom(tenant.roomId);
  return [tenant.name, tenant.mobile, tenant.altMobile, tenant.idNumber, room?.number]
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

function roomRentTotal(roomId) {
  return roomTenants(roomId).reduce((sum, tenant) => sum + tenantRentAmount(tenant), 0);
}

function fillPaymentAmountFromRoom() {
  if (els.paymentRoom.value) els.paymentAmount.value = roomRentTotal(els.paymentRoom.value);
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
        dueDate: dueDateForMonth(month),
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
    summary.paidTotal += row.rentPaid;
    summary.balanceTotal += row.balance;
  });

  return Array.from(grouped.values()).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
}

function renderDashboard() {
  const occupied = data.rooms.filter((room) => roomTenants(room.id).length > 0).length;
  const monthlyRent = activeTenants().reduce((sum, tenant) => sum + tenantRentAmount(tenant), 0);
  const report = getMonthlyReport(els.reportMonth.value || thisMonth());
  const pending = report.reduce((sum, row) => sum + row.balance, 0);

  els.totalRooms.textContent = data.rooms.length;
  els.occupiedRooms.textContent = occupied;
  els.monthlyRent.textContent = money(monthlyRent);
  els.pendingDues.textContent = money(pending);

  els.roomStatusList.innerHTML =
    data.rooms
      .slice(0, 8)
      .map((room) => {
        const count = roomTenants(room.id).length;
        const capacity = roomCapacity(room);
        const status = count >= capacity ? "Full" : count > 0 ? "Partial" : "Vacant";
        const badgeClass = status === "Full" ? "red" : status === "Partial" ? "orange" : "green";
        const roomTotalRent = roomRentTotal(room.id);
        const tenantShare = count ? roomTotalRent / count : occupancyRent(1);
        return `
          <div class="status-item">
            <div><strong>Room ${escapeHtml(room.number)}</strong><span>${count}/${capacity} tenants, ${money(roomTotalRent || occupancyRent(1))} room rent, ${money(tenantShare)} each</span></div>
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
}

function renderRooms() {
  const rooms = data.rooms.filter((room) => {
    const tenants = roomTenants(room.id).map((tenant) => tenant.name).join(" ");
    return [room.number, room.floor, tenants].join(" ").toLowerCase().includes(currentSearch);
  });

  els.roomCount.textContent = `${rooms.length} rooms`;
  els.roomsTable.innerHTML = table(
    ["Room", "Floor", "Occupancy", "Rent Split", "Deposit", "Notes", "Actions"],
    rooms.map((room) => {
      const tenants = roomTenants(room.id);
      const capacity = roomCapacity(room);
      const totalRent = occupancyRent(tenants.length || 1);
      const tenantShare = tenants.length ? totalRent / tenants.length : totalRent;
      return `
        <tr>
          <td><strong>${escapeHtml(room.number)}</strong></td>
          <td>${escapeHtml(room.floor || "-")}</td>
          <td>${tenants.length}/${capacity}${room.capacity > MAX_TENANTS_PER_ROOM ? " (max 4)" : ""}<br>${roomOccupantsHtml(tenants)}</td>
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
  const tenants = data.tenants.filter(tenantMatchesSearch);
  els.tenantCount.textContent = `${tenants.length} tenants`;
  els.tenantsTable.innerHTML = table(
    ["Name", "Mobile", "Room", "Rent", "Joining", "ID Proof", "Emergency", "Status", "Actions"],
    tenants.map(
      (tenant) => `
      <tr>
        <td><strong>${escapeHtml(tenant.name)}</strong><br><small>${escapeHtml(tenant.address || "")}</small></td>
        <td>
          <div class="mobile-cell">
            <strong>${escapeHtml(tenant.mobile)}</strong>
            <small>${escapeHtml(tenant.altMobile || "")}</small>
            <button class="contact-button" data-contact-tenant="${tenant.id}">Call / WhatsApp</button>
          </div>
        </td>
        <td>${escapeHtml(tenantRoomLabel(tenant))}</td>
        <td>${money(tenantRentAmount(tenant))}</td>
        <td>${escapeHtml(tenant.joinDate)}</td>
        <td>${escapeHtml(tenant.idType || "-")}<br><small>${escapeHtml(tenant.idNumber || "")}</small></td>
        <td>${escapeHtml(tenant.emergency || "-")}</td>
        <td><span class="badge ${tenant.status === "Active" ? "green" : "orange"}">${escapeHtml(tenant.status)}</span></td>
        <td class="row-actions">
          <button data-edit-tenant="${tenant.id}">Edit</button>
          <button class="danger" data-delete-tenant="${tenant.id}">Delete</button>
        </td>
      </tr>
    `
    ),
    "No tenants found."
  );
}

function renderPayments() {
  const payments = data.payments.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  els.paymentCount.textContent = `${payments.length} payments`;

  if (!payments.length) {
    els.paymentsTable.innerHTML = '<div class="empty">No payments recorded.</div>';
    return;
  }

  const grouped = new Map();
  payments.forEach((payment) => {
    const room = paymentRoom(payment);
    const key = room?.id || "deleted-room";
    if (!grouped.has(key)) {
      grouped.set(key, {
        roomNumber: room?.number || "Deleted room",
        payments: []
      });
    }
    grouped.get(key).payments.push({ payment, tenants: paymentTenants(payment) });
  });

  els.paymentsTable.innerHTML = Array.from(grouped.values())
    .map((group) => {
      const total = group.payments.reduce((sum, item) => sum + Number(item.payment.amount || 0), 0);
      return `
        <section class="room-report">
          <div class="room-report-head">
            <strong>Room ${escapeHtml(group.roomNumber)}</strong>
            <span>${group.payments.length} payments | ${money(total)}</span>
          </div>
          ${table(
            ["Room Tenants", "Month", "Amount", "Date", "Mode", "Remarks", "Slip"],
            group.payments.map(({ payment, tenants }) => `
              <tr>
                <td>${tenants.length ? tenants.map((tenant) => `<strong>${escapeHtml(tenant.name)}</strong><br><small>${escapeHtml(tenant.mobile || "")}</small>`).join("<hr>") : "No active tenant"}</td>
                <td>${escapeHtml(payment.month)}</td>
                <td>${money(payment.amount)}</td>
                <td>${escapeHtml(payment.date)}</td>
                <td>${escapeHtml(payment.mode)}</td>
                <td>${escapeHtml(payment.remarks || "-")}</td>
                <td class="row-actions">
                  ${tenants
                    .map(
                      (tenant) =>
                        `<button data-payment-slip="${payment.id}" data-payment-slip-tenant="${tenant.id}" ${tenant.mobile ? "" : "disabled"}>${escapeHtml(tenant.name)} Slip</button>`
                    )
                    .join("")}
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

function renderElectricity() {
  els.electricityCount.textContent = `${data.electricity.length} bills`;
  els.electricityTable.innerHTML = table(
    ["Room", "Month", "Previous", "Current", "Units", "Rate", "Fixed", "Amount", "Actions"],
    data.electricity
      .slice()
      .sort((a, b) => b.month.localeCompare(a.month))
      .map(
        (bill) => `
        <tr>
          <td>Room ${escapeHtml(findRoom(bill.roomId)?.number || "Deleted")}</td>
          <td>${escapeHtml(bill.month)}</td>
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
    "No electricity bills recorded."
  );
}

function getMonthlyReport(month) {
  return activeTenants().map((tenant) => {
    const room = findRoom(tenant.roomId);
    const rentDue = tenantRentAmount(tenant);
    const tenantDirectPaid = data.payments
      .filter((payment) => payment.tenantId === tenant.id && payment.month === month)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const roomPaymentTotal = data.payments
      .filter((payment) => payment.roomId === tenant.roomId && payment.month === month)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const electricityDue = data.electricity
      .filter((bill) => bill.roomId === tenant.roomId && bill.month === month)
      .reduce((sum, bill) => sum + Number(bill.amount), 0);
    const roomActiveTenants = Math.max(roomTenants(tenant.roomId).length, 1);
    const roomPaidShare = roomPaymentTotal / roomActiveTenants;
    const rentPaid = tenantDirectPaid + roomPaidShare;
    const tenantElectricity = electricityDue / roomActiveTenants;
    const totalDue = rentDue + tenantElectricity;

    return {
      tenant,
      room,
      rentDue,
      rentPaid,
      electricityDue: tenantElectricity,
      totalDue,
      balance: Math.max(totalDue - rentPaid, 0)
    };
  });
}

function renderReports() {
  const month = els.reportMonth.value || thisMonth();
  const rows = getMonthlyReport(month);

  if (!rows.length) {
    els.reportsTable.innerHTML = `<div class="empty">No active tenants for ${month}.</div>`;
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
      const paidTotal = group.rows.reduce((sum, row) => sum + row.rentPaid, 0);
      const balanceTotal = group.rows.reduce((sum, row) => sum + row.balance, 0);

      return `
        <section class="room-report">
          <div class="room-report-head">
            <strong>Room ${escapeHtml(group.roomNumber)}</strong>
            <span>Balance ${money(balanceTotal)}</span>
          </div>
          ${table(
            ["Tenant", "Rent Due", "Electricity", "Paid", "Balance", "Send Due"],
            [
              ...group.rows.map(
                (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.tenant.name)}</strong><br><small>${escapeHtml(row.tenant.mobile)}</small></td>
                  <td>${money(row.rentDue)}</td>
                  <td>${money(row.electricityDue)}</td>
                  <td>${money(row.rentPaid)}</td>
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
                  <td>${money(paidTotal)}</td>
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
            <span>${escapeHtml(monthLabel(summary.month))} | ${escapeHtml(dueStatusText(summary))}</span>
            <small>${escapeHtml(summary.tenants.map((tenant) => `${tenant.name} (${tenant.mobile || "-"})`).join(", "))}</small>
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
  const previousMonth = shiftMonth(thisMonth(), -1);
  const currentDueDate = dueDateForMonth(thisMonth());
  const upcomingMonth = daysUntil(currentDueDate) >= 0 ? thisMonth() : shiftMonth(thisMonth(), 1);
  const previousDues = getRoomDueSummaries(previousMonth).filter((summary) => summary.balanceTotal > 0);
  const upcomingDues = getRoomDueSummaries(upcomingMonth).filter((summary) => summary.balanceTotal > 0);

  els.previousDuesList.innerHTML = dueListHtml(previousDues, "No previous month pending dues.", "Previous month rent pending");
  els.upcomingDuesList.innerHTML = dueListHtml(upcomingDues, "No upcoming room dues.", "Upcoming rent due");
  els.sendAllPreviousDues.disabled = previousDues.length === 0;
  els.sendAllUpcomingDues.disabled = upcomingDues.length === 0;
  els.sendAllPreviousDues.dataset.ownerSummary = "previous";
  els.sendAllUpcomingDues.dataset.ownerSummary = "upcoming";
}

function renderAll() {
  renderRoomOptions();
  renderTenantOptions();
  renderRentSettings();
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

  const dueToday = getRoomDueSummaries(thisMonth()).filter((summary) => summary.balanceTotal > 0 && daysUntil(summary.dueDate) === 0);
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
  els.tenantStatus.value = "Active";
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
    idType: els.tenantIdType.value.trim(),
    idNumber: els.tenantIdNumber.value.trim(),
    emergency: els.tenantEmergency.value.trim(),
    address: els.tenantAddress.value.trim(),
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

els.cloudLogout.addEventListener("click", () => {
  logoutCloud();
});

els.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!els.paymentRoom.value) {
    toast("Add a room before recording payment");
    return;
  }

  data.payments.push({
    id: crypto.randomUUID(),
    roomId: els.paymentRoom.value,
    month: els.paymentMonth.value,
    amount: Number(els.paymentAmount.value) || 0,
    date: els.paymentDate.value,
    mode: els.paymentMode.value,
    remarks: els.paymentRemarks.value.trim()
  });

  saveData();
  els.paymentForm.reset();
  els.paymentMonth.value = thisMonth();
  els.paymentDate.value = today();
  toast("Payment recorded");
  renderAll();
});

els.paymentRoom.addEventListener("change", fillPaymentAmountFromRoom);

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

  const { units, amount } = calculateElectricity();
  data.electricity.push({
    id: crypto.randomUUID(),
    roomId: els.electricityRoom.value,
    month: els.electricityMonth.value,
    previousReading: Number(els.previousReading.value) || 0,
    currentReading: Number(els.currentReading.value) || 0,
    units,
    rate: Number(els.unitRate.value) || 0,
    fixedCharge: Number(els.fixedCharge.value) || 0,
    amount,
    createdAt: today()
  });

  saveData();
  els.electricityForm.reset();
  els.electricityMonth.value = thisMonth();
  els.unitRate.value = electricityRate();
  els.fixedCharge.value = 0;
  calculateElectricity();
  toast("Electricity bill recorded");
  renderAll();
});

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
    if (payment && tenant) openContactSheet(tenant, buildPaymentSlipMessage(payment, tenant));
  }

  const ownerSummary = target.dataset.ownerSummary;
  if (ownerSummary) {
    const previousMonth = shiftMonth(thisMonth(), -1);
    const currentDueDate = dueDateForMonth(thisMonth());
    const upcomingMonth = daysUntil(currentDueDate) >= 0 ? thisMonth() : shiftMonth(thisMonth(), 1);
    const month = ownerSummary === "previous" ? previousMonth : upcomingMonth;
    const title = ownerSummary === "previous" ? "Previous month pending room dues" : "Upcoming room rent dues";
    const summaries = getRoomDueSummaries(month).filter((summary) => summary.balanceTotal > 0);
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
    els.tenantIdType.value = tenant.idType;
    els.tenantIdNumber.value = tenant.idNumber;
    els.tenantEmergency.value = tenant.emergency;
    els.tenantAddress.value = tenant.address;
    els.tenantStatus.value = tenant.status;
    window.scrollTo({ top: 0, behavior: "smooth" });
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
els.paymentDate.value = today();
els.electricityMonth.value = thisMonth();
els.reportMonth.value = thisMonth();
els.unitRate.value = electricityRate();
resetTenantForm();
calculateElectricity();
setupInstallExperience();
renderCloudStatus();
renderAll();
updateAuthGate();
showDueNotification().catch(() => {});

if (cloudReady() && cloudAuth?.idToken) {
  downloadCloudData(false).catch(handleCloudError);
}
