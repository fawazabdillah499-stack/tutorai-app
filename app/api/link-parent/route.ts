import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { parentId, studentCode } = await req.json()
  if (!parentId || !studentCode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: students } = await supabase.from('profiles').select('id, full_name').eq('role', 'student')
  const student = students?.find((s: any) => s.id.slice(0,8).toUpperCase() === studentCode.toUpperCase())

  if (!student) return NextResponse.json({ error: 'Kode tidak ditemukan' }, { status: 404 })

  await supabase.from('parent_links').upsert({ parent_id: parentId, student_id: student.id })
  return NextResponse.json({ success: true, studentName: student.full_name })
}