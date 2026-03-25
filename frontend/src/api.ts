import type { Conversation, Message } from './types'

const BASE = '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  async createConversation(): Promise<Conversation> {
    const r = await fetch(`${BASE}/conversations`, { method: 'POST' })
    return handleResponse<Conversation>(r)
  },

  async listConversations(): Promise<Conversation[]> {
    const r = await fetch(`${BASE}/conversations`)
    return handleResponse<Conversation[]>(r)
  },

  async getMessages(convId: number): Promise<Message[]> {
    const r = await fetch(`${BASE}/conversations/${convId}/messages`)
    return handleResponse<Message[]>(r)
  },

  async sendMessage(convId: number, content: string): Promise<Message> {
    const r = await fetch(`${BASE}/conversations/${convId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    return handleResponse<Message>(r)
  },

  async deleteConversation(convId: number): Promise<void> {
    const r = await fetch(`${BASE}/conversations/${convId}`, { method: 'DELETE' })
    await handleResponse<unknown>(r)
  },
}
