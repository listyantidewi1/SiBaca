import { Router } from 'express'
import { db } from './db.js'
import { perluLogin, perluPetugas } from './auth.js'

export const petugas = Router()
petugas.use(perluLogin, perluPetugas)

petugas.get('/anggota', async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.nama, u.nis, u.kelas, u.aktif,
       COUNT(p.id) AS dipinjam
     FROM pengguna u
     LEFT JOIN peminjaman p ON p.pengguna_id = u.id AND p.tgl_kembali IS NULL
     WHERE u.peran = 'anggota'
     GROUP BY u.id
     ORDER BY u.aktif, u.nama`)
  res.json(rows)
})

petugas.post('/anggota/:id/setujui', async (req, res) => {
  await db.query("UPDATE pengguna SET aktif = TRUE WHERE id = ? AND peran = 'anggota'", [req.params.id])
  res.json({ pesan: 'Anggota disetujui' })
})

// Anggota yang masih memegang buku tidak boleh dinonaktifkan; riwayatnya tetap disimpan.
petugas.post('/anggota/:id/nonaktifkan', async (req, res) => {
  const [[h]] = await db.query(
    'SELECT COUNT(*) AS n FROM peminjaman WHERE pengguna_id = ? AND tgl_kembali IS NULL',
    [req.params.id])
  if (h.n > 0) return res.status(409).json({ pesan: `Masih meminjam ${h.n} buku` })
  await db.query("UPDATE pengguna SET aktif = FALSE WHERE id = ? AND peran = 'anggota'", [req.params.id])
  res.json({ pesan: 'Anggota dinonaktifkan' })
})

petugas.get('/peminjaman', async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, u.nama, u.kelas, b.judul, e.kode, p.tgl_pinjam, p.jatuh_tempo,
       DATEDIFF(CURDATE(), p.jatuh_tempo) AS telat_hari
     FROM peminjaman p
     JOIN pengguna u ON u.id = p.pengguna_id
     JOIN eksemplar e ON e.id = p.eksemplar_id
     JOIN buku b ON b.id = e.buku_id
     WHERE p.tgl_kembali IS NULL
     ORDER BY p.jatuh_tempo`)
  res.json(rows)
})
