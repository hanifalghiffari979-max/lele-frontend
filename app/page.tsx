import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-emerald-400 mb-4">🐟 Lele Monitor</h1>
        <p className="text-gray-400 text-xl mb-8">Platform Monitoring & AI untuk Budidaya Ikan Lele</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Masuk
          </Link>
          <Link href="/register"
            className="border border-emerald-600 hover:bg-emerald-900/30 text-emerald-400 font-semibold px-8 py-3 rounded-lg transition-colors">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}
