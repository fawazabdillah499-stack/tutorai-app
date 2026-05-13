import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { teacherId, studentId, classCode } = await req.json()
  if (!teacherId || !studentId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await supabase.from('class_memberships').upsert({ teacher_id: teacherId, student_id: studentId, class_code: classCode })
  return NextResponse.json({ success: true })
}