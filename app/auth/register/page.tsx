'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ROLES = [
  { id:'student', label:'👨‍🎓 Saya Pelajar', desc:'Akses tutor AI & latihan soal' },
  { id:'parent', label:'👨‍👩‍👧 Saya Orang Tua', desc:'Pantau progress belajar anak' },
  { id:'teacher', label:'👨‍🏫 Saya Guru', desc:'Pantau semua murid di kelas' },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [kelas, setKelas] = useState('')
  const [childCode, setChildCode] = useState('')
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user) { setError('Gagal membuat akun'); setLoading(false); return }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, email, full_name: name, role, kelas: role === 'student' ? kelas : null
    })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    // Link parent to student
    if (role === 'parent' && childCode) {
      await supabase.from('parent_links').insert({ parent_id: data.user.id, student_code: childCode })
    }
    // Link teacher to class
    if (role === 'teacher' && classCode) {
      await supabase.from('class_memberships').insert({ teacher_id: data.user.id, class_code: classCode })
    }

    const redirectMap: Record<string, string> = { student:'/dashboard', parent:'/parent', teacher:'/teacher', admin:'/admin' }
    router.push(redirectMap[role] || '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{background:'#0a0e1a'}}>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-syne font-black text-xl mb-10 justify-center">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-dot inline-block"></span>
          Tutor<span className="text-blue-400">AI</span>.id
        </Link>
        <div className="p-8 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
          <div className="flex gap-1 mb-8">
            {[1,2].map(s => <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{background: s <= step ? '#4f8ef7' : '#1e2640'}}></div>)}
          </div>
          {error && <div className="p-3 rounded-lg text-sm text-red-400 mb-4" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>{error}</div>}

          {step === 1 && (
            <div>
              <h1 className="font-syne font-bold text-2xl mb-2">Kamu siapa?</h1>
              <p className="text-sm text-gray-400 mb-6">Pilih peran kamu untuk pengalaman yang tepat.</p>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} className="w-full p-4 rounded-xl text-left transition-all" style={{background: role===r.id ? 'rgba(79,142,247,0.1)' : '#0a0e1a', border: role===r.id ? '1px solid #4f8ef7' : '1px solid #1e2640'}}>
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => role && setStep(2)} disabled={!role} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-6 disabled:opacity-40 transition-all hover:-translate-y-0.5" style={{background:'#4f8ef7'}}>
                Lanjut →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister}>
              <h1 className="font-syne font-bold text-2xl mb-2">Buat Akun</h1>
              <p className="text-sm text-gray-400 mb-6">Isi data dirimu untuk memulai.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Nama Lengkap</label>
                  <input value={name} onChange={e=>setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Nama kamu..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="email@kamu.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Min. 8 karakter..." />
                </div>
                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Kelas</label>
                    <select value={kelas} onChange={e=>setKelas(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}}>
                      <option value="">Pilih kelas...</option>
                      <option>Kelas 7</option><option>Kelas 8</option><option>Kelas 9</option>
                    </select>
                  </div>
                )}
                {role === 'parent' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Kode Anak (opsional)</label>
                    <input value={childCode} onChange={e=>setChildCode(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Kode dari akun anak..." />
                    <p className="text-xs text-gray-600 mt-1">Bisa diisi nanti dari dashboard</p>
                  </div>
                )}
                {role === 'teacher' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Kode Kelas (opsional)</label>
                    <input value={classCode} onChange={e=>setClassCode(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Kode kelas dari admin..." />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={()=>setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-medium transition-all" style={{border:'1px solid #1e2640', color:'#8b92a8'}}>← Kembali</button>
                <button type="submit" disabled={loading} className="flex-2 py-3 px-6 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:-translate-y-0.5" style={{background:'#4f8ef7', flex:2}}>
                  {loading ? 'Memuat...' : 'Daftar Gratis ✦'}
                </button>
              </div>
            </form>
          )}
          <p className="text-center text-xs text-gray-500 mt-6">
            Sudah punya akun? <Link href="/auth/login" className="text-blue-400 hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
