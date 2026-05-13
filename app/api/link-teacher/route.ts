import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { teacherCode } = await req.json()

  // Find teacher with this code
  const { data: teacher } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('parent_code', teacherCode.toUpperCase())
    .eq('role', 'teacher')
    .single()

  if (!teacher) return NextResponse.json({ error: 'Kode guru tidak valid' }, { status: 404 })

  await supabase.from('teacher_student').upsert({
    teacher_id: teacher.id,
    student_id: user.id
  })

  return NextResponse.json({ success: true, teacherName: teacher.full_name })
}
