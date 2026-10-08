const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
// Railway membutuhkan PORT dinamis dari environment
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware parsing data (JSON base64 foto & teks hingga 15MB)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Melayani file statis
app.use(express.static(__dirname));

// Route Utama: Menampilkan index.html yang ada di root folder
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send('<h1>File index.html tidak ditemukan di root folder!</h1>');
  }
});

// Helper Membaca Data
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
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    } catch (e) {}
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Helper Menyimpan Data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Gagal menulis data:', err);
  }
}

// --- API ENDPOINTS ---

// 1. Get Semua Aspirasi
app.get('/api/aspirasi', (req, res) => {
  res.json(readData());
});

// 2. Tambah Aspirasi Baru (Siswa)
app.post('/api/aspirasi', (req, res) => {
  const { kategori, urgensi, pesan, foto } = req.body;
  if (!pesan) {
    return res.status(400).json({ success: false, message: 'Pesan aspirasi wajib diisi!' });
  }

  const data = readData();
  const newItem = {
    id: Date.now(),
    ticket: 'ASP-' + Math.floor(100 + Math.random() * 900),
    kategori: kategori || 'Umum',
    urgensi: urgensi || 'Biasa',
    pesan,
    status: 'Menunggu',
    tanggapan: '',
    foto: foto || '',
    upvotes: 0,
    tanggal: new Date().toISOString().split('T')[0]
  };

  data.unshift(newItem);
  writeData(data);
  res.json({ success: true, data: newItem });
});

// 3. Upvote Aspirasi
app.post('/api/aspirasi/:id/upvote', (req, res) => {
  const data = readData();
  const item = data.find(a => a.id == req.params.id);
  if (item) {
    item.upvotes = (item.upvotes || 0) + 1;
    writeData(data);
    res.json({ success: true, upvotes: item.upvotes });
  } else {
    res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  }
});

// 4. Tanggapi Laporan & Ubah Status (Guru / Admin)
app.post('/api/admin/tanggapi', (req, res) => {
  const { id, status, tanggapan } = req.body;
  const data = readData();
  const item = data.find(a => a.id == id);
  if (item) {
    if (status) item.status = status;
    if (tanggapan !== undefined) item.tanggapan = tanggapan;
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  }
});

// 5. Hapus Laporan Spam (Guru / Admin)
app.delete('/api/aspirasi/:id', (req, res) => {
  let data = readData();
  const initialLength = data.length;
  data = data.filter(a => a.id != req.params.id);
  
  if (data.length < initialLength) {
    writeData(data);
    res.json({ success: true, message: 'Laporan berhasil dihapus' });
  } else {
    res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  }
});

// Pastikan IP binding mendengarkan di '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Aspirasi SMK Walisongo 2 Gempol berjalan di port ${PORT}`);
});
