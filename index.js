const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data_aspirasi.json');

// Konfigurasi Upload Foto Bukti Aspirasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get Semua Aspirasi
app.get('/api/aspirasi', (req, res) => {
  res.json(readData());
});

// Tambah Aspirasi Baru
app.post('/api/aspirasi', upload.single('foto'), (req, res) => {
  const { nama, kelas, anonim, kategori, judul, isi } = req.body;
  if (!judul || !isi) {
    return res.status(400).json({ success: false, message: 'Judul dan isi aspirasi wajib diisi!' });
  }

  const data = readData();
  const newAspirasi = {
    id: Date.now(),
    nama: anonim === 'true' ? 'Anonim' : (nama || 'Siswa SMK Walisongo 2'),
    kelas: anonim === 'true' ? '-' : (kelas || '-'),
    kategori: kategori || 'Umum',
    judul,
    isi,
    foto: req.file ? `/uploads/${req.file.filename}` : null,
    status: 'Menunggu',
    tanggapan: '',
    upvotes: 0,
    tanggal: new Date().toLocaleDateString('id-ID')
  };

  data.unshift(newAspirasi);
  writeData(data);
  res.json({ success: true, data: newAspirasi });
});

// Upvote Aspirasi
app.post('/api/aspirasi/:id/upvote', (req, res) => {
  const data = readData();
  const item = data.find(a => a.id == req.params.id);
  if (item) {
    item.upvotes += 1;
    writeData(data);
    res.json({ success: true, upvotes: item.upvotes });
  } else {
    res.status(404).json({ success: false });
  }
});

// Tanggapi & Ubah Status (Admin Sekolah)
app.post('/api/admin/tanggapi', (req, res) => {
  const { id, status, tanggapan } = req.body;
  const data = readData();
  const item = data.find(a => a.id == id);
  if (item) {
    item.status = status || item.status;
    item.tanggapan = tanggapan || item.tanggapan;
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Aspirasi SMK Walisongo 2 Gempol berjalan di port ${PORT}`);
});
