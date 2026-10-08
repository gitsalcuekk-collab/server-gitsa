const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send('<h1>File index.html tidak ditemukan!</h1>');
  }
});

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
        komentar: ['Tolong dikirim teknisi secepatnya ya pak.'],
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

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Gagal menyimpan data:', err);
  }
}

// Get All
app.get('/api/aspirasi', (req, res) => {
  res.json(readData());
});

// Post New
app.post('/api/aspirasi', (req, res) => {
  const { kategori, urgensi, pesan, foto } = req.body;
  if (!pesan) return res.status(400).json({ success: false, message: 'Pesan wajib diisi' });

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
    komentar: [],
    tanggal: new Date().toISOString().split('T')[0]
  };

  data.unshift(newItem);
  writeData(data);
  res.json({ success: true, data: newItem });
});

// Upvote
app.post('/api/aspirasi/:id/upvote', (req, res) => {
  const data = readData();
  const item = data.find(a => a.id == req.params.id);
  if (item) {
    item.upvotes = (item.upvotes || 0) + 1;
    writeData(data);
    res.json({ success: true, upvotes: item.upvotes });
  } else {
    res.status(404).json({ success: false });
  }
});

// Tambah Komentar
app.post('/api/aspirasi/:id/komentar', (req, res) => {
  const { teks } = req.body;
  const data = readData();
  const item = data.find(a => a.id == req.params.id);
  if (item) {
    if (!item.komentar) item.komentar = [];
    item.komentar.push(teks);
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// Tanggapi Guru
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
    res.status(404).json({ success: false });
  }
});

// Delete Spam
app.delete('/api/aspirasi/:id', (req, res) => {
  let data = readData();
  data = data.filter(a => a.id != req.params.id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server aktif di port ${PORT}`);
});
