/**
 * Foresta Adventure - Bundles Data Service
 * Mengelola data Paket Bundling secara dinamis (LocalStorage dengan fallback default)
 */

const BUNDLES_STORAGE_KEY = "foresta_adventure_bundles";

// Data Awal Paket Bundling Default (Berdasarkan spesifikasi)
const DEFAULT_BUNDLES = [
  {
    id: "bundle-camping-basic",
    name: "Paket Camping Basic",
    badge: "Rekomendasi Pemula",
    badgeColor: "success",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
    desc: "Paket lengkap dan praktis untuk bermalam santai di alam terbuka. Sudah termasuk tenda kapasitas 4 orang, sleeping bag hangat, dan matras lipat insulasi.",
    price: 69000, // Harga bundling per hari
    isActive: true,
    items: [
      { productId: "tenda-01", qty: 1 }, // Tenda Borneo 4 Pro (Rp 55.000)
      { productId: "sleep-02", qty: 1 }, // Sleeping Bag Polar (Rp 15.000)
      { productId: "sleep-03", qty: 1 }  // Matras Lipat IXPE (Rp 15.000)
    ]
  },
  {
    id: "bundle-hiking",
    name: "Paket Hiking",
    badge: "Favorit Solo & Duo Hiker",
    badgeColor: "primary",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
    desc: "Paket khusus penjelajah dan pendaki jalur gunung. Dilengkapi carrier kapasitas 50-60L, trekking pole sepasang, headlamp LED terang, serta sleeping bag polar.",
    price: 99000, // Harga bundling per hari
    isActive: true,
    items: [
      { productId: "carrier-01", qty: 1 }, // Carrier Deuter 50+10L (Rp 85.000)
      { productId: "gear-01", qty: 1 },    // Trekking Pole Sepasang (Rp 15.000)
      { productId: "light-01", qty: 1 },   // Headlamp LED 800 Lumens (Rp 15.000)
      { productId: "sleep-02", qty: 1 }    // Sleeping Bag Polar (Rp 15.000)
    ]
  },
  {
    id: "bundle-camping-complete",
    name: "Paket Camping Complete",
    badge: "Paling Hemat & Lengkap",
    badgeColor: "warning",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80",
    desc: "Solusi all-in-one tanpa ribet untuk pendakian puncak dan camping ground. Seluruh kebutuhan shelter, masak, tidur, dan navigasi sudah siap pakai dalam kondisi prima.",
    price: 159000, // Harga bundling per hari
    isActive: true,
    items: [
      { productId: "tenda-01", qty: 1 }, // Tenda Borneo 4 Pro (Rp 55.000)
      { productId: "carrier-01", qty: 1 }, // Carrier Deuter (Rp 85.000)
      { productId: "sleep-02", qty: 1 }, // Sleeping Bag Polar (Rp 15.000)
      { productId: "cook-01", qty: 1 },  // Cooking Set Nesting (Rp 20.000)
      { productId: "light-01", qty: 1 }, // Headlamp LED (Rp 15.000)
      { productId: "gear-01", qty: 1 }   // Trekking Pole (Rp 15.000)
    ]
  },
  {
    id: "bundle-rombongan",
    name: "Paket Rombongan (Group Camping)",
    badge: "Pilihan Terbaik Rombongan (6-8 Orang)",
    badgeColor: "danger",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=80",
    desc: "Paket skala besar untuk rombongan teman kantor, keluarga, atau komunitas pecinta alam. Kapasitas multi-tenda dengan logistik masak ganda dan flysheet pelindung.",
    price: 385000, // Harga bundling per hari
    isActive: true,
    items: [
      { productId: "tenda-01", qty: 2 }, // 2x Tenda Borneo 4P (2 x 55.000 = 110.000)
      { productId: "carrier-01", qty: 2 }, // 2x Carrier 60L (2 x 85.000 = 170.000)
      { productId: "sleep-02", qty: 4 }, // 4x Sleeping Bag (4 x 15.000 = 60.000)
      { productId: "sleep-03", qty: 4 }, // 4x Matras Foil (4 x 15.000 = 60.000)
      { productId: "cook-01", qty: 2 },  // 2x Cooking Set Nesting (2 x 20.000 = 40.000)
      { productId: "cook-02", qty: 2 },  // 2x Kompor Portable (2 x 10.000 = 20.000)
      { productId: "light-02", qty: 2 }, // 2x Lentera Retro (2 x 12.000 = 24.000)
      { productId: "fly-01", qty: 1 }    // 1x Flysheet 3x4m (1 x 15.000 = 15.000)
    ]
  }
];

class BundlesService {
  constructor() {
    this.bundles = this.loadBundles();
  }

