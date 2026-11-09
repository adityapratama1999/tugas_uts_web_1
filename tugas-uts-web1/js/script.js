/* =====================================================
   script.js
   Logika JavaScript (manipulasi DOM, validasi form,
   modal/alert) untuk semua halaman.
   Tiap halaman punya fungsi init sendiri, dipilih lewat
   atribut <body data-page="...">.
   ===================================================== */

/* ---------- 1. Utilitas umum ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const KEY = { users: "rb_users", session: "rb_session", katalog: "rb_katalog", cart: "rb_cart", orders: "rb_orders" };
const rupiah = (n) => "Rp" + Number(n).toLocaleString("id-ID");
const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function bacaJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
  catch { return fallback; }
}
const simpanJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

function tanggalID(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function isoHariIni(tambahHari = 0) {
  const d = new Date(); d.setDate(d.getDate() + tambahHari);
  return d.toISOString().slice(0, 10);
}

/* Teks error di bawah input; kosongkan jika valid */
function setError(idError, pesan, inputEl) {
  const el = document.getElementById(idError);
  if (el) el.textContent = pesan || "";
  if (inputEl) {
    inputEl.classList.toggle("invalid", Boolean(pesan));
    inputEl.setAttribute("aria-invalid", pesan ? "true" : "false");
  }
  return !pesan;
}

/* Toast (notifikasi kecil) */
let toastTimer;
function toast(pesan, tipe = "ok") {
  const el = $("#toast"); if (!el) return;
  el.textContent = pesan;
  el.className = "toast show " + tipe;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = "toast"), 2800);
}

/* Modal memakai elemen <dialog> */
function pasangModal(dialog) {
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // klik latar = tutup
  $$("[data-close]", dialog).forEach((b) => b.addEventListener("click", () => dialog.close()));
}

/* ---------- 2. Data (localStorage + data.js) ---------- */
function semuaUser() { return [...dataUsers, ...bacaJSON(KEY.users, [])]; }

function getKatalog() {
  let k = bacaJSON(KEY.katalog, null);
  if (!k) { k = structuredClone(dataKatalogBuku); simpanJSON(KEY.katalog, k); }
  return k;
}
const setKatalog = (k) => simpanJSON(KEY.katalog, k);

const getCart = () => bacaJSON(KEY.cart, []);
const setCart = (c) => simpanJSON(KEY.cart, c);

function getOrders() {
  let o = bacaJSON(KEY.orders, null);
  if (!o) { o = structuredClone(dataPesananAwal); simpanJSON(KEY.orders, o); }
  return o;
}
const setOrders = (o) => simpanJSON(KEY.orders, o);

/* ---------- 3. Sesi, navbar, dan penjaga halaman ---------- */
function guard() {
  if (!sessionStorage.getItem(KEY.session)) { window.location.href = "index.html"; return false; }
  return true;
}
function sesi() { try { return JSON.parse(sessionStorage.getItem(KEY.session)); } catch { return null; } }

function renderNavbar(aktif) {
  const header = $("#navbar"); if (!header) return;
  const jumlah = getCart().reduce((a, c) => a + c.qty, 0);
  const link = (href, teks, key) => `<a href="${href}" ${aktif === key ? 'aria-current="page"' : ""}>${teks}</a>`;
  header.innerHTML = `
    <div class="navbar-inner">
      <a class="brand" href="dashboard.html"><img src="assets/logo.png" alt="" width="30" height="30"><span>Rak Buku</span></a>
      <nav aria-label="Navigasi situs">
        ${link("dashboard.html", "Dashboard", "dashboard")}
        ${link("stok.html", "Katalog", "stok")}
        ${link("tracking.html", "Tracking", "tracking")}
        <a href="checkout.html" ${aktif === "checkout" ? 'aria-current="page"' : ""}>Pesanan <span class="badge" id="badgeCart">${jumlah}</span></a>
      </nav>
      <div class="user"><span id="namaUser"></span><button type="button" class="btn btn-ghost btn-sm" id="btnLogout">Keluar</button></div>
    </div>`;
  $("#namaUser").textContent = sesi()?.nama ?? "";
  $("#btnLogout").addEventListener("click", () => {
    sessionStorage.removeItem(KEY.session);
    window.location.href = "index.html";
  });
}
function updateBadge() {
  const b = $("#badgeCart"); if (b) b.textContent = getCart().reduce((a, c) => a + c.qty, 0);
}

