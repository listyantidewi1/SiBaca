-- SiBaca: perpustakaan sekolah
DROP TABLE IF EXISTS peminjaman, eksemplar, buku, pengguna;

CREATE TABLE pengguna (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nis VARCHAR(20) NOT NULL UNIQUE,
  kelas VARCHAR(20) NULL,
  sandi_hash VARCHAR(100) NOT NULL,
  peran ENUM('anggota', 'petugas') NOT NULL DEFAULT 'anggota',
  aktif BOOLEAN NOT NULL DEFAULT FALSE,
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buku (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  penulis VARCHAR(120) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  tahun SMALLINT NULL,
  INDEX (kategori),
  INDEX (judul)
);

CREATE TABLE eksemplar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buku_id INT NOT NULL,
  kode VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('tersedia', 'dipinjam', 'hilang') NOT NULL DEFAULT 'tersedia',
  FOREIGN KEY (buku_id) REFERENCES buku(id),
  INDEX (buku_id, status)
);

CREATE TABLE peminjaman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eksemplar_id INT NOT NULL,
  pengguna_id INT NOT NULL,
  tgl_pinjam DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jatuh_tempo DATE NOT NULL,
  tgl_kembali DATETIME NULL,
  FOREIGN KEY (eksemplar_id) REFERENCES eksemplar(id),
  FOREIGN KEY (pengguna_id) REFERENCES pengguna(id),
  INDEX (pengguna_id, tgl_kembali)
);
