import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Katalog({ pengguna }) {
  const [buku, setBuku] = useState([])
  const [status, setStatus] = useState('memuat')

  useEffect(() => {
    api('/buku')
      .then((data) => { setBuku(data); setStatus('siap') })
      .catch(() => setStatus('gagal'))
  }, [])

  return (
    <>
      {status === 'memuat' && <p className="tengah">Memuat…</p>}
      {status === 'gagal' && <p className="galat">Server tidak bisa dihubungi. Coba lagi sebentar.</p>}
      <ul className="daftar">
        {buku.map((b) => (
          <li key={b.id} className="kartu">
            <div>
              <b>{b.judul}</b>
              <p className="redup">{b.penulis} · {b.kategori}{b.tahun ? ` · ${b.tahun}` : ''}</p>
              <span className={b.tersedia > 0 ? 'chip hijau' : 'chip abu'}>
                {b.tersedia > 0 ? `${b.tersedia} dari ${b.jumlah} tersedia` : 'Sedang dipinjam semua'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
