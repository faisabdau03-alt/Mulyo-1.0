// Database Produk Mulyo Adventure
const PRODUCTS_DATA = [
  {
    id: "tenda-01",
    name: "Tenda Borneo 4 Pro Black Edition (4-5 Orang)",
    category: "tenda",
    categoryName: "Tenda 4 Orang",
    brand: "Tendaki",
    basePrice: 55000,
    rating: 4.9,
    reviewsCount: 84,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tenda camping premium kapasitas 4-5 orang dengan bahan Ripstop PU 4000mm anti badai dan air. Dilengkapi vestibule (teras) luas untuk memasak dan menaruh ransel carrier.",
    specs: {
      "Kapasitas": "4-5 Orang",
      "Outer Layer": "210T Polyester Ripstop PU 4000mm",
      "Inner Tent": "190T Breathable Polyester + High Density B3 Mesh",
      "Alas / Floor": "Terpal PE 120g/m² Waterproof",
      "Frame": "Fiberglass 8.5mm x 3 set",
      "Dimensi": "Outer: 220x250x135 cm, Inner: 210x240x130 cm",
      "Berat": "4.3 kg"
    },
    stock: 8
  },
  {
    id: "tenda-02",
    name: "Tenda Quechua MH100 2-3 Orang Double Layer",
    category: "tenda",
    categoryName: "Tenda 2-3 Orang",
    brand: "Quechua",
    basePrice: 35000,
    rating: 4.8,
    reviewsCount: 62,
    badge: "Populer",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tenda dome ringkas dan tangguh khas Quechua. Struktur freestanding mudah didirikan dalam 5 menit, tahan angin hingga kecepatan 50 km/jam, dan ventilasi optimal.",
    specs: {
      "Kapasitas": "2 - 3 Orang",
      "Bahan": "Polyester PU 2000mm & Ventilasi Mesh",
      "Dimensi Kamar": "200 x 120 x 105 cm",
      "Berat": "2.6 kg",
      "Kelengkapan": "Pasak, Guyline, Tas Tenda"
    },
    stock: 12
  },
  {
    id: "tenda-03",
    name: "Tenda Dome Family Great Outdoor 6 Orang",
    category: "tenda",
    categoryName: "Tenda 6 Orang",
    brand: "Great Outdoor",
    basePrice: 85000,
    rating: 4.9,
    reviewsCount: 41,
    badge: "Family Size",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tenda kapasitas besar untuk rombongan keluarga atau tim ekspedisi. Langit-langit tinggi memungkinkan berdiri tegak di dalam tenda dengan sirkulasi udara maksimal.",
    specs: {
      "Kapasitas": "6 Orang dewasa",
      "Waterproof": "Flysheet 3000mm, Alas Oxford 5000mm",
      "Tinggi Tenda": "180 cm",
      "Fitur": "2 Pintu besar + Teras luas",
      "Berat": "6.8 kg"
    },
    stock: 5
  },
  {
    id: "carrier-01",
    name: "Carrier Deuter Aircontact Core 50+10L",
    category: "carrier",
    categoryName: "Carrier 50L - 100L",
    brand: "Deuter",
    basePrice: 85000,
    rating: 5.0,
    reviewsCount: 79,
    badge: "Top Comfort",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Carrier legendaris buatan Jerman dengan backsystem Aircontact yang empuk dan mendistribusikan beban secara ergonomis ke pinggul. Cocok untuk pendakian 3-5 hari.",
    specs: {
      "Kapasitas": "50 + 10 Liter",
      "Backsystem": "Aircontact System + VariSlide Back Length",
      "Fitur": "Raincover included, Kompartemen sleeping bag terpisah, Trekking pole loop",
      "Bahan": "500D Textured PA / 235D Recycled Polyamide",
      "Berat": "2.1 kg"
    },
    stock: 6
  },
  {
    id: "carrier-02",
    name: "Carrier Osprey Atmos AG 65L - Ergonomic Fit",
    category: "carrier",
    categoryName: "Carrier 50L - 100L",
    brand: "Osprey",
    basePrice: 95000,
    rating: 4.9,
    reviewsCount: 93,
    badge: "Sultan Gear",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tas carrier premium dengan Anti-Gravity suspension system jaring 3D yang membuat ransel terasa mengambang di punggung dan sirkulasi angin sejuk tanpa berkeringat.",
    specs: {
      "Kapasitas": "65 Liter",
      "Sistem Suspensi": "Anti-Gravity™ 3D Suspended Mesh",
      "Fitur": "Stow-on-the-Go trekking pole attachment, FlapJacket cover",
      "Raincover": "Termasuk (High-Vis)",
      "Berat": "2.2 kg"
    },
    stock: 4
  },
  {
    id: "carrier-03",
    name: "Semi Carrier Consina Tarebbi 40L",
    category: "carrier",
    categoryName: "Semi Carrier 35L - 45L",
    brand: "Consina",
    basePrice: 40000,
    rating: 4.7,
    reviewsCount: 55,
    badge: "Ekonomis",
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Semi carrier tangguh ideal untuk pendakian tektok atau camping singkat 1-2 hari. Ringan, banyak kantong samping, dan busa punggung nyaman.",
    specs: {
      "Kapasitas": "40 Liter",
      "Bahan": "Cordura Ripstop & Nylon",
      "Fitur": "Air circulation backsystem, Peluit darurat di chest strap",
      "Berat": "1.2 kg"
    },
    stock: 10
  },
  {
    id: "carrier-04",
    name: "Daypack Arei Outdoor 25L Ultralight",
    category: "carrier",
    categoryName: "Daypack 15L - 30L",
    brand: "Arei",
    basePrice: 20000,
    rating: 4.8,
    reviewsCount: 38,
    badge: "Tektok Ready",
    image: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tas daypack ringkas untuk summit attack atau perjalanan harian (one-day trip). Kompartemen botol minum di kedua sisi dan tempat water bladder.",
    specs: {
      "Kapasitas": "25 Liter",
      "Fitur": "Kompatibel Water Bladder, Raincover included",
      "Berat": "650 gram"
    },
    stock: 14
  },
  {
    id: "sleep-01",
    name: "Sleeping Bag Bulu Angsa Ultralight 800FP (-5°C)",
    category: "tidur",
    categoryName: "Sleeping Bag & Matras",
    brand: "Naturehike",
    basePrice: 35000,
    rating: 4.9,
    reviewsCount: 88,
    badge: "Ekstra Hangat",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Sleeping bag bulu angsa (down feather) grade tinggi. Sangat hangat untuk suhu puncak gunung Indonesia (Semeru, Rinjani, Prau) dengan kompresi kecil seukuran botol minum.",
    specs: {
      "Comfort Temp": "0°C s/d 5°C",
      "Limit Temp": "-5°C",
      "Filling": "800 Fill Power Goose Down 400g",
      "Ukuran": "205 x 80 cm (Packing: 15 x 28 cm)",
      "Berat": "850 gram"
    },
    stock: 9
  },
  {
    id: "sleep-02",
    name: "Sleeping Bag Polar Dacron Tebal",
    category: "tidur",
    categoryName: "Sleeping Bag & Matras",
    brand: "Arei",
    basePrice: 15000,
    rating: 4.7,
    reviewsCount: 110,
    badge: "Murah Meriah",
    image: "https://images.unsplash.com/photo-1520095972714-909e91b03895?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1520095972714-909e91b03895?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Kantung tidur model mummy berbahan polar bulu lembut di bagian dalam dan kain parasit tahan cipratan air di luar.",
    specs: {
      "Suhu Nyaman": "10°C - 18°C",
      "Material": "Outer Polyester Ripstop, Inner Polar Fleece",
      "Ukuran": "180 + 30 cm x 75 cm",
      "Berat": "900 gram"
    },
    stock: 20
  },
  {
    id: "sleep-03",
    name: "Matras Lipat IXPE Egg Crate dengan Aluminium Foil",
    category: "tidur",
    categoryName: "Sleeping Bag & Matras",
    brand: "Klymit",
    basePrice: 15000,
    rating: 4.9,
    reviewsCount: 74,
    badge: "Empuk",
    image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Matras lipat tekstur wadah telur (egg crate) yang empuk dan tidak bocor seperti kasur angin. Lapisan aluminium foil memantulkan panas tubuh kembali.",
    specs: {
      "Bahan": "Busa IXPE Foam + Thermal Aluminium Layer",
      "Tebal": "1.8 cm",
      "Dimensi": "185 x 56 cm (Lipat: 56 x 13 x 12 cm)",
      "Berat": "420 gram"
    },
    stock: 15
  },
  {
    id: "cook-01",
    name: "Cooking Set Nesting DS-308 (Lengkap 4-5 Orang)",
    category: "masak",
    categoryName: "Perlengkapan Masak & Alat Makan",
    brand: "Fire Maple",
    basePrice: 20000,
    rating: 4.8,
    reviewsCount: 95,
    badge: "Paket Lengkap",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Paket panci dan wajan camping aluminium anodized tebal dan anti lengket. Termasuk teko mini, mangkuk plastik BPA Free, spatula kayu, dan spons cuci.",
    specs: {
      "Isi Paket": "Panci besar, panci sedang, wajan penggorengan, teko teh 0.8L, 3 mangkuk, centong",
      "Material": "Hard Anodized Aluminum (Anti karat)",
      "Kapasitas": "4 - 5 orang",
      "Berat": "950 gram"
    },
    stock: 14
  },
  {
    id: "cook-02",
    name: "Kompor Portable Camping Windproof Bunga Mawar",
    category: "masak",
    categoryName: "Perlengkapan Masak & Alat Makan",
    brand: "Kovar",
    basePrice: 10000,
    rating: 4.8,
    reviewsCount: 140,
    badge: "Wajib Bawa",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Kompor ultralight dengan penahan angin (wind shield) model kelopak mawar yang bisa dilebarkan. Api tetap menyala biru stabil meski angin kencang di punggungan gunung.",
    specs: {
      "Bahan Bakar": "Gas Butane Hi-Cook kaleng",
      "Ignition": "Pemantik piezoelektrik otomatis",
      "Beban Maksimal": "Hingga 8 kg",
      "Ukuran Lipat": "14 x 14 x 12 cm"
    },
    stock: 25
  },
  {
    id: "gear-01",
    name: "Trekking Pole Duralumin Anti-Shock (Sepasang / 2 Pcs)",
    category: "gear",
    categoryName: "Trekking Pole & Aksesoris",
    brand: "Eiger",
    basePrice: 15000,
    rating: 4.9,
    reviewsCount: 120,
    badge: "Kaki Ketiga",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Tongkat mendaki sepasang dengan sistem peredam kejut (anti-shock) untuk mengurangi beban pada lutut dan persendian saat menanjak maupun menuruni jalur curam.",
    specs: {
      "Jumlah": "2 Pcs (Sepasang)",
      "Panjang": "65 cm (dilipat) s/d 135 cm (maksimal)",
      "Material": "Duralumin 7075 Alloy ringan & kuat",
      "Grip": "Busa EVA empuk & tidak licin",
      "Aksesoris": "Mud basket + Rubber tip pelindung"
    },
    stock: 18
  },
  {
    id: "light-01",
    name: "Headlamp LED Rechargeable 800 Lumens IPX6",
    category: "penerangan",
    categoryName: "Lampu & Senter Kepala",
    brand: "Black Diamond",
    basePrice: 15000,
    rating: 4.9,
    reviewsCount: 105,
    badge: "Terang Benderang",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Senter kepala berdaya tinggi dengan baterai lithium isi ulang via USB Type-C. Tahan guyuran hujan badai (IPX6) dan memiliki sensor gerak tangan (motion sensor) untuk on/off.",
    specs: {
      "Kekuatan Cahaya": "800 Lumens (Jangkauan hingga 120m)",
      "Mode": "Terang, Sedang, Redup, SOS Merah",
      "Baterai": "Lithium 18650 2200mAh (Daya tahan 8-16 jam)",
      "Port": "USB Type-C Fast Charging"
    },
    stock: 20
  },
  {
    id: "light-02",
    name: "Lentera Tenda Camping Retro Vintage USB",
    category: "penerangan",
    categoryName: "Lampu & Senter Kepala",
    brand: "Barebones Style",
    basePrice: 12000,
    rating: 4.8,
    reviewsCount: 47,
    badge: "Aesthetic",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Lampu lentera gantung berdesain klasik dengan cahaya warm-white yang menenangkan dan nyaman di dalam tenda atau area perkemahan malam hari.",
    specs: {
      "Cahaya": "Warm White Dimmer 360 Derajat",
      "Baterai": "Rechargeable 3000mAh (Tahan hingga 24 jam)",
      "Fitur": "Bisa jadi powerbank darurat, kaitan gantung carabiner"
    },
    stock: 15
  },
  {
    id: "wear-01",
    name: "Jaket Gunung Waterproof Gore-Tex Columbia",
    category: "pakaian",
    categoryName: "Jaket Outer Layer",
    brand: "Columbia",
    basePrice: 50000,
    rating: 4.8,
    reviewsCount: 52,
    badge: "Anti Badai",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Jaket outer layer tahan air dan angin (waterproof & windproof) dengan lapisan membran bernapas (breathable). Dilengkapi seal tape pada setiap jahitan.",
    specs: {
      "Material": "3-Layer Nylon Ripstop Breathable Fabric",
      "Ukuran Tersedia": "S, M, L, XL",
      "Fitur": "Hoodie helm-compatible, ketiak ventilasi ritsleting, saku dada anti air"
    },
    stock: 8
  },
  {
    id: "wear-02",
    name: "Sepatu Trekking Hiking Waterproof Vibram",
    category: "pakaian",
    categoryName: "Sepatu & Sandal Trekking",
    brand: "Salomon / Merrell",
    basePrice: 55000,
    rating: 4.9,
    reviewsCount: 61,
    badge: "Grip Mantap",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Sepatu hiking mid-cut dengan sol Vibram bergerigi tajam yang mencengkeram tanah basah, bebatuan licin, maupun pasir berkerikil. Aman dari keseleo mata kaki.",
    specs: {
      "Ukuran": "Tersedia 39, 40, 41, 42, 43, 44",
      "Outsole": "Vibram Megagrip",
      "Upper": "Suede Leather + Waterproof Membrane"
    },
    stock: 10
  },
  {
    id: "fly-01",
    name: "Flysheet Waterproof 3x4 Meter + Tali Prusik",
    category: "gear",
    categoryName: "Flysheet & Jas Hujan & Tiang",
    brand: "Mulyo Gear",
    basePrice: 15000,
    rating: 4.8,
    reviewsCount: 89,
    badge: "Pelindung Tambahan",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Atap peneduh tahan hujan lebat berukuran 3x4 meter dengan 19 titik loop pengait. Cocok untuk bivak darurat, kanopi dapur tenda, atau pelapis tenda ekstra.",
    specs: {
      "Ukuran": "300 x 400 cm",
      "Bahan": "Taslan Balon Waterproof Coated PU 3000mm",
      "Kelengkapan": "Tas kantong + 6 set tali prusik 3 meter"
    },
    stock: 16
  },
  {
    id: "table-01",
    name: "Set Meja Lipat & 2 Kursi Camping Portable",
    category: "gear",
    categoryName: "Meja & Kursi",
    brand: "Naturehike",
    basePrice: 35000,
    rating: 4.9,
    reviewsCount: 44,
    badge: "Camp Santai",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Satu set meja lipat aluminium dan dua kursi santai camping. Kuat menahan beban orang dewasa hingga 120 kg namun mudah diringkas masuk ke dalam tas ransel.",
    specs: {
      "Isi": "1 Meja Aluminium Lipat + 2 Kursi Lipat Moon Chair",
      "Kapasitas Beban": "Meja 30kg, Kursi hingga 120kg",
      "Total Berat": "3.2 kg dalam 1 tas jinjing"
    },
    stock: 7
  },
  {
    id: "elec-01",
    name: "Power Bank Monster 30.000 mAh Dual Fast Charging",
    category: "penerangan",
    categoryName: "Power Bank & Kabel",
    brand: "Baseus / Remax",
    basePrice: 15000,
    rating: 4.8,
    reviewsCount: 77,
    badge: "Baterai Awet",
    image: "https://images.unsplash.com/photo-1609592426868-6f68545802fb?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1609592426868-6f68545802fb?auto=format&fit=crop&w=800&q=80"
    ],
    desc: "Power bank berkapasitas raksasa cukup untuk 6-8 kali isi ulang smartphone di atas gunung. Mendukung Quick Charge 3.0 dan Power Delivery 20W.",
    specs: {
      "Kapasitas Nyata": "30.000 mAh Li-Polymer",
      "Output": "USB Type-C PD 20W + 2x USB-A QC 3.0",
      "Layar": "Indikator digital persentase baterai LED",
      "Kabel Termasuk": "Type C & Lightning"
    },
    stock: 12
  }
];

// Helper Functions
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}
