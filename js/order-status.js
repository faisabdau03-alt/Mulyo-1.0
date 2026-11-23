/**
 * Foresta Adventure - Status Pesanan & Riwayat Pemesanan Logic
 * Terintegrasi di halaman cara-sewa.html
 * Fitur: Pembedaan Pesanan Bebas Denda vs Terkena Denda (Normal, Melebihi Batas 1 Hari, Melebihi Batas 2 Hari)
 */

const ORDER_STORAGE_KEY = "foresta_orders";
const NOTIF_STORAGE_KEY = "foresta_notifications";
const SIM_MODE_KEY = "foresta_sim_mode";

// Data Sample Awal dengan Pembedaan Bebas Denda vs Terkena Denda
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
    deadlineTime: "22 November 2026 pukul 17.00 WIB",
    isActive: true,
    // Status Denda (Normal = Bebas Denda, late1 = Terlambat 1 Hari, late2 = Terlambat 2 Hari)
    simMode: "normal", // Default awal: Normal (Bebas Denda)
    isOverdue: false,
    overdueDays: 0,
    penaltyRate: 0.5, // 50% dari harga barang yang disewa
    penaltyPerDay: 50000, // 50% * Rp 100.000 = Rp 50.000 / hari
    status: "Sedang Disewa (Bebas Denda)",
    statusBadgeClass: "bg-success-subtle text-success border border-success-subtle",
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Menunggu Pengembalian", status: "in-progress", icon: "bi-box-seam" }
    ],
    deadlineNote: "Pastikan untuk mengembalikan barang sebelum <b>22 November 2026 pukul 17.00 WIB</b> agar tetap bebas dari biaya denda keterlambatan.",
    hasReminder: true,
    reminderTitle: "Pengingat Pengembalian Barang",
    reminderText: "Halo! Kami mengingatkan bahwa masa sewa Anda masih aktif dan belum melewati batas waktu. Silakan kembalikan sebelum <b>22 November 2026 pukul 17.00 WIB</b> agar tetap bebas denda."
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
    status: "Selesai (Tepat Waktu · Bebas Denda)",
    statusBadgeClass: "bg-success-subtle text-success border border-success-subtle",
    hasLatePenalty: false,
    penaltyPaid: 0,
    isActive: false,
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Selesai & Jaminan Kembali", status: "done", icon: "bi-check-lg" }
    ],
    deadlineNote: "Peralatan telah dikembalikan tepat waktu dalam kondisi prima. Dokumen jaminan telah diserahkan kembali tanpa denda.",
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
    status: "Selesai (Denda 1 Hari: +Rp 42.500)",
    statusBadgeClass: "bg-danger-subtle text-danger border border-danger-subtle",
    hasLatePenalty: true,
    penaltyPaid: 42500,
    totalPaid: 127500,
    isActive: false,
    steps: [
      { name: "Pesanan Dikonfirmasi", status: "done", icon: "bi-check-lg" },
      { name: "Barang Diserahkan", status: "done", icon: "bi-check-lg" },
      { name: "Selesai Bersama Pelunasan Denda", status: "done", icon: "bi-check-lg" }
    ],
    deadlineNote: "Pengembalian melewati batas waktu 1 hari. Denda keterlambatan 50% (+Rp 42.500) telah dilunasi dan jaminan telah dikembalikan.",
    hasReminder: false
  }
];

class OrderStatusManager {
  constructor() {
    this.simMode = localStorage.getItem(SIM_MODE_KEY) || "normal";
    this.orders = this.loadOrders();
    this.notifications = this.loadNotifications();
  }

