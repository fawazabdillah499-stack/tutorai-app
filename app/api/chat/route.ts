import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { message, subject } = await req.json()
    if (!message || !subject) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const systemPrompt = `Kamu adalah TutorAI, tutor AI yang ramah dan sabar untuk pelajar SMP Indonesia. Mata pelajaran: ${subject}. Gunakan bahasa Indonesia santai. Jangan langsung kasih jawaban, bimbing step by step. Pakai analogi sehari-hari. Maksimal 3-4 paragraf.`
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }]
      })
    })
    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf ada gangguan, coba lagi ya!'
    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json({ reply: 'Maaf ada gangguan, coba lagi ya!' })
  }
}
