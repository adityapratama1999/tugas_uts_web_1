/* =====================================================
   data.js
   Data dummy (format Array JSON) pengganti server/database.
   File ini dimuat lebih dulu daripada script.js.
   ===================================================== */

// Katalog buku (dipakai di stok.html dan checkout.html)
const dataKatalogBuku = [
  { id: 1, judul: "Madilog",                   penulis: "Tan Malaka",     kategori: "Filsafat",   harga: 65000, stok: 24, gambar: "img/buku1.jpg" },
  { id: 2, judul: "CSS Layout Modern",         penulis: "Dimas Prakoso",  kategori: "Web",        harga: 78000, stok: 17, gambar: "img/buku2.png" },
  { id: 3, judul: "JavaScript untuk Pemula",   penulis: "Sari Wulandari", kategori: "Web",        harga: 89000, stok: 30, gambar: "img/buku3.png" },
  { id: 4, judul: "DOM dan Interaksi Web",     penulis: "Bagas Nugroho",  kategori: "Web",        harga: 72000, stok: 4,  gambar: "img/buku4.png" },
  { id: 5, judul: "Desain Antarmuka Praktis",  penulis: "Nadia Putri",    kategori: "Desain",     harga: 95000, stok: 12, gambar: "img/buku5.png" },
  { id: 6, judul: "Algoritma Sehari-hari",     penulis: "Hendra Gunawan", kategori: "Dasar",      harga: 69000, stok: 20, gambar: "img/buku6.png" },
  { id: 7, judul: "Basis Data Ringkas",        penulis: "Lestari Anggun", kategori: "Dasar",      harga: 74000, stok: 0,  gambar: "img/buku7.png" },
  { id: 8, judul: "Git dan Kolaborasi Tim",    penulis: "Fajar Ramadhan", kategori: "Kolaborasi", harga: 59000, stok: 15, gambar: "img/buku8.png" }
];

// Akun bawaan untuk login. Akun baru dari fitur "Daftar" disimpan di localStorage.
const dataUsers = [
  { nama: "Adita Eka Pratama", email: "apratama25064@gmail.com", password: "AditSerang99" },
  { nama: "Mahasiswa Uji",  email: "mahasiswa@rakbuku.id", password: "uts12345" }
];

// Daftar tahap status pengiriman (urutan = progress)
const dataStatusPengiriman = ["Pesanan diterima", "Dikemas", "Dikirim", "Dalam perjalanan", "Terkirim"];

// Opsi ongkos kirim per jenis paket
const dataOngkir = { "Reguler": 12000, "Ekspres": 25000 };

// Pesanan awal: dipakai untuk Histori Transaksi, Laporan Pemesanan, dan Tracking.
// Pesanan baru dari checkout.html ditambahkan ke localStorage.
const dataPesananAwal = [
  {
    nomorDO: "DO-20261028-001", tanggalPesan: "2026-10-28", pemesan: "Adita Eka Pratama",
    email: "apratama25064@gmail.com", telepon: "089897327180", alamat: "Jl. Mawar No. 12, Bekasi",
    items: [ { id: 1, judul: "Madilog", harga: 65000, qty: 2 }, { id: 3, judul: "JavaScript untuk Pemula", harga: 89000, qty: 1 } ],
    ekspedisi: "JNE", jenisPaket: "Reguler", tanggalKirim: "2026-10-29", ongkir: 12000,
    metodeBayar: "Transfer Bank", total: 231000, status: "Terkirim"
  },
  {
    nomorDO: "DO-20261103-002", tanggalPesan: "2026-11-03", pemesan: "Rina Maharani",
    email: "rina@contoh.id", telepon: "081234567890", alamat: "Jl. Kenanga No. 5, Jakarta Timur",
    items: [ { id: 5, judul: "Desain Antarmuka Praktis", harga: 95000, qty: 1 } ],
    ekspedisi: "J&T", jenisPaket: "Ekspres", tanggalKirim: "2026-11-04", ongkir: 25000,
    metodeBayar: "E-Wallet", total: 120000, status: "Dalam perjalanan"
  },
  {
    nomorDO: "DO-20261106-003", tanggalPesan: "2026-11-06", pemesan: "Bagus Santoso",
    email: "bagus@contoh.id", telepon: "085611223344", alamat: "Perumahan Griya Asri Blok C3, Bekasi",
    items: [ { id: 2, judul: "CSS Layout Modern", harga: 78000, qty: 1 }, { id: 8, judul: "Git dan Kolaborasi Tim", harga: 59000, qty: 2 } ],
    ekspedisi: "SiCepat", jenisPaket: "Reguler", tanggalKirim: "2026-11-07", ongkir: 12000,
    metodeBayar: "COD", total: 208000, status: "Dikemas"
  }
];
