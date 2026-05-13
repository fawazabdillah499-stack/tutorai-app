import { supabase } from './supabase'

export async function saveSession(studentId: string, subject: string, messages: any[], topics: string[]) {
  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({
      student_id: studentId,
      subject,
      message_count: messages.length,
      topics_covered: topics,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Save messages
  const msgRows = messages.map((m: any) => ({
    session_id: session.id,
    role: m.role,
    content: m.content,
  }))

  await supabase.from('chat_messages').insert(msgRows)
  return session
}

export async function getStudentProgress(studentId: string) {
  const { data } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('started_at', { ascending: false })
  return data || []
}

export async function getSubjectStats(studentId: string) {
  const sessions = await getStudentProgress(studentId)
  const stats: Record<string, number> = {}
  sessions.forEach((s: any) => {
    stats[s.subject] = (stats[s.subject] || 0) + s.message_count
  })
  return stats
}

export async function getStudentsForParent(parentId: string) {
  const { data } = await supabase
    .from('parent_student_links')
    .select('student_id, profiles!student_id(*)')
    .eq('parent_id', parentId)
  return data || []
}

export async function getStudentsForTeacher(teacherId: string) {
  const { data } = await supabase
    .from('teacher_student_links')
    .select('student_id, class_code, profiles!student_id(*)')
    .eq('teacher_id', teacherId)
  return data || []
}

export async function linkParentToStudent(parentId: string, linkCode: string) {
  const { data: student } = await supabase
    .from('profiles')
    .select('id')
    .eq('link_code', linkCode)
    .eq('role', 'student')
    .single()

  if (!student) throw new Error('Kode tidak valid')

  const { error } = await supabase
    .from('parent_student_links')
    .insert({ parent_id: parentId, student_id: student.id, link_code: linkCode })

  if (error) throw error
  return student
}

export async function linkTeacherClass(teacherId: string, classCode: string) {
  const { data: students } = await supabase
    .from('profiles')
    .select('id')
    .eq('class_code', classCode)
    .eq('role', 'student')

  if (!students || students.length === 0) throw new Error('Kode kelas tidak ditemukan')

  const links = students.map((s: any) => ({
    teacher_id: teacherId,
    student_id: s.id,
    class_code: classCode,
  }))

  await supabase.from('teacher_student_links').insert(links)
  return students.length
}

export async function getAllStats() {
  const [users, sessions] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('chat_sessions').select('subject, message_count, started_at'),
  ])

  const totalUsers = users.data?.length || 0
  const students = users.data?.filter((u: any) => u.role === 'student').length || 0
  const totalSessions = sessions.data?.length || 0
  const totalMessages = sessions.data?.reduce((sum: number, s: any) => sum + s.message_count, 0) || 0

  return { totalUsers, students, totalSessions, totalMessages }
}
