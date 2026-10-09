CREATE TABLE IF NOT EXISTS aspirasi (
  id INTEGER PRIMARY KEY,
  ticket TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Umum',
  urgensi TEXT NOT NULL DEFAULT 'Biasa',
  pesan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Menunggu',
  tanggapan TEXT NOT NULL DEFAULT '',
  foto TEXT NOT NULL DEFAULT '',
  upvotes INTEGER NOT NULL DEFAULT 0,
  komentar TEXT NOT NULL DEFAULT '[]',
  tanggal TEXT NOT NULL
);

INSERT OR IGNORE INTO aspirasi
  (id, ticket, kategori, urgensi, pesan, status, tanggapan, foto, upvotes, komentar, tanggal)
VALUES
  (1, 'ASP-101', 'Fasilitas Sekolah', 'Penting',
   'Proyektor di kelas 11 RPL mati total saat jam pelajaran.',
   'Diproses',
   'Terima kasih, teknisi sarpras akan mengecek ke lokasi hari ini.',
   '', 3, '["Tolong dikirim teknisi secepatnya ya pak."]', '2026-10-08');
