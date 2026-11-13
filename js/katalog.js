// Katalog Page Logic - Foresta Adventure / Mulyo Adventure

document.addEventListener("DOMContentLoaded", () => {
  initKatalogPage();
});

function initKatalogPage() {
  const gridContainer = document.getElementById("katalogProductsGrid");
  const countDisplay = document.getElementById("katalogResultsCount");
  const searchInput = document.getElementById("katalogSearchInput");
  const sidebarSearchInput = document.getElementById("sidebarSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const sortSelect = document.getElementById("katalogSortSelect");
  const maxPriceInput = document.getElementById("katalogMaxPrice");
  const maxPriceLabel = document.getElementById("katalogMaxPriceLabel");
  const resetBtn = document.getElementById("katalogResetFilterBtn");
  const topResetBtn = document.getElementById("katalogTopResetBtn");
  const quickResetAllBtn = document.getElementById("quickResetAllBtn");
  const categoryChips = document.querySelectorAll(".katalog-chips-wrapper .category-tab-btn");
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
  const brandCheckboxes = document.querySelectorAll(".brand-checkbox");
  const activeFilterPills = document.getElementById("activeFilterPills");
  const activeCatBadge = document.getElementById("activeCatBadge");
  const activeCatText = document.getElementById("activeCatText");
  const removeCatFilter = document.getElementById("removeCatFilter");
  const activeSearchBadge = document.getElementById("activeSearchBadge");
  const activeSearchText = document.getElementById("activeSearchText");
  const removeSearchFilter = document.getElementById("removeSearchFilter");

  if (!gridContainer) return;

  // Active Category State (defaults to 'all')
  let activeCategory = "all";

  // Category mapping name helper
  const categoryNameMap = {
    all: "Semua Gear",
    tenda: "Tenda Camping",
    carrier: "Carrier & Tas",
    tidur: "Sleeping Bag & Matras",
    masak: "Alat Masak Camping",
    penerangan: "Senter & Lentera",
    pakaian: "Jaket & Sepatu",
    gear: "Trekking Pole & Kursi"
  };

  // Check URL query parameters (?cat=... or ?q=... or ?openCart=true)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("cat");
  const initialSearch = urlParams.get("q");

  if (initialSearch) {
    if (searchInput) searchInput.value = initialSearch;
    if (sidebarSearchInput) sidebarSearchInput.value = initialSearch;
  }

  if (initialCategory && categoryNameMap[initialCategory]) {
    activeCategory = initialCategory;
  }

  // Synchronize category chips and checkboxes UI
  function syncCategoryUi() {
    categoryChips.forEach((chip) => {
      const cat = chip.getAttribute("data-category");
      if (cat === activeCategory) {
        chip.classList.add("active");
        chip.classList.remove("btn-outline-secondary");
      } else {
        chip.classList.remove("active");
        chip.classList.add("btn-outline-secondary");
      }
    });

    categoryCheckboxes.forEach((cb) => {
      cb.checked = activeCategory === "all" ? false : cb.value === activeCategory;
    });

    // Active Category Badge
    if (activeCatBadge && activeCatText) {
      if (activeCategory !== "all") {
        activeCatText.textContent = categoryNameMap[activeCategory] || activeCategory;
        activeCatBadge.classList.remove("d-none");
      } else {
        activeCatBadge.classList.add("d-none");
      }
    }
  }

  function syncSearchUi(val) {
    if (clearSearchBtn) {
      if (val) clearSearchBtn.classList.remove("d-none");
      else clearSearchBtn.classList.add("d-none");
    }
    if (activeSearchBadge && activeSearchText) {
      if (val) {
        activeSearchText.textContent = `"${val}"`;
        activeSearchBadge.classList.remove("d-none");
      } else {
        activeSearchBadge.classList.add("d-none");
      }
    }
    if (searchInput && searchInput.value !== val) searchInput.value = val;
    if (sidebarSearchInput && sidebarSearchInput.value !== val) sidebarSearchInput.value = val;
  }

  function filterAndRender() {
    let results = [...PRODUCTS_DATA];

    // Filter Search
    const query = (searchInput ? searchInput.value : (sidebarSearchInput ? sidebarSearchInput.value : "")).toLowerCase().trim();
    syncSearchUi(query);

    if (query) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    // Filter Kategori (Chips)
    if (activeCategory && activeCategory !== "all") {
      results = results.filter((p) => p.category === activeCategory);
    }

    // Filter Brand
    const selectedBrands = Array.from(brandCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value.toLowerCase());

    if (selectedBrands.length > 0) {
      results = results.filter((p) =>
        selectedBrands.some((b) => p.brand.toLowerCase().includes(b))
      );
    }

    // Filter Harga
    if (maxPriceInput) {
      const maxVal = parseInt(maxPriceInput.value) || 250000;
      if (maxPriceLabel) maxPriceLabel.textContent = formatRupiah(maxVal);
      results = results.filter((p) => p.basePrice <= maxVal);
    }

    // Sorting
    if (sortSelect) {
      const sortVal = sortSelect.value;
      if (sortVal === "price-asc") {
        results.sort((a, b) => a.basePrice - b.basePrice);
      } else if (sortVal === "price-desc") {
        results.sort((a, b) => b.basePrice - a.basePrice);
      } else if (sortVal === "rating") {
        results.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === "name-asc") {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    // Update Counter
    if (countDisplay) {
      countDisplay.textContent = `Menampilkan ${results.length} dari ${PRODUCTS_DATA.length} perlengkapan`;
    }

    // Update Active Filter Bar Visibility
    if (activeFilterPills) {
      const hasActive = (activeCategory !== "all") || (query.length > 0) || (selectedBrands.length > 0) || (maxPriceInput && parseInt(maxPriceInput.value) < 250000);
      if (hasActive) {
        activeFilterPills.classList.remove("d-none");
      } else {
        activeFilterPills.classList.add("d-none");
      }
    }

    // Render HTML with smooth fade transition
    if (results.length === 0) {
      gridContainer.innerHTML = `
        <div class="col-12 text-center py-5 product-fade-in">
          <div class="d-inline-flex p-4 rounded-circle bg-light text-muted mb-3 shadow-xs">
            <i class="bi bi-search" style="font-size: 2.5rem;"></i>
          </div>
          <h5 class="fw-bold text-dark mb-1">Tidak Ada Perlengkapan yang Sesuai</h5>
          <p class="text-muted small mb-3">Coba ubah kata kunci pencarian atau sesuaikan kategori yang dipilih.</p>
          <button class="btn btn-brand-primary btn-sm rounded-pill px-4 fw-semibold" onclick="window.resetAllFilters()">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Tampilkan Semua Perlengkapan
          </button>
        </div>
      `;
    } else {
      gridContainer.innerHTML = results
        .map((p) => createProductCardHtml(p, "col-xl-4 col-md-6 col-sm-6 mb-4 product-fade-in"))
        .join("");
    }
  }

  // Category Chips Click Event
  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.getAttribute("data-category") || "all";
      syncCategoryUi();
      filterAndRender();

      // Update URL without page reload
      const newUrl = new URL(window.location);
      if (activeCategory === "all") {
        newUrl.searchParams.delete("cat");
      } else {
        newUrl.searchParams.set("cat", activeCategory);
      }
      window.history.replaceState({}, "", newUrl);
    });
  });

  // Sidebar Category Checkbox Event
  categoryCheckboxes.forEach((cb) => {
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        activeCategory = e.target.value;
      } else {
        const checkedOne = Array.from(categoryCheckboxes).find((c) => c.checked);
        activeCategory = checkedOne ? checkedOne.value : "all";
      }
      syncCategoryUi();
      filterAndRender();

      const newUrl = new URL(window.location);
      if (activeCategory === "all") {
        newUrl.searchParams.delete("cat");
      } else {
        newUrl.searchParams.set("cat", activeCategory);
      }
      window.history.replaceState({}, "", newUrl);
    });
  });

  // Search input events
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      if (sidebarSearchInput) sidebarSearchInput.value = e.target.value;
      filterAndRender();
    });
  }
  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener("input", (e) => {
      if (searchInput) searchInput.value = e.target.value;
      filterAndRender();
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (sidebarSearchInput) sidebarSearchInput.value = "";
      filterAndRender();
    });
  }
  if (removeSearchFilter) {
    removeSearchFilter.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (sidebarSearchInput) sidebarSearchInput.value = "";
      filterAndRender();
    });
  }
  if (removeCatFilter) {
    removeCatFilter.addEventListener("click", () => {
      activeCategory = "all";
      syncCategoryUi();
      filterAndRender();
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("cat");
      window.history.replaceState({}, "", newUrl);
    });
  }

  // Sort & Price & Brand events
  if (sortSelect) sortSelect.addEventListener("change", filterAndRender);
  if (maxPriceInput) maxPriceInput.addEventListener("input", filterAndRender);
  brandCheckboxes.forEach((cb) => cb.addEventListener("change", filterAndRender));

  // Global reset logic
  window.resetAllFilters = () => {
    activeCategory = "all";
    if (searchInput) searchInput.value = "";
    if (sidebarSearchInput) sidebarSearchInput.value = "";
    if (sortSelect) sortSelect.value = "rating";
    if (maxPriceInput) {
      maxPriceInput.value = 250000;
      if (maxPriceLabel) maxPriceLabel.textContent = formatRupiah(250000);
    }
    categoryCheckboxes.forEach((cb) => (cb.checked = false));
    brandCheckboxes.forEach((cb) => (cb.checked = false));
    syncCategoryUi();
    filterAndRender();
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete("cat");
    newUrl.searchParams.delete("q");
    window.history.replaceState({}, "", newUrl);
  };

  if (resetBtn) resetBtn.addEventListener("click", window.resetAllFilters);
  if (topResetBtn) topResetBtn.addEventListener("click", window.resetAllFilters);
  if (quickResetAllBtn) quickResetAllBtn.addEventListener("click", window.resetAllFilters);

  // Initial Sync & First Render
  syncCategoryUi();
  filterAndRender();
}