/* =====================================================
   HALAMAN LOGIN (index.html)
   ===================================================== */
function initLogin() {
  const form = $("#formLogin");
  const email = $("#email"), pass = $("#password");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okEmail = setError("errEmail", !email.value.trim() ? "Email wajib diisi." : !emailValid(email.value.trim()) ? "Format email belum benar." : "", email);
    const okPass  = setError("errPassword", !pass.value ? "Password wajib diisi." : "", pass);
    if (!okEmail || !okPass) return;

    const user = semuaUser().find((u) => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === pass.value);
    if (!user) {
      alert("Email/password yang anda masukkan salah"); // pop-up alert sesuai soal
      pass.value = ""; pass.focus();
      return;
    }
    sessionStorage.setItem(KEY.session, JSON.stringify({ nama: user.nama, email: user.email }));
    window.location.href = "dashboard.html";
  });

  /* Modal Lupa Password */
  const modalLupa = $("#modalLupa"), formLupa = $("#formLupa");
  pasangModal(modalLupa);
  $("#btnLupa").addEventListener("click", () => {
    formLupa.reset(); setError("errLupa", ""); $("#okLupa").textContent = "";
    modalLupa.showModal();
  });
  formLupa.addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("#emailLupa"); const v = inp.value.trim();
    $("#okLupa").textContent = "";
    if (!v) return setError("errLupa", "Email wajib diisi.", inp);
    if (!emailValid(v)) return setError("errLupa", "Format email belum benar.", inp);
    if (!semuaUser().some((u) => u.email.toLowerCase() === v.toLowerCase()))
      return setError("errLupa", "Email ini belum terdaftar. Periksa penulisannya atau daftar akun baru.", inp);
    setError("errLupa", "", inp);
    $("#okLupa").textContent = "Petunjuk reset password sudah dikirim ke " + v + " (simulasi).";
  });

  /* Modal Daftar */
  const modalDaftar = $("#modalDaftar"), formDaftar = $("#formDaftar");
  pasangModal(modalDaftar);
  $("#btnDaftar").addEventListener("click", () => {
    formDaftar.reset();
    ["errRegNama", "errRegEmail", "errRegPassword", "errRegKonfirmasi"].forEach((id) => setError(id, ""));
    modalDaftar.showModal();
  });
  formDaftar.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = $("#regNama"), em = $("#regEmail"), pw = $("#regPassword"), kf = $("#regKonfirmasi");
    const emailPakai = semuaUser().some((u) => u.email.toLowerCase() === em.value.trim().toLowerCase());
    const hasil = [
      setError("errRegNama", nama.value.trim().length < 3 ? "Nama minimal 3 karakter." : "", nama),
      setError("errRegEmail", !emailValid(em.value.trim()) ? "Format email belum benar." : emailPakai ? "Email sudah terdaftar." : "", em),
      setError("errRegPassword", pw.value.length < 6 ? "Password minimal 6 karakter." : "", pw),
      setError("errRegKonfirmasi", kf.value !== pw.value ? "Password tidak sama." : "", kf)
    ];
    if (hasil.includes(false)) return;

    const users = bacaJSON(KEY.users, []);
    users.push({ nama: nama.value.trim(), email: em.value.trim(), password: pw.value });
    simpanJSON(KEY.users, users);
    modalDaftar.close();
    email.value = em.value.trim(); pass.value = ""; pass.focus();
    alert("Pendaftaran berhasil. Silakan login dengan akun baru Anda.");
  });
}

