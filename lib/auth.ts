import { supabase } from './supabase'
import type { UserRole } from './supabase'

export async function signUp(email: string, password: string, fullName: string, role: UserRole, kelas?: string, school?: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
      kelas,
      school,
    })
    if (profileError) throw profileError
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getRedirectPath(role: UserRole) {
  switch (role) {
    case 'admin': return '/admin'
    case 'teacher': return '/teacher'
    case 'parent': return '/parent'
    default: return '/dashboard'
  }
}
