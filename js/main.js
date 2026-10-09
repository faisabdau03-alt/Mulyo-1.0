// Main App Logic for Mulyo Adventure

document.addEventListener("DOMContentLoaded", () => {
  initDateAndDurationPicker();
  initCategoryFilters();
  initFeaturedProducts();
  initStickyNavbar();
  initSearchHandler();
  initQuickModals();
});

// 1. Inisialisasi Tanggal & Kalkulasi Durasi Sewa
function initDateAndDurationPicker() {
  const startDateInput = document.getElementById("bookingStartDate");
  const durationSelect = document.getElementById("bookingDuration");
  const endDateDisplay = document.getElementById("bookingEndDate");

  if (!startDateInput || !durationSelect || !endDateDisplay) return;

  // Set default tgl ambil = besok
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  startDateInput.min = minDateStr;
  if (!startDateInput.value) {
    startDateInput.value = minDateStr;
  }

  function updateReturnDate() {
    const startVal = startDateInput.value;
    const durVal = parseInt(durationSelect.value) || 2;

    if (!startVal) {
      endDateDisplay.value = "Pilih tanggal ambil";
      return;
    }

    const startDate = new Date(startVal);
    const endDate = new Date(startDate);
    // Tambah hari durasi (misal sewa 2 hari = kembali 2 hari kemudian)
    endDate.setDate(startDate.getDate() + (durVal - 1));

    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    const formatted = endDate.toLocaleDateString("id-ID", options);
    endDateDisplay.value = formatted;

    // Simpan ke cart state
    if (window.cartService) {
      cartService.saveBookingState({
        startDate: startVal,
        duration: durVal,
        endDate: endDate.toISOString().split("T")[0]
      });
      // Sinkronkan durasi ke item yang ada di cart
      cartService.applyDurationToAll(durVal);
    }
  }

  startDateInput.addEventListener("change", updateReturnDate);
  durationSelect.addEventListener("change", updateReturnDate);

  // Jalankan kalkulasi awal
  updateReturnDate();
}

// 2. Render Produk Unggulan di Homepage
function initFeaturedProducts(categoryFilter = "all") {
  const gridContainer = document.getElementById("featuredProductsGrid");
  if (!gridContainer) return;

  let products = PRODUCTS_DATA;
  if (categoryFilter !== "all") {
    products = products.filter((p) => p.category === categoryFilter);
  }

  // Tampilkan max 8 produk di homepage
  const displayed = products.slice(0, 8);

  gridContainer.innerHTML = displayed
    .map((product) => createProductCardHtml(product))
    .join("");
}

