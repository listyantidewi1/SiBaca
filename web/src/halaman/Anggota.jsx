import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Anggota() {
  const [daftar, setDaftar] = useState([])
  const [pesan, setPesan] = useState('')

  const muat = () => api('/petugas/anggota').then(setDaftar)
  useEffect(() => { muat() }, [])

  async function aksi(a, apa) {
    try {
      const hasil = await api(`/petugas/anggota/${a.id}/${apa}`, {})
      setPesan(`${a.nama}: ${hasil.pesan}`)
    } catch (err) {
      setPesan(`${a.nama}: ${err.message}`)
    }
    muat()
  }

  return (
    <>
      <h2>Anggota</h2>
      {pesan && <p className="info">{pesan}</p>}
      <ul className="daftar">
        {daftar.map((a) => (
          <li key={a.id} className="kartu">
            <div>
              <b>{a.nama}</b>
              <p className="redup">NIS {a.nis} · {a.kelas || 'tanpa kelas'}</p>
              {a.aktif
                ? <span className="chip hijau">Aktif · meminjam {a.dipinjam} buku</span>
                : <span className="chip kuning">Menunggu persetujuan</span>}
            </div>
            {a.aktif
              ? <button className="tipis" onClick={() => aksi(a, 'nonaktifkan')}>Nonaktifkan</button>
              : <button onClick={() => aksi(a, 'setujui')}>Setujui</button>}
          </li>
        ))}
      </ul>
    </>
  )
}
