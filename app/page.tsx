'use client'
import { useState } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  { icon: '📐', name: 'Matematika', desc: 'Aljabar, Geometri, Statistika' },
  { icon: '🔬', name: 'IPA', desc: 'Fisika, Kimia, Biologi' },
  { icon: '🌍', name: 'IPS', desc: 'Geografi, Sejarah, Ekonomi' },
  { icon: '📝', name: 'Bahasa Indonesia', desc: 'Teks, Puisi, Tata Bahasa' },
  { icon: '🇬🇧', name: 'Bahasa Inggris', desc: 'Grammar, Reading, Writing' },
  { icon: '🏛️', name: 'PKN', desc: 'Pancasila, UUD, Demokrasi' },
  { icon: '☪️', name: 'Agama', desc: 'Fiqih, Akidah, Al-Quran' },
  { icon: '💻', name: 'Informatika', desc: 'Coding, Logika, Algoritma' },
]

const TESTIMONIALS = [
  { name: 'Alya Ramadhani', school: 'SMPN 3 Bandung • Kelas 8', text: 'Dulu nilai matematikaku selalu merah. Setelah pakai TutorAI, akhirnya ngerti kenapa rumusnya begitu. Nilai langsung naik ke 85!', stars: 5, color: 'from-blue-500 to-purple-600', initials: 'AR' },
  { name: 'Bintang Nugroho', school: 'SMP Al-Azhar • Kelas 9', text: 'AI-nya ga langsung kasih jawaban. Dia tanya balik dulu biar aku mikir sendiri. Kerasa beneran belajar!', stars: 5, color: 'from-teal-500 to-blue-500', initials: 'BN' },
  { name: 'Ibu Wulandari', school: 'Orang tua siswa • Jakarta', text: 'Anak saya jadi aktif belajar sendiri. Dashboard orang tua-nya juga membantu saya pantau progress dia tiap hari.', stars: 5, color: 'from-pink-500 to-purple-600', initials: 'IW' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{background:'#0a0e1a', color:'#e8eaf0'}}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4" style={{background:'rgba(10,14,26,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid #1e2640'}}>
        <div className="font-syne font-black text-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-dot inline-block"></span>
          Tutor<span className="text-blue-400">AI</span>.id
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Mata Pelajaran','Cara Kerja','Harga'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Masuk</Link>
          <Link href="/auth/register" className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-all hover:-translate-y-0.5" style={{background:'#4f8ef7', boxShadow:'0 4px 16px rgba(79,142,247,0.3)'}}>
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{background:'radial-gradient(circle, rgba(79,142,247,0.1) 0%, transparent 70%)'}}></div>
        </div>
        <div className="max-w-3xl mx-auto relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-blue-400 mb-8" style={{background:'rgba(79,142,247,0.1)', border:'1px solid rgba(79,142,247,0.3)'}}>
            ✦ Tutor AI #1 untuk Pelajar SMP Indonesia
          </div>
          <h1 className="font-syne font-black text-5xl md:text-7xl leading-none tracking-tight mb-6">
            Belajar Lebih <span className="text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(135deg, #4f8ef7, #7c3aed)'}}>Pintar</span><br/>dengan AI 24 Jam
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl mx-auto mb-10 font-light">
            Tanya apa saja, kapan saja. TutorAI.id jelasin materi step by step — bukan cuma kasih jawaban, tapi bikin kamu paham beneran.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/register" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:-translate-y-1" style={{background:'linear-gradient(135deg,#4f8ef7,#3d7ef5)', boxShadow:'0 4px 24px rgba(79,142,247,0.4)'}}>
              ✦ Coba Gratis Sekarang
            </Link>
            <Link href="/auth/login" className="px-8 py-4 rounded-xl font-medium text-white transition-all hover:border-blue-400" style={{border:'1px solid #1e2640'}}>
              Sudah punya akun →
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center mt-14">
            {[['50rb+','Pertanyaan Dijawab'],['12+','Mata Pelajaran'],['4.9★','Rating Pengguna'],['24/7','Siap Membantu']].map(([num,label]) => (
              <div key={label} className="text-center">
                <div className="font-syne font-black text-3xl tracking-tight">{num}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAPEL */}
      <section id="mata-pelajaran" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Mata Pelajaran</div>
        <h2 className="font-syne font-bold text-4xl tracking-tight mb-4">Semua Mapel,<br/>Satu Platform</h2>
        <p className="text-gray-400 mb-14 max-w-md leading-relaxed">Sesuai kurikulum Merdeka Belajar. Dari Matematika sampai Informatika, semua ada.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBJECTS.map(s => (
            <Link key={s.name} href="/auth/register" className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:border-blue-500 cursor-pointer" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <span className="text-3xl block mb-3">{s.icon}</span>
              <div className="font-syne font-bold text-sm mb-1">{s.name}</div>
              <div className="text-xs text-gray-500">{s.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="py-24 px-6" style={{background:'#0f1526'}}>
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Cara Kerja</div>
          <h2 className="font-syne font-bold text-4xl tracking-tight mb-4">Bukan Chatbot Biasa</h2>
          <p className="text-gray-400 mb-14 max-w-md leading-relaxed">AI kami dirancang khusus untuk cara belajar pelajar Indonesia.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              ['01','✍️','Tanya dengan Bahasa Kamu','Ga perlu formal. Tulis aja "aku ga ngerti rumus ini" — AI kita ngerti!'],
              ['02','🧠','Dijelasin Step by Step','AI jelasin dengan analogi relatable, bukan langsung kasih jawaban.'],
              ['03','🔄','Tanya Lagi Kalau Belum Ngerti','Masih bingung? Tanya lagi! AI jelasin ulang dengan cara berbeda.'],
              ['04','📊','Ortu & Guru Bisa Pantau','Dashboard real-time untuk orang tua dan guru memantau progress belajar.'],
            ].map(([num,icon,title,desc]) => (
              <div key={num} className="p-8 rounded-2xl transition-all hover:-translate-y-1 hover:border-blue-500" style={{background:'#141929', border:'1px solid #1e2640'}}>
                <div className="font-syne font-black text-5xl tracking-tight mb-4" style={{color:'#1e2640'}}>{num}</div>
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-syne font-bold text-lg mb-2">{title}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="harga" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Harga</div>
          <h2 className="font-syne font-bold text-4xl tracking-tight mb-4">Terjangkau untuk Semua</h2>
          <p className="text-gray-400 mb-14 max-w-md">Mulai gratis, upgrade kapan saja. Tidak ada kontrak, tidak ada biaya tersembunyi.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name:'Gratis', price:'Rp 0', desc:'Untuk coba-coba dulu', features:['10 pertanyaan/hari','Semua mata pelajaran','Jawaban step by step'], disabled:['Riwayat percakapan','Dashboard progress','Latihan soal'], popular:false },
              { name:'Basic', price:'Rp 29rb', desc:'/bulan • Paling populer', features:['Tanya tidak terbatas','Semua mata pelajaran','Riwayat percakapan','50 latihan soal/bulan'], disabled:['Dashboard progress lengkap'], popular:true },
              { name:'Premium', price:'Rp 59rb', desc:'/bulan', features:['Tanya tidak terbatas','Semua mata pelajaran','Riwayat percakapan','Latihan soal unlimited','Dashboard progress lengkap'], disabled:[], popular:false },
            ].map(p => (
              <div key={p.name} className="rounded-2xl p-8 relative transition-all hover:-translate-y-1" style={{background: p.popular ? 'linear-gradient(135deg, rgba(79,142,247,0.1), #141929)' : '#141929', border: p.popular ? '1px solid #4f8ef7' : '1px solid #1e2640', boxShadow: p.popular ? '0 0 40px rgba(79,142,247,0.1)' : 'none'}}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white" style={{background:'#4f8ef7'}}>⭐ Paling Populer</div>}
                <div className="text-sm font-semibold text-gray-400 mb-2">{p.name}</div>
                <div className="font-syne font-black text-3xl tracking-tight mb-1">{p.price}</div>
                <div className="text-xs text-gray-500 mb-6 pb-6" style={{borderBottom:'1px solid #1e2640'}}>{p.desc}</div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => <li key={f} className="text-sm text-gray-300 flex items-start gap-2"><span className="text-teal-400 font-bold mt-0.5">✓</span>{f}</li>)}
                  {p.disabled.map(f => <li key={f} className="text-sm text-gray-600 flex items-start gap-2"><span className="mt-0.5">—</span>{f}</li>)}
                </ul>
                <Link href="/auth/register" className="block text-center py-3 rounded-xl text-sm font-semibold transition-all" style={p.popular ? {background:'#4f8ef7', color:'white'} : {border:'1px solid #1e2640', color:'#e8eaf0'}}>
                  Mulai {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{background:'#0f1526'}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Testimoni</div>
          <h2 className="font-syne font-bold text-4xl tracking-tight mb-14">Kata Mereka</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-7 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
                <div className="text-yellow-400 text-sm mb-4">{'★'.repeat(t.stars)}</div>
                <p className="text-sm text-gray-400 leading-relaxed italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${t.color}`}>{t.initials}</div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-syne font-black text-5xl tracking-tight mb-4">Mulai Belajar<br/><span className="text-blue-400">Hari Ini</span></h2>
          <p className="text-gray-400 mb-10">Bergabung dengan ribuan pelajar SMP yang sudah merasakan manfaatnya.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:-translate-y-1" style={{background:'linear-gradient(135deg,#4f8ef7,#3d7ef5)', boxShadow:'0 8px 32px rgba(79,142,247,0.4)'}}>
            ✦ Daftar Gratis Sekarang
          </Link>
          <div className="text-xs text-gray-600 mt-4">Tidak perlu kartu kredit • Gratis selamanya (paket dasar)</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 flex flex-wrap items-center justify-between gap-4" style={{background:'#0f1526', borderTop:'1px solid #1e2640'}}>
        <div className="font-syne font-black text-lg">Tutor<span className="text-blue-400">AI</span>.id</div>
        <div className="flex gap-6 text-xs text-gray-500">
          {['Tentang Kami','Blog','Privasi','Syarat & Ketentuan'].map(l => <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>)}
        </div>
        <div className="text-xs text-gray-600">© 2026 TutorAI.id • Made for pelajar Indonesia 🇮🇩</div>
      </footer>
    </div>
  )
}
