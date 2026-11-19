// Data contoh: petugas, beberapa anggota, dan koleksi buku. Jalankan: npm run contoh
import bcrypt from 'bcryptjs'
import { db } from '../server/db.js'
import { BUKU, SERI } from './daftar-buku.js'

const sandi = await bcrypt.hash('rahasia123', 10)
// Kosongkan dulu, dari tabel yang paling bergantung pada tabel lain.
for (const tabel of ['peminjaman', 'eksemplar', 'buku', 'pengguna']) {
  await db.query(`DELETE FROM ${tabel}`)
  await db.query(`ALTER TABLE ${tabel} AUTO_INCREMENT = 1`)
}
await db.query(
  `INSERT INTO pengguna (nama, nis, kelas, sandi_hash, peran, aktif) VALUES
   ('Bu Ratih', 'petugas', NULL, ?, 'petugas', TRUE),
   ('Raka Pratama', '2425011', 'XI RPL 1', ?, 'anggota', TRUE),
   ('Nadia Putri', '2425102', 'X-2', ?, 'anggota', TRUE),
   ('Bima Saputra', '2425140', 'X-4', ?, 'anggota', TRUE),
   ('Sari Wulandari', '2526007', 'X-1', ?, 'anggota', FALSE),
   ('Dodi Kurniawan', '2526019', 'X-3', ?, 'anggota', FALSE)`,
  Array(6).fill(sandi))

const semua = [...BUKU]
for (const [judul, penulis, kategori, n] of SERI) {
  for (let i = 1; i <= n; i++) semua.push([`${judul} ${i}`, penulis, kategori, 2015 + (i % 10), 1])
}
for (const [judul, penulis, kategori, tahun, jumlah] of semua) {
  const [b] = await db.query('INSERT INTO buku (judul, penulis, kategori, tahun) VALUES (?, ?, ?, ?)',
    [judul, penulis, kategori, tahun])
  for (let i = 1; i <= jumlah; i++) {
    await db.query('INSERT INTO eksemplar (buku_id, kode) VALUES (?, ?)',
      [b.insertId, `B${String(b.insertId).padStart(4, '0')}-${i}`])
  }
}
// Nadia sedang meminjam dua buku. Pinjaman Bima sudah lewat jatuh tempo.
async function pinjamkan(nis, judul, hariLalu) {
  const [[e]] = await db.query(
    `SELECT e.id FROM eksemplar e JOIN buku b ON b.id = e.buku_id
     WHERE b.judul = ? AND e.status = 'tersedia' LIMIT 1`, [judul])
  await db.query("UPDATE eksemplar SET status = 'dipinjam' WHERE id = ?", [e.id])
  await db.query(
    `INSERT INTO peminjaman (eksemplar_id, pengguna_id, tgl_pinjam, jatuh_tempo)
     SELECT ?, id, NOW() - INTERVAL ? DAY, CURDATE() - INTERVAL ? DAY + INTERVAL 7 DAY
     FROM pengguna WHERE nis = ?`, [e.id, hariLalu, hariLalu, nis])
}
await pinjamkan('2425102', 'Laskar Pelangi', 2)
await pinjamkan('2425102', 'Filosofi Teras', 3)
await pinjamkan('2425140', 'Bumi', 10)
const [[n]] = await db.query('SELECT COUNT(*) AS buku FROM buku')
console.log(`Data contoh siap: ${n.buku} judul buku. Kata sandi semua akun: rahasia123`)
await db.end()
