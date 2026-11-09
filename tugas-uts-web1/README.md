# Rak Buku - Tugas UTS Pemrograman Web 1

Cara menjalankan: buka `index.html` di browser (klik dua kali, tanpa server).

Akun uji: `admin@rakbuku.id` / `buku123`  (atau daftar akun baru lewat tombol Daftar)
Nomor DO contoh untuk Tracking: `DO-20261028-001`, `DO-20261103-002`, `DO-20261106-003`

## Struktur
- index.html     : login (modal Lupa Password dan Daftar, alert jika salah)
- dashboard.html : menu utama, salam sesuai jam, panel Laporan dan History
- stok.html      : katalog dari data.js, cari/filter, tambah baris stok (DOM), tombol Pesan
- checkout.html  : ubah/tambah item, data pemesan, pembayaran, konfirmasi, nomor DO
- tracking.html  : cari nomor DO, progress bar status, detail ekspedisi
- css/style.css, js/script.js, js/data.js, assets/logo.png, img/*.png

## Alur penjelasan untuk video (maks. 15 menit)
1. Struktur folder dan alasan memisahkan HTML, CSS, JS, data (modularitas).
2. HTML semantik: header, nav, main, section, form dengan label, dialog, table dengan caption/scope.
3. CSS: variabel warna (:root), grid/flex, responsif (media query), status fokus.
4. data.js: dataKatalogBuku, dataUsers, dataPesananAwal sebagai pengganti database.
5. script.js: satu fungsi init per halaman (dipilih lewat data-page), helper bersama
   (setError, toast, pasangModal), validasi form, manipulasi DOM (createElement, append, replaceChildren).
6. Demo: login salah -> alert, daftar, login, katalog, tambah stok, pesan, checkout, lacak DO.
