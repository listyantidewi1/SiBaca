import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.js'

export default function Masuk({ setelahMasuk }) {
  const [nis, setNis] = useState('')
  const [sandi, setSandi] = useState('')
  const [galat, setGalat] = useState('')

  async function kirim(e) {
    e.preventDefault()
    setGalat('')
    try {
      setelahMasuk(await api('/auth/masuk', { nis, sandi }))
    } catch (err) {
      setGalat(err.message)
    }
  }

  return (
    <form className="kartu sempit" onSubmit={kirim}>
      <h1>SiBaca</h1>
      <p className="redup">Perpustakaan SMK Nusa Bakti</p>
      <label>NIS
        <input value={nis} onChange={(e) => setNis(e.target.value)} autoFocus />
      </label>
      <label>Kata sandi
        <input type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} />
      </label>
      {galat && <p className="galat">{galat}</p>}
      <button>Masuk</button>
      <p className="redup">Belum punya akun? <Link to="/daftar">Daftar</Link></p>
    </form>
  )
}