/* =====================================================
   DASHBOARD (dashboard.html)
   ===================================================== */
function waktuSalam(jam) {
  if (jam < 11) return "pagi";
  if (jam < 15) return "siang";
  if (jam < 18) return "sore";
  return "malam";
}

function initDashboard() {
  const sekarang = new Date();
  $("#salam").textContent = `Selamat ${waktuSalam(sekarang.getHours())}, ${sesi().nama}`;
  $("#tanggalSekarang").textContent = sekarang.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Tombol menu yang membuka panel (Laporan & History)
  $$("[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.panel);
      const buka = target.hidden;
      $$(".panel").forEach((p) => (p.hidden = true));
      $$("[data-panel]").forEach((b) => b.setAttribute("aria-expanded", "false"));
      if (buka) {
        target.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  renderLaporan();
  renderHistory();
}

function sel(tag, teks, kelas) {
  const el = document.createElement(tag);
  if (teks !== undefined) el.textContent = teks;
  if (kelas) el.className = kelas;
  return el;
}

function renderLaporan() {
  const tbody = $("#tbodyLaporan"), tfoot = $("#tfootLaporan");
  tbody.replaceChildren(); tfoot.replaceChildren();
  const rekap = {};
  getOrders().forEach((o) => o.items.forEach((it) => {
    rekap[it.judul] ??= { qty: 0, uang: 0 };
    rekap[it.judul].qty += it.qty;
    rekap[it.judul].uang += it.qty * it.harga;
  }));
  const judul = Object.keys(rekap);
  if (!judul.length) {
    const tr = sel("tr"); const td = sel("td", "Belum ada pesanan."); td.colSpan = 3; tr.append(td); tbody.append(tr); return;
  }
  let totalQty = 0, totalUang = 0;
  judul.forEach((j) => {
    const tr = sel("tr");
    tr.append(sel("td", j), sel("td", rekap[j].qty, "num"), sel("td", rupiah(rekap[j].uang), "num"));
    tbody.append(tr);
    totalQty += rekap[j].qty; totalUang += rekap[j].uang;
  });
  const trf = sel("tr");
  trf.append(sel("th", "Total"), sel("td", totalQty, "num"), sel("td", rupiah(totalUang), "num"));
  trf.firstChild.scope = "row";
  tfoot.append(trf);
}

function renderHistory() {
  const tbody = $("#tbodyHistory"); tbody.replaceChildren();
  const orders = [...getOrders()].sort((a, b) => b.tanggalPesan.localeCompare(a.tanggalPesan));
  orders.forEach((o) => {
    const tr = sel("tr");
    const tdDO = sel("td"); const a = sel("a", o.nomorDO); a.href = "tracking.html?do=" + encodeURIComponent(o.nomorDO); tdDO.append(a);
    const tdSt = sel("td"); tdSt.append(sel("span", o.status, "badge-status " + kelasStatus(o.status)));
    tr.append(tdDO, sel("td", tanggalID(o.tanggalPesan)), sel("td", o.pemesan), sel("td", rupiah(o.total), "num"), tdSt);
    tbody.append(tr);
  });
}
const kelasStatus = (s) => "st-" + dataStatusPengiriman.indexOf(s);

/* =====================================================
   INFORMASI STOK / KATALOG (stok.html)
   ===================================================== */
function initStok() {
  const tbody = $("#tbodyStok"), cari = $("#cari"), filter = $("#filterKategori");
  let katalog = getKatalog();

  // Isi pilihan kategori secara dinamis dari data
  [...new Set(katalog.map((b) => b.kategori))].sort().forEach((k) => {
    const o = document.createElement("option"); o.value = k; o.textContent = k; filter.append(o);
  });

  /* Membuat satu baris tabel dengan DOM */
  function buatBaris(b, baru = false) {
    const tr = document.createElement("tr");
    tr.dataset.id = b.id;
    if (baru) tr.classList.add("baru");

    const tdImg = sel("td"); const img = document.createElement("img");
    img.src = b.gambar || "img/default.png"; img.alt = "Cover " + b.judul; img.width = 44; img.height = 62; img.className = "cover";
    img.onerror = () => { img.onerror = null; img.src = "img/default.png"; };
    tdImg.append(img);

    const tdJudul = sel("td"); tdJudul.append(sel("strong", b.judul), document.createElement("br"), sel("span", b.penulis, "muted"));
    const tdStok = sel("td", b.stok, "num" + (b.stok <= 5 ? " stok-tipis" : ""));
    const tdAksi = sel("td"); const btn = sel("button", b.stok === 0 ? "Habis" : "Pesan", "btn btn-sm " + (b.stok === 0 ? "btn-ghost" : "btn-primary"));
    btn.type = "button"; btn.disabled = b.stok === 0;
    btn.addEventListener("click", () => tambahKeKeranjang(b.id));
    tdAksi.append(btn);

    tr.append(tdImg, tdJudul, sel("td", b.kategori), sel("td", rupiah(b.harga), "num"), tdStok, tdAksi);
    tbody.append(tr);
  }

  function render() {
    const q = cari.value.trim().toLowerCase(), kat = filter.value;
    tbody.replaceChildren();
    const hasil = katalog.filter((b) => (!kat || b.kategori === kat) && (!q || (b.judul + " " + b.penulis).toLowerCase().includes(q)));
    hasil.forEach((b) => buatBaris(b));
    $("#kosong").hidden = hasil.length > 0;
    $("#tabelStok").hidden = hasil.length === 0;
    $("#ringkasanStok").textContent = `${katalog.length} judul, total ${katalog.reduce((a, b) => a + b.stok, 0)} buku tersedia. Stok 5 atau kurang ditandai merah.`;
  }

  function tambahKeKeranjang(id) {
    const buku = getKatalog().find((b) => b.id === id);
    const cart = getCart();
    const item = cart.find((c) => c.id === id);
    if (item && item.qty >= buku.stok) return toast(`Stok "${buku.judul}" hanya ${buku.stok}.`, "err");
    item ? item.qty++ : cart.push({ id, qty: 1 });
    setCart(cart); updateBadge();
    toast(`"${buku.judul}" masuk ke pesanan.`);
  }

  cari.addEventListener("input", render);
  filter.addEventListener("change", render);

  /* Form tambah baris stok baru */
  $("#formTambah").addEventListener("submit", (e) => {
    e.preventDefault();
    const judul = $("#inJudul"), penulis = $("#inPenulis"), kat = $("#inKategori"), harga = $("#inHarga"), stok = $("#inStok");
    const h = Number(harga.value), s = Number(stok.value);
    const hasil = [
      setError("errJudul", judul.value.trim().length < 3 ? "Judul minimal 3 karakter." : "", judul),
      setError("errPenulis", !penulis.value.trim() ? "Penulis wajib diisi." : "", penulis),
      setError("errKategori", !kat.value ? "Pilih kategori." : "", kat),
      setError("errHarga", !harga.value || h < 1000 ? "Harga minimal Rp1.000." : "", harga),
      setError("errStok", stok.value === "" || !Number.isInteger(s) || s < 0 || s > 9999 ? "Stok berupa bilangan bulat 0 sampai 9999." : "", stok)
    ];
    if (hasil.includes(false)) return;

    const bukuBaru = {
      id: Math.max(0, ...katalog.map((b) => b.id)) + 1,
      judul: judul.value.trim(), penulis: penulis.value.trim(), kategori: kat.value, harga: h, stok: s, gambar: "img/default.png"
    };
    katalog.push(bukuBaru); setKatalog(katalog);

    if (![...filter.options].some((o) => o.value === bukuBaru.kategori)) {
      const o = document.createElement("option"); o.value = o.textContent = bukuBaru.kategori; filter.append(o);
    }
    cari.value = ""; filter.value = "";
    render();
    const baris = $(`tr[data-id="${bukuBaru.id}"]`);
    baris?.classList.add("baru");
    baris?.scrollIntoView({ behavior: "smooth", block: "center" });
    e.target.reset();
    toast(`"${bukuBaru.judul}" ditambahkan ke stok.`);
  });

  render();
}

/* =====================================================
   HALAMAN PEMESANAN (checkout.html)
   ===================================================== */
function initCheckout() {
  const tbody = $("#tbodyKeranjang"), paket = $("#jenisPaket"), pilih = $("#pilihBuku");

  // Isi pilihan jenis paket dari dataOngkir
  Object.entries(dataOngkir).forEach(([nama, harga]) => {
    const o = document.createElement("option"); o.value = nama; o.textContent = `${nama} (${rupiah(harga)})`; paket.append(o);
  });

  // Prefill nama & email dari akun login
  $("#nama").value = sesi().nama; $("#emailPemesan").value = sesi().email;

  function detailKeranjang() {
    const katalog = getKatalog();
    return getCart().map((c) => ({ ...c, buku: katalog.find((b) => b.id === c.id) })).filter((c) => c.buku);
  }

  function isiPilihan() {
    pilih.replaceChildren();
    getKatalog().filter((b) => b.stok > 0).forEach((b) => {
      const o = document.createElement("option"); o.value = b.id; o.textContent = `${b.judul} (${rupiah(b.harga)}, stok ${b.stok})`; pilih.append(o);
    });
  }

  function renderKeranjang() {
    tbody.replaceChildren();
    const items = detailKeranjang();
    $("#keranjangKosong").hidden = items.length > 0;
    $("#wrapKeranjang").hidden = items.length === 0;

    items.forEach((c) => {
      const tr = sel("tr");
      const qtyTd = sel("td"); const inp = document.createElement("input");
      inp.type = "number"; inp.min = 1; inp.max = c.buku.stok; inp.value = c.qty; inp.className = "qty";
      inp.setAttribute("aria-label", "Jumlah " + c.buku.judul);
      inp.addEventListener("change", () => {
        let v = Math.floor(Number(inp.value)) || 1;
        if (v > c.buku.stok) { v = c.buku.stok; toast(`Stok "${c.buku.judul}" hanya ${c.buku.stok}.`, "err"); }
        if (v < 1) v = 1;
        const cart = getCart(); cart.find((x) => x.id === c.id).qty = v; setCart(cart);
        renderKeranjang(); updateBadge();
      });
      qtyTd.append(inp);

      const hapus = sel("button", "Hapus", "btn btn-ghost btn-sm"); hapus.type = "button";
      hapus.addEventListener("click", () => { setCart(getCart().filter((x) => x.id !== c.id)); renderKeranjang(); updateBadge(); });
      const aksi = sel("td"); aksi.append(hapus);

      tr.append(sel("td", c.buku.judul), sel("td", rupiah(c.buku.harga), "num"), qtyTd, sel("td", rupiah(c.buku.harga * c.qty), "num"), aksi);
      tbody.append(tr);
    });
    hitungRingkasan();
  }

  function hitungRingkasan() {
    const subtotal = detailKeranjang().reduce((a, c) => a + c.buku.harga * c.qty, 0);
    const ongkir = subtotal > 0 ? dataOngkir[paket.value] : 0;
    $("#sSubtotal").textContent = rupiah(subtotal);
    $("#sOngkir").textContent = rupiah(ongkir);
    $("#sTotal").textContent = rupiah(subtotal + ongkir);
    return { subtotal, ongkir, total: subtotal + ongkir };
  }
  paket.addEventListener("change", hitungRingkasan);

  /* Tambah buku langsung dari halaman pemesanan */
  $("#formTambahItem").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = Number(pilih.value); if (!id) return toast("Tidak ada buku dengan stok tersedia.", "err");
    const buku = getKatalog().find((b) => b.id === id);
    const cart = getCart(); const it = cart.find((c) => c.id === id);
    if (it && it.qty >= buku.stok) return toast(`Stok "${buku.judul}" hanya ${buku.stok}.`, "err");
    it ? it.qty++ : cart.push({ id, qty: 1 });
    setCart(cart); renderKeranjang(); updateBadge();
  });

  /* Validasi form pemesan & pembayaran */
  function validasi() {
    const nama = $("#nama"), em = $("#emailPemesan"), tel = $("#telepon"), almt = $("#alamat"), eks = $("#ekspedisi"), byr = $("#metodeBayar");
    return [
      setError("errNama", nama.value.trim().length < 3 ? "Nama minimal 3 karakter." : "", nama),
      setError("errEmailPemesan", !emailValid(em.value.trim()) ? "Format email belum benar." : "", em),
      setError("errTelepon", !/^08\d{8,11}$/.test(tel.value.trim()) ? "Nomor harus diawali 08 dan berisi 10 sampai 13 digit." : "", tel),
      setError("errAlamat", almt.value.trim().length < 10 ? "Alamat minimal 10 karakter agar kurir mudah menemukan." : "", almt),
      setError("errEkspedisi", !eks.value ? "Pilih ekspedisi." : "", eks),
      setError("errBayar", !byr.value ? "Pilih metode pembayaran." : "", byr)
    ].every(Boolean);
  }

  const modalKonf = $("#modalKonfirmasi"), modalOk = $("#modalSukses");
  pasangModal(modalKonf); pasangModal(modalOk);

  $("#formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();
    if (detailKeranjang().length === 0) { alert("Pesanan masih kosong. Tambahkan minimal satu buku."); return; }
    if (!validasi()) { toast("Periksa isian yang berwarna merah.", "err"); return; }

    const r = hitungRingkasan();
    const box = $("#isiKonfirmasi"); box.replaceChildren();
    const ul = document.createElement("ul"); ul.className = "plain";
    detailKeranjang().forEach((c) => ul.append(sel("li", `${c.buku.judul} × ${c.qty} = ${rupiah(c.buku.harga * c.qty)}`)));
    box.append(ul,
      sel("p", `Dikirim ke ${$("#nama").value.trim()}, ${$("#alamat").value.trim()}`),
      sel("p", `${$("#ekspedisi").value} ${paket.value} | Bayar via ${$("#metodeBayar").value}`),
      sel("p", `Total bayar: ${rupiah(r.total)}`, "strong"));
    modalKonf.showModal();
  });

  $("#btnKonfirmasi").addEventListener("click", () => {
    const r = hitungRingkasan();
    const items = detailKeranjang();
    const orders = getOrders();

    // Nomor Delivery Order unik: DO-TTTTBBHH-NNN
    const tgl = isoHariIni().replaceAll("-", "");
    let urut = orders.length + 1, nomorDO;
    do { nomorDO = `DO-${tgl}-${String(urut++).padStart(3, "0")}`; } while (orders.some((o) => o.nomorDO === nomorDO));

    orders.push({
      nomorDO, tanggalPesan: isoHariIni(), pemesan: $("#nama").value.trim(), email: $("#emailPemesan").value.trim(),
      telepon: $("#telepon").value.trim(), alamat: $("#alamat").value.trim(),
      items: items.map((c) => ({ id: c.id, judul: c.buku.judul, harga: c.buku.harga, qty: c.qty })),
      ekspedisi: $("#ekspedisi").value, jenisPaket: paket.value, tanggalKirim: isoHariIni(1), ongkir: r.ongkir,
      metodeBayar: $("#metodeBayar").value, total: r.total, status: "Pesanan diterima"
    });
    setOrders(orders);

    // Kurangi stok katalog
    const katalog = getKatalog();
    items.forEach((c) => { katalog.find((b) => b.id === c.id).stok -= c.qty; });
    setKatalog(katalog);
    setCart([]);

    modalKonf.close();
    $("#nomorBaru").textContent = nomorDO;
    $("#linkLacak").href = "tracking.html?do=" + encodeURIComponent(nomorDO);
    modalOk.showModal();
    renderKeranjang(); isiPilihan(); updateBadge();
    $("#formCheckout").reset(); $("#nama").value = sesi().nama; $("#emailPemesan").value = sesi().email; hitungRingkasan();
  });

  isiPilihan();
  renderKeranjang();
}

