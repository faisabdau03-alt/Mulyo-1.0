// Main App Logic for Foresta Adventure

document.addEventListener("DOMContentLoaded", () => {
  initDateAndDurationPicker();
  initCategoryFilters();
  initFeaturedProducts();
  initStickyNavbar();
  initSearchHandler();
  initQuickModals();
  initMemberState();
  initPasswordToggles();
  initMemberModalHandlers();
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
      // Wajib Jadi Member Sebelum Menyewa
      if (!isForestaMemberLoggedIn()) {
        const bsProductModal = bootstrap.Modal.getInstance(modalEl);
        if (bsProductModal) bsProductModal.hide();
        openMemberRequiredModal();
        return;
      }

      const qty = parseInt(qtyInput.value) || 1;
      const dur = parseInt(durSelect.value) || 2;
      const rawTotal = product.basePrice * qty * dur;
      const discount = Math.round(rawTotal * 0.10);
      const finalTotal = rawTotal - discount;
      const member = getForestaMember();

      const message = `Halo Admin *Foresta Adventure*! 👋
Saya ingin menyewa produk ini langsung sebagai Member:

👤 *Member*: ${member.name || member.email} (${member.email} | ID: ${member.memberId || 'FA-MEMBER'})
📦 *Item*: ${product.name}
🔢 *Jumlah*: ${qty} unit
⏱️ *Durasi*: ${dur} hari
💵 *Subtotal*: ${formatRupiah(rawTotal)}
🏷️ *Diskon Member (10%)*: -${formatRupiah(discount)}
💰 *Total Akhir*: *${formatRupiah(finalTotal)}*

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

      // Wajib Jadi Member Sebelum Menyewa
      if (!isForestaMemberLoggedIn()) {
        const modalEl = document.getElementById("checkoutModal");
        if (modalEl) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }
        openMemberRequiredModal();
        return;
      }

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




// ==========================================
// 8. Foresta Member State & Auth Service (Email & Sandi)
// ==========================================
const MEMBER_STORAGE_KEY = "foresta_member_data";
const REGISTERED_USERS_KEY = "foresta_registered_users";

function getForestaRegisteredUsers() {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Akun demo awal untuk pengujian instan
    const initialUsers = [
      {
        email: "pendaki@foresta.com",
        password: "password123",
        name: "Pendaki Foresta",
        memberId: "FA-77001",
        joinDate: "01 Nov 2026",
        discount: 10,
        status: "Member Prioritas"
      }
    ];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  } catch (e) {
    return [];
  }
}

function registerForestaMember(email, password, name = "") {
  email = (email || "").trim().toLowerCase();
  password = (password || "").trim();

  if (!email || !email.includes("@")) {
    return { success: false, message: "Silakan masukkan alamat email yang valid." };
  }
  if (!password || password.length < 4) {
    return { success: false, message: "Kata sandi minimal 4 karakter." };
  }

  const users = getForestaRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return {
      success: false,
      alreadyExists: true,
      message: "Email ini sudah terdaftar sebagai member. Silakan Masuk (Login) menggunakan kata sandi Anda."
    };
  }

  if (!name) {
    const rawPrefix = email.split("@")[0].replace(/[._-]/g, " ");
    name = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
  }

  const memberId = "FA-" + Math.floor(10000 + Math.random() * 90000);
  const options = { day: "numeric", month: "short", year: "numeric" };
  const todayFormatted = new Date().toLocaleDateString("id-ID", options);

  const newUser = {
    email: email,
    password: password,
    name: name,
    memberId: memberId,
    joinDate: todayFormatted,
    discount: 10,
    status: "Member Prioritas"
  };

  users.push(newUser);
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {}

  // Aktifkan sesi login member
  setForestaMember(newUser);

  return {
    success: true,
    user: newUser,
    message: "Pendaftaran berhasil! Anda kini resmi menjadi Member Foresta Adventure."
  };
}

function loginForestaMember(email, password) {
  email = (email || "").trim().toLowerCase();
  password = (password || "").trim();

  if (!email) {
    return { success: false, message: "Alamat email wajib diisi." };
  }
  if (!password) {
    return { success: false, message: "Kata sandi wajib diisi." };
  }

  const users = getForestaRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return {
      success: false,
      notRegistered: true,
      message: "Email belum terdaftar sebagai member. Silakan daftar akun baru terlebih dahulu."
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali."
    };
  }

  // Set active member session
  setForestaMember(user);

  return {
    success: true,
    user: user,
    message: "Berhasil masuk! Selamat datang kembali."
  };
}

function isForestaMemberLoggedIn() {
  const member = getForestaMember();
  return !!(member && member.email);
}

function getForestaMember() {
  try {
    const data = localStorage.getItem(MEMBER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function setForestaMember(memberData) {
  try {
    localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(memberData));
    updateAllMemberUI();
    if (window.cartService) {
      window.cartService.updateUI();
    }
  } catch (e) {}
}

function logoutForestaMember() {
  try {
    localStorage.removeItem(MEMBER_STORAGE_KEY);
    updateAllMemberUI();
    if (window.cartService) {
      window.cartService.updateUI();
    }
  } catch (e) {}
}

function openMemberRequiredModal() {
  const modalEl = document.getElementById("memberRequiredModal");
  if (modalEl && window.bootstrap) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  } else {
    window.location.href = "register.html?redirect=cart";
  }
}

function updateAllMemberUI() {
  const member = getForestaMember();
  const memberNavElements = document.querySelectorAll(".member-nav-slot");

  memberNavElements.forEach((container) => {
    if (member && member.email) {
      container.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-nav-member logged-in dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="height: 34px; font-size: 0.78rem;">
            <i class="bi bi-person-check-fill text-brand-green"></i>
            <span class="d-none d-xl-inline text-truncate" style="max-width: 130px;">${member.name || member.email}</span>
            <span class="badge bg-success-subtle text-success small py-0 px-1">10% OFF</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-dark-custom dropdown-menu-end shadow-lg">
            <li><h6 class="dropdown-header text-muted small py-1">Member Prioritas Foresta</h6></li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="login.html">
                <i class="bi bi-credit-card-2-front text-brand-green"></i>
                <div>
                  <strong class="d-block small text-white">Kartu Member Digital</strong>
                  <span class="small text-muted" style="font-size: 0.72rem;">ID: ${member.memberId || 'FA-MEMBER'}</span>
                </div>
              </a>
            </li>
            <li><a class="dropdown-item d-flex align-items-center gap-2" href="katalog.html"><i class="bi bi-tag text-warning"></i> Gunakan Diskon 10%</a></li>
            <li><hr class="dropdown-divider border-secondary" /></li>
            <li><a class="dropdown-item text-danger d-flex align-items-center gap-2" href="#" onclick="logoutForestaMember(); return false;"><i class="bi bi-box-arrow-right"></i> Keluar</a></li>
          </ul>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="d-flex align-items-center gap-1">
          <a href="register.html" class="btn btn-sm btn-brand-primary rounded-pill fw-bold" style="font-size: 0.78rem; height: 34px; padding: 0 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;">
            <i class="bi bi-person-plus"></i> Daftar
          </a>
          <a href="login.html" class="btn btn-nav-member" title="Masuk ke Akun Member">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Masuk</span>
          </a>
        </div>
      `;
    }
  });

  // Top Bar Member Slot
  const topBarMemberSlot = document.getElementById("topBarMemberSlot");
  if (topBarMemberSlot) {
    if (member && member.email) {
      topBarMemberSlot.innerHTML = `
        <span class="text-brand-green fw-semibold"><i class="bi bi-star-fill me-1"></i>Halo, ${member.name || member.email}! (Diskon Member 10% Aktif)</span>
      `;
    } else {
      topBarMemberSlot.innerHTML = `
        <span>Wajib Daftar Member Sebelum Menyewa · <b class="text-brand-green">Diskon 10% Otomatis</b></span>
      `;
    }
  }
}

