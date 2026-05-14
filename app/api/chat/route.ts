import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { message, subject, sessionId, studentId } = await req.json()

  if (!message || !subject) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const systemPrompt = `Kamu adalah TutorAI, tutor AI yang ramah dan sabar untuk pelajar SMP Indonesia (kelas 7-9).

Mata pelajaran: ${subject}
Kurikulum: Merdeka Belajar (Kemdikbud Indonesia)

CARA MENGAJAR:
- Gunakan bahasa Indonesia santai tapi benar secara akademis
- JANGAN langsung kasih jawaban — bimbing step by step
- Pakai analogi sehari-hari yang relatable buat remaja Indonesia
- Kalau ada rumus, jelaskan KENAPA rumusnya begitu
- Tanya balik untuk memastikan siswa mengerti
- Gunakan emoji secukupnya biar tidak kaku
- Kalau soal matematika, tunjukkan cara pengerjaan step by step
- Maksimal 3-4 paragraf per jawaban
- Di akhir jawaban, selalu tanya apakah sudah ngerti atau ada yang mau ditanyain lagi`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }]
        })
      }
    )

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, ada gangguan. Coba lagi ya!'

    if (sessionId && studentId) {
      await supabase.from('chat_messages').insert([
        { session_id: sessionId, role: 'user', content: message },
        { session_id: sessionId, role: 'assistant', content: reply }
      ])
      await supabase.rpc('increment_message_count', { session_id: sessionId })
    }

    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json({ error: 'API error' }, { status: 500 })
  }
}