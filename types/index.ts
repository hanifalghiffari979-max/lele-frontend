export interface User {
  id: string
  email: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
  user: User
}

export interface Channel {
  id: string
  user_id: string
  name: string
  description: string
  is_public: boolean
  thingspeak_channel_id: string
  created_at: string
}

export interface SensorLog {
  id: number
  channel_id: string
  ph: number | null
  tds: number | null
  temperature: number | null
  ammonia: number | null
  recorded_at: string
}

export interface SensorLatest {
  channel_id: string
  ph: number | null
  tds: number | null
  temperature: number | null
  ammonia: number | null
  recorded_at: string | null
}
