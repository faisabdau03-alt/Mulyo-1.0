/**
 * Foresta Adventure - Admin Bundling Management Script
 * Menghandle operasional CRUD paket bundling, kalkulasi harga normal & penghematan real-time,
 * serta integrasi dengan katalog produk & data stok.
 */

document.addEventListener("DOMContentLoaded", () => {
  initAdminBundles();
});

let currentEditingBundleId = null;
let currentFormItems = []; // Array of { productId, qty }

function initAdminBundles() {
  renderAdminBundlesTable();
  updateAdminMetrics();
  setupAdminListeners();

  // Listen for bundle updates
  window.addEventListener("foresta_bundles_updated", () => {
    renderAdminBundlesTable();
    updateAdminMetrics();
  });
}

function updateAdminMetrics() {
  if (typeof bundlesService === "undefined") return;
  const all = bundlesService.getBundles(true);
  const activeCount = all.filter((b) => b.isActive !== false).length;
  const productsCount = typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA.length : 0;

  let maxSavings = 0;
  all.forEach((b) => {
    const m = bundlesService.calculateMetrics(b);
    if (m.savingsAmount > maxSavings) {
      maxSavings = m.savingsAmount;
    }
  });

  const totalEl = document.getElementById("adminMetricTotalBundles");
  const activeEl = document.getElementById("adminMetricActiveBundles");
  const maxSavingsEl = document.getElementById("adminMetricMaxSavings");
  const prodCountEl = document.getElementById("adminMetricProductsCount");

  if (totalEl) totalEl.textContent = all.length;
  if (activeEl) activeEl.textContent = `${activeCount} Aktif`;
  if (maxSavingsEl) maxSavingsEl.textContent = formatRupiah(maxSavings) + " / hari";
  if (prodCountEl) prodCountEl.textContent = `${productsCount} Perlengkapan`;
}

