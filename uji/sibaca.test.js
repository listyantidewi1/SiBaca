// Uji lewat pintu yang sama dengan pemakai: permintaan HTTP ke server yang sedang berjalan.
// Sebelum menjalankan: npm run contoh (supaya datanya seperti semula), lalu npm test.
import test from 'node:test'
import assert from 'node:assert/strict'

const ALAMAT = 'http://localhost:3000/api'

async function kirim(alamat, isi, cookie = '') {
  const res = await fetch(ALAMAT + alamat, {
    method: isi ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: isi ? JSON.stringify(isi) : undefined
  })
  return { status: res.status, data: await res.json(), res }
}

async function masuk(nis) {
  const { res } = await kirim('/auth/masuk', { nis, sandi: 'rahasia123' })
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
}

test('pendaftar tidak bisa memilih peran sendiri', async () => {
  const nis = 'uji' + Date.now()
  await kirim('/auth/daftar', { nama: 'Iseng', nis, sandi: 'cobacoba1', peran: 'petugas', aktif: true })
  const hasil = await kirim('/auth/masuk', { nis, sandi: 'cobacoba1' })
  assert.equal(hasil.status, 403)
})

test('anggota tidak bisa membuka data petugas', async () => {
  const nadia = await masuk('2425102')
  const hasil = await kirim('/petugas/anggota', null, nadia)
  assert.equal(hasil.status, 403)
})

test('pinjaman keempat ditolak server', async () => {
  const nadia = await masuk('2425102')
  const ketiga = await kirim('/pinjam', { buku_id: 5 }, nadia)
  assert.equal(ketiga.status, 201)
  const keempat = await kirim('/pinjam', { buku_id: 6 }, nadia)
  assert.equal(keempat.status, 409)
})

test('tanda persen dicari sebagai huruf biasa', async () => {
  const nadia = await masuk('2425102')
  const hasil = await kirim('/buku?q=%25', null, nadia)
  assert.equal(hasil.data.length, 1)
})