function initPasswordToggles() {
  document.querySelectorAll(".toggle-password-btn").forEach((btn) => {
    if (btn.dataset.initialized) return;
    btn.dataset.initialized = "true";

    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("bi-eye");
          icon.classList.add("bi-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("bi-eye-slash");
          icon.classList.add("bi-eye");
        }
      }
    });
  });
}

function initMemberModalHandlers() {
  // Handler untuk form cepat daftar di modal
  const quickRegForm = document.getElementById("modalQuickRegisterForm");
  if (quickRegForm) {
    quickRegForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("modalRegEmail")?.value;
      const password = document.getElementById("modalRegPassword")?.value;
      const name = document.getElementById("modalRegName")?.value;

      const result = registerForestaMember(email, password, name);
      if (result.success) {
        if (window.cartService) {
          cartService.showToast(`Pendaftaran berhasil! Selamat datang ${result.user.name}. Diskon 10% aktif.`, "success");
        }
        // Tutup modal member
        const memberModalEl = document.getElementById("memberRequiredModal");
        if (memberModalEl && window.bootstrap) {
          const bsMemberModal = bootstrap.Modal.getInstance(memberModalEl);
          if (bsMemberModal) bsMemberModal.hide();
        }
        // Buka modal checkout jika ada barang di keranjang
        if (window.cartService && cartService.getCartCount() > 0) {
          const checkoutModalEl = document.getElementById("checkoutModal");
          if (checkoutModalEl && window.bootstrap) {
            const bsCheckoutModal = new bootstrap.Modal(checkoutModalEl);
            bsCheckoutModal.show();
          }
        }
      } else {
        alert(result.message);
      }
    });
  }

  // Handler untuk form cepat login di modal
  const quickLoginForm = document.getElementById("modalQuickLoginForm");
  if (quickLoginForm) {
    quickLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("modalLoginEmail")?.value;
      const password = document.getElementById("modalLoginPassword")?.value;

      const result = loginForestaMember(email, password);
      if (result.success) {
        if (window.cartService) {
          cartService.showToast(`Selamat datang kembali ${result.user.name}!`, "success");
        }
        // Tutup modal member
        const memberModalEl = document.getElementById("memberRequiredModal");
        if (memberModalEl && window.bootstrap) {
          const bsMemberModal = bootstrap.Modal.getInstance(memberModalEl);
          if (bsMemberModal) bsMemberModal.hide();
        }
        // Buka modal checkout jika ada barang di keranjang
        if (window.cartService && cartService.getCartCount() > 0) {
          const checkoutModalEl = document.getElementById("checkoutModal");
          if (checkoutModalEl && window.bootstrap) {
            const bsCheckoutModal = new bootstrap.Modal(checkoutModalEl);
            bsCheckoutModal.show();
          }
        }
      } else {
        alert(result.message);
      }
    });
  }
}

function initMemberState() {
  updateAllMemberUI();

  // Prefill nama member di checkout modal jika ada
  const checkoutModalEl = document.getElementById("checkoutModal");
  if (checkoutModalEl) {
    checkoutModalEl.addEventListener("show.bs.modal", () => {
      const member = getForestaMember();
      if (member && member.email) {
        const coName = document.getElementById("coName");
        if (coName && !coName.value) {
          coName.value = member.name || "";
        }
      }
    });
  }
}
