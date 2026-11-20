import express from 'express'
import cookieSession from 'cookie-session'
import path from 'node:path'
import { auth } from './auth.js'
import { buku } from './buku.js'
import { pinjam } from './pinjam.js'
import { petugas } from './petugas.js'

const app = express()
app.use(express.json())
app.use(cookieSession({
  name: 'sibaca',
  keys: [process.env.SESSION_SECRET],
  maxAge: 8 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax'
}))

app.use('/api/auth', auth)
app.use('/api/buku', buku)
app.use('/api/pinjam', pinjam)
app.use('/api/petugas', petugas)
app.use('/api', (req, res) => res.status(404).json({ pesan: 'Alamat API tidak ada' }))

// Hasil build React disajikan oleh server yang sama, tanpa internet.
const dist = path.resolve('web/dist')
app.use(express.static(dist))
app.get('/{*semua}', (req, res) => res.sendFile(path.join(dist, 'index.html')))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ pesan: 'Terjadi kesalahan di server' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`SiBaca berjalan di port ${port}`))
