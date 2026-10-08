const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware untuk memproses data JSON & URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Melayani file statis jika ada (seperti CSS/JS tambahan)
app.use(express.static(__dirname));

// Route Utama: Menampilkan index.html yang berada sejajar di root folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fungsi Membaca Data Permanen
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
      {
        id: 1,
        ticket: 'ASP-101',
        kategori: 'Fasilitas Sekolah',
        urgensi: 'Penting',
        pesan: 'Proyektor di kelas 11 RPL mati total saat jam pelajaran.',
        status: 'Diproses',
        tanggapan: 'Terima kasih, teknisi sarpras akan mengecek ke lokasi hari ini.',
        foto: '',
        upvotes: 3,
        tanggal: '2026-10-08'
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Fungsi Menyimpan Data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Get Semua Aspirasi
app.get('/api/aspirasi', (req, res) => {
  res.json(readData());
});

// API Tambah Aspirasi Baru
app.post('/api/aspirasi', (req, res) => {
  const { kategori, urgensi, pesan, foto } = req.body;
  if (!pesan) {
    return res.status(400).json({ success: false, message
