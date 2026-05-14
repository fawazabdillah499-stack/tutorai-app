'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ParentDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [linkCode, setLinkCode] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkMsg, setLinkMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p?.role !== 'parent') { router.push('/dashboard'); return }
      setProfile(p)
      loadChildren(data.user.id)
    })
  }, [])

  const loadChildren = async (parentId: string) => {
    const { data: links } = await supabase.from('parent_links').select('student_id').eq('parent_id', parentId)
    if (!links?.length) return
    const ids = links.map((l:any) => l.student_id)
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    setChildren(profiles || [])
    if (profiles?.length) selectChild(profiles[0])
  }

  const selectChild = async (child: any) => {
    setSelected(child)
    const { data } = await supabase.from('chat_sessions').select('*').eq('student_id', child.id).order('started_at', {ascending:false}).limit(20)
    setSessions(data || [])
  }

  const linkChild = async () => {
    if (!linkCode.trim()) return
    setLinking(true)
const { data: { user } } = await supabase.auth.getUser()
    // Find student by code (first 8 chars of UUID uppercase)
    const { data: students } = await supabase.from('profiles').select('*').eq('role','student')
    const student = students?.find((s:any) => s.id.slice(0,8).toUpperCase() === linkCode.trim().toUpperCase())
    if (!student) { setLinkMsg('❌ Kode tidak ditemukan'); setLinking(false); return }
    await supabase.from('parent_links').insert({ parent_id: user?.id, student_id: student.id })
    setLinkMsg('✅ Berhasil terhubung dengan ' + student.full_name)
    loadChildren(user?.id || '')
    setLinkCode('')
    setLinking(false)
  }

  const subjectColor: Record<string,string> = { 'Matematika':'#4f8ef7','IPA':'#06d6a0','IPS':'#f59e0b','Bahasa Indonesia':'#a78bfa','Bahasa Inggris':'#f472b6','default':'#8b92a8' }

  return (
    <div className="min-h-screen" style={{background:'#0a0e1a', color:'#e8eaf0'}}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{background:'#0f1526', borderBottom:'1px solid #1e2640'}}>
        <div className="font-syne font-black text-xl">Tutor<span className="text-blue-400">AI</span>.id</div>
        <div className="text-sm text-gray-400">Dashboard Orang Tua 👨‍👩‍👧</div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/'))} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Keluar</button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-2xl">Selamat datang, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-400 mt-1">Pantau progress belajar anak-anak kamu di sini.</p>
        </div>

        {/* Link Child */}
        <div className="p-5 rounded-2xl mb-8" style={{background:'#141929', border:'1px solid #1e2640'}}>
          <div className="font-semibold mb-3 text-sm">➕ Hubungkan Akun Anak</div>
          <div className="flex gap-3">
            <input value={linkCode} onChange={e=>setLinkCode(e.target.value.toUpperCase())} className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{background:'#0a0e1a', border:'1px solid #1e2640', color:'#e8eaf0'}} placeholder="Masukkan kode anak (contoh: A1B2C3D4)" maxLength={8} />
            <button onClick={linkChild} disabled={linking} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:'#4f8ef7'}}>
              {linking ? '...' : 'Hubungkan'}
            </button>
          </div>
          {linkMsg && <p className="text-xs mt-2 text-gray-400">{linkMsg}</p>}
          <p className="text-xs text-gray-600 mt-2">Minta anak kamu buka TutorAI → Progress → lihat "Kode Akunmu"</p>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">👧</div>
            <div className="font-semibold">Belum ada anak yang terhubung</div>
            <div className="text-sm mt-1">Masukkan kode anak di atas untuk mulai memantau</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Child selector */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Anak Kamu</div>
              {children.map(c => (
                <button key={c.id} onClick={()=>selectChild(c)} className="w-full flex items-center gap-3 p-4 rounded-xl mb-2 text-left transition-all" style={{background: selected?.id===c.id ? 'rgba(79,142,247,0.1)' : '#141929', border: selected?.id===c.id ? '1px solid #4f8ef7' : '1px solid #1e2640'}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>{c.full_name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-sm">{c.full_name}</div>
                    <div className="text-xs text-gray-500">{c.kelas}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="md:col-span-2">
              {selected && (
                <>
                  <div className="font-syne font-bold text-lg mb-4">{selected.full_name}</div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[[sessions.length.toString(),'Total Sesi','📚'],[sessions.reduce((a:number,s:any)=>a+s.message_count,0).toString(),'Total Pertanyaan','❓'],['3','Hari Aktif','🔥']].map(([v,l,ic]) => (
                      <div key={l} className="p-4 rounded-xl text-center" style={{background:'#141929', border:'1px solid #1e2640'}}>
                        <div className="text-xl mb-1">{ic}</div>
                        <div className="font-syne font-black text-2xl">{v}</div>
                        <div className="text-xs text-gray-500">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
                    <div className="font-semibold text-sm mb-4">Sesi Belajar Terbaru</div>
                    {sessions.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">Belum ada sesi belajar</div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.slice(0,8).map((s:any) => (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{background:'#0a0e1a'}}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{background: subjectColor[s.subject] || subjectColor.default}}>{s.subject.charAt(0)}</div>
                              <div>
                                <div className="text-sm font-medium">{s.subject}</div>
                                <div className="text-xs text-gray-500">{new Date(s.started_at).toLocaleDateString('id-ID', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">{s.message_count} pesan</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
