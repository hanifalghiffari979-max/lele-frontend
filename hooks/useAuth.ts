'use client'
import { useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('access_token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
