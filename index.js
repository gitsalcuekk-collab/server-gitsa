const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let laporanList = [
  {
    id: 1,
    kategori: 'Fasilitas Sekolah',
    pesan: 'AC kelas kurang dingin pak/bu.',
    status: 'Diproses',
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
      <title>Aspirasi SMK Walisongo 2 Gempol</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-100 p-6">
      <div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 class="text-xl font-bold text-indigo-600 mb-4 text-center">Aspirasi SMK Walisongo 2 Gempol</h1>
        
        <form id="formP" class="space-y-3 mb-6">
          <select id="kategori" class="w-full border p-2 rounded text-sm">
            <option value="Fasilitas Sekolah">Fasilitas Sekolah</option>
            <option value="Keamanan & Bullying">Keamanan & Bullying</option>
            <option value="Saran & Masukan">Saran & Masukan</option>
          </select>
          <textarea id="pesan" class="w-full border p-2 rounded text-sm" placeholder="Tuliskan aspirasimu..." required></textarea>
          <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold">Kirim Aspirasi</button>
        </form>

        <h2 class="font-bold text-slate-700 mb-2">Daftar Laporan:</h2>
        <div id="list" class="space-y-2"></div>
      </div>

      <script>
        async function load() {
          const res = await fetch('/api/laporan');
          const data = await res.json();
          const list = document.getElementById('list');
          list.innerHTML = '';
          data.forEach(i => {
            list.innerHTML += \`
              <div class="p-3 bg-slate-50 border rounded text-xs">
                <div class="font-bold text-indigo-600">\${i.kategori} <span class="text-slate-400 font-normal">(\${i.tanggal})</span></div>
                <p class="mt-1">\${i.pesan}</p>
              </div>
            \`;
          });
        }

        document.getElementById('formP').addEventListener('submit', async (e) => {
          e.preventDefault();
          const kategori = document.getElementById('kategori').value;
          const pesan = document.getElementById('pesan').value;
          await fetch('/api/laporan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kategori, pesan })
          });
          document.getElementById('pesan').value = '';
          load();
        });

        load();
      </script>
    </body>
    </html>
  `);
});

app.get('/api/laporan', (req, res) => res.json(laporanList));

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
  res.json({ message: 'Success' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
