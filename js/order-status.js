/**
 * Foresta Adventure - Status Pesanan & Riwayat Pemesanan Logic
 * Terintegrasi di halaman cara-sewa.html
 */

const ORDER_STORAGE_KEY = "foresta_orders";
const NOTIF_STORAGE_KEY = "foresta_notifications";

// Data Sample Awal (Sesuai Desain Acuan UI)
const DEFAULT_SAMPLE_ORDERS = [
  {
    id: "FA-20261120-045",
    productName: "Tenda Dome 4 Orang",
    qty: 1,
    duration: 2,
    price: 100000,
    unitPrice: 50000,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80",
    tglSewa: "21 Nov 2026",
    tglKembali: "22 Nov 2026",
    status: "Sedang Disewa",
    statusBadgeClass: "bg-success-subtle text-success border border-success-subtle",
    isActive: true,
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Menunggu Pengembalian", status: "in-progress", icon: "bi-box-seam" }
    ],
    deadlineNote: "Pastikan untuk mengembalikan barang sebelum <b>22 November 2026 pukul 17.00 WIB</b> agar tidak dikenakan biaya keterlambatan.",
    hasReminder: true,
    reminderTitle: "Pengingat Pengembalian Barang",
    reminderText: "Halo! Kami mengingatkan bahwa masa sewa Anda akan berakhir dalam <b>1 hari lagi</b>. Mohon kembalikan perlengkapan sesuai jadwal."
  },
  {
    id: "FA-20261110-028",
    productName: "Paket Camping Complete (Tenda 4P + 2 SB + Kompor + Nesting)",
    qty: 1,
    duration: 2,
    price: 240000,
    unitPrice: 120000,
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=500&q=80",
    tglSewa: "10 Nov 2026",
    tglKembali: "12 Nov 2026",
    status: "Selesai Dikembalikan",
    statusBadgeClass: "bg-secondary-subtle text-secondary border",
    isActive: false,
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Selesai & Jaminan Kembali", status: "done", icon: "bi-check-lg" }
    ],
    deadlineNote: "Peralatan telah diperiksa lengkap dan kartu identitas jaminan telah diserahkan kembali.",
    hasReminder: false
  },
  {
    id: "FA-20261028-019",
    productName: "Carrier Osprey 60L + Trekking Pole Ultralight",
    qty: 1,
    duration: 2,
    price: 85000,
    unitPrice: 42500,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=500&q=80",
    tglSewa: "28 Okt 2026",
    tglKembali: "30 Okt 2026",
    status: "Selesai Dikembalikan",
    statusBadgeClass: "bg-secondary-subtle text-secondary border",
    isActive: false,
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Selesai & Jaminan Kembali", status: "done", icon: "bi-check-lg" }
    ],
    deadlineNote: "Peralatan telah diperiksa lengkap dan kartu identitas jaminan telah diserahkan kembali.",
    hasReminder: false
  }
];

const DEFAULT_SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: "reminder",
    title: "Pengingat Pengembalian Barang",
    time: "1 jam lalu",
    desc: "Masa sewa Anda akan berakhir besok, 22 November 2026. Pastikan barang dikembalikan tepat waktu.",
    icon: "bi-clock-history",
    iconBg: "rgba(34, 165, 31, 0.15)",
    iconColor: "#22a51f",
    isRead: false
  },
  {
    id: 2,
    type: "confirm",
    title: "Pesanan Dikonfirmasi",
    time: "1 hari lalu",
    desc: "Pesanan #FA-20261120-045 telah dikonfirmasi.",
    icon: "bi-check-circle-fill",
    iconBg: "rgba(34, 165, 31, 0.15)",
    iconColor: "#22a51f",
    isRead: false
  }
];

class OrderStatusManager {
  constructor() {
    this.orders = this.loadOrders();
    this.notifications = this.loadNotifications();
  }