// 3. Template HTML Kartu Produk
function createProductCardHtml(product) {
  return `
    <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
      <div class="card h-100 product-card shadow-sm border-0 rounded-4 overflow-hidden position-relative hover-lift">
        <!-- Badge -->
        ${
          product.badge
            ? `<span class="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill bg-success-subtle text-success fw-bold z-2">${product.badge}</span>`
            : ""
        }
        
        <!-- Gambar Produk -->
        <div class="product-img-wrapper position-relative overflow-hidden" style="height: 220px; background-color: #f1f5f9;">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="w-100 h-100 object-fit-cover product-img"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'"
          />
          <div class="product-overlay d-flex align-items-center justify-content-center gap-2">
            <button class="btn btn-light btn-sm rounded-pill px-3 shadow" onclick="openProductModal('${product.id}')">
              <i class="bi bi-eye"></i> Detail
            </button>
            <button class="btn btn-success btn-sm rounded-pill px-3 shadow text-dark fw-bold" onclick="cartService.addToCart('${product.id}', 1)">
              <i class="bi bi-cart-plus"></i> + Sewa
            </button>
          </div>
        </div>

        <!-- Info Produk -->
        <div class="card-body d-flex flex-column p-3">
          <div class="d-flex align-items-center justify-content-between text-muted small mb-1">
            <span class="text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">${product.brand}</span>
            <span class="d-flex align-items-center text-warning small">
              ★ <span class="text-dark ms-1 fw-bold">${product.rating}</span>
              <span class="text-muted ms-1">(${product.reviewsCount})</span>
            </span>
          </div>

          <h5 class="card-title fs-6 fw-bold text-dark text-truncate-2 mb-2" style="min-height: 42px;">
            <a href="javascript:void(0)" onclick="openProductModal('${product.id}')" class="text-decoration-none text-dark hover-green">
              ${product.name}
            </a>
          </h5>

          <p class="text-muted small text-truncate-2 mb-3" style="font-size: 0.825rem; min-height: 38px;">
            ${product.desc}
          </p>

          <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small d-block" style="font-size: 0.75rem;">Biaya Sewa</span>
              <span class="fs-5 fw-bold text-success">${formatRupiah(product.basePrice)}</span>
              <span class="text-muted small">/hari</span>
            </div>
            <button class="btn btn-outline-success btn-sm rounded-circle p-2" title="Tambah ke Keranjang" onclick="cartService.addToCart('${product.id}', 1)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 4. Filter Kategori Tabs
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll(".category-tab-btn");
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active", "btn-success", "text-white"));
      filterBtns.forEach((b) => b.classList.add("btn-outline-secondary", "text-dark"));

      btn.classList.add("active", "btn-success", "text-white");
      btn.classList.remove("btn-outline-secondary", "text-dark");

      const category = btn.getAttribute("data-category");
      initFeaturedProducts(category);
    });
  });
}

// 5. Product Modal Detail
function openProductModal(productId) {
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) return;

  const modalEl = document.getElementById("productDetailModal");
  if (!modalEl) return;

  // Set konten modal
  document.getElementById("modalProductTitle").textContent = product.name;
  document.getElementById("modalProductCategory").textContent = `${product.brand} • ${product.categoryName}`;
  document.getElementById("modalProductPrice").textContent = formatRupiah(product.basePrice);
  document.getElementById("modalProductDesc").textContent = product.desc;
  document.getElementById("modalProductRating").textContent = `${product.rating} (${product.reviewsCount} Ulasan)`;
  document.getElementById("modalProductStock").textContent = `Stok Tersedia: ${product.stock} Unit`;

  const modalImg = document.getElementById("modalProductImg");
  if (modalImg) modalImg.src = product.image;

  // Spesifikasi teknis
  const specsContainer = document.getElementById("modalProductSpecs");
  if (specsContainer && product.specs) {
    let specRows = "";
    for (const [key, val] of Object.entries(product.specs)) {
      specRows += `
        <tr>
          <td class="text-muted small py-1" style="width: 35%;">${key}</td>
          <td class="fw-semibold small py-1 text-dark">${val}</td>
        </tr>
      `;
    }
    specsContainer.innerHTML = specRows;
  }

  // Kalkulator sewa di modal
  const qtyInput = document.getElementById("modalQtyInput");
  const durSelect = document.getElementById("modalDurationSelect");
  const subtotalEl = document.getElementById("modalCalculatedSubtotal");

  if (qtyInput) qtyInput.value = 1;
  if (durSelect) {
    durSelect.value = cartService.bookingState.duration || 2;
  }

  function recalculateModalPrice() {
    const qty = parseInt(qtyInput.value) || 1;
    const dur = parseInt(durSelect.value) || 2;
    const total = product.basePrice * qty * dur;
    if (subtotalEl) subtotalEl.textContent = formatRupiah(total);
  }

  if (qtyInput) qtyInput.oninput = recalculateModalPrice;
  if (durSelect) durSelect.onchange = recalculateModalPrice;
  recalculateModalPrice();

  // Tombol Aksi Modal
  const addToCartBtn = document.getElementById("modalAddToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      const qty = parseInt(qtyInput.value) || 1;
      const dur = parseInt(durSelect.value) || 2;
      cartService.addToCart(product.id, qty, dur);

      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    };
  }

  const rentNowWaBtn = document.getElementById("modalRentNowWaBtn");
  if (rentNowWaBtn) {
    rentNowWaBtn.onclick = () => {
      const qty = parseInt(qtyInput.value) || 1;
      const dur = parseInt(durSelect.value) || 2;
      const total = product.basePrice * qty * dur;

      const message = `Halo Admin *Mulyo Adventure*! 👋
Saya ingin menyewa produk ini langsung:

📦 *Item*: ${product.name}
🔢 *Jumlah*: ${qty} unit
⏱️ *Durasi*: ${dur} hari
💰 *Estimasi Total*: ${formatRupiah(total)}

Mohon konfirmasi kesiapan barangnya ya admin. Terima kasih! 🏕️`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${DEFAULT_PHONE_WA}?text=${encoded}`, "_blank");
    };
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// 6. Sticky Navbar Scroller
function initStickyNavbar() {
  const navbar = document.querySelector(".navbar-sticky");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled", "shadow-sm");
    } else {
      navbar.classList.remove("scrolled", "shadow-sm");
    }
  });
}

// 7. Search Form Handler
function initSearchHandler() {
  const searchInputs = document.querySelectorAll(".hero-search-input, .navbar-search-input");
  searchInputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = encodeURIComponent(input.value.trim());
        if (query) {
          window.location.href = `katalog.html?q=${query}`;
        }
      }
    });
  });

  const searchButtons = document.querySelectorAll(".hero-search-btn");
  searchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".search-box-wrapper") || document;
      const input = parent.querySelector(".hero-search-input");
      if (input) {
        const query = encodeURIComponent(input.value.trim());
        window.location.href = `katalog.html?q=${query}`;
      }
    });
  });
}

// 8. Inisialisasi Modal Tambahan (Checkout WhatsApp & Quick Contact)
function initQuickModals() {
  const checkoutForm = document.getElementById("whatsappCheckoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const customer = {
        name: document.getElementById("coName")?.value || "",
        phone: document.getElementById("coPhone")?.value || "",
        startDate: document.getElementById("coStartDate")?.value || "",
        endDate: document.getElementById("coEndDate")?.value || "",
        notes: document.getElementById("coNotes")?.value || ""
      };

      cartService.generateWhatsAppOrder(customer);

      const modalEl = document.getElementById("checkoutModal");
      if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
    });
  }
}
