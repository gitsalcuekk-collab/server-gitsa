const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'data.json');

// Anti-Spam Rate Limit
const rateLimitMap = new Map();

// Fungsi Membaca Data Permanen
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
      {
        id: 1,
        ticket: '#ASP-101',
        kategori: 'Fasilitas Sekolah',
        urgensi: 'Penting',
        pesan: 'Proyektor di kelas 11 RPL mati total saat jam pelajaran.',
        status: 'Diproses',
        tanggapan: 'Terima kasih, teknisi sarpras akan mengecek ke lokasi hari ini.',
        foto: '',
        upvotes: 3,
        isNew: false,
        tanggal: '07/10/2026, 08:30:00'
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Fungsi Menyimpan Data Permanen
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get All Laporan
app.get('/api/laporan', (req, res) => {
  const data = readData();
  res.json(data);
});

// Kirim Laporan Baru
app.post('/api/laporan', (req, res) => {
  const ip = req.ip || 'user';
  const now = Date.now();
  const lastTime = rateLimitMap.get(ip) || 0;

  if (now - lastTime < 5000) {
    return res.status(429).json({ message: 'Terlalu cepat! Tunggu 5 detik.' });
  }
  rateLimitMap.set(ip, now);

  const { kategori, urgensi, pesan, foto } = req.body;
  const data = readData();

  const newLaporan = {
    id: Date.now(),
    ticket: '#ASP-' + Math.floor(100 + Math.random() * 900),
    kategori,
    urgensi: urgensi || 'Biasa',
    pesan,
    foto: foto || '',
    status: 'Diproses',
    tanggapan: '',
    upvotes: 0,
    isNew: true,
    tanggal: new Date().toLocaleString('id-ID')
  };

  data.unshift(newLaporan);
  saveData(data);
  res.json({ message: 'Success', ticket: newLaporan.ticket });
});

// Upvote Laporan
app.post('/api/laporan/upvote', (req, res) => {
  const { id } = req.body;
  const data = readData();
  const item = data.find(l => l.id == id);
  if (item) {
    item.upvotes = (item.upvotes || 0) + 1;
    saveData(data);
  }
  res.json({ message: 'Upvoted' });
});

// Update Status / Balasan Admin
app.post('/api/laporan/update', (req, res) => {
  const { id, status, tanggapan } = req.body;
  const data = readData();
  const item = data.find(l => l.id == id);
  if (item) {
    item.status = status;
    item.tanggapan = tanggapan;
    item.isNew = false;
    saveData(data);
  }
  res.json({ message: 'Updated' });
});

// Hapus Laporan
app.post('/api/laporan/delete', (req, res) => {
  const { id } = req.body;
  let data = readData();
  data = data.filter(l => l.id != id);
  saveData(data);
  res.json({ message: 'Deleted' });
});

// Export CSV / Excel
app.get('/api/export/excel', (req, res) => {
  const data = readData();
  let csv = 'Kode Tiket,Kategori,Urgensi,Isi Pesan,Status,Tanggapan Sekolah,Dukungan,Tanggal\n';
  data.forEach(item => {
    const pesanClean = `"${(item.pesan || '').replace(/"/g, '""')}"`;
    const tanggapanClean = `"${(item.tanggapan || '').replace(/"/g, '""')}"`;
    csv += `${item.ticket},${item.kategori},${item.urgensi},${pesanClean},${item.status},${tanggapanClean},${item.upvotes || 0},${item.tanggal}\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=Rekap_Aspirasi_SMK_Walisongo2.csv');
  res.send(csv);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));