  loadOrders() {
    try {
      const data = localStorage.getItem(ORDER_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.find(o => o.isActive);
          if (active) {
            // Sinkronkan active order dengan simMode saat ini
            this.applyModeToActiveOrder(active, this.simMode);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading orders:", e);
    }
    // Set default data
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_ORDERS));
    this.applyModeToActiveOrder(defaults[0], this.simMode);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  applyModeToActiveOrder(active, mode) {
    if (!active) return;
    active.simMode = mode;
    active.penaltyRate = 0.5;
    active.penaltyPerDay = Math.round((active.price || 100000) * 0.5);
    active.deadlineTime = "22 November 2026 pukul 17.00 WIB";

    if (mode === "normal") {
      active.isOverdue = false;
      active.overdueDays = 0;
      active.status = "Sedang Disewa (Bebas Denda)";
      active.statusBadgeClass = "bg-success-subtle text-success border border-success-subtle";
    } else if (mode === "late1") {
      active.isOverdue = true;
      active.overdueDays = 1;
      active.status = "Terlambat 1 Hari · Denda 50%";
      active.statusBadgeClass = "bg-danger text-white border border-danger";
    } else if (mode === "late2") {
      active.isOverdue = true;
      active.overdueDays = 2;
      active.status = "Terlambat 2 Hari · Denda 100% (Darurat)";
      active.statusBadgeClass = "bg-danger text-white border border-danger shadow-sm";
    }
  }

  loadNotifications() {
    const active = this.getActiveOrder();
    const mode = this.simMode;
    const notifs = [];

    if (mode === "late2") {
      notifs.push({
        id: "notif-penalty-2",
        type: "penalty-critical",
        title: "🚨 Denda Keterlambatan Hari ke-2 Aktif",
        time: "Baru saja",
        desc: "Batas pengembalian terlewat 2 Hari. Denda berkala telah bertambah menjadi 100% (Rp 100.000). Total kewajiban: Rp 200.000. Segera hubungi admin!",
        icon: "bi-exclamation-octagon-fill",
        iconBg: "rgba(190, 18, 60, 0.15)",
        iconColor: "#be123c",
        isRead: false
      });
    } else if (mode === "late1") {
      notifs.push({
        id: "notif-penalty-1",
        type: "penalty",
        title: "⚠️ Denda Keterlambatan Berlaku",
        time: "Baru saja",
        desc: "Notifikasi pengembalian barang tidak digubris. Batas kesepakatan terlewat 1 hari. Denda berkala 50% (Rp 50.000) telah aktif. Total tagihan: Rp 150.000.",
        icon: "bi-exclamation-triangle-fill",
        iconBg: "rgba(220, 38, 38, 0.15)",
        iconColor: "#dc2626",
        isRead: false
      });
    }

    notifs.push({
      id: "notif-reminder",
      type: "reminder",
      title: "Pengingat Pengembalian Barang",
      time: "Kemarin",
      desc: "Masa sewa Anda akan berakhir pada 22 November 2026 pukul 17.00 WIB. Pastikan barang dikembalikan tepat waktu agar bebas denda.",
      icon: "bi-clock-history",
      iconBg: "rgba(34, 165, 31, 0.15)",
      iconColor: "#22a51f",
      isRead: mode !== "normal"
    });

    notifs.push({
      id: "notif-confirm",
      type: "confirm",
      title: "Pesanan Dikonfirmasi",
      time: "2 hari lalu",
      desc: "Pesanan #FA-20261120-045 telah dikonfirmasi dan disiapkan di Basecamp Foresta.",
      icon: "bi-check-circle-fill",
      iconBg: "rgba(34, 165, 31, 0.15)",
      iconColor: "#22a51f",
      isRead: true
    });

    return notifs;
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

    if (badgeEl) {
      badgeEl.style.display = "block";
      const hasCritical = this.notifications.some(n => n.type === "penalty-critical");
      const hasPenalty = this.notifications.some(n => n.type === "penalty");
      badgeEl.style.backgroundColor = (hasCritical || hasPenalty) ? "#dc2626" : "#22a51f";
    }

    listEl.innerHTML = this.notifications.map(n => `
      <div class="notif-item ${n.type.includes('penalty') ? 'border-start border-danger border-3 ps-2' : ''}">
        <div class="notif-icon-circle" style="background-color: ${n.iconBg}; color: ${n.iconColor};">
          <i class="bi ${n.icon}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="small fw-bold ${n.type.includes('penalty') ? 'text-danger' : 'text-dark'}">${n.title}</strong>
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

    const mode = this.simMode;
    const basePrice = activeOrder.price || 100000;
    const penaltyPerDay = activeOrder.penaltyPerDay || Math.round(basePrice * 0.5);

    let overdueDays = 0;
    let penaltyTotal = 0;
    let totalDue = basePrice;

    if (mode === "late1") {
      overdueDays = 1;
      penaltyTotal = penaltyPerDay;
      totalDue = basePrice + penaltyTotal;
    } else if (mode === "late2") {
      overdueDays = 2;
      penaltyTotal = penaltyPerDay * 2;
      totalDue = basePrice + penaltyTotal;
    }

    // ==========================================
    // 1. RENDER BANNER ATAS (3 KONDISI BERBEDA)
    // ==========================================
    if (reminderBox) {
      reminderBox.style.display = "block";

      if (mode === "normal") {
        // KONDISI 1: NORMAL (BELUM TERKENA DENDA)
        reminderBox.className = "order-reminder-banner mb-4";
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
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h4 class="fw-extrabold text-dark mb-0" style="font-size: 1.25rem;">
                    Pengingat Pengembalian Barang
                  </h4>
                  <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-0-5 small fw-bold">
                    <i class="bi bi-shield-check me-1"></i>Bebas Denda
                  </span>
                </div>
                <p class="text-muted small mb-0" style="font-size: 0.88rem; max-width: 660px; line-height: 1.45;">
                  Halo! Masa sewa Anda masih aktif dan belum melewati batas waktu. Silakan kembalikan perlengkapan sebelum <b>22 November 2026 pukul 17.00 WIB</b> agar tetap bebas dari biaya keterlambatan.
                </p>
              </div>
            </div>
            <div class="text-md-end flex-shrink-0">
              <a href="#activeOrderDetailCard" class="btn-detail-pesanan">
                Lihat Detail Pesanan <i class="bi bi-arrow-down"></i>
              </a>
            </div>
          </div>
        `;
      } else if (mode === "late1") {
        // KONDISI 2: MELEBIHI BATAS 1 HARI (DENDA 50%)
        reminderBox.className = "order-reminder-banner penalty-active mb-4";
        reminderBox.innerHTML = `
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div class="d-flex align-items-start gap-3">
              <div class="bell-radiant-wrapper">
                <div class="bell-radiant-badge penalty">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div class="bell-radiant-sparkle penalty">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h4 class="fw-extrabold text-danger mb-0" style="font-size: 1.25rem;">
                    ⚠️ Denda Keterlambatan Berlaku: Melebihi Batas 1 Hari
                  </h4>
                  <span class="badge bg-danger text-white rounded-pill px-2.5 py-0-5 small fw-bold">
                    Denda 50% Aktif
                  </span>
                </div>
                <p class="text-dark small mb-0" style="font-size: 0.88rem; max-width: 680px; line-height: 1.45;">
                  Batas waktu pengembalian telah terlewat <b>1 Hari</b> (Batas: 22 Nov 2026 17.00 WIB) dan notifikasi tidak digubris. Sesuai kesepakatan, denda keterlambatan 50% dari harga barang (<b>+Rp ${penaltyPerDay.toLocaleString("id-ID")}/hari</b>) telah diberlakukan. Total kewajiban: <b class="text-danger">Rp ${totalDue.toLocaleString("id-ID")}</b>.
                </p>
              </div>
            </div>
            <div class="text-md-end flex-shrink-0">
              <a href="#orderPenaltySection" class="btn-detail-pesanan penalty">
                Rincian Denda & Bayar <i class="bi bi-arrow-down"></i>
              </a>
            </div>
          </div>
        `;
      } else if (mode === "late2") {
        // KONDISI 3: MELEBIHI BATAS 2 HARI (DENDA 100% DARURAT)
        reminderBox.className = "order-reminder-banner penalty-critical mb-4";
        reminderBox.innerHTML = `
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div class="d-flex align-items-start gap-3">
              <div class="bell-radiant-wrapper">
                <div class="bell-radiant-badge penalty-critical">
                  <i class="bi bi-exclamation-octagon-fill"></i>
                </div>
                <div class="bell-radiant-sparkle penalty">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h4 class="fw-extrabold text-danger mb-0" style="font-size: 1.25rem;">
                    🚨 Peringatan Darurat: Melebihi Batas 2 Hari (Denda 100%)
                  </h4>
                  <span class="badge bg-danger text-white rounded-pill px-2.5 py-0-5 small fw-bold">
                    Akumulasi 2 Hari (+Rp 100rb)
                  </span>
                </div>
                <p class="text-dark small mb-0" style="font-size: 0.88rem; max-width: 680px; line-height: 1.45;">
                  Batas pengembalian telah terlewat <b>2 Hari penuh</b>. Denda berkala otomatis bertambah 50% lagi (<b>2 × Rp ${penaltyPerDay.toLocaleString("id-ID")} = Rp ${penaltyTotal.toLocaleString("id-ID")}</b>). Total kewajiban pelunasan yang harus dibayar saat ini mencapai <b class="text-danger fs-6">Rp ${totalDue.toLocaleString("id-ID")}</b>. Mohon segera serahkan peralatan ke Basecamp hari ini!
                </p>
              </div>
            </div>
            <div class="text-md-end flex-shrink-0">
              <a href="#orderPenaltySection" class="btn-detail-pesanan penalty-critical">
                Selesaikan Rp 200rb via WA <i class="bi bi-arrow-down"></i>
              </a>
            </div>
          </div>
        `;
      }
    }

    // ==========================================
    // 2. RENDER KARTU DETAIL PESANAN
    // ==========================================
    if (detailBox) {
      // Status Badge
      let statusBadge = "";
      let cardBorderClass = "";
      let step3Node = "";
      let priceDisplay = "";
      let returnDateHtml = "";

      if (mode === "normal") {
        cardBorderClass = "border";
        statusBadge = `<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Sedang Disewa (Bebas Denda)</span>`;
        step3Node = `
          <div class="order-step-node in-progress">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="order-step-label text-success fw-bold">Menunggu Pengembalian<br/><span class="text-muted fw-normal">(Tepat Waktu)</span></div>
        `;
        priceDisplay = `
          <div class="fw-extrabold text-success fs-5">
            Rp ${basePrice.toLocaleString("id-ID")}
            <span class="badge bg-success-subtle text-success small fs-6 fw-normal ms-1">Bebas Denda</span>
          </div>
        `;
        returnDateHtml = `
          <strong class="text-dark small">22 Nov 2026 (Maks. 17.00 WIB)</strong>
        `;
      } else if (mode === "late1") {
        cardBorderClass = "border border-danger border-1";
        statusBadge = `<span class="badge rounded-pill bg-danger text-white px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"><i class="bi bi-exclamation-triangle-fill"></i> Terlambat 1 Hari · Denda 50%</span>`;
        step3Node = `
          <div class="order-step-node penalty penalty-active-pulse">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div class="order-step-label text-danger fw-bold">Melebihi Batas (+1 Hari)<br/><span class="fw-normal">Denda 50% Aktif</span></div>
        `;
        priceDisplay = `
          <div class="fw-extrabold text-danger fs-5">
            Rp ${totalDue.toLocaleString("id-ID")}
            <span class="badge bg-danger-subtle text-danger small fs-6 fw-normal ms-1">Denda: +Rp 50rb</span>
          </div>
        `;
        returnDateHtml = `
          <strong class="text-danger small fw-bold"><i class="bi bi-alarm me-1"></i>22 Nov 2026 (Terlewat 1 Hari)</strong>
        `;
      } else if (mode === "late2") {
        cardBorderClass = "border border-danger border-2 shadow-sm";
        statusBadge = `<span class="badge rounded-pill bg-danger text-white px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow"><i class="bi bi-exclamation-octagon-fill"></i> Terlambat 2 Hari · Denda 100% (Darurat)</span>`;
        step3Node = `
          <div class="order-step-node penalty penalty-active-pulse" style="background-color: #be123c;">
            <i class="bi bi-exclamation-octagon-fill"></i>
          </div>
          <div class="order-step-label text-danger fw-extrabold">Melebihi Batas (+2 Hari)<br/><span class="fw-semibold">Denda 100% Aktif</span></div>
        `;
        priceDisplay = `
          <div class="fw-extrabold text-danger fs-5">
            Rp ${totalDue.toLocaleString("id-ID")}
            <span class="badge bg-danger text-white small fs-6 fw-normal ms-1">Denda Akumulasi 2 Hari (+Rp 100rb)</span>
          </div>
        `;
        returnDateHtml = `
          <strong class="text-danger small fw-extrabold"><i class="bi bi-exclamation-circle-fill me-1"></i>22 Nov 2026 (Terlewat 2 Hari)</strong>
        `;
      }

      // Middle Box: Bebas Denda vs Box Rincian Denda
      let middleBoxHtml = "";

      if (mode === "normal") {
        middleBoxHtml = `
          <div class="order-fee-free-card mt-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2.5">
              <div class="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                <i class="bi bi-shield-check fs-5"></i>
              </div>
              <div>
                <strong class="text-success d-block small fw-bold">Status Pesanan: Aman & Bebas Denda Keterlambatan</strong>
                <span class="text-muted small">Penyewaan masih dalam periode sewa resmi. Kembalikan peralatan sebelum <b>22 Nov 2026 pukul 17.00 WIB</b>.</span>
              </div>
            </div>
            <div class="text-md-end">
              <span class="text-muted small d-block">Total Biaya Sewa Pokok:</span>
              <span class="fs-5 fw-extrabold text-success">Rp ${basePrice.toLocaleString("id-ID")}</span>
              <span class="badge bg-white text-success border border-success-subtle rounded-pill ms-1 small">Denda: Rp 0</span>
            </div>
          </div>
        `;
      } else {
        const isCritical = mode === "late2";
        const breakdownCardClass = isCritical ? "order-penalty-breakdown-card critical mt-4" : "order-penalty-breakdown-card mt-4";
        const titleBadgeText = isCritical ? "Akumulasi Hari ke-2 (100%)" : "Hari ke-1 (50%)";

        middleBoxHtml = `
          <div class="${breakdownCardClass}" id="orderPenaltySection">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom border-danger-subtle">
              <div class="d-flex align-items-center gap-2">
                <i class="bi ${isCritical ? 'bi-exclamation-octagon-fill' : 'bi-receipt-cutoff'} text-danger fs-5"></i>
                <strong class="text-danger" style="font-size: 0.95rem;">
                  Rincian Denda Keterlambatan Berkala (${overdueDays} Hari Terlambat)
                </strong>
              </div>
              <span class="badge bg-danger text-white rounded-pill px-2.5 py-1 small fw-bold">
                <i class="bi bi-arrow-repeat me-1"></i> ${titleBadgeText}
              </span>
            </div>

            <div class="row g-3 small">
              <div class="col-md-6 col-12">
                <div class="d-flex justify-content-between py-1 border-bottom border-light">
                  <span class="text-muted">Biaya Sewa Pokok (${activeOrder.duration} Hari):</span>
                  <span class="fw-bold text-dark">Rp ${basePrice.toLocaleString("id-ID")}</span>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom border-light">
                  <span class="text-muted">Batas Pengembalian Disepakati:</span>
                  <span class="fw-semibold text-danger">22 Nov 2026 (17.00 WIB)</span>
                </div>
                <div class="d-flex justify-content-between py-1">
                  <span class="text-muted">Status Respon Notifikasi:</span>
                  <span class="badge bg-danger-subtle text-danger fw-bold">Tidak Digubris / Terlewat</span>
                </div>
              </div>

              <div class="col-md-6 col-12">
                <div class="d-flex justify-content-between py-1 border-bottom border-light">
                  <span class="text-muted">Durasi Keterlambatan:</span>
                  <span class="text-danger fw-extrabold"><i class="bi bi-alarm-fill me-1"></i>${overdueDays} Hari Melebihi Batas</span>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom border-light">
                  <span class="text-muted">Tarif Denda Berkala:</span>
                  <span class="text-danger fw-semibold">50% harga barang (Rp ${penaltyPerDay.toLocaleString("id-ID")}/hari)</span>
                </div>
                <div class="d-flex justify-content-between py-1">
                  <span class="text-muted">Total Denda (${overdueDays} Hari × Rp ${penaltyPerDay.toLocaleString("id-ID")}):</span>
                  <span class="text-danger fw-extrabold fs-6">+Rp ${penaltyTotal.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-3 border-top border-danger-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <span class="text-muted small d-block">Total Yang Wajib Dilunasi (Sewa + Denda):</span>
                <div class="fs-4 fw-extrabold text-danger">Rp ${totalDue.toLocaleString("id-ID")}</div>
              </div>
              <div>
                <a href="https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Foresta Adventure! 👋\nSaya ingin konfirmasi pengembalian alat untuk Pesanan #${activeOrder.id} (${activeOrder.productName}).\n\nStatus: Melebihi Batas ${overdueDays} Hari\nBiaya Sewa Pokok: Rp ${basePrice.toLocaleString("id-ID")}\nDenda Keterlambatan: Rp ${penaltyTotal.toLocaleString("id-ID")}\nTotal Pelunasan: Rp ${totalDue.toLocaleString("id-ID")}\n\nSaya akan segera mengantarkan peralatan ke Basecamp hari ini. Mohon konfirmasinya ya Admin.`)}" target="_blank" class="btn btn-danger rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                  <i class="bi bi-whatsapp"></i> Konfirmasi Pengembalian via WhatsApp
                </a>
              </div>
            </div>
          </div>
        `;
      }

      // Bottom Note Alert
      let bottomAlertHtml = "";
      if (mode === "normal") {
        bottomAlertHtml = `
          <div class="order-deadline-alert mt-4 d-flex align-items-start gap-2.5">
            <i class="bi bi-info-circle-fill text-success fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small">
              Pastikan untuk mengembalikan barang sebelum <b>22 November 2026 pukul 17.00 WIB</b> agar kartu identitas jaminan dapat langsung diserahkan utuh dan bebas dari biaya keterlambatan.
            </div>
          </div>
        `;
      } else if (mode === "late1") {
        bottomAlertHtml = `
          <div class="order-deadline-alert penalty mt-4 d-flex align-items-start gap-2.5">
            <i class="bi bi-exclamation-octagon-fill text-danger fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small">
              <strong>PERINGATAN DENDA BERKALA (HARI KE-1):</strong> Notifikasi pengembalian perlengkapan tidak digubris hingga melewati batas kesepakatan <b>22 November 2026 pukul 17.00 WIB</b>. Sesuai ketentuan, denda sebesar <b>50% dari harga barang yang disewa (Rp ${penaltyPerDay.toLocaleString("id-ID")})</b> diakumulasikan setiap 24 jam keterlambatan sampai seluruh alat diserahkan utuh ke Basecamp.
            </div>
          </div>
        `;
      } else if (mode === "late2") {
        bottomAlertHtml = `
          <div class="order-deadline-alert penalty mt-4 d-flex align-items-start gap-2.5" style="background-color: #ffe4e6; border-color: #f43f5e;">
            <i class="bi bi-exclamation-diamond-fill text-danger fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small text-danger">
              <strong>PERINGATAN DARURAT (HARI KE-2):</strong> Keterlambatan telah mencapai 2 hari penuh. Denda bertambah berkala menjadi <b>Rp ${penaltyTotal.toLocaleString("id-ID")} (100% dari harga sewa)</b>. Kartu identitas jaminan ditahan sampai pelunasan denda dan pengembalian fisik barang selesai diperiksa.
            </div>
          </div>
        `;
      }

      detailBox.innerHTML = `
        <div class="order-detail-card ${cardBorderClass}" id="activeOrderDetailCard">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border px-2 py-1 small fw-bold">ID: #${activeOrder.id}</span>
              <span class="text-muted small d-none d-sm-inline">Penyewaan Mandiri</span>
            </div>
            ${statusBadge}
          </div>

          <div class="row g-4 align-items-center">
            <!-- Kolom 1: Info Produk & Harga -->
            <div class="col-lg-4 col-md-5">
              <div class="d-flex gap-3 align-items-center">
                <img src="${activeOrder.image}" alt="${activeOrder.productName}" class="order-product-thumb shadow-sm" />
                <div>
                  <h5 class="fw-bold text-dark mb-1 fs-6">${activeOrder.productName}</h5>
                  <div class="text-muted small mb-2">${activeOrder.qty} Unit × ${activeOrder.duration} Hari</div>
                  ${priceDisplay}
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
                  <i class="bi bi-calendar-check fs-5 ${mode !== 'normal' ? 'text-danger' : 'text-dark'}"></i>
                  <div>
                    <div class="text-muted" style="font-size: 0.72rem;">Batas Pengembalian</div>
                    ${returnDateHtml}
                  </div>
                </div>
              </div>
            </div>

            <!-- Kolom 3: Status Stepper -->
            <div class="col-lg-5 col-md-4">
              <div class="order-tracker-timeline">
                <div class="order-tracker-step">
                  <div class="order-step-node">
                    <i class="bi bi-check-lg"></i>
                  </div>
                  <div class="order-step-label">Pesanan Dikonfirmasi</div>
                </div>
                <div class="order-tracker-step">
                  <div class="order-step-node">
                    <i class="bi bi-check-lg"></i>
                  </div>
                  <div class="order-step-label">Barang Diserahkan</div>
                </div>
                <div class="order-tracker-step">
                  ${step3Node}
                </div>
              </div>
            </div>
          </div>

          <!-- Rincian Bebas Denda vs Denda Keterlambatan -->
          ${middleBoxHtml}

          <!-- Alert Peringatan / Info Pengembalian -->
          ${bottomAlertHtml}
        </div>
      `;
    }

    this.updateSimulationButtons();
  }

  updateSimulationButtons() {
    const btnNormal = document.getElementById("btnStatusNormal");
    const btnLate1 = document.getElementById("btnStatusLate1Day");
    const btnLate2 = document.getElementById("btnStatusLate2Days");

    if (!btnNormal || !btnLate1 || !btnLate2) return;

    // Reset classes
    btnNormal.className = "btn btn-sm px-3 py-1.5 fw-semibold";
    btnLate1.className = "btn btn-sm px-3 py-1.5 fw-semibold";
    btnLate2.className = "btn btn-sm px-3 py-1.5 fw-semibold";

    if (this.simMode === "normal") {
      btnNormal.className += " btn-success active fw-bold text-white shadow-sm";
      btnLate1.className += " btn-outline-danger";
      btnLate2.className += " btn-outline-danger";
    } else if (this.simMode === "late1") {
      btnNormal.className += " btn-outline-success";
      btnLate1.className += " btn-danger active fw-bold text-white shadow-sm";
      btnLate2.className += " btn-outline-danger";
    } else if (this.simMode === "late2") {
      btnNormal.className += " btn-outline-success";
      btnLate1.className += " btn-outline-danger";
      btnLate2.className += " btn-danger active fw-bold text-white shadow-sm";
    }
  }

  setMode(mode) {
    this.simMode = mode;
    localStorage.setItem(SIM_MODE_KEY, mode);

    const active = this.getActiveOrder();
    this.applyModeToActiveOrder(active, mode);
    this.saveOrders();

    this.notifications = this.loadNotifications();
    this.saveNotifications();

    this.renderNotifications();
    this.renderActiveOrder();
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

    historyContainer.innerHTML = completed.map(o => {
      const isPenalty = !!o.hasLatePenalty;
      const badgeStyle = isPenalty ? "bg-danger-subtle text-danger border border-danger-subtle" : "bg-success-subtle text-success border border-success-subtle";
      const icon = isPenalty ? "bi-exclamation-triangle-fill text-danger" : "bi-check-all text-success";
      const priceText = isPenalty ? `Rp ${(o.totalPaid || o.price).toLocaleString("id-ID")} <span class="badge bg-danger text-white rounded-pill ms-1" style="font-size: 0.68rem;">Denda +Rp ${(o.penaltyPaid || 0).toLocaleString("id-ID")}</span>` : `Rp ${o.price.toLocaleString("id-ID")} <span class="badge bg-success-subtle text-success rounded-pill ms-1" style="font-size: 0.68rem;">Bebas Denda</span>`;

      return `
        <div class="card border rounded-4 p-3 mb-3 bg-white shadow-sm hover-lift">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border fw-bold small">#${o.id}</span>
              <span class="text-muted small">${o.tglSewa} - ${o.tglKembali}</span>
            </div>
            <span class="badge rounded-pill ${badgeStyle} px-3 py-1 fw-bold">
              <i class="bi ${icon} me-1"></i> ${o.status}
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
              <div class="fw-bold text-dark mb-1">${priceText}</div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-xs btn-outline-secondary rounded-pill px-3 py-1" onclick="alert('Bukti Pengembalian & Jaminan #${o.id} telah diserahkan di Basecamp Foresta Adventure pada ${o.tglKembali}. Catatan: ${o.deadlineNote}')">
                  <i class="bi bi-receipt me-1"></i> Nota Selesai
                </button>
                <a href="katalog.html" class="btn btn-xs btn-success rounded-pill px-3 py-1 text-white">
                  <i class="bi bi-arrow-repeat me-1"></i> Sewa Lagi
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
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

    // Event listeners 3 Tombol Simulasi Status: Normal, 1 Hari, 2 Hari
    const btnNormal = document.getElementById("btnStatusNormal");
    const btnLate1 = document.getElementById("btnStatusLate1Day");
    const btnLate2 = document.getElementById("btnStatusLate2Days");

    if (btnNormal) {
      btnNormal.addEventListener("click", () => this.setMode("normal"));
    }
    if (btnLate1) {
      btnLate1.addEventListener("click", () => this.setMode("late1"));
    }
    if (btnLate2) {
      btnLate2.addEventListener("click", () => this.setMode("late2"));
    }

    // Auto-switch tabs via URL hash (#status or #panduan)
    this.handleUrlHash();
    window.addEventListener("hashchange", () => this.handleUrlHash());
  }

  handleUrlHash() {
    const hash = window.location.hash;
    const statusTabBtn = document.getElementById("tab-status-btn");
    const panduanTabBtn = document.getElementById("tab-panduan-btn");

    if (hash === "#panduan" || hash === "#syarat" || hash === "#denda") {
      if (panduanTabBtn && window.bootstrap) {
        const tab = new bootstrap.Tab(panduanTabBtn);
        tab.show();
      }
    } else if (hash === "#status" || hash === "#riwayat") {
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
