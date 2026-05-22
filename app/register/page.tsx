'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.register(form)
      localStorage.setItem('access_token', res.data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-400">🐟 Lele Monitor</h1>
          <p className="text-gray-400 mt-2">Platform Monitoring Budidaya Ikan Lele</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Daftar Akun</h2>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="email@contoh.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
