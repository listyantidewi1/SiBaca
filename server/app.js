import express from 'express'
import { buku } from './buku.js'

const app = express()
app.use(express.json())

app.use('/api/buku', buku)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`SiBaca berjalan di port ${port}`))
