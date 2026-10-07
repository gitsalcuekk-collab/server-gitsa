const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simpan data di memory (array)
let laporanList = [];

// Serve file HTML statis
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aspirasi & Pengaduan Siswa</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-6">
      <div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4 text-blue-600">Portal Pengaduan Siswa (Anonim)</h1>
        
        <!-- Form Kirim Laporan -->
        <form id="formPengaduan" class="mb-8 space-y-4">
          <div>
            <label class="block font-medium">Kategori:</label>
            <select id="kategori" class="w-full border p-2 rounded">
              <option value="Fasilitas Sekolah">Fasilitas Sekolah</option>
              <option value="Keamanan & Bullying">Keamanan & Bullying</option>
              <option value="Saran & Masukan">Saran & Masukan</option>
            </select>
          </div>
          <div>
            <label class="block font-medium">Isi Laporan / Aspirasi:</label>
            <textarea id="pesan" class="w-full border p-2 rounded" rows="4" required placeholder="Tuliskan laporanmu secara jujur, identitasmu aman/anonim..."></textarea>
          </div>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Kirim Laporan</button>
        </form>

        <hr class="my-6">

        <h2 class="text-xl font-bold mb-4 text-gray-800">Daftar Laporan Terkini</h2>
        <div id="daftarLaporan" class="space-y-3"></div>
      </div>

      <script>
        async function loadLaporan() {
          const res = await fetch('/api/laporan');
          const data = await res.json();
          const container = document.getElementById('daftarLaporan');
          container.innerHTML = '';
          
          data.forEach(item => {
            const statusColor = item.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            container.innerHTML += \`
              <div class="border p-4 rounded bg-gray-50">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-sm text-blue-600">\${item.kategori}</span>
                  <span class="text-xs px-2 py-1 rounded \${statusColor}">\${item.status}</span>
                </div>
                <p class="text-gray-700">\${item.pesan}</p>
                <small class="text-gray-400 block mt-2">Dikirim: \${item.tanggal}</small>
              </div>
            \`;
          });
        }

        document.getElementById('formPengaduan').addEventListener('submit', async (e) => {
          e.preventDefault();
          const kategori = document.getElementById('kategori').value;
          const pesan = document.getElementById('pesan').value;

          await fetch('/api/laporan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kategori, pesan })
          });

          document.getElementById('pesan').value = '';
          loadLaporan();
        });

        loadLaporan();
      </script>
    </body>
    </html>
  `);
});

// API Get Semua Laporan
app.get('/api/laporan', (req, res) => {
  res.json(laporanList);
});

// API Tambah Laporan Baru
app.post('/api/laporan', (req, res) => {
  const { kategori, pesan } = req.body;
  const newLaporan = {
    id: Date.now(),
    kategori,
    pesan,
    status: 'Diproses',
    tanggal: new Date().toLocaleString('id-ID')
  };
  laporanList.unshift(newLaporan);
  res.json({ message: 'Laporan berhasil dikirim!', data: newLaporan });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
