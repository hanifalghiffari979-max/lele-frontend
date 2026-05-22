'use client'
import { useEffect, useRef, useState } from 'react'
import { SensorLog } from '@/types'

export function useWebSocket(channelId: string) {
  const [latestData, setLatestData] = useState<SensorLog | null>(null)
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!channelId) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    ws.current = new WebSocket(`${WS_URL}/ws/${channelId}`)

    ws.current.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.current.onmessage = (event) => {
      // Skip pesan ping/pong
      if (event.data === 'pong' || event.data === 'ping') return
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'sensor_update') {
          setLatestData(msg.data)
        }
      } catch (e) {
        console.log('Non-JSON message:', event.data)
      }
    }

    ws.current.onclose = () => {
      setConnected(false)
    }

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
