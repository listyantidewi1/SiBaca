import { Router } from 'express'
import { db } from './db.js'

export const buku = Router()

buku.get('/', async (req, res) => {
  const q = String(req.query.q || '')
  const [rows] = await db.query(
    `SELECT b.id, b.judul, b.penulis, b.kategori, b.tahun,
      SUM(e.status = 'tersedia') AS tersedia, COUNT(e.id) AS jumlah
    FROM buku b JOIN eksemplar e ON e.buku_id = b.id AND e.status <> 'hilang'
    WHERE b.judul LIKE ?
    GROUP BY b.id ORDER BY b.judul`,
    ['%' + q + '%'])
  res.json(rows)
})
