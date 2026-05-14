'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // Get role and redirect accordingly
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    const role = profile?.role || 'student'
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher',
      parent: '/parent',
      student: '/dashboard',
    }
    router.push(redirectMap[role] || '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#0a0e1a'}}>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-syne font-black text-xl mb-10 justify-center">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-dot inline-block"></span>
          Tutor<span className="text-blue-400">AI</span>.id
        </Link>
        <div className="p-8 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
          <h1 className="font-syne font-bold text-2xl mb-2">Masuk ke Akun</h1>
          <p className="text-sm text-gray-400 mb-8">Selamat datang kembali!</p>
          {error && <div className="p-3 rounded-lg text-sm text-red-400 mb-4" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="email@kamu.com" onFocus={e=>(e.target.style.borderColor='#4f8ef7')} onBlur={e=>(e.target.style.borderColor='#1e2640')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Password kamu..." onFocus={e=>(e.target.style.borderColor='#4f8ef7')} onBlur={e=>(e.target.style.borderColor='#1e2640')} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2" style={{background:'#4f8ef7', boxShadow:'0 4px 16px rgba(79,142,247,0.3)'}}>
              {loading ? 'Memuat...' : 'Masuk →'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">
            Belum punya akun? <Link href="/auth/register" className="text-blue-400 hover:underline">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
