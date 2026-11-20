import { useEffect, useState } from 'react'
import { api, tanggal } from '../api.js'

export default function Pinjaman() {
  const [daftar, setDaftar] = useState(null)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    api('/pinjam/saya').then(setDaftar).catch((err) => setGalat(err.message))
  }, [])

  if (galat) return <p className="galat">{galat}</p>
  if (!daftar) return <p className="tengah">Memuat…</p>
  if (daftar.length === 0) return <p className="tengah">Kamu belum pernah meminjam buku.</p>

  return (
    <ul className="daftar">
      {daftar.map((p) => (
        <li key={p.id} className="kartu">
          <div>
            <b>{p.judul}</b>
            <p className="redup">Kode {p.kode} · dipinjam {tanggal(p.tgl_pinjam)}</p>
            {p.tgl_kembali
              ? <span className="chip abu">Sudah kembali</span>
              : <span className={p.terlambat ? 'chip merah' : 'chip hijau'}>
                  {p.terlambat ? 'Terlambat! ' : ''}Kembalikan paling lambat {tanggal(p.jatuh_tempo)}
                </span>}
          </div>
        </li>
      ))}
    </ul>
  )
}
