'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [classCode, setClassCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p?.role !== 'teacher' && p?.role !== 'admin') { router.push('/dashboard'); return }
      setProfile(p)
      setClassCode(data.user.id.slice(0,6).toUpperCase())
      loadStudents(data.user.id)
    })
  }, [])

  const loadStudents = async (teacherId: string) => {
    const { data: memberships } = await supabase.from('class_memberships').select('student_id').eq('teacher_id', teacherId)
    if (!memberships?.length) return
    const ids = memberships.map((m:any) => m.student_id)
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    setStudents(profiles || [])
    if (profiles?.length) selectStudent(profiles[0])
  }

  const selectStudent = async (student: any) => {
    setSelected(student)
    const { data } = await supabase.from('chat_sessions').select('*').eq('student_id', student.id).order('started_at', {ascending:false}).limit(20)
    setSessions(data || [])
  }

  return (
    <div className="min-h-screen" style={{background:'#0a0e1a', color:'#e8eaf0'}}>
      <div className="px-6 py-5 flex items-center justify-between" style={{background:'#0f1526', borderBottom:'1px solid #1e2640'}}>
        <div className="font-syne font-black text-xl">Tutor<span className="text-blue-400">AI</span>.id</div>
        <div className="text-sm text-gray-400">Dashboard Guru 👨‍🏫</div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/'))} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Keluar</button>
      </div>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-syne font-bold text-2xl">Dashboard Guru 📊</h1>
            <p className="text-sm text-gray-400 mt-1">Pantau progress belajar semua murid di kelasmu.</p>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{background:'rgba(6,214,160,0.05)', border:'1px solid rgba(6,214,160,0.15)'}}>
            <div className="text-xs text-gray-500 mb-1">Kode Kelasmu</div>
            <div className="font-syne font-black text-xl tracking-widest text-teal-400">{classCode}</div>
            <div className="text-xs text-gray-600 mt-1">Bagikan ke murid</div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16" style={{background:'#141929', border:'1px solid #1e2640', borderRadius:16}}>
            <div className="text-4xl mb-3">👨‍🎓</div>
            <div className="font-semibold text-gray-300">Belum ada murid di kelasmu</div>
            <div className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Bagikan kode kelas <strong className="text-teal-400">{classCode}</strong> ke murid-muridmu agar mereka bisa mendaftarkan diri.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Murid ({students.length})</div>
              <div className="space-y-2">
                {students.map(s => (
                  <button key={s.id} onClick={()=>selectStudent(s)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all" style={{background: selected?.id===s.id ? 'rgba(79,142,247,0.1)' : '#141929', border: selected?.id===s.id ? '1px solid #4f8ef7' : '1px solid #1e2640'}}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>{s.full_name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-semibold">{s.full_name}</div>
                      <div className="text-xs text-gray-500">{s.kelas}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              {selected && (
                <>
                  <div className="font-syne font-bold text-lg mb-4">{selected.full_name} — {selected.kelas}</div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[[sessions.length,'Sesi Belajar','📚'],[sessions.reduce((a:number,s:any)=>a+s.message_count,0),'Total Pertanyaan','❓'],[sessions.length > 0 ? 'Aktif' : 'Belum','Status','🟢']].map(([v,l,ic]) => (
                      <div key={l as string} className="p-4 rounded-xl text-center" style={{background:'#141929', border:'1px solid #1e2640'}}>
                        <div className="text-xl mb-1">{ic}</div>
                        <div className="font-syne font-black text-xl">{v}</div>
                        <div className="text-xs text-gray-500">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
                    <div className="font-semibold text-sm mb-4">Sesi Belajar Terbaru</div>
                    {sessions.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">Murid ini belum ada sesi belajar</div>
                    ) : sessions.slice(0,8).map((s:any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{background:'#0a0e1a'}}>
                        <div>
                          <div className="text-sm font-medium">{s.subject}</div>
                          <div className="text-xs text-gray-500">{new Date(s.started_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                        </div>
                        <div className="text-xs text-gray-400">{s.message_count} pesan</div>
                      </div>
                    ))}
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
