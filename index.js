const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database sementara di RAM
let laporanList = [
  {
    id: 1,
    kategori: 'Fasilitas Sekolah',
    pesan: 'AC di kelas 11 IPA 2 bocor dan berisik banget pak/bu.',
    status: 'Diproses',
    tanggapan: 'Terima kasih, tim sarpras akan mengecek lokasi besok.',
    tanggal: '07/10/2026, 10:15:00'
  }
];

// Dashboard Frontend & Admin
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portal Pengaduan & Aspirasi Siswa</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body class="bg-slate-100 min-h-screen text-slate-800 font-sans">
      
      <!-- Navbar -->
      <nav class="bg-indigo-600 text-white shadow-lg">
        <div class="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <i class="fa-solid me-2 fa-user-shield text-2xl"></i>
            <h1 class="font-bold text-lg md:text-xl">AspirasiSiswa.id</h1>
          </div>
          <div>
            <button onclick="switchTab('siswa')" id="btnSiswa" class="px-3 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-sm mr-2 shadow">Mode Siswa</button>
            <button onclick="switchTab('admin')" id="btnAdmin" class="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm">Portal Guru/Admin</button>
          </div>
        </div>
      </nav>

      <div class="max-w-5xl mx-auto p-4 md:p-6">

        <!-- STATS CARD -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
            <p class="text-xs text-slate-500 uppercase font-semibold">Total Laporan</p>
            <p id="statTotal" class="text-2xl font-extrabold text-indigo-600">0</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
            <p class="text-xs text-slate-500 uppercase font-semibold">Sedang Diproses</p>
            <p id="statProses" class="text-2xl font-extrabold text-amber-500">0</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
            <p class="text-xs text-slate-500 uppercase font-semibold">Selesai</p>
            <p id="statSelesai" class="text-2xl font-extrabold text-emerald-500">0</p>
          </div>
        </div>

        <!-- VIEW SISWA -->
        <div id="viewSiswa" class="grid md:grid-cols-3 gap-6">
          <!-- Form -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 h-fit">
            <h2 class="text-lg font-bold mb-4 text-indigo-600 flex items-center gap-2">
              <i class="fa-solid fa-paper-plane"></i> Kirim Laporan Anonim
            </h2>
            <form id="formPengaduan" class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Kategori</label>
                <select id="kategori" class="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Fasilitas Sekolah">Fasilitas Sekolah</option>
                  <option value="Keamanan & Bullying">Keamanan & Bullying</option>
                  <option value="Akademik & Guru">Akademik & Guru</option>
                  <option value="Saran & Masukan">Saran & Masukan</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Isi Laporan / Keluhan</label>
                <textarea id="pesan" class="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows="4" required placeholder="Tuliskan keluhan atau saranmu secara jelas dan jujur... Identitasmu 100% rahasia!"></textarea>
              </div>
              <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm shadow transition">
                Kirim Aspirasi
              </button>
            </form>
          </div>

          <!-- Feed Laporan Public -->
          <div class="md:col-span-2">
            <h2 class="text-lg font-bold mb-4 text-slate-700">Daftar Aspirasi Terbaru</h2>
            <div id="daftarLaporanPublic" class="space-y-4"></div>
          </div>
        </div>

        <!-- VIEW ADMIN GURU -->
        <div id="viewAdmin" class="hidden">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-user-gear text-indigo-600"></i> Panel Kelola Pengaduan (Guru)
              </h2>
              <span class="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">Akses Admin</span>
            </div>

            <div id="daftarLaporanAdmin" class="space-y-4"></div>
          </div>
        </div>

      </div>

      <script>
        let currentMode = 'siswa';

        function switchTab(mode) {
          currentMode = mode;
          const btnSiswa = document.getElementById('btnSiswa');
          const btnAdmin = document.getElementById('btnAdmin');
          const viewSiswa = document.getElementById('viewSiswa');
          const viewAdmin = document.getElementById('viewAdmin');

          if(mode === 'siswa') {
            viewSiswa.classList.remove('hidden');
            viewAdmin.classList.add('hidden');
            btnSiswa.className = "px-3 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-sm mr-2 shadow";
            btnAdmin.className = "px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm";
          } else {
            const pass = prompt("Masukkan Password Guru/Admin:");
            if(pass !== "guru123") {
              alert("Password Salah! (Password default: guru123)");
              return;
            }
            viewSiswa.classList.add('hidden');
            viewAdmin.classList.remove('hidden');
            btnAdmin.className = "px-3 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-sm shadow";
            btnSiswa.className = "px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm mr-2";
          }
          loadData();
        }

        async function loadData() {
          const res = await fetch('/api/laporan');
          const data = await res.json();

          // Update Stats
          document.getElementById('statTotal').innerText = data.length;
          document.getElementById('statProses').innerText = data.filter(i => i.status === 'Diproses').length;
          document.getElementById('statSelesai').innerText = data.filter(i => i.status === 'Selesai').length;

          // Render Public View
          const publicContainer = document.getElementById('daftarLaporanPublic');
          publicContainer.innerHTML = '';
          data.forEach(item => {
            const statusBadge = item.status === 'Selesai' 
              ? '<span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-check mr-1"></i>Selesai</span>'
              : '<span class="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-clock mr-1"></i>Diproses</span>';

            publicContainer.innerHTML += \`
              <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">\${item.kategori}</span>
                  \${statusBadge}
                </div>
                <p class="text-slate-700 text-sm my-3 font-medium">\${item.pesan}</p>
                \${item.tanggapan ? \`
                  <div class="mt-3 p-3 bg
