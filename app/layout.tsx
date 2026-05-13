import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TutorAI.id — Tutor AI Pintar untuk Pelajar SMP',
  description: 'Belajar lebih mudah dengan AI Tutor 24 jam. Tanya apa saja, kapan saja. TutorAI.id jelasin materi sesuai kurikulum Merdeka Belajar.',
  keywords: 'tutor AI, belajar online, SMP, matematika, IPA, kurikulum merdeka, les online murah',
  openGraph: {
    title: 'TutorAI.id — Tutor AI untuk Pelajar SMP Indonesia',
    description: 'Belajar lebih mudah dengan AI Tutor 24 jam. Gratis untuk memulai!',
    url: 'https://tutorai.id',
    siteName: 'TutorAI.id',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
