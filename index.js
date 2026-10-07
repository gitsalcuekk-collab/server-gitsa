const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let laporanList = [
  {
    id: 1,
    kategori: 'Fasilitas Sekolah',
    urgensi: 'Penting',
    pesan: 'Proyektor di kelas 11 RPL mati total saat jam pelajaran.',
    status: 'Diproses',
    tanggapan: 'Terima kasih, teknisi sarpras akan mengecek ke lokasi hari ini.',
    foto: '',
    tanggal: '07/10/2026, 08:30:00'
  }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/laporan', (req, res) => res.json(laporanList));

app.post('/api/laporan', (req, res) => {
  const { kategori, urgensi, pesan, foto } = req.body;
  const newLaporan = {
    id: Date.now(),
    kategori,
    urgensi: urgensi || 'Biasa',
    pesan,
    foto: foto || '',
    status: 'Diproses',
    tanggapan: '',
    tanggal: new Date().toLocaleString('id-ID')
  };
  laporanList.unshift(newLaporan);
  res.json({ message: 'Success' });
});

app.post('/api/laporan/update', (req, res) => {
  const { id, status, tanggapan } = req.body;
  const item = laporanList.find(l => l.id == id);
  if (item) {
    item.status = status;
    item.tanggapan = tanggapan;
  }
  res.json({ message: 'Updated' });
});

app.post('/api/laporan/delete', (req, res) => {
  const { id } = req.body;
  laporanList = laporanList.filter(l => l.id != id);
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
