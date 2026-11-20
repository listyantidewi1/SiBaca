import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.js'

export default function Daftar() {
  const [isi, setIsi] = useState({ nama: '', nis: '', kelas: '', sandi: '' })
  const [pesan, setPesan] = useState('')
  const [galat, setGalat] = useState('')
  const ubah = (e) => setIsi({ ...isi, [e.target.name]: e.target.value })

  async function kirim(e) {
    e.preventDefault()
    setGalat('')
    try {
      const hasil = await api('/auth/daftar', isi)
      setPesan(hasil.pesan)
    } catch (err) {
      setGalat(err.message)
    }
  }

  if (pesan) {
    return (
      <div className="kartu sempit">
        <h1>Terima kasih</h1>
        <p>{pesan}</p>
        <Link to="/">Kembali ke halaman masuk</Link>
      </div>
    )
  }

  return (
    <form className="kartu sempit" onSubmit={kirim}>
      <h1>Daftar anggota</h1>
      <label>Nama lengkap <input name="nama" value={isi.nama} onChange={ubah} /></label>
      <label>NIS <input name="nis" value={isi.nis} onChange={ubah} /></label>
      <label>Kelas <input name="kelas" value={isi.kelas} onChange={ubah} /></label>
      <label>Kata sandi (minimal 8 huruf)
        <input name="sandi" type="password" value={isi.sandi} onChange={ubah} />
      </label>
      {galat && <p className="galat">{galat}</p>}
      <button>Kirim pendaftaran</button>
      <p className="redup">Sudah punya akun? <Link to="/">Masuk</Link></p>
    </form>
  )
}
