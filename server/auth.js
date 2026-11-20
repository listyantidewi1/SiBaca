import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from './db.js'

export const auth = Router()

// Siapa yang sedang login? Selalu dibaca ulang dari database.
async function penggunaAktif(id) {
  const [rows] = await db.query(
    'SELECT id, nama, nis, kelas, peran FROM pengguna WHERE id = ? AND aktif = TRUE',
    [id])
  return rows[0] || null
}

export async function perluLogin(req, res, next) {
  req.pengguna = req.session.id_pengguna ? await penggunaAktif(req.session.id_pengguna) : null
  if (!req.pengguna) return res.status(401).json({ pesan: 'Silakan login dulu' })
  next()
}

export function perluPetugas(req, res, next) {
  if (req.pengguna.peran !== 'petugas') return res.status(403).json({ pesan: 'Khusus petugas' })
  next()
}

auth.post('/daftar', async (req, res) => {
  const { nama, nis, kelas, sandi } = req.body
  if (!nama || !nis || !sandi || sandi.length < 8) {
    return res.status(400).json({ pesan: 'Nama, NIS, dan kata sandi (minimal 8 huruf) wajib diisi' })
  }
  const hash = await bcrypt.hash(sandi, 10)
  try {
    // peran dan aktif tidak diambil dari form: selalu anggota dan menunggu persetujuan
    await db.query(
      'INSERT INTO pengguna (nama, nis, kelas, sandi_hash) VALUES (?, ?, ?, ?)',
      [nama, nis, kelas || null, hash])
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ pesan: 'NIS sudah terdaftar' })
    throw e
  }
  res.status(201).json({ pesan: 'Pendaftaran terkirim. Tunggu persetujuan petugas.' })
})

auth.post('/masuk', async (req, res) => {
  const { nis, sandi } = req.body
  const [rows] = await db.query('SELECT id, sandi_hash, aktif FROM pengguna WHERE nis = ?', [nis])
  const p = rows[0]
  if (!p || !(await bcrypt.compare(String(sandi), p.sandi_hash))) {
    return res.status(401).json({ pesan: 'NIS atau kata sandi salah' })
  }
  if (!p.aktif) return res.status(403).json({ pesan: 'Akunmu menunggu persetujuan petugas' })
  req.session.id_pengguna = p.id
  res.json(await penggunaAktif(p.id))
})

auth.post('/keluar', (req, res) => {
  req.session = null
  res.json({ pesan: 'Sampai jumpa' })
})

auth.get('/saya', perluLogin, (req, res) => res.json(req.pengguna))
