'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { channelAPI, sensorAPI } from '@/lib/api'
import { Channel, SensorLog, SensorLatest } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [history, setHistory] = useState<SensorLog[]>([])
  const [latest, setLatest] = useState<SensorLatest | null>(null)
  const { latestData, connected } = useWebSocket(selectedChannel)

  // Redirect jika belum login
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  // Load channels
  useEffect(() => {
    if (user) {
      channelAPI.getAll().then(res => {
        setChannels(res.data)
        if (res.data.length > 0) setSelectedChannel(res.data[0].id)
      })
    }
  }, [user])

  // Load sensor data
  useEffect(() => {
    if (selectedChannel) {
      sensorAPI.getHistory(selectedChannel, 20).then(res => {
        setHistory(res.data.reverse())
      })
      sensorAPI.getLatest(selectedChannel).then(res => {
        setLatest(res.data)
      }).catch(() => {})
    }
  }, [selectedChannel])

  // Update dari WebSocket
  useEffect(() => {
    if (latestData) {
      setLatest(latestData as any)
      setHistory(prev => [...prev.slice(-19), latestData])
    }
  }, [latestData])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-emerald-400 text-xl">Loading...</p>
    </div>
  )

  const chartData = history.map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
    ph: h.ph,
    tds: h.tds,
    suhu: h.temperature,
    amonia: h.ammonia
  }))

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-emerald-400">🐟 Lele Monitor</span>
          <span className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
            {connected ? '● Live' : '○ Offline'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">👤 {user?.username}</span>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Keluar</button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Channel Selector */}
        {channels.length > 0 ? (
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Pilih Channel:</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
            >
              {channels.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-6">
            Belum ada channel. Buat channel dulu melalui API.
          </div>
        )}

        {/* Sensor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SensorCard title="pH" value={latest?.ph} unit="" color="blue" ideal="6.5 - 8.5" />
          <SensorCard title="TDS" value={latest?.tds} unit="ppm" color="purple" ideal="< 500" />
          <SensorCard title="Suhu" value={latest?.temperature} unit="°C" color="orange" ideal="25 - 30°C" />
          <SensorCard title="Amonia" value={latest?.ammonia} unit="mg/L" color="red" ideal="< 0.1" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="pH" dataKey="ph" data={chartData} color="#3b82f6" />
          <ChartCard title="TDS (ppm)" dataKey="tds" data={chartData} color="#8b5cf6" />
          <ChartCard title="Suhu (°C)" dataKey="suhu" data={chartData} color="#f97316" />
          <ChartCard title="Amonia (mg/L)" dataKey="amonia" data={chartData} color="#ef4444" />
        </div>
      </div>
    </div>
  )
}

function SensorCard({ title, value, unit, color, ideal }: any) {
  const colors: any = {
    blue: 'border-blue-700 bg-blue-900/20',
    purple: 'border-purple-700 bg-purple-900/20',
    orange: 'border-orange-700 bg-orange-900/20',
    red: 'border-red-700 bg-red-900/20',
  }
  const textColors: any = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${textColors[color]}`}>
        {value !== null && value !== undefined ? value.toFixed(2) : '--'}
        <span className="text-sm ml-1">{unit}</span>
      </p>
      <p className="text-gray-500 text-xs mt-1">Ideal: {ideal}</p>
    </div>
  )
}

function ChartCard({ title, dataKey, data, color }: any) {
  const values = data.map((d: any) => d[dataKey]).filter((v: any) => v !== null && v !== undefined && isFinite(v) && v < 10000)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 10
  const padding = (max - min) * 0.15 || 0.5
  const domain: [number, number] = [
    parseFloat((min - padding).toFixed(3)),
    parseFloat((max + padding).toFixed(3))
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-gray-300 font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 11}} />
          <YAxis stroke="#6b7280" tick={{fontSize: 11}} domain={domain} />
          <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px'}} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
