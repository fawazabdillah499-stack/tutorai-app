# 🚀 PANDUAN DEPLOY TUTORAI.ID
## Dari Nol sampai Online di Internet — Step by Step

---

## TOTAL WAKTU: ~1 jam
## TOTAL BIAYA: Rp 0 (semua free tier) + domain ~Rp 150rb/tahun (opsional)

---

## LANGKAH 1: Setup Supabase (Database + Auth)
*Waktu: ~15 menit*

1. Buka **supabase.com** → klik "Start your project"
2. Daftar dengan GitHub atau Google
3. Klik **"New Project"**
   - Name: `tutorai`
   - Database password: buat yang kuat, simpan!
   - Region: **Southeast Asia (Singapore)**
4. Tunggu ~2 menit sampai project ready

5. **Setup database:**
   - Buka menu kiri → **SQL Editor**
   - Copy-paste semua isi file `SUPABASE_SCHEMA.sql`
   - Klik **Run** (tombol hijau)
   - Pastikan muncul "Success"

6. **Ambil API keys:**
   - Menu kiri → **Project Settings** → **API**
   - Copy:
     - `Project URL` → ini NEXT_PUBLIC_SUPABASE_URL
     - `anon public` key → ini NEXT_PUBLIC_SUPABASE_ANON_KEY
     - `service_role` key → ini SUPABASE_SERVICE_ROLE_KEY

---

## LANGKAH 2: Dapatkan Anthropic API Key
*Waktu: ~5 menit*

1. Buka **console.anthropic.com**
2. Login atau daftar
3. Menu kiri → **API Keys** → **Create Key**
4. Copy key-nya (mulai dengan `sk-ant-...`)

---

## LANGKAH 3: Upload Code ke GitHub
*Waktu: ~10 menit*

1. Buka **github.com** → daftar/login
2. Klik tombol **+** di kanan atas → **New repository**
   - Name: `tutorai`
   - Private (biar aman)
   - Klik **Create repository**

3. Install Git di laptop: **git-scm.com/downloads**

4. Buka Terminal/Command Prompt, jalankan:
```bash
cd /lokasi/folder/tutorai  # masuk ke folder project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAMU/tutorai.git
git push -u origin main
```

---

## LANGKAH 4: Deploy ke Vercel (Hosting Gratis)
*Waktu: ~10 menit*

1. Buka **vercel.com** → daftar dengan GitHub
2. Klik **"Add New Project"**
3. Import repository `tutorai` dari GitHub
4. **PENTING — Tambah Environment Variables:**
   Klik "Environment Variables" dan tambah satu per satu:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL dari Supabase tadi |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key dari Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key |
   | `ANTHROPIC_API_KEY` | key dari Anthropic |

5. Klik **Deploy**
6. Tunggu ~2-3 menit → website jadi online!
7. Vercel kasih URL gratis: `tutorai-xxx.vercel.app`

---

## LANGKAH 5: Set Lo Jadi Admin
*Waktu: ~2 menit*

1. Buka website yang sudah online
2. Daftar akun dengan email lo (pilih role Pelajar dulu, ga masalah)
3. Kembali ke **Supabase** → **SQL Editor**
4. Jalankan:
```sql
update public.profiles 
set role = 'admin' 
where email = 'EMAILMU@gmail.com';
```
5. Sekarang login → lo otomatis diarahkan ke `/admin`

---

## LANGKAH 6: Custom Domain (Opsional tapi Recommended)
*Waktu: ~15 menit*

1. Beli domain di **niagahoster.co.id** atau **rumahweb.com**
   - Cek `tutorai.id` → kalau sudah ada, coba `tutoraiku.id` dll
   - Harga: ~Rp 100-200rb/tahun

2. Di Vercel → **Settings** → **Domains**
3. Masukkan domain yang dibeli
4. Vercel kasih instruksi untuk set DNS
5. Di dashboard domain registrar, update DNS sesuai instruksi Vercel
6. Tunggu 5-30 menit → domain aktif!

---

## LANGKAH 7: Google Search (SEO)
*Waktu: ~5 menit*

1. Buka **search.google.com/search-console**
2. Tambah property → masukkan domain lo
3. Verifikasi kepemilikan (ikuti instruksi)
4. Submit sitemap: `https://tutorai.id/sitemap.xml`
5. Tunggu 1-2 minggu → mulai muncul di Google!

---

## CARA KERJA SISTEM AKUN:

### 🎓 Siswa:
- Daftar → pilih "Pelajar" → dapat kode unik 8 karakter
- Belajar di `/dashboard`
- Bagikan kode ke ortu/guru

### 👨‍👩‍👧 Orang Tua:
- Daftar → pilih "Orang Tua"
- Masuk dashboard → input kode anak
- Bisa pantau semua sesi belajar anak

### 👨‍🏫 Guru:
- Daftar → pilih "Guru"
- Dapat kode kelas unik
- Bagikan kode ke murid saat daftar
- Pantau semua murid di satu dashboard

### 🛡️ Admin (Lo):
- Akses `/admin`
- Lihat semua user, semua sesi, statistik lengkap
- Bisa manage semua akun

---

## TROUBLESHOOTING:

**Error "Invalid API key":**
→ Cek environment variables di Vercel sudah benar

**Database error:**
→ Pastikan SQL schema sudah dijalankan di Supabase

**Login tidak bisa:**
→ Di Supabase → Authentication → Email Settings → matikan "Confirm email" dulu

**Website lambat:**
→ Normal di free tier Vercel, upgrade kalau sudah ada revenue

---

## NEXT STEPS SETELAH ONLINE:

1. **Tambah payment gateway** (Midtrans) untuk fitur premium
2. **Google Analytics** untuk tracking visitor
3. **Tambah latihan soal** dengan database soal per mapel
4. **Push notification** ketika ada pesan baru
5. **Mobile app** dengan React Native/Expo

---

*File ini dibuat oleh TutorAI Development System*
*Versi: 1.0 — Mei 2026*
