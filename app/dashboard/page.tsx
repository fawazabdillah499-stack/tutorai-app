'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const SUBJECTS = ['Matematika','IPA','IPS','Bahasa Indonesia','Bahasa Inggris','PKN','Agama','Informatika']
const SUBJECT_ICONS: Record<string,string> = { 'Matematika':'📐','IPA':'🔬','IPS':'🌍','Bahasa Indonesia':'📝','Bahasa Inggris':'🇬🇧','PKN':'🏛️','Agama':'☪️','Informatika':'💻' }
const QUICK: Record<string,string[]> = {
  'Matematika': ['Apa itu persamaan linear?','Cara menghitung luas lingkaran','Jelaskan teorema Pythagoras'],
  'IPA': ['Jelaskan fotosintesis','Apa itu hukum Newton?','Apa perbedaan sel hewan dan tumbuhan?'],
  'IPS': ['Apa penyebab penjajahan Belanda?','Jelaskan letak geografis Indonesia','Apa itu inflasi?'],
  'Bahasa Indonesia': ['Apa perbedaan simile dan metafora?','Jelaskan struktur teks eksposisi','Apa itu kata kerja pasif?'],
  'Bahasa Inggris': ['Perbedaan past tense dan present tense','Apa itu conditional sentence?','Contoh kalimat passive voice'],
  'PKN': ['Apa isi Pancasila?','Jelaskan sistem demokrasi','Apa fungsi UUD 1945?'],
  'Agama': ['Apa itu sholat sunnah?','Jelaskan rukun iman','Kisah nabi Ibrahim'],
  'Informatika': ['Apa itu algoritma?','Jelaskan cara kerja internet','Apa itu flowchart?'],
}

