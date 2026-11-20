import { Router } from 'express'
import { db } from './db.js'
import { perluLogin, perluPetugas } from './auth.js'

export const pinjam = Router()
const BATAS = 3
const LAMA_HARI = 7
class Tolak extends Error {}

pinjam.post('/', perluLogin, async (req, res) => {
  const kon = await db.getConnection()
  try {
    await kon.beginTransaction()
    // Kunci baris pengguna: dua permintaan pinjam dari orang yang sama harus antre.
    await kon.query('SELECT id FROM pengguna WHERE id = ? FOR UPDATE', [req.pengguna.id])
    const [[hitung]] = await kon.query(
      `SELECT COUNT(*) AS aktif, SUM(jatuh_tempo < CURDATE()) AS terlambat
       FROM peminjaman WHERE pengguna_id = ? AND tgl_kembali IS NULL`,
      [req.pengguna.id])
    if (hitung.terlambat > 0) throw new Tolak('Kembalikan dulu buku yang terlambat')
    if (hitung.aktif >= BATAS) throw new Tolak(`Batas pinjam ${BATAS} buku`)
    const [[eks]] = await kon.query(
      `SELECT id, kode FROM eksemplar WHERE buku_id = ? AND status = 'tersedia'
       LIMIT 1 FOR UPDATE`,
      [req.body.buku_id])
    if (!eks) throw new Tolak('Semua eksemplar sedang dipinjam')
    await kon.query("UPDATE eksemplar SET status = 'dipinjam' WHERE id = ?", [eks.id])
    await kon.query(
      `INSERT INTO peminjaman (eksemplar_id, pengguna_id, jatuh_tempo)
       VALUES (?, ?, CURDATE() + INTERVAL ? DAY)`,
      [eks.id, req.pengguna.id, LAMA_HARI])
    await kon.commit()
    res.status(201).json({ pesan: `Ambil buku berkode ${eks.kode} di rak`, kode: eks.kode })
  } catch (e) {
    await kon.rollback()
    if (e instanceof Tolak) return res.status(409).json({ pesan: e.message })
    throw e
  } finally {
    kon.release()
  }
})

pinjam.get('/saya', perluLogin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, b.judul, e.kode, p.tgl_pinjam, p.jatuh_tempo, p.tgl_kembali,
       (p.tgl_kembali IS NULL AND p.jatuh_tempo < CURDATE()) AS terlambat
     FROM peminjaman p
     JOIN eksemplar e ON e.id = p.eksemplar_id
     JOIN buku b ON b.id = e.buku_id
     WHERE p.pengguna_id = ?
     ORDER BY p.tgl_kembali IS NULL DESC, p.tgl_pinjam DESC
     LIMIT 20`,
    [req.pengguna.id])
  res.json(rows)
})

// Pengembalian dicatat petugas di meja perpustakaan, berdasarkan kode di label buku.
pinjam.post('/kembali', perluLogin, perluPetugas, async (req, res) => {
  const kon = await db.getConnection()
  try {
    await kon.beginTransaction()
    const [[p]] = await kon.query(
      `SELECT p.id, p.eksemplar_id FROM peminjaman p
       JOIN eksemplar e ON e.id = p.eksemplar_id
       WHERE e.kode = ? AND p.tgl_kembali IS NULL FOR UPDATE`,
      [req.body.kode])
    if (!p) throw new Tolak('Tidak ada pinjaman aktif untuk kode ini')
    await kon.query('UPDATE peminjaman SET tgl_kembali = NOW() WHERE id = ?', [p.id])
    await kon.query("UPDATE eksemplar SET status = 'tersedia' WHERE id = ?", [p.eksemplar_id])
    await kon.commit()
    res.json({ pesan: 'Buku sudah kembali' })
  } catch (e) {
    await kon.rollback()
    if (e instanceof Tolak) return res.status(404).json({ pesan: e.message })
    throw e
  } finally {
    kon.release()
  }
})
