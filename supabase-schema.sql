-- ============================================
-- TUTORAI.ID - SUPABASE DATABASE SCHEMA
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extend auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
  kelas TEXT,
  school TEXT,
  parent_code TEXT UNIQUE,   -- siswa punya kode ini, dikasih ke ortu
  teacher_code TEXT,         -- kode kelas dari guru
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PARENT-CHILD LINKS
CREATE TABLE parent_child (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 3. TEACHER-STUDENT LINKS
CREATE TABLE teacher_student (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, student_id)
);

-- 4. CHAT SESSIONS
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  topics_covered TEXT[] DEFAULT '{}'
);

-- 5. CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENT PROGRESS (aggregated)
CREATE TABLE student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_questions INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  subject_stats JSONB DEFAULT '{}',
  weekly_activity INT[] DEFAULT '{0,0,0,0,0,0,0}',
  topics_learned TEXT[] DEFAULT '{}'
);

-- 7. DAILY ACTIVITY LOG
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  subject TEXT,
  questions_asked INT DEFAULT 0,
  minutes_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa lihat profil sendiri, admin bisa lihat semua
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat messages: siswa lihat sendiri, ortu/guru lihat anak/muridnya
CREATE POLICY "Students see own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Parents see child messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_child
      WHERE parent_id = auth.uid() AND student_id = chat_messages.student_id
    )
  );

CREATE POLICY "Teachers see student messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_student
      WHERE teacher_id = auth.uid() AND student_id = chat_messages.student_id
    )
  );

CREATE POLICY "Admin see all messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Students insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Progress: sama dengan messages
CREATE POLICY "Students see own progress" ON student_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Parents see child progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_child
      WHERE parent_id = auth.uid() AND student_id = student_progress.student_id
    )
  );

CREATE POLICY "Teachers see student progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_student
      WHERE teacher_id = auth.uid() AND student_id = student_progress.student_id
    )
  );

CREATE POLICY "Admin see all progress" ON student_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile setelah register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_parent_code TEXT;
BEGIN
  new_parent_code := upper(substring(md5(NEW.id::text) from 1 for 8));
  
  INSERT INTO profiles (id, email, full_name, role, parent_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    new_parent_code
  );

  INSERT INTO student_progress (student_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update progress setelah chat
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_progress (student_id, total_questions, total_sessions, last_active)
  VALUES (NEW.student_id, 1, 0, NOW())
  ON CONFLICT (student_id) DO UPDATE SET
    total_questions = student_progress.total_questions + 1,
    last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_message_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  WHEN (NEW.role = 'user')
  EXECUTE FUNCTION update_student_progress();

-- ============================================
-- SEED ADMIN USER (jalankan setelah buat akun admin)
-- Ganti 'your-admin-user-id' dengan UUID dari auth.users
-- ============================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@tutorai.id';