function renderAdminBundlesTable() {
  const tbody = document.getElementById("adminBundlesTableBody");
  if (!tbody) return;

  if (typeof bundlesService === "undefined") {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Memuat data...</td></tr>`;
    return;
  }

  const bundles = bundlesService.getBundles(true);

  if (bundles.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <div class="text-muted">
            <i class="bi bi-inbox fs-2 d-block mb-2"></i>
            Belum ada paket bundling yang dibuat. Klik tombol <strong>"+ Tambah Paket Baru"</strong> di atas.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bundles
    .map((bundle, index) => {
      const m = bundlesService.calculateMetrics(bundle);
      const isActive = bundle.isActive !== false;
      const isAvailable = m.isAvailable;

      const itemsTags = m.itemsDetail
        .map((item) => {
          return `
            <span class="badge bg-light text-dark border me-1 mb-1 fw-normal" style="font-size: 0.72rem;">
              <strong>${item.qty}x</strong> ${item.name} (${item.isStockEnough ? '<span class="text-success">Ready</span>' : '<span class="text-danger">Stok Menipis</span>'})
            </span>
          `;
        })
        .join("");

      return `
        <tr>
          <td class="align-middle text-center text-muted small">${index + 1}</td>
          
          <!-- Foto & Nama Paket -->
          <td class="align-middle">
            <div class="d-flex align-items-center gap-3">
              <img src="${bundle.image}" alt="${bundle.name}" class="rounded-3 shadow-sm object-fit-cover" style="width: 60px; height: 60px; flex-shrink: 0;" />
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h6 class="mb-0 fw-bold text-dark fs-6">${bundle.name}</h6>
                  ${bundle.badge ? `<span class="badge bg-${bundle.badgeColor || 'success'} text-dark fw-bold px-2 py-0" style="font-size: 0.68rem;">${bundle.badge}</span>` : ""}
                </div>
                <div class="text-muted small" style="font-size: 0.75rem;">
                  ID: <code class="text-secondary">${bundle.id}</code> • ${m.itemCount} Jenis Alat (${m.totalPieces} Pcs)
                </div>
              </div>
            </div>
          </td>

          <!-- Daftar Perlengkapan -->
          <td class="align-middle" style="max-width: 280px;">
            <div class="d-flex flex-wrap">${itemsTags}</div>
          </td>

          <!-- Komparasi Harga -->
          <td class="align-middle">
            <div>
              <div class="text-muted small text-decoration-line-through" style="font-size: 0.75rem;">${formatRupiah(m.normalPrice)}/hari</div>
              <div class="fw-bold text-success fs-6">${formatRupiah(m.bundlePrice)}/hari</div>
              <div class="badge bg-success-subtle text-success small py-0 px-1 mt-1" style="font-size: 0.7rem;">Hemat ${formatRupiah(m.savingsAmount)} (${m.savingsPercent}%)</div>
            </div>
          </td>

          <!-- Status Stok Komponen -->
          <td class="align-middle text-center">
            ${isAvailable ? `
              <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill" style="font-size: 0.75rem;">
                <i class="bi bi-check-circle-fill me-1"></i>Tersedia (${m.maxBundlesAvailable} Pkt)
              </span>
            ` : `
              <span class="badge bg-danger-subtle text-danger px-2 py-1 rounded-pill" style="font-size: 0.75rem;">
                <i class="bi bi-exclamation-octagon-fill me-1"></i>Stok Alat Kurang
              </span>
            `}
          </td>

          <!-- Switch Status Aktif / Nonaktif -->
          <td class="align-middle text-center">
            <div class="form-check form-switch d-inline-block">
              <input class="form-check-input cursor-pointer" type="checkbox" role="switch" ${isActive ? "checked" : ""} onchange="toggleAdminBundleStatus('${bundle.id}')" title="Klik untuk mengaktifkan/menonaktifkan paket" />
            </div>
            <div class="small ${isActive ? 'text-success' : 'text-muted'}" style="font-size: 0.7rem;">
              ${isActive ? 'Aktif' : 'Nonaktif'}
            </div>
          </td>

          <!-- Aksi -->
          <td class="align-middle text-center">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-primary" onclick="openAdminEditModal('${bundle.id}')" title="Edit Paket">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button type="button" class="btn btn-outline-danger" onclick="confirmDeleteBundle('${bundle.id}', '${bundle.name}')" title="Hapus Paket">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function setupAdminListeners() {
  const form = document.getElementById("bundleEditForm");
  if (form) {
    form.addEventListener("submit", handleBundleFormSubmit);
  }

  const bundlePriceInput = document.getElementById("formBundlePrice");
  if (bundlePriceInput) {
    bundlePriceInput.addEventListener("input", recalcFormPricing);
  }
}

/**
 * Toggle Status Paket (Aktif / Nonaktif)
 */
function toggleAdminBundleStatus(bundleId) {
  if (typeof bundlesService === "undefined") return;
  const newStatus = bundlesService.toggleActive(bundleId);
  showAdminToast(`Status paket berhasil diubah menjadi: ${newStatus ? 'AKTIF (Tampil ke Publik)' : 'NONAKTIF'}`);
}

/**
 * Buka Modal Tambah Paket Baru
 */
function openAdminCreateModal() {
  currentEditingBundleId = null;
  currentFormItems = [
    { productId: "tenda-01", qty: 1 },
    { productId: "sleep-02", qty: 1 }
  ];

  const modalTitle = document.getElementById("bundleModalTitle");
  if (modalTitle) modalTitle.innerHTML = `<i class="bi bi-plus-circle me-1 text-success"></i> Tambah Paket Bundling Baru`;

  document.getElementById("formBundleId").value = "bundle-" + Date.now().toString(36);
  document.getElementById("formBundleName").value = "";
  document.getElementById("formBundleBadge").value = "";
  document.getElementById("formBundleBadgeColor").value = "success";
  document.getElementById("formBundleImage").value = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80";
  document.getElementById("formBundleDesc").value = "";
  document.getElementById("formBundlePrice").value = 75000;
  document.getElementById("formBundleIsActive").checked = true;

  updateImagePreview();
  renderFormItemsRows();
  recalcFormPricing();

  const modalEl = document.getElementById("bundleEditModal");
  if (modalEl && window.bootstrap) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

/**
 * Buka Modal Edit Paket
 */
function openAdminEditModal(bundleId) {
  if (typeof bundlesService === "undefined") return;
  const bundle = bundlesService.getBundleById(bundleId);
  if (!bundle) return;

  currentEditingBundleId = bundleId;
  currentFormItems = JSON.parse(JSON.stringify(bundle.items || []));

  const modalTitle = document.getElementById("bundleModalTitle");
  if (modalTitle) modalTitle.innerHTML = `<i class="bi bi-pencil-square me-1 text-success"></i> Edit Paket Bundling: ${bundle.name}`;

  document.getElementById("formBundleId").value = bundle.id;
  document.getElementById("formBundleName").value = bundle.name;
  document.getElementById("formBundleBadge").value = bundle.badge || "";
  document.getElementById("formBundleBadgeColor").value = bundle.badgeColor || "success";
  document.getElementById("formBundleImage").value = bundle.image || "";
  document.getElementById("formBundleDesc").value = bundle.desc || "";
  document.getElementById("formBundlePrice").value = bundle.price || 0;
  document.getElementById("formBundleIsActive").checked = bundle.isActive !== false;

  updateImagePreview();
  renderFormItemsRows();
  recalcFormPricing();

  const modalEl = document.getElementById("bundleEditModal");
  if (modalEl && window.bootstrap) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

/**
 * Render Baris Pilihan Item di Form
 */
function renderFormItemsRows() {
  const container = document.getElementById("formItemsContainer");
  if (!container) return;

  const products = typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : [];

  if (currentFormItems.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning small py-2">
        Belum ada perlengkapan yang ditambahkan ke paket ini. Klik tombol <strong>"+ Tambah Barang"</strong> di bawah.
      </div>
    `;
    return;
  }

  container.innerHTML = currentFormItems
    .map((item, index) => {
      const selectedProd = products.find((p) => p.id === item.productId);
      const unitPrice = selectedProd ? selectedProd.basePrice : 0;
      const subtotal = unitPrice * (item.qty || 1);
      const stockInfo = selectedProd ? `(Stok Gudang: ${selectedProd.stock})` : "";

      const options = products
        .map((p) => {
          return `<option value="${p.id}" ${p.id === item.productId ? "selected" : ""}>${p.name} - ${formatRupiah(p.basePrice)}/hari [Stok: ${p.stock}]</option>`;
        })
        .join("");

      return `
        <div class="card p-2 mb-2 bg-light border">
          <div class="row g-2 align-items-center">
            <!-- Pilihan Produk -->
            <div class="col-md-7 col-12">
              <label class="form-label small text-muted mb-0" style="font-size: 0.72rem;">Perlengkapan #${index + 1}</label>
              <select class="form-select form-select-sm" onchange="handleFormItemProductChange(${index}, this.value)">
                ${options}
              </select>
            </div>

            <!-- Jumlah / Qty -->
            <div class="col-md-2 col-6">
              <label class="form-label small text-muted mb-0" style="font-size: 0.72rem;">Jumlah</label>
              <div class="input-group input-group-sm">
                <input type="number" class="form-control text-center p-1" min="1" max="20" value="${item.qty || 1}" onchange="handleFormItemQtyChange(${index}, this.value)" />
                <span class="input-group-text p-1 text-muted small">pcs</span>
              </div>
            </div>

            <!-- Subtotal Satuan & Hapus -->
            <div class="col-md-3 col-6 text-end">
              <div class="small fw-bold text-dark">${formatRupiah(subtotal)}</div>
              <button type="button" class="btn btn-link text-danger text-decoration-none small p-0 mt-1" onclick="removeFormItemRow(${index})">
                <i class="bi bi-trash3 me-1"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  recalcFormPricing();
}

function addFormItemRow() {
  const products = typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : [];
  const defaultProdId = products.length > 0 ? products[0].id : "tenda-01";
  currentFormItems.push({ productId: defaultProdId, qty: 1 });
  renderFormItemsRows();
}

function removeFormItemRow(index) {
  currentFormItems.splice(index, 1);
  renderFormItemsRows();
}

function handleFormItemProductChange(index, newProductId) {
  if (currentFormItems[index]) {
    currentFormItems[index].productId = newProductId;
    renderFormItemsRows();
  }
}

function handleFormItemQtyChange(index, newQty) {
  if (currentFormItems[index]) {
    currentFormItems[index].qty = Math.max(1, parseInt(newQty) || 1);
    renderFormItemsRows();
  }
}

/**
 * Kalkulasi Harga Normal Satuan vs Harga Bundling di Form
 */
function recalcFormPricing() {
  const products = typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : [];
  let normalPrice = 0;

  currentFormItems.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      normalPrice += prod.basePrice * (item.qty || 1);
    }
  });

  const bundlePriceInput = document.getElementById("formBundlePrice");
  const bundlePrice = parseInt(bundlePriceInput ? bundlePriceInput.value : 0) || 0;

  const savingsAmount = Math.max(0, normalPrice - bundlePrice);
  const savingsPercent = normalPrice > 0 ? Math.round((savingsAmount / normalPrice) * 100) : 0;

  const normalEl = document.getElementById("formPreviewNormalPrice");
  const bundleEl = document.getElementById("formPreviewBundlePrice");
  const savingsEl = document.getElementById("formPreviewSavings");

  if (normalEl) normalEl.textContent = formatRupiah(normalPrice) + " / hari";
  if (bundleEl) bundleEl.textContent = formatRupiah(bundlePrice) + " / hari";
  if (savingsEl) {
    if (savingsAmount > 0) {
      savingsEl.className = "text-success fw-bold";
      savingsEl.textContent = `Hemat ${formatRupiah(savingsAmount)} (${savingsPercent}%)`;
    } else if (normalPrice === bundlePrice) {
      savingsEl.className = "text-muted";
      savingsEl.textContent = "Sama dengan harga normal (Tidak ada penghematan)";
    } else {
      savingsEl.className = "text-danger fw-bold";
      savingsEl.textContent = "Peringatan: Harga bundling lebih mahal dari harga normal!";
    }
  }
}

/**
 * Preset Foto Cepat
 */
function setPresetImage(url) {
  const input = document.getElementById("formBundleImage");
  if (input) {
    input.value = url;
    updateImagePreview();
  }
}

function updateImagePreview() {
  const input = document.getElementById("formBundleImage");
  const img = document.getElementById("formImagePreview");
  if (input && img) {
    img.src = input.value || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80";
  }
}

/**
 * Submit Form Tambah / Edit Paket
 */
function handleBundleFormSubmit(e) {
  e.preventDefault();

  if (currentFormItems.length === 0) {
    alert("Harap masukkan minimal 1 perlengkapan ke dalam paket!");
    return;
  }

  const bundleId = document.getElementById("formBundleId").value.trim();
  const name = document.getElementById("formBundleName").value.trim();
  const badge = document.getElementById("formBundleBadge").value.trim();
  const badgeColor = document.getElementById("formBundleBadgeColor").value;
  const image = document.getElementById("formBundleImage").value.trim();
  const desc = document.getElementById("formBundleDesc").value.trim();
  const price = parseInt(document.getElementById("formBundlePrice").value) || 0;
  const isActive = document.getElementById("formBundleIsActive").checked;

  if (!name) {
    alert("Nama paket wajib diisi!");
    return;
  }

  const newBundleData = {
    id: bundleId,
    name,
    badge,
    badgeColor,
    image: image || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
    desc,
    price,
    isActive,
    items: currentFormItems
  };

  if (typeof bundlesService !== "undefined") {
    bundlesService.saveBundle(newBundleData);
    showAdminToast(`Paket "${name}" berhasil disimpan!`);

    const modalEl = document.getElementById("bundleEditModal");
    if (modalEl && window.bootstrap) {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }
  }
}

/**
 * Hapus Paket
 */
let bundleIdToDelete = null;

function confirmDeleteBundle(id, name) {
  bundleIdToDelete = id;
  const nameEl = document.getElementById("deleteBundleNameLabel");
  if (nameEl) nameEl.textContent = name;

  const modalEl = document.getElementById("deleteConfirmModal");
  if (modalEl && window.bootstrap) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

function executeDeleteBundle() {
  if (!bundleIdToDelete || typeof bundlesService === "undefined") return;
  bundlesService.deleteBundle(bundleIdToDelete);
  showAdminToast("Paket bundling berhasil dihapus.");

  const modalEl = document.getElementById("deleteConfirmModal");
  if (modalEl && window.bootstrap) {
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
  }
  bundleIdToDelete = null;
}

/**
 * Reset ke Paket Default
 */
function resetAllBundlesToDefault() {
  if (confirm("Apakah Anda yakin ingin mereset seluruh paket bundling ke data awal bawaan? Perubahan manual yang pernah dibuat akan dikembalikan.")) {
    if (typeof bundlesService !== "undefined") {
      bundlesService.resetToDefault();
      showAdminToast("Seluruh paket bundling berhasil direset ke pengaturan default!");
    }
  }
}

function showAdminToast(message) {
  let toastContainer = document.getElementById("adminToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "adminToastContainer";
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    toastContainer.style.zIndex = "99999";
    document.body.appendChild(toastContainer);
  }

  const toastId = "toast_" + Date.now();
  const html = `
    <div id="${toastId}" class="toast align-items-center bg-dark text-white border-success border shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi bi-check-circle-fill text-success fs-5"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", html);
  const toastEl = document.getElementById(toastId);
  if (window.bootstrap && bootstrap.Toast) {
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  }
}

function formatRupiah(num) {
  return "Rp " + (Number(num) || 0).toLocaleString("id-ID");
}
