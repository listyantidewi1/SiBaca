import express from 'express'
import cookieSession from 'cookie-session'
import { auth } from './auth.js'
import { buku } from './buku.js'

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

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ pesan: 'Terjadi kesalahan di server' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`SiBaca berjalan di port ${port}`))
