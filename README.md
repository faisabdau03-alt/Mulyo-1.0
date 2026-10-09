# Mulyo Adventure 🏕️ - Persewaan Tenda, Carrier & Gear Outdoor

Website platform persewaan perlengkapan camping, mendaki gunung, dan outdoor adventure modern yang dirancang mengadaptasi konsep dan tata letak **Foresta Adventure**, dengan penyesuaian brand menjadi **Mulyo Adventure**.

Proyek ini dibangun untuk kebutuhan tugas perkuliahan Semester 5 (Bu Fersel).

---

## 🚀 Fitur Utama

1. **Header & Sticky Navigation Bar**:
   - Top announcement bar dengan info kontak telepon, email, dan jam buka.
   - Logo kustom "Mulyo Adventure".
   - Menu navigasi: Beranda, Dropdown Kategori Lengkap, Katalog Gear, Cara Sewa, Kontak & Lokasi.
   - Tombol Keranjang Belanja interaktif dengan indikator jumlah item real-time.

2. **Hero Banner & Interactive Booking Picker**:
   - Banner bertema adventure modern dengan visual camping di alam terbuka.
   - Bar pemesanan interaktif:
     - **Tanggal Ambil**: Pemilih tanggal otomatis minimal H+1.
     - **Durasi Sewa**: Pilihan 1 hari hingga 14 hari.
     - **Maks. Pengembalian**: Dihitung otomatis secara *real-time*.
     - **Pencarian Cepat**: Langsung mencari alat dan diarahkan ke katalog.

3. **Pilihan Brand Ternama**:
   - Menampilkan mitra merek perlengkapan outdoor terpercaya: Eiger, Deuter, Osprey, Consina, Tendaki, Quechua, Naturehike, Arei, Merapi Mountain, Great Outdoor.

4. **Katalog Produk & Filter Lengkap (`katalog.html`)**:
   - Filter Kategori (Tenda, Carrier, Sleeping Bag, Alat Masak, Lampu, Pakaian/Sepatu, Aksesoris).
   - Filter Merek / Brand.
   - Filter Slider Rentang Harga per Hari (hingga Rp 250.000).
   - Pengurutan (Rating tertinggi, Harga termurah/termahal, Nama A-Z).
   - Pencarian kata kunci live search.

5. **Modal Detail Produk & Live Price Calculator**:
   - Preview foto produk beresolusi tinggi.
   - Deskripsi dan tabel spesifikasi teknis lengkap (bahan, kapasitas, ukuran, kelengkapan).
   - Kalkulator sewa instan: `Subtotal = Harga/hari x Jumlah x Durasi`.
   - Tombol "+ Keranjang" dan "Sewa Langsung via WhatsApp".

6. **Keranjang Belanja (Cart Drawer / Offcanvas)**:
   - Data tersimpan secara persisten menggunakan `localStorage`.
   - Pengaturan jumlah (Qty) dan durasi sewa per item.
   - Kalkulasi otomatis total biaya sewa.
   - Tombol checkout instan ke formulir WhatsApp.

7. **Sistem Pemesanan Terintegrasi WhatsApp**:
   - Formulir konfirmasi pemesanan (Nama, No WA, Tanggal Sewa, Catatan).
   - Menghasilkan format pesan WhatsApp rapi berisi rincian barang, durasi, total biaya, dan data peminjam siap kirim ke admin rental.

8. **Panduan Cara Sewa & Ketentuan (`cara-sewa.html`)**:
   - 4 alur langkah mudah meminjam alat.
   - Syarat dokumen jaminan identitas asli (KTP, KTM, SIM, Paspor).
   - Ketentuan denda keterlambatan dan kerusakan yang transparan.

9. **Kontak & Lokasi Toko (`kontak.html`)**:
   - Alamat toko lengkap (Jl. Kaliurang KM 5, Yogyakarta).
   - Jam operasional (08.00 - 21.00 WIB setiap hari).
   - Peta interaktif Google Maps.
   - Formulir pesan langsung ke WhatsApp admin.
   - Tombol mengambang (Floating Action Button) WhatsApp dengan animasi berdenyut.

---

## 📁 Struktur Berkas Proyek

```
Mulyo 1.0/
├── index.html            # Halaman utama beranda (Mirip forestaadventure.com)
├── katalog.html          # Halaman katalog produk dengan filter sidebar & sorting
├── cara-sewa.html        # Halaman panduan sewa, syarat jaminan & denda
├── kontak.html           # Halaman informasi kontak, peta toko & form pesan
├── package.json          # Konfigurasi npm script untuk local development
├── README.md             # Dokumentasi proyek
├── css/
│   └── style.css         # Styling custom modern outdoor green & dark theme
└── js/
    ├── products-data.js  # Database produk perlengkapan outdoor
    ├── cart.js           # Logika keranjang belanja & generator pesan WhatsApp
    ├── katalog.js        # Logika filter kategori, harga & sorting katalog
    └── main.js           # Logika interaktif tanggal, modal produk & navbar
```

---

## 💻 Cara Menjalankan

### Cara 1: Membuka Langsung di Browser (Paling Mudah)
Cukup klik ganda (double-click) berkas `index.html` menggunakan browser apa saja (Google Chrome, Microsoft Edge, Mozilla Firefox, dll). Semua fitur berfungsi penuh tanpa instalasi tambahan.

### Cara 2: Menjalankan Local Web Server (Node.js)
1. Buka terminal PowerShell di folder proyek ini (`Mulyo 1.0`).
2. Jalankan perintah:
   ```bash
   npm start
   ```
3. Buka peramban di alamat:
   ```
   http://localhost:3000
   ```

---

## 🎨 Teknologi yang Digunakan
- **HTML5 & CSS3 Modern** (Semantic tags, CSS Variables, Flexbox & Grid).
- **Bootstrap 5.3 & Bootstrap Icons** untuk tata letak responsif dan ikonografi.
- **Vanilla JavaScript (ES6+)** tanpa framework berat, memastikan performa sangat cepat dan mudah dipelajari untuk mata kuliah.
- **LocalStorage API** untuk menyimpan item keranjang sewa pengguna.
- **WhatsApp API Deep Link** untuk alur checkout langsung ke nomor penjual.
