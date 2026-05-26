'use client'
import { useEffect, useRef, useState } from 'react'
import { SensorLog } from '@/types'

export function useWebSocket(channelId: string) {
  const [latestData, setLatestData] = useState<SensorLog | null>(null)
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!channelId) return

    const WS_URL = 'wss://leleku-production.up.railway.app'
    ws.current = new WebSocket(`${WS_URL}/ws/${channelId}`)

    ws.current.onopen = () => setConnected(true)

    ws.current.onmessage = (event) => {
      if (event.data === 'pong' || event.data === 'ping') return
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'sensor_update') setLatestData(msg.data)
      } catch (e) {}
    }

    ws.current.onclose = () => setConnected(false)

    const ping = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send('ping')
      }
    }, 30000)

    return () => {
      clearInterval(ping)
      ws.current?.close()
    }
  }, [channelId])

  return { latestData, connected }
}
