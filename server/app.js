import express from 'express'

const app = express()

app.get('/api/halo', (req, res) => {
  res.json({ pesan: 'Halo dari SiBaca' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`SiBaca berjalan di port ${port}`))
