import { useState, useCallback, useEffect, useRef } from 'react'
import { api } from '../api'
import type { Message } from '../types'

interface UseMessagesReturn {
  messages: Message[]
  input: string
  sending: boolean
  error: string | null
  enterArmed: boolean
  bottomRef: React.RefObject<HTMLDivElement>
  textareaRef: React.RefObject<HTMLTextAreaElement>
  loadMessages: (convId: number) => Promise<void>
  clearMessages: () => void
  handleInputChange: (value: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  handleSend: (convId: number, onTitleUpdate: (title: string) => void) => Promise<void>
  clearError: () => void
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enterArmed, setEnterArmed] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // スクロールを最下部に保つ
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Enter 確定状態を 3秒後に自動解除
  useEffect(() => {
    if (!enterArmed) return
    const t = window.setTimeout(() => setEnterArmed(false), 3000)
    return () => window.clearTimeout(t)
  }, [enterArmed])

  const loadMessages = useCallback(async (convId: number): Promise<void> => {
    setMessages([])
    setEnterArmed(false)
    setError(null)
    try {
      const msgs = await api.getMessages(convId)
      setMessages(msgs)
    } catch {
      setError('メッセージの読み込みに失敗しました')
    }
  }, [])

  const clearMessages = useCallback((): void => {
    setMessages([])
    setEnterArmed(false)
    setError(null)
  }, [])

  const handleInputChange = useCallback((value: string): void => {
    setEnterArmed(false)
    setInput(value)
  }, [])

  const handleSend = useCallback(
    async (convId: number, onTitleUpdate: (title: string) => void): Promise<void> => {
      if (!input.trim() || sending) return
      setEnterArmed(false)

      const content = input.trim()
      setInput('')
      setSending(true)
      setError(null)

      // 楽観的更新
      const tempMsg: Message = {
        id: Date.now(),
        conversation_id: convId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempMsg])

      try {
        await api.sendMessage(convId, content)
        const msgs = await api.getMessages(convId)
        setMessages(msgs)
        const newTitle = content.slice(0, 40) + (content.length > 40 ? '...' : '')
        onTitleUpdate(newTitle)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '送信に失敗しました'
        setError(msg)
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      } finally {
        setSending(false)
      }
    },
    [input, sending],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key !== 'Enter') return

      if (!e.shiftKey) {
        e.preventDefault()
        if (enterArmed) {
          // 呼び出し元で handleSend を呼ぶため、ここでは armed を落とすだけ
          setEnterArmed(false)
        } else {
          setEnterArmed(true)
        }
        return
      }

      // Shift+Enter → 改行（確定解除）
      setEnterArmed(false)
    },
    [enterArmed],
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    input,
    sending,
    error,
    enterArmed,
    bottomRef,
    textareaRef,
    loadMessages,
    clearMessages,
    handleInputChange,
    handleKeyDown,
    handleSend,
    clearError,
  }
}