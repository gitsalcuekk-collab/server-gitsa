const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let laporanList = [
  {
    id: 1,
    kategori: 'Fasilitas Sekolah',
    pesan: 'Proyektor di kelas 11 RPL mati total saat jam pelajaran.',
    status: 'Diproses',
    tanggapan: 'Terima kasih, teknisi sarpras akan mengecek ke lokasi hari ini.',
    tanggal: '07/10/2026, 08:30:00'
  }
];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aspirasi SMK Walisongo 2 Gempol</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    </head>
    <body class="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      
      <!-- Navbar -->
      <nav class="bg-indigo-600 text-white shadow-lg sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div class="flex items-center space-x-3">
            <div class="bg-white/10 p-2 rounded-xl">
              <i class="fa-solid fa-graduation-cap text-2xl text-amber-300"></i>
            </div>
            <div>
              <h1 class="font-extrabold text-lg md:text-xl tracking-tight">Aspirasi SMK Walisongo 2 Gempol</h1>
              <p class="text-xs text-indigo-200">Sistem Layanan Pengaduan & Aspirasi Anonim Siswa</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="switchTab('siswa')" id="btnSiswa" class="px-4 py-2 rounded-xl bg-white text-indigo-600 font-bold text-sm shadow transition hover:bg-slate-50">
              <i class="fa-solid fa-user-graduate mr-1.5"></i> Mode Siswa
            </button>
            <button onclick="openLoginModal()" id="btnAdmin" class="px-4 py-2 rounded-xl bg-indigo-700 text-indigo-100 hover:bg-indigo-800 font-bold text-sm transition">
              <i class="fa-solid fa-user-shield mr-1.5"></i> Portal Guru / Admin
            </button>
          </div>
        </div>
      </nav>

      <div class="max-w-6xl mx-auto p-4 md:p-6">

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Aspirasi</p>
              <p id="statTotal" class="text-3xl font-black text-indigo-600">0</p>
            </div>
            <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <i class="fa-solid fa-inbox text-xl"></i>
            </div>
          </div>
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sedang Diproses</p>
              <p id="statProses" class="text-3xl font-black text-amber-500">0</p>
            </div>
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <i class="fa-solid fa-spinner fa-spin-pulse text-xl"></i>
            </div>
          </div>
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tuntas & Selesai</p>
              <p id="statSelesai" class="text-3xl font-black text-emerald-500">0</p>
            </div>
            <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
              <i class="fa-solid fa-circle-check text-xl"></i>
            </div>
          </div>
        </div>

        <!-- SISWA VIEW -->
        <div id="viewSiswa" class="grid md:grid-cols-3 gap-6">
          
          <!-- Form Kirim -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 md:col-span-1 h-fit sticky top-24">
            <div class="flex items-center gap-2 mb-4 text-indigo-600">
              <i class="fa-solid fa-paper-plane text-lg"></i>
              <h2 class="text-base font-bold">Kirim Aspirasi Anonim</h2>
            </div>
            <form id="formPengaduan" class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1.5">Kategori Pelaporan</label>
                <select id="kategori" class="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
                  <option value="Fasilitas Sekolah">Fasilitas Sekolah</option>
                  <option value="Keamanan & Bullying">Keamanan & Bullying</option>
                  <option value="Akademik & Guru">Akademik & Guru</option>
                  <option value="Saran & Masukan">Saran & Masukan</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1.5">Isi Laporan / Keluhan</label>
                <textarea id="pesan" class="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" rows="4" required placeholder="Tuliskan keluhan atau saranmu secara spesifik. Identitas kamu 100% rahasia!"></textarea>
              </div>
              <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-paper-plane"></i> Kirim Laporan Sekarang
              </button>
            </form>
          </div>

          <!-- Feed Laporan Public -->
          <div class="md:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-base font-bold text-slate-700">Daftar Aspirasi Publik</h2>
              <select id="filterKategori" onchange="loadData()" class="border border-slate-200 bg-white px-3 py-1.5 rounded-xl text-xs font-semibold outline-none">
                <option value="ALL">Semua Kategori</option>
                <option value="Fasilitas Sekolah">Fasilitas Sekolah</option>
                <option value="Keamanan & Bullying">Keamanan & Bullying</option>
                <option value="Akademik & Guru">Akademik & Guru</option>
                <option value="Saran & Masukan">Saran & Masukan</option>
              </select>
            </div>
            <div id="daftarLaporanPublic" class="space-y-4"></div>
          </div>
        </div>

        <!-- ADMIN VIEW -->
        <div id="viewAdmin" class="hidden">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <i class="
