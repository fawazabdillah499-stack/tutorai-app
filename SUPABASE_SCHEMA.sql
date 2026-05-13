-- ============================================
-- TUTORAI.ID - SUPABASE DATABASE SCHEMA
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('student', 'parent', 'teacher', 'admin')),
  kelas text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Enable insert for authenticated" on public.profiles for insert with check (auth.uid() = id);
-- Admin can see all
create policy "Admin see all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 2. CHAT SESSIONS
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  message_count integer default 0,
  started_at timestamptz default now(),
  ended_at timestamptz
);
alter table public.chat_sessions enable row level security;
create policy "Students see own sessions" on public.chat_sessions for select using (auth.uid() = student_id);
create policy "Students insert own sessions" on public.chat_sessions for insert with check (auth.uid() = student_id);
create policy "Students update own sessions" on public.chat_sessions for update using (auth.uid() = student_id);
-- Parents can see their children's sessions
create policy "Parents see children sessions" on public.chat_sessions for select using (
  exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = chat_sessions.student_id)
);
-- Teachers can see their students' sessions
create policy "Teachers see students sessions" on public.chat_sessions for select using (
  exists (select 1 from public.class_memberships where teacher_id = auth.uid() and student_id = chat_sessions.student_id)
);
-- Admin sees all
create policy "Admin see all sessions" on public.chat_sessions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. CHAT MESSAGES
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
alter table public.chat_messages enable row level security;
create policy "Access messages via session" on public.chat_messages for all using (
  exists (select 1 from public.chat_sessions where id = chat_messages.session_id and student_id = auth.uid())
);
create policy "Service role full access messages" on public.chat_messages for all using (true) with check (true);

-- 4. PARENT LINKS
create table public.parent_links (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(parent_id, student_id)
);
alter table public.parent_links enable row level security;
create policy "Parents manage own links" on public.parent_links for all using (auth.uid() = parent_id);

-- 5. CLASS MEMBERSHIPS (teacher-student)
create table public.class_memberships (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade,
  class_code text not null,
  created_at timestamptz default now()
);
alter table public.class_memberships enable row level security;
create policy "Teachers manage own class" on public.class_memberships for all using (auth.uid() = teacher_id);
create policy "Students see own memberships" on public.class_memberships for select using (auth.uid() = student_id);

-- 6. FUNCTION: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'User'), 'student');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. FUNCTION: increment message count
create or replace function increment_message_count(session_id uuid)
returns void as $$
  update chat_sessions set message_count = message_count + 2 where id = session_id;
$$ language sql security definer;

-- 8. Set first admin (ganti dengan email lo!)
-- Jalankan ini SETELAH lo daftar akun:
-- update public.profiles set role = 'admin' where email = 'EMAILMU@gmail.com';
