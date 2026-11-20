import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Katalog({ pengguna }) {
  const [q, setQ] = useState('')
  const [kategori, setKategori] = useState('')
  const [tersedia, setTersedia] = useState(false)
  const [daftarKategori, setDaftarKategori] = useState([])
  const [buku, setBuku] = useState([])
  const [status, setStatus] = useState('memuat')
  const [pesan, setPesan] = useState('')
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    api('/buku/kategori').then(setDaftarKategori).catch(() => {})
  }, [])

  // Tunggu 300 milidetik setelah ketikan terakhir, baru bertanya ke server.
  useEffect(() => {
    let batal = false
    const jeda = setTimeout(() => {
      const param = new URLSearchParams({ q, kategori, tersedia: tersedia ? '1' : '' })
      api('/buku?' + param)
        .then((data) => { if (!batal) { setBuku(data); setStatus('siap') } })
        .catch(() => { if (!batal) setStatus('gagal') })
    }, 300)
    return () => { batal = true; clearTimeout(jeda) }
  }, [q, kategori, tersedia, muatUlang])

  async function pinjam(b) {
    try {
      const hasil = await api('/pinjam', { buku_id: b.id })
      setPesan(`${b.judul}: ${hasil.pesan}`)
    } catch (err) {
      setPesan(`${b.judul}: ${err.message}`)
    }
    setMuatUlang((n) => n + 1)
  }

  return (
    <>
      <div className="saring">
        <input placeholder="Cari judul atau penulis…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
          <option value="">Semua kategori</option>
          {daftarKategori.map((k) => <option key={k}>{k}</option>)}
        </select>
        <label className="centang">
          <input type="checkbox" checked={tersedia} onChange={(e) => setTersedia(e.target.checked)} />
          Hanya yang tersedia
        </label>
      </div>
      {pesan && <p className="info" onClick={() => setPesan('')}>{pesan}</p>}
      {status === 'memuat' && <p className="tengah">Memuat…</p>}
      {status === 'gagal' && <p className="galat">Server tidak bisa dihubungi. Coba lagi sebentar.</p>}
      {status === 'siap' && buku.length === 0 && <p className="tengah">Tidak ada buku yang cocok.</p>}
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
            {pengguna.peran === 'anggota' && (
              <button disabled={b.tersedia === 0} onClick={() => pinjam(b)}>Pinjam</button>
            )}
          </li>
        ))}
      </ul>
      {status === 'siap' && buku.length === 20 && (
        <p className="redup tengah">Menampilkan 20 buku pertama. Ketik kata kunci untuk mempersempit.</p>
      )}
    </>
  )
}
