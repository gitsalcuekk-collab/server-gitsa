const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

        <div id="viewSiswa" class="grid md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 h-fit">
            <h2 class="text-lg font-bold mb-4 text-indigo-600 flex items-center gap-2">
              <i class="fa-solid fa-paper-plane"></i> Kirim Laporan Anonim
            </h2>
            <form id="formPengaduan" class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Kategori</label>
                <select id="kategori" class="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Fasilitas Sekolah">Fas
