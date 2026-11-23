/**
 * Foresta Adventure - Status Pesanan & Riwayat Pemesanan Logic
 * Terintegrasi di halaman cara-sewa.html
 * Fitur: Status Pesanan, Riwayat, Notifikasi, serta Denda Keterlambatan Berkala (50% dari harga barang/sewa)
 */

const ORDER_STORAGE_KEY = "foresta_orders";
const NOTIF_STORAGE_KEY = "foresta_notifications";

// Data Sample Awal (Sesuai Desain Acuan UI dengan Fitur Denda Berkala)
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
    // Aturan Denda Keterlambatan Berkala (50% harga barang yang disewa)
    isOverdue: true, // Default aktif denda saat notifikasi pengembalian tidak digubris
    overdueDays: 1,  // Keterlambatan bertambah secara berkala per hari
    penaltyRate: 0.5, // 50% dari harga sewa barang
    penaltyPerDay: 50000, // 50% * Rp 100.000 = Rp 50.000 / hari
    status: "Terlambat & Denda Aktif",
    statusBadgeClass: "bg-danger text-white border border-danger",
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pastikan activeOrder memiliki field denda
          const active = parsed.find(o => o.isActive);
          if (active) {
            if (active.isOverdue === undefined) active.isOverdue = true;
            if (!active.overdueDays) active.overdueDays = 1;
            if (!active.penaltyRate) active.penaltyRate = 0.5;
            if (!active.penaltyPerDay) active.penaltyPerDay = Math.round((active.price || 100000) * 0.5);
            if (!active.deadlineTime) active.deadlineTime = "22 November 2026 pukul 17.00 WIB";
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading orders:", e);
    }
    // Set default initial data
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_ORDERS));
    return DEFAULT_SAMPLE_ORDERS;
  }

  loadNotifications() {
    const active = this.getActiveOrder();
    const isOverdue = active && active.isOverdue;
    const days = (active && active.overdueDays) || 1;
    const penaltyPerDay = (active && active.penaltyPerDay) || 50000;
    const totalDenda = days * penaltyPerDay;

    const notifs = [];

    if (isOverdue) {
      notifs.push({
        id: "notif-penalty",
        type: "penalty",
        title: "⚠️ Denda Keterlambatan Berlaku",
        time: "Baru saja",
        desc: `Notifikasi pengembalian tidak digubris. Batas toleransi terlewati (${days} hari). Denda berkala 50% (Rp ${penaltyPerDay.toLocaleString("id-ID")}/hari) telah diberlakukan. Total denda saat ini: Rp ${totalDenda.toLocaleString("id-ID")}.`,
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
      time: "1 hari lalu",
      desc: "Masa sewa Anda akan berakhir pada 22 November 2026 pukul 17.00 WIB. Pastikan barang dikembalikan tepat waktu.",
      icon: "bi-clock-history",
      iconBg: "rgba(34, 165, 31, 0.15)",
      iconColor: "#22a51f",
      isRead: false
    });

    notifs.push({
      id: "notif-confirm",
      type: "confirm",
      title: "Pesanan Dikonfirmasi",
      time: "2 hari lalu",
      desc: "Pesanan #FA-20261120-045 telah dikonfirmasi dan disiapkan di Basecamp.",
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
      const hasPenalty = this.notifications.some(n => n.type === "penalty");
      badgeEl.style.backgroundColor = hasPenalty ? "#dc2626" : "#22a51f";
    }

    listEl.innerHTML = this.notifications.map(n => `
      <div class="notif-item ${n.type === 'penalty' ? 'border-start border-danger border-3 ps-2' : ''}">
        <div class="notif-icon-circle" style="background-color: ${n.iconBg}; color: ${n.iconColor};">
          <i class="bi ${n.icon}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="small fw-bold ${n.type === 'penalty' ? 'text-danger' : 'text-dark'}">${n.title}</strong>
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

    const isOverdue = !!activeOrder.isOverdue;
    const overdueDays = activeOrder.overdueDays || 1;
    const penaltyPerDay = activeOrder.penaltyPerDay || Math.round(activeOrder.price * 0.5);
    const penaltyTotal = isOverdue ? overdueDays * penaltyPerDay : 0;
    const totalDue = activeOrder.price + penaltyTotal;

    // 1. Render Banner Pengingat atau Banner Peringatan Denda
    if (reminderBox) {
      reminderBox.style.display = "block";

      if (isOverdue) {
        // Mode Denda Keterlambatan Aktif (Notifikasi Pengembalian Tidak Digubris)
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
                    ⚠️ Denda Keterlambatan Berlaku
                  </h4>
                  <span class="badge bg-danger text-white rounded-pill px-2.5 py-0-5 small fw-bold">
                    Notifikasi Diabaikan
                  </span>
                </div>
                <p class="text-dark small mb-0" style="font-size: 0.88rem; max-width: 680px; line-height: 1.45;">
                  Batas waktu pengembalian telah terlewat <b>${overdueDays} Hari</b> (${activeOrder.deadlineTime || '22 Nov 2026'}). Karena notifikasi pengembalian sebelumnya tidak digubris, <b>denda berkala sebesar 50% dari harga barang (Rp ${penaltyPerDay.toLocaleString("id-ID")}/hari)</b> telah diaktifkan secara otomatis. Total denda saat ini: <b class="text-danger">Rp ${penaltyTotal.toLocaleString("id-ID")}</b>.
                </p>
              </div>
            </div>
            <div class="text-md-end flex-shrink-0">
              <a href="#orderPenaltyBreakdown" class="btn-detail-pesanan penalty">
                Rincian Denda & Bayar <i class="bi bi-arrow-down"></i>
              </a>
            </div>
          </div>
        `;
      } else if (activeOrder.hasReminder) {
        // Mode Normal: Pengingat Ramah Sebelum Batas Pengembalian
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

    // 2. Render Detail Pesanan Card
    if (detailBox) {
      const formattedPrice = "Rp " + activeOrder.price.toLocaleString("id-ID");
      
      // Status Badge
      const statusBadge = isOverdue
        ? `<span class="badge rounded-pill bg-danger text-white px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"><i class="bi bi-exclamation-triangle-fill"></i> Terlambat & Denda Aktif</span>`
        : `<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Sedang Disewa</span>`;

      // Timeline Stepper
      const stepsHtml = `
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
          <div class="order-step-node ${isOverdue ? 'penalty penalty-active-pulse' : 'in-progress'}">
            <i class="bi ${isOverdue ? 'bi-exclamation-triangle-fill' : 'bi-box-seam'}"></i>
          </div>
          <div class="order-step-label ${isOverdue ? 'text-danger fw-bold' : ''}">
            ${isOverdue ? `Lewat Batas (+${overdueDays} Hari)` : 'Menunggu Pengembalian'}
          </div>
        </div>
      `;

      // Box Rincian Denda Berkala (Muncul Jika Keterlambatan Aktif)
      const penaltyBoxHtml = isOverdue ? `
        <div class="order-penalty-breakdown-card mt-4" id="orderPenaltyBreakdown">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom border-danger-subtle">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-receipt-cutoff text-danger fs-5"></i>
              <strong class="text-danger" style="font-size: 0.95rem;">Rincian Denda Keterlambatan Berkala</strong>
            </div>
            <span class="badge bg-danger text-white rounded-pill px-2.5 py-1 small fw-bold">
              <i class="bi bi-arrow-repeat me-1"></i> Bertambah Berkala Tiap 24 Jam
            </span>
          </div>

          <div class="row g-3 small">
            <div class="col-md-6 col-12">
              <div class="d-flex justify-content-between py-1 border-bottom border-light">
                <span class="text-muted">Biaya Sewa Pokok (${activeOrder.duration} Hari):</span>
                <span class="fw-bold text-dark">Rp ${activeOrder.price.toLocaleString("id-ID")}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-light">
                <span class="text-muted">Batas Pengembalian Disepakati:</span>
                <span class="fw-semibold text-danger">${activeOrder.deadlineTime || '22 Nov 2026 17.00 WIB'}</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Status Respon Notifikasi:</span>
                <span class="badge bg-danger-subtle text-danger fw-bold">Tidak Digubris / Terlewat</span>
              </div>
            </div>

            <div class="col-md-6 col-12">
              <div class="d-flex justify-content-between py-1 border-bottom border-light">
                <span class="text-muted">Lama Keterlambatan:</span>
                <span class="text-danger fw-extrabold"><i class="bi bi-alarm-fill me-1"></i>${overdueDays} Hari Terlambat</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-light">
                <span class="text-muted">Tarif Denda Berkala:</span>
                <span class="text-danger fw-semibold">50% harga barang (Rp ${penaltyPerDay.toLocaleString("id-ID")}/hari)</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Total Akumulasi Denda:</span>
                <span class="text-danger fw-bold fs-6">+Rp ${penaltyTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div class="mt-3 pt-3 border-top border-danger-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span class="text-muted small d-block">Total Kewajiban Pembayaran (Sewa Pokok + Denda):</span>
              <div class="fs-4 fw-extrabold text-danger">Rp ${totalDue.toLocaleString("id-ID")}</div>
            </div>
            <div>
              <a href="https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Foresta Adventure! 👋\nSaya ingin konfirmasi pengembalian alat untuk Pesanan #${activeOrder.id} (${activeOrder.productName}).\n\nStatus: Terlambat ${overdueDays} Hari\nBiaya Sewa: Rp ${activeOrder.price.toLocaleString("id-ID")}\nDenda Berkala 50%: Rp ${penaltyTotal.toLocaleString("id-ID")}\nTotal Kewajiban: Rp ${totalDue.toLocaleString("id-ID")}\n\nSaya akan segera mengantarkan peralatan ke Basecamp hari ini. Mohon konfirmasinya ya Admin.`)}" target="_blank" class="btn btn-danger rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-whatsapp"></i> Konfirmasi Pengembalian via WhatsApp
              </a>
            </div>
          </div>
        </div>
      ` : "";

      // Alert Catatan Deadline / Warning
      const alertNoteHtml = isOverdue
        ? `
          <div class="order-deadline-alert penalty mt-4 d-flex align-items-start gap-2.5">
            <i class="bi bi-exclamation-octagon-fill text-danger fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small">
              <strong>PERINGATAN DENDA BERKALA AKTIF:</strong> Notifikasi pengembalian perlengkapan tidak digubris hingga melewati batas kesepakatan <b>${activeOrder.deadlineTime || '22 Nov 2026 pukul 17.00 WIB'}</b>. Sesuai ketentuan, denda sebesar <b>50% dari harga barang yang disewa (Rp ${penaltyPerDay.toLocaleString("id-ID")})</b> diakumulasikan setiap 24 jam keterlambatan sampai seluruh alat diserahkan utuh dan diperiksa oleh tim Basecamp Foresta.
            </div>
          </div>
        `
        : `
          <div class="order-deadline-alert mt-4 d-flex align-items-start gap-2.5">
            <i class="bi bi-info-circle-fill text-success fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="small">
              ${activeOrder.deadlineNote}
            </div>
          </div>
        `;

      detailBox.innerHTML = `
        <div class="order-detail-card" id="activeOrderDetailCard">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border px-2 py-1 small fw-bold">ID: #${activeOrder.id}</span>
              <span class="text-muted small d-none d-sm-inline">Penyewaan Mandiri</span>
            </div>
            ${statusBadge}
          </div>

          <div class="row g-4 align-items-center">
            <!-- Kolom 1: Info Produk -->
            <div class="col-lg-4 col-md-5">
              <div class="d-flex gap-3 align-items-center">
                <img src="${activeOrder.image}" alt="${activeOrder.productName}" class="order-product-thumb shadow-sm" />
                <div>
                  <h5 class="fw-bold text-dark mb-1 fs-6">${activeOrder.productName}</h5>
                  <div class="text-muted small mb-2">${activeOrder.qty} Unit × ${activeOrder.duration} Hari</div>
                  <div class="fw-extrabold ${isOverdue ? 'text-danger' : 'text-dark'} fs-5">
                    ${isOverdue ? `Rp ${totalDue.toLocaleString("id-ID")} <span class="badge bg-danger-subtle text-danger small fs-6 fw-normal">Termasuk Denda</span>` : formattedPrice}
                  </div>
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
                  <i class="bi bi-calendar-check fs-5 ${isOverdue ? 'text-danger' : 'text-dark'}"></i>
                  <div>
                    <div class="text-muted" style="font-size: 0.72rem;">Batas Pengembalian</div>
                    <strong class="${isOverdue ? 'text-danger' : 'text-dark'} small">${activeOrder.tglKembali} (17.00 WIB)</strong>
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

          <!-- Rincian Denda Berkala Jika Terlambat -->
          ${penaltyBoxHtml}

          <!-- Alert Pengingat / Peringatan Denda -->
          ${alertNoteHtml}
        </div>
      `;
    }

    this.updateSimulationControls();
  }

  updateSimulationControls() {
    const active = this.getActiveOrder();
    if (!active) return;

    const btnOnTime = document.getElementById("btnSimulateOnTime");
    const btnOverdue = document.getElementById("btnSimulateOverdue");
    const btnAddDay = document.getElementById("btnAddOverdueDay");

    if (btnOnTime && btnOverdue) {
      if (active.isOverdue) {
        btnOnTime.className = "btn btn-sm btn-outline-secondary";
        btnOverdue.className = "btn btn-sm btn-danger active fw-bold";
        if (btnAddDay) {
          btnAddDay.disabled = false;
          btnAddDay.textContent = `+1 Hari Terlambat (Hari ke-${(active.overdueDays || 1) + 1})`;
        }
      } else {
        btnOnTime.className = "btn btn-sm btn-success active fw-bold";
        btnOverdue.className = "btn btn-sm btn-outline-danger";
        if (btnAddDay) {
          btnAddDay.disabled = true;
          btnAddDay.textContent = "+1 Hari Terlambat";
        }
      }
    }
  }

  setSimulationState(isOverdue, days = 1) {
    const active = this.getActiveOrder();
    if (!active) return;

    active.isOverdue = isOverdue;
    active.overdueDays = days;
    active.status = isOverdue ? "Terlambat & Denda Aktif" : "Sedang Disewa";
    active.statusBadgeClass = isOverdue ? "bg-danger text-white border border-danger" : "bg-success-subtle text-success border border-success-subtle";

    this.saveOrders();
    this.notifications = this.loadNotifications();
    this.saveNotifications();

    this.renderNotifications();
    this.renderActiveOrder();
  }

  addOverdueDay() {
    const active = this.getActiveOrder();
    if (!active) return;
    if (!active.isOverdue) active.isOverdue = true;
    active.overdueDays = (active.overdueDays || 1) + 1;

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

    // Event listener Simulasi Status
    const btnSimOnTime = document.getElementById("btnSimulateOnTime");
    const btnSimOverdue = document.getElementById("btnSimulateOverdue");
    const btnAddDay = document.getElementById("btnAddOverdueDay");

    if (btnSimOnTime) {
      btnSimOnTime.addEventListener("click", () => this.setSimulationState(false, 0));
    }
    if (btnSimOverdue) {
      btnSimOverdue.addEventListener("click", () => this.setSimulationState(true, 1));
    }
    if (btnAddDay) {
      btnAddDay.addEventListener("click", () => this.addOverdueDay());
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
