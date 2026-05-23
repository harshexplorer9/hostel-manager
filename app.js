const STORAGE_KEY = "hostel-manager-data-v1";
const INSTALL_HINT_KEY = "hostel-manager-install-hint-dismissed";
const AUTH_STORAGE_KEY = "hostel-manager-auth-v1";
const CLOUD_CONFIG = window.HOSTEL_CLOUD_CONFIG || {};
const MAX_TENANTS_PER_ROOM = 4;

const defaultData = {
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

let data = loadData();
let currentSearch = "";
let cloudAuth = loadAuth();
let syncTimer;

const els = {
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
  paymentTenant: document.querySelector("#paymentTenant"),
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
  fixedCharge: document.querySelector("#fixedCharge"),
  calculatedUnits: document.querySelector("#calculatedUnits"),
  calculatedBill: document.querySelector("#calculatedBill"),
  electricityTable: document.querySelector("#electricityTable"),
  electricityCount: document.querySelector("#electricityCount"),
  reportMonth: document.querySelector("#reportMonth"),
  reportsTable: document.querySelector("#reportsTable"),
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
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);

  try {
    return { ...structuredClone(defaultData), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(skipCloud = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (!skipCloud) scheduleCloudSave();
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
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
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
  return Number(findRoom(tenant.roomId)?.rent || 0);
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
    return;
  }

  if (cloudAuth?.email) {
    els.cloudStatus.textContent = `Synced: ${cloudAuth.email}`;
    els.cloudStatus.classList.add("online");
  } else {
    els.cloudStatus.textContent = "Local only";
    els.cloudStatus.classList.remove("online");
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

async function authenticateCloud(mode) {
  if (!cloudReady()) {
    toast("Cloud config missing");
    return;
  }

  const email = els.cloudEmail.value.trim();
  const password = els.cloudPassword.value;
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

  els.cloudPassword.value = "";
  await downloadCloudData(true);
  showCloudSheet();
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
  await cloudRequest(firestoreDocUrl(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${cloudAuth.idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        hostelData: { stringValue: JSON.stringify(data) },
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
    if (uploadIfEmpty) await uploadCloudData(false);
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
    data = { ...structuredClone(defaultData), ...JSON.parse(remoteData) };
    saveData(true);
    renderAll();
    toast("Cloud data loaded");
  }
}

function scheduleCloudSave() {
  if (!cloudReady() || !cloudAuth?.idToken) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    uploadCloudData(false).catch((error) => toast(`Cloud sync failed: ${error.message}`));
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
}

function renderTenantOptions() {
  const options = activeTenants()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((tenant) => `<option value="${tenant.id}">${escapeHtml(tenant.name)} - ${escapeHtml(tenantRoomLabel(tenant))}</option>`)
    .join("");

  els.paymentTenant.innerHTML = options || '<option value="">Add an active tenant first</option>';
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
        return `
          <div class="status-item">
            <div><strong>Room ${escapeHtml(room.number)}</strong><span>${count}/${capacity} tenants, ${money(room.rent)}/month default</span></div>
            <span class="badge ${badgeClass}">${status}</span>
          </div>
        `;
      })
      .join("") || '<div class="empty">No rooms added yet.</div>';

  const activities = [
    ...data.payments.map((item) => ({
      date: item.date,
      title: `Rent received: ${money(item.amount)}`,
      sub: `${findTenant(item.tenantId)?.name || "Tenant"} for ${item.month}`
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
    ["Room", "Floor", "Occupancy", "Rent", "Deposit", "Notes", "Actions"],
    rooms.map((room) => {
      const tenants = roomTenants(room.id);
      const capacity = roomCapacity(room);
      return `
        <tr>
          <td><strong>${escapeHtml(room.number)}</strong></td>
          <td>${escapeHtml(room.floor || "-")}</td>
          <td>${tenants.length}/${capacity}${room.capacity > MAX_TENANTS_PER_ROOM ? " (max 4)" : ""}<br>${roomOccupantsHtml(tenants)}</td>
          <td>${money(room.rent)}</td>
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
  els.paymentCount.textContent = `${data.payments.length} payments`;
  els.paymentsTable.innerHTML = table(
    ["Tenant", "Room", "Month", "Amount", "Date", "Mode", "Remarks", "Actions"],
    data.payments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((payment) => {
        const tenant = findTenant(payment.tenantId);
        return `
          <tr>
            <td>${escapeHtml(tenant?.name || "Deleted tenant")}</td>
            <td>${escapeHtml(tenant ? tenantRoomLabel(tenant) : "-")}</td>
            <td>${escapeHtml(payment.month)}</td>
            <td>${money(payment.amount)}</td>
            <td>${escapeHtml(payment.date)}</td>
            <td>${escapeHtml(payment.mode)}</td>
            <td>${escapeHtml(payment.remarks || "-")}</td>
            <td class="row-actions"><button class="danger" data-delete-payment="${payment.id}">Delete</button></td>
          </tr>
        `;
      }),
    "No payments recorded."
  );
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
    const rentPaid = data.payments
      .filter((payment) => payment.tenantId === tenant.id && payment.month === month)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const electricityDue = data.electricity
      .filter((bill) => bill.roomId === tenant.roomId && bill.month === month)
      .reduce((sum, bill) => sum + Number(bill.amount), 0);
    const roomActiveTenants = Math.max(roomTenants(tenant.roomId).length, 1);
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
  els.reportsTable.innerHTML = table(
    ["Tenant", "Room", "Rent Due", "Electricity Share", "Paid", "Balance", "Send Due"],
    rows.map(
      (row) => `
      <tr>
        <td><strong>${escapeHtml(row.tenant.name)}</strong><br><small>${escapeHtml(row.tenant.mobile)}</small></td>
        <td>${escapeHtml(row.room?.number || "-")}</td>
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
    `No active tenants for ${month}.`
  );
}

function renderAll() {
  renderRoomOptions();
  renderTenantOptions();
  renderDashboard();
  renderRooms();
  renderTenants();
  renderPayments();
  renderElectricity();
  renderReports();
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

els.cloudLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await authenticateCloud("signin");
  } catch (error) {
    toast(`Login failed: ${error.message}`);
  }
});

els.cloudCreateAccount.addEventListener("click", async () => {
  try {
    await authenticateCloud("signup");
  } catch (error) {
    toast(`Account failed: ${error.message}`);
  }
});

els.cloudUpload.addEventListener("click", async () => {
  try {
    await uploadCloudData(true);
  } catch (error) {
    toast(`Upload failed: ${error.message}`);
  }
});

els.cloudDownload.addEventListener("click", async () => {
  try {
    await downloadCloudData(false);
  } catch (error) {
    toast(`Download failed: ${error.message}`);
  }
});

els.cloudLogout.addEventListener("click", () => {
  saveAuth(null);
  showCloudSheet();
  toast("Logged out");
});

els.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!els.paymentTenant.value) {
    toast("Add an active tenant before recording payment");
    return;
  }

  data.payments.push({
    id: crypto.randomUUID(),
    tenantId: els.paymentTenant.value,
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
  els.unitRate.value = 8;
  els.fixedCharge.value = 0;
  calculateElectricity();
  toast("Electricity bill recorded");
  renderAll();
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
resetTenantForm();
calculateElectricity();
setupInstallExperience();
renderCloudStatus();
renderAll();

if (cloudReady() && cloudAuth?.idToken) {
  downloadCloudData(false).catch((error) => toast(`Cloud sync failed: ${error.message}`));
}
