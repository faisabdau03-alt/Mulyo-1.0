// Katalog Page Logic for Mulyo Adventure

document.addEventListener("DOMContentLoaded", () => {
  initKatalogPage();
});

function initKatalogPage() {
  const gridContainer = document.getElementById("katalogProductsGrid");
  const countDisplay = document.getElementById("katalogResultsCount");
  const searchInput = document.getElementById("katalogSearchInput");
  const sortSelect = document.getElementById("katalogSortSelect");
  const maxPriceInput = document.getElementById("katalogMaxPrice");
  const maxPriceLabel = document.getElementById("katalogMaxPriceLabel");
  const resetBtn = document.getElementById("katalogResetFilterBtn");
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
  const brandCheckboxes = document.querySelectorAll(".brand-checkbox");

  if (!gridContainer) return;

  // Baca query parameter dari URL (misal: ?cat=tenda atau ?q=carrier)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("cat");
  const initialSearch = urlParams.get("q");

  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  if (initialCategory) {
    categoryCheckboxes.forEach((cb) => {
      cb.checked = cb.value === initialCategory;
    });
  }

  function filterAndRender() {
    let results = [...PRODUCTS_DATA];

    // Filter Search
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    if (query) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    // Filter Kategori
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    if (selectedCategories.length > 0) {
      results = results.filter((p) => selectedCategories.includes(p.category));
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
      const maxVal = parseInt(maxPriceInput.value) || 200000;
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
      countDisplay.textContent = `Menampilkan ${results.length} dari ${PRODUCTS_DATA.length} produk`;
    }

    // Render HTML
    if (results.length === 0) {
      gridContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
          <h5 class="fw-bold mt-3 text-dark">Tidak Ada Produk yang Sesuai</h5>
          <p class="text-muted small">Coba ubah kata kunci pencarian atau sesuaikan filter kategori Anda.</p>
          <button class="btn btn-outline-success btn-sm rounded-pill px-4 mt-2" onclick="resetAllFilters()">
            Reset Semua Filter
          </button>
        </div>
      `;
    } else {
      gridContainer.innerHTML = results
        .map((p) => createProductCardHtml(p))
        .join("");
    }
  }

  // Bind Events
  if (searchInput) searchInput.addEventListener("input", filterAndRender);
  if (sortSelect) sortSelect.addEventListener("change", filterAndRender);
  if (maxPriceInput) maxPriceInput.addEventListener("input", filterAndRender);

  categoryCheckboxes.forEach((cb) => cb.addEventListener("change", filterAndRender));
  brandCheckboxes.forEach((cb) => cb.addEventListener("change", filterAndRender));

  window.resetAllFilters = () => {
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "rating";
    if (maxPriceInput) maxPriceInput.value = 250000;
    categoryCheckboxes.forEach((cb) => (cb.checked = false));
    brandCheckboxes.forEach((cb) => (cb.checked = false));
    filterAndRender();
  };

  if (resetBtn) {
    resetBtn.addEventListener("click", window.resetAllFilters);
  }

  // First render
  filterAndRender();
}
