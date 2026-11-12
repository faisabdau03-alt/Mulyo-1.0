// Cart System for Foresta Adventure
const CART_STORAGE_KEY = "foresta_adventure_cart";
const DEFAULT_PHONE_WA = "6281234567890"; // Nomor WhatsApp Admin Foresta Adventure

class CartService {
  constructor() {
    this.cart = this.loadCart();
    this.bookingState = this.loadBookingState();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Gagal memuat keranjang:", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      this.updateUI();
    } catch (e) {
      console.error("Gagal menyimpan keranjang:", e);
    }
  }

  loadBookingState() {
    try {
      const state = localStorage.getItem("foresta_booking_dates");
      if (state) return JSON.parse(state);
    } catch (e) {}

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const after3Days = new Date(tomorrow);
    after3Days.setDate(after3Days.getDate() + 2); // 3 hari durasi

    return {
      startDate: tomorrow.toISOString().split("T")[0],
      duration: 3,
      endDate: after3Days.toISOString().split("T")[0]
    };
  }

  saveBookingState(state) {
    this.bookingState = state;
    localStorage.setItem("foresta_booking_dates", JSON.stringify(state));
    this.updateUI();
  }

  addToCart(productId, qty = 1, customDuration = null) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) {
      this.showToast("Produk tidak ditemukan!", "error");
      return false;
    }

    const duration = customDuration || this.bookingState.duration || 2;
    const existingIndex = this.cart.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += qty;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        category: product.categoryName,
        price: product.basePrice,
        image: product.image,
        qty: qty,
        duration: duration
      });
    }

    this.saveCart();
    this.showToast(`Berhasil menambahkan "${product.name}" ke keranjang sewa!`, "success");
    return true;
  }

  removeFromCart(productId) {
    const item = this.cart.find((i) => i.id === productId);
    this.cart = this.cart.filter((i) => i.id !== productId);
    this.saveCart();
    if (item) {
      this.showToast(`"${item.name}" dihapus dari keranjang.`, "info");
    }
  }

  updateQty(productId, qty) {
    const index = this.cart.findIndex((i) => i.id === productId);
    if (index > -1) {
      if (qty <= 0) {
        this.removeFromCart(productId);
      } else {
        this.cart[index].qty = qty;
        this.saveCart();
      }
    }
  }

  updateDuration(productId, duration) {
    const index = this.cart.findIndex((i) => i.id === productId);
    if (index > -1) {
      this.cart[index].duration = Math.max(1, parseInt(duration) || 1);
      this.saveCart();
    }
  }

  applyDurationToAll(duration) {
    const dur = Math.max(1, parseInt(duration) || 1);
    this.cart.forEach((item) => {
      item.duration = dur;
    });
    this.bookingState.duration = dur;
    this.saveBookingState(this.bookingState);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.showToast("Keranjang sewa berhasil dikosongkan.", "info");
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  }

  getMemberDiscount() {
    if (typeof getForestaMember === "function") {
      const member = getForestaMember();
      if (member && member.email) {
        return 0.10; // Diskon 10% untuk member aktif
      }
    }
    return 0;
  }

  getCartRawTotal() {
    return this.cart.reduce((total, item) => {
      const dur = item.duration || this.bookingState.duration || 2;
      return total + item.price * item.qty * dur;
    }, 0);
  }

  getCartTotal() {
    const raw = this.getCartRawTotal();
    const discountRate = this.getMemberDiscount();
    const discountAmount = Math.round(raw * discountRate);
    return Math.max(0, raw - discountAmount);
  }

  updateUI() {
    // Update badge count
    const badgeElements = document.querySelectorAll(".cart-count-badge");
    const count = this.getCartCount();
    badgeElements.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });

    // Update Cart Drawer / Modal if open
    this.renderDrawer();
  }

  renderDrawer() {
    const container = document.getElementById("cartDrawerItems");
    const totalEl = document.getElementById("cartDrawerTotal");
    const countEl = document.getElementById("cartDrawerCount");
    const emptyNotice = document.getElementById("cartEmptyNotice");
    const footerEl = document.getElementById("cartDrawerFooter");

    if (!container) return;

    if (countEl) countEl.textContent = `${this.getCartCount()} Item`;
    const rawTotal = this.getCartRawTotal();
    const discountRate = this.getMemberDiscount();
    const discountAmount = Math.round(rawTotal * discountRate);
    const finalTotal = rawTotal - discountAmount;

    if (totalEl) {
      if (discountRate > 0) {
        totalEl.innerHTML = `
          <div class="text-end">
            <span class="text-decoration-line-through text-muted small fw-normal d-block" style="font-size: 0.8rem;">${formatRupiah(rawTotal)}</span>
            <span class="text-success fw-bold">${formatRupiah(finalTotal)}</span>
            <span class="badge bg-success-subtle text-success small py-0 px-2 ms-1">Member 10% OFF</span>
          </div>
        `;
      } else {
        totalEl.textContent = formatRupiah(finalTotal);
      }
    }

    if (this.cart.length === 0) {
      container.innerHTML = "";
      if (emptyNotice) emptyNotice.style.display = "block";
      if (footerEl) footerEl.style.display = "none";
      return;
    }

    if (emptyNotice) emptyNotice.style.display = "none";
    if (footerEl) footerEl.style.display = "block";

    const isMember = (typeof isForestaMemberLoggedIn === "function") ? isForestaMemberLoggedIn() : false;
    const checkoutBtn = document.getElementById("btnProceedToCheckout");
    const memberGateNotice = document.getElementById("cartMemberGateNotice");

    if (checkoutBtn) {
      if (isMember) {
        checkoutBtn.innerHTML = `<i class="bi bi-whatsapp"></i> Lanjut Booking via WhatsApp`;
        checkoutBtn.className = "btn btn-brand-primary py-2 d-flex align-items-center justify-content-center gap-2";
      } else {
        checkoutBtn.innerHTML = `<i class="bi bi-person-lock"></i> Daftar / Masuk untuk Booking`;
        checkoutBtn.className = "btn btn-warning text-dark fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm";
      }
    }

    if (memberGateNotice) {
      memberGateNotice.style.display = isMember ? "none" : "flex";
    }

    container.innerHTML = this.cart
      .map((item) => {
        const itemDuration = item.duration || this.bookingState.duration || 2;
        const subtotal = item.price * item.qty * itemDuration;

        return `
        <div class="cart-item border-bottom py-3">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="rounded-3" style="width: 70px; height: 70px; object-fit: cover; flex-shrink: 0;" />
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-1 text-truncate fw-bold fs-6">${item.name}</h6>
                <button type="button" class="btn-close btn-sm ms-2 text-danger" title="Hapus" onclick="cartService.removeFromCart('${item.id}')"></button>
              </div>
              <p class="text-muted small mb-2">${item.category} • <span class="text-success fw-semibold">${formatRupiah(item.price)}/hari</span></p>
              
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <!-- Qty Control -->
                <div class="input-group input-group-sm" style="width: 105px;">
                  <button class="btn btn-outline-secondary" type="button" onclick="cartService.updateQty('${item.id}', ${item.qty - 1})">-</button>
                  <input type="number" class="form-control text-center p-1 bg-light fw-bold" value="${item.qty}" min="1" onchange="cartService.updateQty('${item.id}', parseInt(this.value) || 1)" />
                  <button class="btn btn-outline-secondary" type="button" onclick="cartService.updateQty('${item.id}', ${item.qty + 1})">+</button>
                </div>

                <!-- Durasi sewa -->
                <div class="d-flex align-items-center gap-1">
                  <span class="small text-muted">Durasi:</span>
                  <select class="form-select form-select-sm py-1 pe-4" style="width: auto; font-size: 0.8rem;" onchange="cartService.updateDuration('${item.id}', this.value)">
                    ${[1, 2, 3, 4, 5, 6, 7, 10, 14]
                      .map((d) => `<option value="${d}" ${d === itemDuration ? "selected" : ""}>${d} Hari</option>`)
                      .join("")}
                  </select>
                </div>
              </div>

              <div class="text-end mt-2">
                <span class="small text-muted">Subtotal:</span>
                <span class="fw-bold text-dark ms-1">${formatRupiah(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.showToast("Keranjang sewa Anda masih kosong!", "error");
      return;
    }

    const isMember = (typeof isForestaMemberLoggedIn === "function") ? isForestaMemberLoggedIn() : false;
    if (!isMember) {
      // Tutup offcanvas cart jika terbuka
      const offcanvasEl = document.getElementById("cartOffcanvas");
      if (offcanvasEl && window.bootstrap) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        bsOffcanvas.hide();
      }
      if (typeof openMemberRequiredModal === "function") {
        openMemberRequiredModal();
      } else {
        window.location.href = "register.html?redirect=cart";
      }
      return;
    }

    // Jika sudah menjadi member: buka modal konfirmasi checkout WhatsApp
    const offcanvasEl = document.getElementById("cartOffcanvas");
    if (offcanvasEl && window.bootstrap) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.hide();
    }
    const checkoutModalEl = document.getElementById("checkoutModal");
    if (checkoutModalEl && window.bootstrap) {
      const bsModal = new bootstrap.Modal(checkoutModalEl);
      bsModal.show();
    }
  }

  showToast(message, type = "success") {
    let toastContainer = document.getElementById("forestaToastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "forestaToastContainer";
      toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
      toastContainer.style.zIndex = "99999";
      document.body.appendChild(toastContainer);
    }

    const toastId = "toast_" + Date.now();
    const bgClass = type === "error" ? "bg-danger text-white" : type === "info" ? "bg-dark text-white" : "bg-success text-white";

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <span><i class="bi ${type === "error" ? "bi-exclamation-triangle-fill" : type === "info" ? "bi-info-circle-fill" : "bi-check-circle-fill"}"></i></span>
            <span>${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHtml);
    const toastEl = document.getElementById(toastId);
    if (window.bootstrap && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
      bsToast.show();
      toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), 3500);
    }
  }

  generateWhatsAppOrder(customer) {
    if (this.cart.length === 0) {
      this.showToast("Keranjang sewa Anda masih kosong!", "error");
      return;
    }

    const nama = customer.name || "Pelanggan Foresta Adventure";
    const wa = customer.phone || "-";
    const tglAmbil = customer.startDate || this.bookingState.startDate || "Menyesuaikan";
    const tglKembali = customer.endDate || this.bookingState.endDate || "Menyesuaikan";
    const catatan = customer.notes || "Tidak ada catatan";

    let itemLines = "";
    let grandTotal = 0;

    this.cart.forEach((item, index) => {
      const dur = item.duration || this.bookingState.duration || 2;
      const subtotal = item.price * item.qty * dur;
      grandTotal += subtotal;

      itemLines += `${index + 1}. *${item.name}*\n   • Jumlah: ${item.qty} pcs\n   • Durasi: ${dur} hari (@ ${formatRupiah(item.price)}/hari)\n   • Subtotal: ${formatRupiah(subtotal)}\n\n`;
    });

    const rawTotal = grandTotal;
    const discountRate = this.getMemberDiscount();
    const discountAmount = Math.round(rawTotal * discountRate);
    const finalTotal = rawTotal - discountAmount;

    const member = (typeof getForestaMember === "function") ? getForestaMember() : null;
    let memberStatusLine = "";
    if (member && member.email) {
      memberStatusLine = `• *Status Member*: 🌟 Member Prioritas (${member.email} | ID: ${member.memberId || 'FA-MEMBER'}) - Diskon 10% Diterapkan\n`;
    }

    let totalPricingText = `💵 *TOTAL ESTIMASI SEWA*: *${formatRupiah(finalTotal)}*`;
    if (discountRate > 0) {
      totalPricingText = `💵 *SUBTOTAL SEWA*: ${formatRupiah(rawTotal)}
🏷️ *POTONGAN DISKON MEMBER (10%)*: -${formatRupiah(discountAmount)}
💵 *TOTAL AKHIR*: *${formatRupiah(finalTotal)}* (Hemat ${formatRupiah(discountAmount)})`;
    }

    const message = `Halo Admin *Foresta Adventure*! 👋
Saya ingin melakukan booking sewa perlengkapan outdoor melalui website:

🏕️ *DATA PENYEWA*:
• *Nama*: ${nama}
• *No. WhatsApp*: ${wa}
${memberStatusLine}• *Tgl Ambil*: ${tglAmbil}
• *Tgl Kembali (Maks)*: ${tglKembali}

📦 *DAFTAR ALAT YANG DISEWA*:
${itemLines}${totalPricingText}
📝 *Catatan / Tambahan*: ${catatan}

Mohon konfirmasi ketersediaan barang dan persyaratan jaminannya ya admin. Terima kasih! 🌲🏔️`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${DEFAULT_PHONE_WA}?text=${encoded}`;
    window.open(waUrl, "_blank");
  }
}

// Global instance
const cartService = new CartService();
document.addEventListener("DOMContentLoaded", () => {
  cartService.updateUI();
});