  loadOrders() {
    try {
      const data = localStorage.getItem(ORDER_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading orders:", e);
    }
    // Set default initial data
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_ORDERS));
    return DEFAULT_SAMPLE_ORDERS;
  }

  loadNotifications() {
    try {
      const data = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Error reading notifications:", e);
    }
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_NOTIFICATIONS));
    return DEFAULT_SAMPLE_NOTIFICATIONS;
  }

  saveOrders() {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(this.orders));
  }

  saveNotifications() {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(this.notifications));
  }

  clearNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.renderNotifications();
  }

  getActiveOrder() {
    return this.orders.find(o => o.isActive) || this.orders[0];
  }

  getCompletedOrders() {
    return this.orders.filter(o => !o.isActive);
  }

  renderNotifications() {
    const listEl = document.getElementById("notifDropdownList");
    const badgeEl = document.getElementById("notifBadgeDot");
    if (!listEl) return;

    if (this.notifications.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-bell-slash fs-4 d-block mb-1 text-secondary"></i>
          Tidak ada notifikasi baru
        </div>
      `;
      if (badgeEl) badgeEl.style.display = "none";
      return;
    }

    if (badgeEl) badgeEl.style.display = "block";

    listEl.innerHTML = this.notifications.map(n => `
      <div class="notif-item">
        <div class="notif-icon-circle" style="background-color: ${n.iconBg}; color: ${n.iconColor};">
          <i class="bi ${n.icon}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="small text-dark fw-bold">${n.title}</strong>
            <span class="text-muted" style="font-size: 0.72rem;">${n.time}</span>
          </div>
          <p class="text-muted small mb-0" style="font-size: 0.78rem; line-height: 1.35;">${n.desc}</p>
        </div>
      </div>
    `).join("");
  }

  renderActiveOrder() {
    const activeOrder = this.getActiveOrder();
    const reminderBox = document.getElementById("orderReminderBanner");
    const detailBox = document.getElementById("activeOrderDetailContainer");

    if (!activeOrder) {
      if (reminderBox) reminderBox.style.display = "none";
      if (detailBox) detailBox.innerHTML = `
        <div class="text-center py-5 bg-white rounded-4 border">
          <i class="bi bi-box2 text-muted fs-1 mb-2"></i>
          <h5 class="fw-bold">Belum Ada Pesanan Aktif</h5>
          <p class="text-muted small">Silakan pilih perlengkapan di katalog untuk mulai menyewa.</p>
          <a href="katalog.html" class="btn btn-brand-primary rounded-pill px-4">Lihat Katalog</a>
        </div>
      `;
      return;
    }

    // Render Banner Pengingat
    if (reminderBox) {
      if (activeOrder.hasReminder) {
        reminderBox.style.display = "block";
        reminderBox.innerHTML = `
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div class="d-flex align-items-start gap-3">
              <div class="bell-radiant-wrapper">
                <div class="bell-radiant-badge">
                  <i class="bi bi-bell-fill"></i>
                </div>
                <div class="bell-radiant-sparkle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="fw-extrabold text-dark mb-1" style="font-size: 1.25rem;">${activeOrder.reminderTitle}</h4>
                <p class="text-muted small mb-0" style="font-size: 0.88rem; max-width: 600px;">
                  ${activeOrder.reminderText}
                </p>
              </div>
            </div>
            <div class="text-md-end flex-shrink-0">
              <a href="#activeOrderDetailCard" class="btn-detail-pesanan">
                Lihat Detail Pesanan <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        `;
      } else {
        reminderBox.style.display = "none";
      }
    }

    // Render Detail Pesanan Card
    if (detailBox) {
      const formattedPrice = "Rp " + activeOrder.price.toLocaleString("id-ID");
      
      const stepsHtml = activeOrder.steps.map(step => {
        const isDone = step.status === "done";
        const isInProgress = step.status === "in-progress";
        const nodeClass = isDone ? "" : isInProgress ? "in-progress" : "bg-light text-muted border";
        return `
          <div class="order-tracker-step">
            <div class="order-step-node ${nodeClass}">
              <i class="bi ${step.icon}"></i>
            </div>
            <div class="order-step-label">${step.name}</div>
          </div>
        `;
      }).join("");

      detailBox.innerHTML = `
        <div class="order-detail-card" id="activeOrderDetailCard">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border px-2 py-1 small fw-bold">ID: #${activeOrder.id}</span>
              <span class="text-muted small d-none d-sm-inline">Penyewaan Mandiri</span>
            </div>
            <span class="badge rounded-pill ${activeOrder.statusBadgeClass} px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1">
              <i class="bi bi-check-circle-fill"></i> ${activeOrder.status}
            </span>
          </div>

          <div class="row g-4 align-items-center">
            <!-- Kolom 1: Info Produk -->
            <div class="col-lg-4 col-md-5">
              <div class="d-flex gap-3 align-items-center">
                <img src="${activeOrder.image}" alt="${activeOrder.productName}" class="order-product-thumb shadow-sm" />
                <div>
                  <h5 class="fw-bold text-dark mb-1 fs-6">${activeOrder.productName}</h5>
                  <div class="text-muted small mb-2">${activeOrder.qty} Unit × ${activeOrder.duration} Hari</div>
                  <div class="fw-extrabold text-dark fs-5">${formattedPrice}</div>
                </div>
              </div>
            </div>

            <!-- Kolom 2: Tanggal Sewa & Pengembalian -->
            <div class="col-lg-3 col-md-3">
              <div class="order-dates-box d-flex flex-column gap-2.5">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-calendar3 fs-5 text-dark"></i>
                  <div>
                    <div class="text-muted" style="font-size: 0.72rem;">Tanggal Sewa</div>
                    <strong class="text-dark small">${activeOrder.tglSewa}</strong>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-calendar-check fs-5 text-dark"></i>
                  <div>
                    <div class="text-muted" style="font-size: 0.72rem;">Tanggal Pengembalian</div>
                    <strong class="text-dark small">${activeOrder.tglKembali}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kolom 3: Status Tracking Stepper -->
            <div class="col-lg-5 col-md-4">
              <div class="order-tracker-timeline">
                ${stepsHtml}
              </div>
            </div>
          </div>

          <!-- Alert Pengingat Keterlambatan -->
          <div class="order-deadline-alert mt-4 d-flex align-items-start gap-2.5">
            <i class="bi bi-info-circle-fill text-success fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small">
              ${activeOrder.deadlineNote}
            </div>
          </div>
        </div>
      `;
    }
  }

  renderHistoryOrders() {
    const historyContainer = document.getElementById("orderHistoryContainer");
    if (!historyContainer) return;

    const completed = this.getCompletedOrders();
    const countEl = document.getElementById("historyTotalCount");
    if (countEl) countEl.textContent = `${completed.length} Transaksi`;

    if (completed.length === 0) {
      historyContainer.innerHTML = `
        <div class="text-center py-5 text-muted small bg-white rounded-4 border p-4">
          <i class="bi bi-clock-history fs-1 d-block mb-2 text-secondary"></i>
          <h6 class="fw-bold text-dark mb-1">Belum Ada Riwayat Pemesanan</h6>
          <p class="text-muted small mb-3">Transaksi penyewaan yang telah selesai dikembalikan akan tercatat di sini.</p>
          <a href="katalog.html" class="btn btn-sm btn-brand-primary rounded-pill px-4">Mulai Sewa Alat</a>
        </div>
      `;
      return;
    }

    historyContainer.innerHTML = completed.map(o => `
      <div class="card border rounded-4 p-3 mb-3 bg-white shadow-sm hover-lift">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-light text-dark border fw-bold small">#${o.id}</span>
            <span class="text-muted small">${o.tglSewa} - ${o.tglKembali}</span>
          </div>
          <span class="badge rounded-pill ${o.statusBadgeClass} px-3 py-1 fw-bold">
            <i class="bi bi-check-all me-1"></i> ${o.status}
          </span>
        </div>
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <img src="${o.image}" alt="${o.productName}" class="rounded-3" style="width: 75px; height: 60px; object-fit: cover;" />
            <div>
              <strong class="d-block text-dark small">${o.productName}</strong>
              <span class="text-muted" style="font-size: 0.78rem;">${o.qty} Unit × ${o.duration} Hari</span>
            </div>
          </div>
          <div class="text-md-end">
            <div class="fw-bold text-dark mb-1">Rp ${o.price.toLocaleString("id-ID")}</div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-3 py-1" onclick="alert('Bukti Pengembalian & Jaminan #${o.id} telah diserahkan di Basecamp Foresta Adventure pada ${o.tglKembali}. Terima kasih!')">
                <i class="bi bi-receipt me-1"></i> Nota Selesai
              </button>
              <a href="katalog.html" class="btn btn-xs btn-success rounded-pill px-3 py-1 text-white">
                <i class="bi bi-arrow-repeat me-1"></i> Sewa Lagi
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  searchOrder(query) {
    if (!query) return;
    const cleanQ = query.trim().toUpperCase();
    const match = this.orders.find(o => o.id.toUpperCase().includes(cleanQ) || (o.customerWa && o.customerWa.includes(cleanQ)));
    
    const resultBox = document.getElementById("searchOrderResult");
    if (!resultBox) return;

    if (match) {
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div class="alert alert-success border-0 shadow-sm rounded-4 p-3 d-flex align-items-center justify-content-between gap-2">
          <div>
            <strong class="d-block text-success">Pesanan Ditemukan: #${match.id}</strong>
            <span class="small text-dark">${match.productName} (${match.status}) · Periode: ${match.tglSewa} - ${match.tglKembali}</span>
          </div>
          <a href="#activeOrderDetailCard" class="btn btn-sm btn-brand-primary rounded-pill px-3">Lihat Status</a>
        </div>
      `;
    } else {
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div class="alert alert-warning border-0 shadow-sm rounded-4 p-3">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> Pesanan dengan nomor <b>${query}</b> tidak ditemukan. Pastikan nomor ID pesanan sesuai pada pesan WhatsApp Anda.
        </div>
      `;
    }
  }

  init() {
    this.renderNotifications();
    this.renderActiveOrder();
    this.renderHistoryOrders();

    // Event listener Hapus Semua Notifikasi
    const clearNotifBtn = document.getElementById("clearNotifBtn");
    if (clearNotifBtn) {
      clearNotifBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearNotifications();
      });
    }

    // Event listener Search Form
    const searchForm = document.getElementById("searchOrderForm");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("searchOrderInput");
        if (input) this.searchOrder(input.value);
      });
    }

    // Auto-switch tabs via URL hash (#status or #panduan)
    this.handleUrlHash();
    window.addEventListener("hashchange", () => this.handleUrlHash());
  }

  handleUrlHash() {
    const hash = window.location.hash;
    const statusTabBtn = document.getElementById("tab-status-btn");
    const riwayatTabBtn = document.getElementById("tab-riwayat-btn");
    const panduanTabBtn = document.getElementById("tab-panduan-btn");

    if (hash === "#panduan" || hash === "#syarat" || hash === "#denda") {
      if (panduanTabBtn && window.bootstrap) {
        const tab = new bootstrap.Tab(panduanTabBtn);
        tab.show();
      }
    } else if (hash === "#riwayat") {
      if (riwayatTabBtn && window.bootstrap) {
        const tab = new bootstrap.Tab(riwayatTabBtn);
        tab.show();
      }
    } else if (hash === "#status") {
      if (statusTabBtn && window.bootstrap) {
        const tab = new bootstrap.Tab(statusTabBtn);
        tab.show();
      }
    }
  }
}

// Global initialization
let orderStatusManager;
document.addEventListener("DOMContentLoaded", () => {
  orderStatusManager = new OrderStatusManager();
  orderStatusManager.init();
});
