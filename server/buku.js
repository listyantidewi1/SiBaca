import { Router } from 'express'
import { db } from './db.js'
import { perluLogin } from './auth.js'

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