interface Msg { role: 'user'|'ai'; text: string; time: string }

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subject, setSubject] = useState('Matematika')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string|null>(null)
  const [stats, setStats] = useState({ sessions:0, messages:0, streak:0 })
  const [view, setView] = useState<'chat'|'progress'>('chat')
  const [userCode, setUserCode] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
      setUserCode(data.user.id.slice(0,8).toUpperCase())
      // Load stats
      const { count: sessions } = await supabase.from('chat_sessions').select('*', {count:'exact'}).eq('student_id', data.user.id)
      const { count: messages } = await supabase.from('chat_messages').select('*', {count:'exact'}).eq('session_id', sessionId || 'none')
      setStats({ sessions: sessions||0, messages: messages||0, streak: 3 })
    })
    // Welcome message
    setMsgs([{ role:'ai', text:'Halo! Aku TutorAI 👋 Mau belajar apa hari ini? Pilih mata pelajaran di atas dan tanyakan apa saja ya!', time: now() }])
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  useEffect(() => {
    // Start new session when subject changes
    startSession()
    setMsgs([{ role:'ai', text:`Oke, sekarang kita belajar **${subject}**! 📚\nAda yang mau ditanyakan? Aku siap bantu jelasin step by step 😊`, time: now() }])
  }, [subject])

  const now = () => new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})

  const startSession = async () => {
    if (!user) return
    const { data } = await supabase.from('chat_sessions').insert({ student_id: user.id, subject, message_count: 0 }).select().single()
    if (data) setSessionId(data.id)
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setMsgs(m => [...m, { role:'user', text, time: now() }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message: text, subject, sessionId, studentId: user?.id })
      })
      const data = await res.json()
      setMsgs(m => [...m, { role:'ai', text: data.reply || 'Maaf ada gangguan, coba lagi ya!', time: now() }])
      setStats(s => ({ ...s, messages: s.messages+2 }))
    } catch {
      setMsgs(m => [...m, { role:'ai', text:'Ups, koneksi bermasalah. Coba lagi ya! 😅', time: now() }])
    }
    setLoading(false)
  }

  const formatText = (t: string) => t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')

  return (
    <div className="min-h-screen flex" style={{background:'#0a0e1a'}}>
      {/* SIDEBAR */}
      <div className="w-64 flex-shrink-0 flex flex-col hidden md:flex" style={{background:'#0f1526', borderRight:'1px solid #1e2640'}}>
        <div className="p-5 font-syne font-black text-xl flex items-center gap-2" style={{borderBottom:'1px solid #1e2640'}}>
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-dot inline-block"></span>
          Tutor<span className="text-blue-400">AI</span>.id
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Mata Pelajaran</div>
          {SUBJECTS.map(s => (
            <button key={s} onClick={()=>setSubject(s)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all mb-1" style={{background: s===subject ? 'rgba(79,142,247,0.1)' : 'transparent', color: s===subject ? '#4f8ef7' : '#8b92a8', border: s===subject ? '1px solid rgba(79,142,247,0.2)' : '1px solid transparent'}}>
              <span>{SUBJECT_ICONS[s]}</span>{s}
            </button>
          ))}
        </div>
        {/* User info */}
        <div className="p-4" style={{borderTop:'1px solid #1e2640'}}>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:'#141929'}}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile?.full_name || 'Siswa'}</div>
              <div className="text-xs text-gray-500">{profile?.kelas || 'SMP'}</div>
            </div>
          </div>
          <div className="mt-3 p-2 rounded-lg text-center" style={{background:'rgba(6,214,160,0.05)', border:'1px solid rgba(6,214,160,0.15)'}}>
            <div className="text-xs text-gray-500">Kode Akunmu</div>
            <div className="font-syne font-black text-sm text-teal-400 tracking-widest mt-0.5">{userCode}</div>
            <div className="text-xs text-gray-600 mt-0.5">Bagikan ke ortu/guru</div>
          </div>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/'))} className="w-full mt-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 transition-colors">
            Keluar
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid #1e2640', background:'#0f1526'}}>
          <div>
            <div className="font-syne font-bold text-lg">{subject}</div>
            <div className="text-xs text-gray-500">{SUBJECT_ICONS[subject]} Kurikulum Merdeka Belajar</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 rounded-lg" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <button onClick={()=>setView('chat')} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={view==='chat' ? {background:'#4f8ef7', color:'white'} : {color:'#8b92a8'}}>💬 Chat</button>
              <button onClick={()=>setView('progress')} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={view==='progress' ? {background:'#4f8ef7', color:'white'} : {color:'#8b92a8'}}>📊 Progress</button>
            </div>
          </div>
        </div>

        {view === 'chat' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-gray-600">💡 Coba tanya:</span>
                {(QUICK[subject] || []).map(q => (
                  <button key={q} onClick={()=>{setInput(q)}} className="px-3 py-1.5 rounded-full text-xs transition-all hover:border-teal-500 hover:text-teal-400" style={{border:'1px solid #1e2640', color:'#8b92a8'}}>
                    {q}
                  </button>
                ))}
              </div>
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm" style={m.role==='ai' ? {background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'} : {background:'#1a2035', border:'1px solid #1e2640'}}>
                    {m.role==='ai' ? '🤖' : profile?.full_name?.charAt(0) || 'K'}
                  </div>
                  <div className={`max-w-[75%] ${m.role==='user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={m.role==='ai' ? {background:'#141929', border:'1px solid #1e2640', borderTopLeftRadius:4} : {background:'#1e3a5f', border:'1px solid rgba(79,142,247,0.3)', borderTopRightRadius:4}} dangerouslySetInnerHTML={{__html: formatText(m.text)}} />
                    <div className="text-xs text-gray-600 mt-1 px-1">{m.role==='ai' ? 'TutorAI' : 'Kamu'} • {m.time}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>🤖</div>
                  <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center" style={{background:'#141929', border:'1px solid #1e2640', borderTopLeftRadius:4}}>
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{animation:`typing 1.2s ease-in-out ${i*0.2}s infinite`}}></div>)}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
            {/* Input */}
            <div className="p-4" style={{borderTop:'1px solid #1e2640', background:'#0f1526'}}>
              <div className="flex gap-3">
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{background:'#141929', border:'1px solid #1e2640', color:'#e8eaf0', minHeight:48, maxHeight:120}} placeholder={`Tanya apa saja tentang ${subject}...`} rows={1} />
                <button onClick={send} disabled={loading||!input.trim()} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40" style={{background:'#4f8ef7'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* PROGRESS VIEW */
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="font-syne font-bold text-2xl mb-6">Progress Belajarmu</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[[stats.sessions.toString(),'Total Sesi','📚'],[stats.messages.toString(),'Pesan Terkirim','💬'],[stats.streak.toString(),'Hari Berturut','🔥']].map(([val,label,icon]) => (
                <div key={label} className="p-5 rounded-2xl text-center" style={{background:'#141929', border:'1px solid #1e2640'}}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-syne font-black text-3xl">{val}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl mb-4" style={{background:'#141929', border:'1px solid #1e2640'}}>
              <h3 className="font-semibold mb-4 text-sm">Aktivitas per Mata Pelajaran</h3>
              <div className="space-y-3">
                {SUBJECTS.map(s => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="text-lg">{SUBJECT_ICONS[s]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1"><span>{s}</span><span className="text-gray-500">0 sesi</span></div>
                      <div className="h-1.5 rounded-full" style={{background:'#1e2640'}}>
                        <div className="h-full rounded-full transition-all" style={{width:'0%', background:'linear-gradient(90deg,#4f8ef7,#7c3aed)'}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl" style={{background:'rgba(6,214,160,0.05)', border:'1px solid rgba(6,214,160,0.15)'}}>
              <div className="text-sm font-semibold text-teal-400 mb-1">📋 Kode Akunmu</div>
              <div className="font-syne font-black text-2xl tracking-widest">{userCode}</div>
              <div className="text-xs text-gray-500 mt-2">Bagikan kode ini ke orang tua atau guru agar mereka bisa memantau progress belajarmu</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