/* =====================================================
   TRACKING PENGIRIMAN (tracking.html)
   ===================================================== */
function initTracking() {
  const form = $("#formCari"), input = $("#nomorDO");

  function tampilkan(o) {
    $("#tidakDitemukan").hidden = true;
    $("#hasil").hidden = false;
    $("#hPemesan").textContent = o.pemesan;
    const st = $("#hStatus"); st.textContent = o.status; st.className = "badge-status " + kelasStatus(o.status);
    $("#hEkspedisi").textContent = o.ekspedisi;
    $("#hPaket").textContent = o.jenisPaket;
    $("#hTanggal").textContent = tanggalID(o.tanggalKirim);
    $("#hAlamat").textContent = o.alamat;
    $("#hItems").textContent = o.items.map((i) => `${i.judul} × ${i.qty}`).join(", ");
    $("#hTotal").textContent = `${rupiah(o.total)} (${o.metodeBayar}, termasuk ongkir ${rupiah(o.ongkir)})`;

    // Progress bar + daftar tahap
    const idx = dataStatusPengiriman.indexOf(o.status);
    const persen = Math.round(((idx + 1) / dataStatusPengiriman.length) * 100);
    $("#progressFill").style.width = persen + "%";
    $("#progressBar").setAttribute("aria-valuenow", persen);
    const ol = $("#daftarTahap"); ol.replaceChildren();
    dataStatusPengiriman.forEach((t, i) => {
      const li = sel("li", t, i < idx ? "selesai" : i === idx ? "aktif" : "");
      if (i === idx) li.setAttribute("aria-current", "step");
      ol.append(li);
    });
  }

  function cariPesanan(nomor) {
    const v = nomor.trim().toUpperCase();
    if (!v) { $("#hasil").hidden = true; $("#tidakDitemukan").hidden = true; return setError("errDO", "Nomor Delivery Order wajib diisi.", input); }
    if (!/^DO-\d{8}-\d{3,}$/.test(v)) { $("#hasil").hidden = true; return setError("errDO", "Format nomor belum benar. Contoh: DO-20261103-002.", input); }
    setError("errDO", "", input);
    const o = getOrders().find((x) => x.nomorDO === v);
    if (!o) {
      $("#hasil").hidden = true;
      const msg = $("#tidakDitemukan"); msg.hidden = false;
      msg.textContent = `Nomor ${v} tidak ditemukan. Pastikan nomor sesuai dengan yang diberikan saat pemesanan.`;
      return;
    }
    tampilkan(o);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); cariPesanan(input.value); });

  // Jika dibuka dari link (?do=...), langsung cari
  const dariUrl = new URLSearchParams(window.location.search).get("do");
  if (dariUrl) { input.value = dariUrl; cariPesanan(dariUrl); }
}

/* =====================================================
   Penentu halaman aktif
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const halaman = document.body.dataset.page;
  const inisialisasi = { login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking };
  if (halaman !== "login") {
    if (!guard()) return;
    renderNavbar(halaman);
  }
  inisialisasi[halaman]?.();
});
