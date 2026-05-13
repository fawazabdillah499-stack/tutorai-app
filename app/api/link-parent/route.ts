import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { parentCode } = await req.json()

  // Find student with this parent_code
  const { data: student, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('parent_code', parentCode.toUpperCase())
    .eq('role', 'student')
    .single()

  if (error || !student) {
    return NextResponse.json({ error: 'Kode tidak ditemukan' }, { status: 404 })
  }

  // Link parent to student
  await supabase.from('parent_child').upsert({
    parent_id: user.id,
    student_id: student.id
  })

  return NextResponse.json({ success: true, studentName: student.full_name })
}
