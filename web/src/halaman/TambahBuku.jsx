import { useState } from 'react'
import { api } from '../api.js'

const KOSONG = { judul: '', penulis: '', kategori: '', tahun: '', jumlah: 1 }

export default function TambahBuku({ setelahSimpan }) {
  const [isi, setIsi] = useState(KOSONG)
  const [pesan, setPesan] = useState('')
  const ubah = (e) => setIsi({ ...isi, [e.target.name]: e.target.value })

  async function kirim(e) {
    e.preventDefault()
    try {
      const hasil = await api('/buku', isi)
      setPesan(`Tersimpan. Tempel label ${hasil.kode.join(', ')} di bukunya.`)
      setIsi(KOSONG)
      setelahSimpan()
    } catch (err) {
      setPesan(err.message)
    }
  }

  return (
    <form className="kartu tambah" onSubmit={kirim}>
      <h2>Tambah buku</h2>
      <label>Judul <input name="judul" value={isi.judul} onChange={ubah} /></label>
      <label>Penulis <input name="penulis" value={isi.penulis} onChange={ubah} /></label>
      <label>Kategori <input name="kategori" value={isi.kategori} onChange={ubah} /></label>
      <label>Tahun <input name="tahun" type="number" value={isi.tahun} onChange={ubah} /></label>
      <label>Jumlah eksemplar <input name="jumlah" type="number" min="1" max="50" value={isi.jumlah} onChange={ubah} /></label>
      <button>Simpan</button>
      {pesan && <p className="info">{pesan}</p>}
    </form>
  )
}
