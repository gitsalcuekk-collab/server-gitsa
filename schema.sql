DROP TABLE IF EXISTS aspirasi;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS agenda;
CREATE TABLE aspirasi (
  id INTEGER PRIMARY KEY, ticket TEXT, judul TEXT, kategori TEXT, uraian TEXT,
  lokasi TEXT DEFAULT '', nama TEXT DEFAULT 'Siswa', kelas TEXT DEFAULT '',
  anonim INTEGER DEFAULT 0, client_id TEXT, status TEXT DEFAULT 'Menunggu verifikasi',
  tanggapan TEXT DEFAULT '', foto TEXT DEFAULT '', komentar TEXT DEFAULT '[]'
);
CREATE TABLE votes (aspirasi_id INTEGER, client_id TEXT, PRIMARY KEY (aspirasi_id, client_id));
CREATE TABLE agenda (id INTEGER PRIMARY KEY, judul TEXT, tanggal TEXT, tempat TEXT);
INSERT INTO agenda VALUES
 (1,'Forum aspirasi bulanan OSIS','2026-10-23','Aula sekolah · 13.00 WIB'),
 (2,'Pemeriksaan sarana lab komputer','2026-10-30','Lab Komputer 2 · bersama teknisi');
