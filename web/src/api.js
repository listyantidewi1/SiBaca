// Satu pintu untuk semua permintaan ke server.
// Alamatnya relatif (/api/...), jadi browser memakai alamat tempat halaman ini dibuka.
export async function api(alamat, isi) {
  const res = await fetch('/api' + alamat, {
    method: isi ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: isi ? JSON.stringify(isi) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.pesan || 'Terjadi kesalahan')
  return data
}
