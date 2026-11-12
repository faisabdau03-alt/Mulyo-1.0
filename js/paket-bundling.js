/**
 * Foresta Adventure - Paket Bundling Page Script
 * Menghandle rendering kartu bundling, filter kategori, pencarian, dan modal detail paket.
 */

document.addEventListener("DOMContentLoaded", () => {
  initBundlingPage();
});

let currentActiveFilter = "all";
let currentSearchTerm = "";

function initBundlingPage() {
  renderBundlesList();
  setupFilterButtons();
  setupSearchInput();
  setupDateCalculators();

  // Listen to bundle update events from admin or other tabs
  window.addEventListener("foresta_bundles_updated", () => {
    renderBundlesList();
  });
}

function renderBundlesList() {
  const container = document.getElementById("bundlesGridContainer");
  const countEl = document.getElementById("bundlesCountLabel");
  if (!container) return;

  if (typeof bundlesService === "undefined") {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning">Layanan data bundling sedang dimuat...</div>
      </div>
    `;
    return;
  }

  const allBundles = bundlesService.getBundles(false); // Only active bundles
  let filtered = allBundles.filter((bundle) => {
    // Filter kategori
    if (currentActiveFilter !== "all") {
      const bId = bundle.id.toLowerCase();
      const bName = bundle.name.toLowerCase();
      if (currentActiveFilter === "camping" && !bId.includes("camping") && !bName.includes("camping")) return false;
      if (currentActiveFilter === "hiking" && !bId.includes("hiking") && !bName.includes("hiking") && !bName.includes("gunung")) return false;
      if (currentActiveFilter === "rombongan" && !bId.includes("rombongan") && !bName.includes("rombongan") && !bName.includes("group")) return false;
    }

    // Filter pencarian
    if (currentSearchTerm) {
      const matchName = bundle.name.toLowerCase().includes(currentSearchTerm);
      const matchDesc = (bundle.desc || "").toLowerCase().includes(currentSearchTerm);
      const matchBadge = (bundle.badge || "").toLowerCase().includes(currentSearchTerm);
      if (!matchName && !matchDesc && !matchBadge) return false;
    }

    return true;
  });

  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} dari ${allBundles.length} Paket Bundling`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-5 bg-light rounded-4 border border-dashed text-center">
          <i class="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
          <h5 class="fw-bold mb-2">Tidak Ada Paket Bundling yang Sesuai</h5>
          <p class="text-muted small mb-3">Coba ganti kata kunci pencarian atau pilih filter kategori lainnya.</p>
          <button class="btn btn-outline-success btn-sm rounded-pill px-4" onclick="resetBundlingFilter()">
            <i class="bi bi-arrow-clockwise me-1"></i> Reset Filter
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((bundle) => {
      const m = bundlesService.calculateMetrics(bundle);
      const badgeColor = bundle.badgeColor || (m.savingsPercent >= 20 ? "warning" : "success");
      const isAvailable = m.isAvailable;

      // Buat ringkasan item chips
      const itemsChips = m.itemsDetail
        .map((item) => {
          let icon = "bi-box";
          const cat = (item.categoryName || "").toLowerCase();
          if (cat.includes("tenda")) icon = "bi-house-heart";
          else if (cat.includes("carrier") || cat.includes("tas")) icon = "bi-backpack2";
          else if (cat.includes("tidur") || cat.includes("sleeping") || cat.includes("matras")) icon = "bi-moon-stars";
          else if (cat.includes("masak") || cat.includes("kompor")) icon = "bi-fire";
          else if (cat.includes("penerangan") || cat.includes("headlamp") || cat.includes("lentera")) icon = "bi-lightbulb";
          else if (cat.includes("gear") || cat.includes("pole")) icon = "bi-compass";

          return `
            <span class="badge bg-light text-dark border me-1 mb-1 fw-normal" style="font-size: 0.75rem;">
              <i class="bi ${icon} text-success me-1"></i>${item.qty}x ${item.name}
            </span>
          `;
        })
        .join("");

      return `
        <div class="col-lg-6 col-md-12 mb-4">
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bundle-card transition-all">
            <div class="row g-0 h-100">
              <!-- Foto Paket -->
              <div class="col-md-5 position-relative">
                <img src="${bundle.image}" alt="${bundle.name}" class="w-100 h-100 object-fit-cover" style="min-height: 240px; max-height: 320px;" loading="lazy" />
                
                <!-- Badge Atas Foto -->
                <div class="position-absolute top-0 start-0 p-3 d-flex flex-column gap-1">
                  ${bundle.badge ? `<span class="badge bg-${badgeColor} text-dark fw-bold px-3 py-2 shadow-sm rounded-pill" style="font-size: 0.75rem;"><i class="bi bi-stars me-1"></i>${bundle.badge}</span>` : ""}
                  ${m.savingsPercent > 0 ? `<span class="badge bg-danger text-white fw-bold px-2 py-1 shadow-sm rounded-pill" style="font-size: 0.72rem;">Hemat ${m.savingsPercent}%</span>` : ""}
                </div>

                <!-- Status Ketersediaan Stok -->
                <div class="position-absolute bottom-0 start-0 w-100 p-2 bg-gradient-dark text-white text-center" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); font-size: 0.75rem;">
                  ${isAvailable ? `<span class="text-brand-green fw-semibold"><i class="bi bi-check-circle-fill me-1"></i>Ready (Stok: ${m.maxBundlesAvailable} Paket)</span>` : `<span class="text-danger fw-semibold"><i class="bi bi-x-circle-fill me-1"></i>Stok Alat Sedang Habis</span>`}
                </div>
              </div>

              <!-- Konten Kartu -->
              <div class="col-md-7 d-flex flex-column justify-content-between p-4">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">
                      <i class="bi bi-collection text-success me-1"></i>${m.itemCount} Jenis Perlengkapan (${m.totalPieces} Pcs)
                    </span>
                  </div>

                  <h4 class="fw-bold mb-2 text-dark fs-5">${bundle.name}</h4>
                  <p class="text-muted small mb-3 line-clamp-2" style="font-size: 0.83rem; line-height: 1.4;">${bundle.desc || ""}</p>

                  <!-- Items Preview -->
                  <div class="mb-3">
                    <div class="small fw-semibold text-muted mb-1" style="font-size: 0.72rem;">ISI PERLENGKAPAN:</div>
                    <div class="d-flex flex-wrap">${itemsChips}</div>
                  </div>
                </div>

                <!-- Pricing & Action -->
                <div class="pt-3 border-top mt-2">
                  <div class="d-flex justify-content-between align-items-end mb-3">
                    <div>
                      <div class="text-muted small text-decoration-line-through" style="font-size: 0.8rem;">
                        ${formatRupiah(m.normalPrice)} / hari
                      </div>
                      <div class="d-flex align-items-baseline gap-1">
                        <span class="fs-4 fw-extrabold text-success">${formatRupiah(m.bundlePrice)}</span>
                        <span class="text-muted small">/ hari</span>
                      </div>
                    </div>
                    ${m.savingsAmount > 0 ? `
                      <div class="text-end">
                        <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                          <i class="bi bi-piggy-bank me-1"></i>Hemat ${formatRupiah(m.savingsAmount)}/hari
                        </span>
                      </div>
                    ` : ""}
                  </div>

                  <!-- Tombol Aksi -->
                  <div class="d-grid gap-2 d-sm-flex">
                    <button type="button" class="btn btn-outline-dark rounded-pill btn-sm py-2 px-3 flex-fill fw-semibold" onclick="openBundleDetailModal('${bundle.id}')">
                      <i class="bi bi-eye me-1"></i> Lihat Detail
                    </button>
                    <button type="button" class="btn btn-brand-primary rounded-pill btn-sm py-2 px-3 flex-fill fw-bold shadow-sm" ${!isAvailable ? "disabled" : ""} onclick="quickRentBundle('${bundle.id}')">
                      <i class="bi bi-cart-plus me-1"></i> Sewa Paket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll(".bundle-filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active", "btn-success", "text-white"));
      buttons.forEach((b) => b.classList.add("btn-outline-secondary"));

      btn.classList.add("active", "btn-success", "text-white");
      btn.classList.remove("btn-outline-secondary");

      currentActiveFilter = btn.getAttribute("data-filter") || "all";
      renderBundlesList();
    });
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("bundleSearchInput");
  const clearBtn = document.getElementById("clearBundleSearchBtn");

  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle("d-none", currentSearchTerm.length === 0);
    }
    renderBundlesList();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchTerm = "";
      clearBtn.classList.add("d-none");
      renderBundlesList();
      searchInput.focus();
    });
  }
}

function resetBundlingFilter() {
  currentActiveFilter = "all";
  currentSearchTerm = "";
  const searchInput = document.getElementById("bundleSearchInput");
  if (searchInput) searchInput.value = "";
  const clearBtn = document.getElementById("clearBundleSearchBtn");
  if (clearBtn) clearBtn.classList.add("d-none");

  const buttons = document.querySelectorAll(".bundle-filter-btn");
  buttons.forEach((btn, index) => {
    if (index === 0) {
      btn.classList.add("active", "btn-success", "text-white");
      btn.classList.remove("btn-outline-secondary");
    } else {
      btn.classList.remove("active", "btn-success", "text-white");
      btn.classList.add("btn-outline-secondary");
    }
  });

  renderBundlesList();
}

/**
 * Membuka Modal Detail Paket Lengkap
 */
let selectedBundleForModal = null;
let modalSelectedDuration = 2;

function openBundleDetailModal(bundleId) {
  if (typeof bundlesService === "undefined") return;
  const bundle = bundlesService.getBundleById(bundleId);
  if (!bundle) return;

  selectedBundleForModal = bundle;
  const m = bundlesService.calculateMetrics(bundle);
  modalSelectedDuration = (typeof cartService !== "undefined" && cartService.bookingState && cartService.bookingState.duration) ? cartService.bookingState.duration : 2;

  // Set modal header & badge
  const titleEl = document.getElementById("modalBundleTitle");
  const badgeEl = document.getElementById("modalBundleBadge");
  const imageEl = document.getElementById("modalBundleImage");
  const descEl = document.getElementById("modalBundleDesc");

  if (titleEl) titleEl.textContent = bundle.name;
  if (badgeEl) {
    if (bundle.badge) {
      badgeEl.innerHTML = `<span class="badge bg-${bundle.badgeColor || 'success'} text-dark fw-bold px-3 py-1 rounded-pill">${bundle.badge}</span>`;
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  }
  if (imageEl) imageEl.src = bundle.image;
  if (descEl) descEl.textContent = bundle.desc || "";

  // Render items detail table / cards
  const itemsContainer = document.getElementById("modalBundleItemsList");
  if (itemsContainer) {
    itemsContainer.innerHTML = m.itemsDetail
      .map((item) => {
        return `
          <div class="col-12 col-md-6 mb-3">
            <div class="card h-100 border rounded-3 p-2 d-flex flex-row align-items-center gap-3 bg-white">
              <img src="${item.image}" alt="${item.name}" class="rounded-3" style="width: 65px; height: 65px; object-fit: cover; flex-shrink: 0;" />
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-start">
                  <h6 class="mb-0 text-truncate fw-bold" style="font-size: 0.88rem;" title="${item.name}">${item.name}</h6>
                </div>
                <div class="text-muted small" style="font-size: 0.75rem;">
                  <span>${item.brand}</span> • <span class="fw-semibold text-dark">${item.qty} Unit</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <span class="text-success fw-bold small">${formatRupiah(item.unitPrice)}/hari</span>
                  ${item.isStockEnough ? `<span class="badge bg-success-subtle text-success small py-0 px-2" style="font-size: 0.7rem;">Stok: ${item.currentStock} Ready</span>` : `<span class="badge bg-danger-subtle text-danger small py-0 px-2" style="font-size: 0.7rem;">Stok Kurang (${item.currentStock})</span>`}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Set duration selector & update pricing calculation
  const durationSelect = document.getElementById("modalDurationSelect");
  if (durationSelect) {
    durationSelect.value = modalSelectedDuration;
  }

  // Update date picker default values
  setupModalDates();
  updateModalPricingSummary();

  // Stock warning notice
  const stockAlert = document.getElementById("modalStockAlert");
  const addToCartBtn = document.getElementById("modalAddToCartBtn");
  const directWaBtn = document.getElementById("modalDirectWaBtn");

  if (stockAlert) {
    if (!m.isAvailable) {
      stockAlert.classList.remove("d-none");
      stockAlert.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small">
          <i class="bi bi-exclamation-triangle-fill fs-5"></i>
          <div><strong>Stok Belum Lengkap:</strong> Salah satu perlengkapan dalam paket ini sedang kosong. Hubungi admin via WhatsApp untuk opsi penggantian alat setara.</div>
        </div>
      `;
    } else {
      stockAlert.classList.add("d-none");
    }
  }

  if (addToCartBtn) addToCartBtn.disabled = !m.isAvailable;
  if (directWaBtn) directWaBtn.disabled = !m.isAvailable;

  // Tampilkan Modal
  const modalEl = document.getElementById("bundleDetailModal");
  if (modalEl && window.bootstrap) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

function setupModalDates() {
  const startDateInput = document.getElementById("modalStartDate");
  const endDateInput = document.getElementById("modalEndDate");
  if (!startDateInput || !endDateInput) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const returnDate = new Date(tomorrow);
  returnDate.setDate(returnDate.getDate() + modalSelectedDuration);

  startDateInput.value = tomorrow.toISOString().split("T")[0];
  endDateInput.value = returnDate.toISOString().split("T")[0];
  startDateInput.min = tomorrow.toISOString().split("T")[0];
}

function setupDateCalculators() {
  const durationSelect = document.getElementById("modalDurationSelect");
  const startDateInput = document.getElementById("modalStartDate");
  const endDateInput = document.getElementById("modalEndDate");

  if (durationSelect) {
    durationSelect.addEventListener("change", (e) => {
      modalSelectedDuration = parseInt(e.target.value) || 2;
      setupModalDates();
      updateModalPricingSummary();
    });
  }

  if (startDateInput && endDateInput) {
    startDateInput.addEventListener("change", () => {
      recalcDurationFromDates();
    });
    endDateInput.addEventListener("change", () => {
      recalcDurationFromDates();
    });
  }
}

function recalcDurationFromDates() {
  const startDateInput = document.getElementById("modalStartDate");
  const endDateInput = document.getElementById("modalEndDate");
  const durationSelect = document.getElementById("modalDurationSelect");
  if (!startDateInput || !endDateInput) return;

  const start = new Date(startDateInput.value);
  const end = new Date(endDateInput.value);

  if (end > start) {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    modalSelectedDuration = Math.max(1, diffDays);

    if (durationSelect) {
      durationSelect.value = modalSelectedDuration;
    }
  }
  updateModalPricingSummary();
}

function updateModalPricingSummary() {
  if (!selectedBundleForModal || typeof bundlesService === "undefined") return;
  const m = bundlesService.calculateMetrics(selectedBundleForModal);

  const dur = modalSelectedDuration || 2;
  const totalNormal = m.normalPrice * dur;
  const totalBundle = m.bundlePrice * dur;
  const totalSavings = m.savingsAmount * dur;

  const normalEl = document.getElementById("modalSummaryNormalPrice");
  const bundleEl = document.getElementById("modalSummaryBundlePrice");
  const savingsEl = document.getElementById("modalSummarySavings");
  const durationEl = document.getElementById("modalSummaryDuration");

  if (durationEl) durationEl.textContent = `${dur} Hari`;
  if (normalEl) normalEl.textContent = formatRupiah(totalNormal);
  if (bundleEl) bundleEl.textContent = formatRupiah(totalBundle);
  if (savingsEl) {
    savingsEl.textContent = `Hemat ${formatRupiah(totalSavings)} (${m.savingsPercent}%)`;
  }
}

/**
 * Aksi Cepat Sewa Paket dari Kartu
 */
function quickRentBundle(bundleId) {
  if (typeof cartService === "undefined") {
    alert("Keranjang belanja sedang dimuat...");
    return;
  }

  const success = cartService.addBundleToCart(bundleId, 1);
  if (success) {
    // Buka offcanvas keranjang
    const offcanvasEl = document.getElementById("cartOffcanvas");
    if (offcanvasEl && window.bootstrap) {
      const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.show();
    }
  }
}

/**
 * Tombol Tambah ke Keranjang dari Modal
 */
function addModalBundleToCart() {
  if (!selectedBundleForModal || typeof cartService === "undefined") return;

  const success = cartService.addBundleToCart(selectedBundleForModal.id, 1, modalSelectedDuration);
  if (success) {
    // Tutup modal detail
    const modalEl = document.getElementById("bundleDetailModal");
    if (modalEl && window.bootstrap) {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }

    // Buka keranjang
    const offcanvasEl = document.getElementById("cartOffcanvas");
    if (offcanvasEl && window.bootstrap) {
      const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.show();
    }
  }
}

/**
 * Tombol Sewa Langsung via WhatsApp dari Modal
 */
function directRentBundleViaWA() {
  if (!selectedBundleForModal) return;
  const m = bundlesService.calculateMetrics(selectedBundleForModal);
  const dur = modalSelectedDuration || 2;
  const totalBundle = m.bundlePrice * dur;
  const totalSavings = m.savingsAmount * dur;

  const startDateInput = document.getElementById("modalStartDate");
  const endDateInput = document.getElementById("modalEndDate");
  const tglMulai = startDateInput ? startDateInput.value : "Menyesuaikan";
  const tglKembali = endDateInput ? endDateInput.value : "Menyesuaikan";

  const member = typeof getForestaMember === "function" ? getForestaMember() : null;
  let memberLine = "";
  let finalPrice = totalBundle;

  if (member && member.email) {
    const disc = Math.round(totalBundle * 0.1);
    finalPrice = totalBundle - disc;
    memberLine = `• *Status Member*: 🌟 Member Prioritas (${member.email}) - Diskon Tambahan 10% (-${formatRupiah(disc)})\n`;
  }

  const itemsList = m.itemsDetail.map((i) => `   - ${i.qty}x ${i.name} (@ ${formatRupiah(i.unitPrice)}/hari)`).join("\n");

  const message = `Halo Admin *Foresta Adventure*! 👋
Saya ingin menyewa langsung *Paket Bundling Hemat*:

📦 *PAKET*: *${selectedBundleForModal.name}*
📋 *Daftar Perlengkapan*:
${itemsList}

⏱️ *DURASI SEWA*:
• Tgl Ambil: ${tglMulai}
• Tgl Kembali: ${tglKembali}
• Durasi: *${dur} Hari*

💰 *RINCIAN HARGA*:
• Harga Normal Sewa Satuan: ${formatRupiah(m.normalPrice * dur)}
• Harga Bundling Khusus: *${formatRupiah(totalBundle)}*
• Penghematan Anda: *Hemat ${formatRupiah(totalSavings)} (${m.savingsPercent}%)*
${memberLine}💵 *TOTAL ESTIMASI AKHIR*: *${formatRupiah(finalPrice)}*

Mohon konfirmasi ketersediaan paket untuk tanggal tersebut ya admin. Terima kasih! 🏕️🌲`;

  const phone = typeof DEFAULT_PHONE_WA !== "undefined" ? DEFAULT_PHONE_WA : "6281234567890";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function formatRupiah(num) {
  return "Rp " + (Number(num) || 0).toLocaleString("id-ID");
}

