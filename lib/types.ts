export type Role = 'student' | 'parent' | 'teacher' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  kelas?: string
  created_at: string
}

export interface ChatSession {
  id: string
  student_id: string
  subject: string
  started_at: string
  ended_at?: string
  message_count: number
  topics_covered: string[]
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface StudentProgress {
  student_id: string
  subject: string
  total_sessions: number
  total_messages: number
  last_active: string
  topics_covered: string[]
}

export interface ParentLink {
  parent_id: string
  student_id: string
  student_name: string
}

export interface TeacherLink {
  teacher_id: string
  student_id: string
  class_code: string
}
