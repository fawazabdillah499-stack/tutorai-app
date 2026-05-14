import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { parentId, studentCode } = await req.json()
    if (!parentId || !studentCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: students } = await supabase.from('profiles').select('id, full_name').eq('role', 'student')
    const student = students?.find((s: any) => s.id.slice(0,8).toUpperCase() === studentCode.toUpperCase())

    if (!student) {
      return NextResponse.json({ error: 'Kode tidak ditemukan' }, { status: 404 })
    }

    await supabase.from('parent_links').upsert({ parent_id: parentId, student_id: student.id })
    return NextResponse.json({ success: true, studentName: student.full_name })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
