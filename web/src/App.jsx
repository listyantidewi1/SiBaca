import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router'
import { api } from './api.js'
import Masuk from './halaman/Masuk.jsx'
import Daftar from './halaman/Daftar.jsx'
import Katalog from './halaman/Katalog.jsx'

export default function App() {
  const [pengguna, setPengguna] = useState(undefined)

  useEffect(() => {
    api('/auth/saya').then(setPengguna).catch(() => setPengguna(null))
  }, [])

  async function keluar() {
    await api('/auth/keluar', {})
    setPengguna(null)
  }

  if (pengguna === undefined) return <p className="tengah">Memuat…</p>

  if (!pengguna) {
    return (
      <Routes>
        <Route path="/daftar" element={<Daftar />} />
        <Route path="*" element={<Masuk setelahMasuk={setPengguna} />} />
      </Routes>
    )
  }

  return (
    <>
      <header>
        <b className="merek">SiBaca</b>
        <nav>
          <NavLink to="/">Katalog</NavLink>
        </nav>
        <button className="tipis" onClick={keluar}>Keluar</button>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Katalog pengguna={pengguna} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  )
}
