import { useEffect, useState } from 'react'
import { api, tanggal } from '../api.js'

export default function Petugas() {
  const [daftar, setDaftar] = useState([])
  const [kode, setKode] = useState('')
  const [pesan, setPesan] = useState('')

  const muat = () => api('/petugas/peminjaman').then(setDaftar)
  useEffect(() => { muat() }, [])

  async function kembalikan(k) {
    try {
      const hasil = await api('/pinjam/kembali', { kode: k })
      setPesan(`${k}: ${hasil.pesan}`)
      setKode('')
    } catch (err) {
      setPesan(`${k}: ${err.message}`)
    }
    muat()
  }

  return (
    <>
      <form className="saring" onSubmit={(e) => { e.preventDefault(); kembalikan(kode.trim()) }}>
        <input placeholder="Kode di label buku, misalnya B0001-2" value={kode} onChange={(e) => setKode(e.target.value)} />
        <button>Catat pengembalian</button>
      </form>
      {pesan && <p className="info">{pesan}</p>}
      <h2>Sedang dipinjam ({daftar.length})</h2>
      <ul className="daftar">
        {daftar.map((p) => (
          <li key={p.id} className="kartu">
            <div>
              <b>{p.judul}</b>
              <p className="redup">{p.kode} · {p.nama} ({p.kelas})</p>
              <span className={p.telat_hari > 0 ? 'chip merah' : 'chip hijau'}>
                {p.telat_hari > 0 ? `Terlambat ${p.telat_hari} hari` : `Jatuh tempo ${tanggal(p.jatuh_tempo)}`}
              </span>
            </div>
            <button className="tipis" onClick={() => kembalikan(p.kode)}>Kembali</button>
          </li>
        ))}
      </ul>
    </>
  )
}