  loadBundles() {
    try {
      const data = localStorage.getItem(BUNDLES_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Gagal memuat data bundling dari storage:", e);
    }
    // Fallback seed
    this.saveBundlesToStorage(DEFAULT_BUNDLES);
    return JSON.parse(JSON.stringify(DEFAULT_BUNDLES));
  }

  saveBundlesToStorage(bundlesArray) {
    try {
      localStorage.setItem(BUNDLES_STORAGE_KEY, JSON.stringify(bundlesArray));
    } catch (e) {
      console.error("Gagal menyimpan data bundling:", e);
    }
  }

  getBundles(includeInactive = false) {
    if (includeInactive) {
      return this.bundles;
    }
    return this.bundles.filter((b) => b.isActive !== false);
  }

  getBundleById(id) {
    return this.bundles.find((b) => b.id === id) || null;
  }

  /**
   * Menghitung metrik paket berdasarkan data produk aktual di PRODUCTS_DATA
   */
  calculateMetrics(bundle) {
    const productsSource = typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : [];
    let normalPrice = 0;
    let minStockAvailable = 999;
    let hasOutOfStock = false;
    const itemsDetail = [];

    (bundle.items || []).forEach((item) => {
      const prod = productsSource.find((p) => p.id === item.productId);
      const qtyRequired = item.qty || 1;

      if (prod) {
        const itemSubtotal = prod.basePrice * qtyRequired;
        normalPrice += itemSubtotal;

        // Cek berapa paket yang bisa dibuat dari stok produk ini
        const packagesPossible = Math.floor(prod.stock / qtyRequired);
        if (packagesPossible < minStockAvailable) {
          minStockAvailable = packagesPossible;
        }
        if (prod.stock < qtyRequired) {
          hasOutOfStock = true;
        }

        itemsDetail.push({
          productId: prod.id,
          name: prod.name,
          categoryName: prod.categoryName || prod.category,
          brand: prod.brand || "Foresta",
          unitPrice: prod.basePrice,
          qty: qtyRequired,
          subtotal: itemSubtotal,
          image: prod.image,
          currentStock: prod.stock,
          isStockEnough: prod.stock >= qtyRequired
        });
      } else {
        // Fallback jika ID produk tidak ditemukan
        itemsDetail.push({
          productId: item.productId,
          name: `Item (${item.productId})`,
          categoryName: "Perlengkapan",
          brand: "Foresta",
          unitPrice: 0,
          qty: qtyRequired,
          subtotal: 0,
          image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80",
          currentStock: 0,
          isStockEnough: false
        });
        hasOutOfStock = true;
        minStockAvailable = 0;
      }
    });

    const bundlePrice = bundle.price || 0;
    const savingsAmount = Math.max(0, normalPrice - bundlePrice);
    const savingsPercent = normalPrice > 0 ? Math.round((savingsAmount / normalPrice) * 100) : 0;
    const isAvailable = !hasOutOfStock && minStockAvailable > 0;

    return {
      normalPrice,
      bundlePrice,
      savingsAmount,
      savingsPercent,
      isAvailable,
      maxBundlesAvailable: Math.max(0, minStockAvailable === 999 ? 0 : minStockAvailable),
      itemCount: (bundle.items || []).length,
      totalPieces: (bundle.items || []).reduce((acc, curr) => acc + (curr.qty || 1), 0),
      itemsDetail
    };
  }

  saveBundle(bundleData) {
    const isEdit = this.bundles.some((b) => b.id === bundleData.id);
    if (isEdit) {
      this.bundles = this.bundles.map((b) => (b.id === bundleData.id ? { ...b, ...bundleData } : b));
    } else {
      const newId = bundleData.id || "bundle-" + Date.now();
      this.bundles.push({ ...bundleData, id: newId });
    }
    this.saveBundlesToStorage(this.bundles);
    window.dispatchEvent(new CustomEvent("foresta_bundles_updated"));
    return true;
  }

  deleteBundle(id) {
    this.bundles = this.bundles.filter((b) => b.id !== id);
    this.saveBundlesToStorage(this.bundles);
    window.dispatchEvent(new CustomEvent("foresta_bundles_updated"));
    return true;
  }

  toggleActive(id) {
    const target = this.bundles.find((b) => b.id === id);
    if (target) {
      target.isActive = !target.isActive;
      this.saveBundlesToStorage(this.bundles);
      window.dispatchEvent(new CustomEvent("foresta_bundles_updated"));
      return target.isActive;
    }
    return false;
  }

  resetToDefault() {
    this.bundles = JSON.parse(JSON.stringify(DEFAULT_BUNDLES));
    this.saveBundlesToStorage(this.bundles);
    window.dispatchEvent(new CustomEvent("foresta_bundles_updated"));
    return this.bundles;
  }
}

// Global instance
const bundlesService = new BundlesService();

