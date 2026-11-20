import { Router } from 'express'
import { db } from './db.js'
import { perluLogin, perluPetugas } from './auth.js'

export const buku = Router()

// Tanda % dan _ punya arti khusus di LIKE, jadi diberi garis miring dulu.
function pola(teks) {
  return '%' + teks.replace(/[\\%_]/g, (c) => '\\' + c) + '%'
}

buku.get('/', perluLogin, async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 50)
  const kategori = String(req.query.kategori || '')
  let sql = `SELECT b.id, b.judul, b.penulis, b.kategori, b.tahun,
      SUM(e.status = 'tersedia') AS tersedia, COUNT(e.id) AS jumlah
    FROM buku b JOIN eksemplar e ON e.buku_id = b.id AND e.status <> 'hilang'
    WHERE (b.judul LIKE ? OR b.penulis LIKE ?)`
  const isi = [pola(q), pola(q)]
  if (kategori) {
    sql += ' AND b.kategori = ?'
    isi.push(kategori)
  }
  sql += ' GROUP BY b.id'
  if (req.query.tersedia === '1') sql += ' HAVING tersedia > 0'
  sql += ' ORDER BY b.judul LIMIT 20'
  const [rows] = await db.query(sql, isi)
  res.json(rows)
})

buku.get('/kategori', perluLogin, async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT kategori FROM buku ORDER BY kategori')
  res.json(rows.map((r) => r.kategori))
})

// Petugas menambah judul baru sekaligus beberapa eksemplarnya.
buku.post('/', perluLogin, perluPetugas, async (req, res) => {
  const { judul, penulis, kategori, tahun } = req.body
  const jumlah = Number(req.body.jumlah)
  if (!judul || !penulis || !kategori || !(jumlah >= 1 && jumlah <= 50)) {
    return res.status(400).json({ pesan: 'Judul, penulis, kategori, dan jumlah (1 sampai 50) wajib diisi' })
  }
  const kon = await db.getConnection()
  try {
    await kon.beginTransaction()
    const [hasil] = await kon.query(
      'INSERT INTO buku (judul, penulis, kategori, tahun) VALUES (?, ?, ?, ?)',
      [judul, penulis, kategori, tahun || null])
    const kode = []
    for (let i = 1; i <= jumlah; i++) {
      kode.push(`B${String(hasil.insertId).padStart(4, '0')}-${i}`)
    }
    await kon.query('INSERT INTO eksemplar (buku_id, kode) VALUES ?',
      [kode.map((k) => [hasil.insertId, k])])
    await kon.commit()
    res.status(201).json({ id: hasil.insertId, kode })
  } catch (e) {
    await kon.rollback()
    throw e
  } finally {
    kon.release()
  }
})
