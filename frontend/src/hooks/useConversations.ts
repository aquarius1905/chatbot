import { useState, useCallback, useEffect } from 'react'
import { api } from '../api'
import type { Conversation } from '../types'

interface UseConversationsReturn {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  createConversation: () => Promise<Conversation | null>
  deleteConversation: (id: number) => Promise<void>
  updateTitle: (id: number, title: string) => void
  clearError: () => void
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.listConversations()
        setConversations(data)
      } catch {
        setError('会話の読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    try {
      const conv = await api.createConversation()
      setConversations((prev) => [conv, ...prev])
      return conv
    } catch {
      setError('チャットの作成に失敗しました')
      return null
    }
  }, [])

  const deleteConversation = useCallback(async (id: number): Promise<void> => {
    try {
      await api.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('削除に失敗しました')
    }
  }, [])

  const updateTitle = useCallback((id: number, title: string): void => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    )
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { conversations, loading, error, createConversation, deleteConversation, updateTitle, clearError }
}