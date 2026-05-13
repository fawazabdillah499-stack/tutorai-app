'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users:0, students:0, parents:0, teachers:0, sessions:0, messages:0 })
  const [users, setUsers] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [tab, setTab] = useState<'overview'|'users'|'sessions'>('overview')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (p?.role !== 'admin') { router.push('/'); return }
      loadData()
    })
  }, [])

  const loadData = async () => {
    const [{ count: total }, { count: students }, { count: parents }, { count: teachers }, { count: sessions }, { count: messages }, { data: userList }, { data: sessionList }] = await Promise.all([
      supabase.from('profiles').select('*', {count:'exact', head:true}),
      supabase.from('profiles').select('*', {count:'exact', head:true}).eq('role','student'),
      supabase.from('profiles').select('*', {count:'exact', head:true}).eq('role','parent'),
      supabase.from('profiles').select('*', {count:'exact', head:true}).eq('role','teacher'),
      supabase.from('chat_sessions').select('*', {count:'exact', head:true}),
      supabase.from('chat_messages').select('*', {count:'exact', head:true}),
      supabase.from('profiles').select('*').order('created_at', {ascending:false}).limit(50),
      supabase.from('chat_sessions').select('*, profiles(full_name, kelas)').order('started_at', {ascending:false}).limit(50),
    ])
    setStats({ users:total||0, students:students||0, parents:parents||0, teachers:teachers||0, sessions:sessions||0, messages:messages||0 })
    setUsers(userList || [])
    setSessions(sessionList || [])
    setLoading(false)
  }

  const roleBadge = (role: string) => {
    const map: Record<string,{bg:string,color:string,label:string}> = {
      student: {bg:'rgba(79,142,247,0.1)', color:'#4f8ef7', label:'Siswa'},
      parent: {bg:'rgba(6,214,160,0.1)', color:'#06d6a0', label:'Ortu'},
      teacher: {bg:'rgba(245,158,11,0.1)', color:'#f59e0b', label:'Guru'},
      admin: {bg:'rgba(239,68,68,0.1)', color:'#ef4444', label:'Admin'},
    }
    const s = map[role] || map.student
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:s.bg, color:s.color}}>{s.label}</span>
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'#0a0e1a'}}><div className="text-gray-400">Memuat data...</div></div>

  return (
    <div className="min-h-screen" style={{background:'#0a0e1a', color:'#e8eaf0'}}>
      <div className="px-6 py-5 flex items-center justify-between" style={{background:'#0f1526', borderBottom:'1px solid #1e2640'}}>
        <div className="font-syne font-black text-xl">Tutor<span className="text-blue-400">AI</span>.id <span className="text-xs font-normal text-gray-500 ml-2">Admin Panel</span></div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/'))} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Keluar</button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="font-syne font-bold text-2xl mb-8">Dashboard Admin 🛡️</h1>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            [stats.users.toString(),'Total User','👥','#4f8ef7'],
            [stats.students.toString(),'Siswa','👨‍🎓','#7c3aed'],
            [stats.parents.toString(),'Orang Tua','👨‍👩‍👧','#06d6a0'],
            [stats.teachers.toString(),'Guru','👨‍🏫','#f59e0b'],
            [stats.sessions.toString(),'Sesi Belajar','📚','#ef4444'],
            [stats.messages.toString(),'Total Pesan','💬','#ec4899'],
          ].map(([v,l,ic,color]) => (
            <div key={l} className="p-4 rounded-2xl text-center" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <div className="text-xl mb-1">{ic}</div>
              <div className="font-syne font-black text-2xl" style={{color: color as string}}>{v}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{background:'#141929', border:'1px solid #1e2640'}}>
          {(['overview','users','sessions'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize" style={tab===t ? {background:'#4f8ef7', color:'white'} : {color:'#8b92a8'}}>
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Semua User' : '📚 Sesi Belajar'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <div className="font-semibold text-sm mb-4">Komposisi User</div>
              {[['Siswa',stats.students,stats.users,'#4f8ef7'],['Orang Tua',stats.parents,stats.users,'#06d6a0'],['Guru',stats.teachers,stats.users,'#f59e0b']].map(([label,val,total,color]) => (
                <div key={label as string} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span>{label as string}</span><span className="text-gray-500">{val as number} user ({total ? Math.round((val as number)/(total as number)*100) : 0}%)</span></div>
                  <div className="h-2 rounded-full" style={{background:'#1e2640'}}>
                    <div className="h-full rounded-full" style={{width:`${total ? (val as number)/(total as number)*100 : 0}%`, background: color as string}}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <div className="font-semibold text-sm mb-4">User Terbaru</div>
              <div className="space-y-3">
                {users.slice(0,5).map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>{u.full_name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-medium">{u.full_name}</div>
                        <div className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString('id-ID')}</div>
                      </div>
                    </div>
                    {roleBadge(u.role)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid #1e2640'}}>
            <div className="p-4" style={{background:'#141929', borderBottom:'1px solid #1e2640'}}>
              <div className="font-semibold text-sm">Semua User ({stats.users})</div>
            </div>
            <div className="divide-y" style={{background:'#0f1526', borderColor:'#1e2640'}}>
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 hover:bg-opacity-50 transition-colors" style={{}}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>{u.full_name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-semibold">{u.full_name}</div>
                      <div className="text-xs text-gray-500">{u.email} {u.kelas ? `• ${u.kelas}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {roleBadge(u.role)}
                    <div className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid #1e2640'}}>
            <div className="p-4" style={{background:'#141929', borderBottom:'1px solid #1e2640'}}>
              <div className="font-semibold text-sm">Sesi Belajar Terbaru ({stats.sessions})</div>
            </div>
            <div style={{background:'#0f1526'}}>
              {sessions.map((s:any) => (
                <div key={s.id} className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #1e2640'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>{s.profiles?.full_name?.charAt(0) || '?'}</div>
                    <div>
                      <div className="text-sm font-semibold">{s.profiles?.full_name || 'Unknown'} <span className="text-gray-500 font-normal">• {s.profiles?.kelas}</span></div>
                      <div className="text-xs text-gray-500">{s.subject} • {new Date(s.started_at).toLocaleDateString('id-ID', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{s.message_count} pesan</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
