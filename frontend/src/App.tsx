import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from './api'
import type { Conversation, Message } from './types'
import './App.css'

const jstTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})

function formatJstTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return jstTimeFormatter.format(d)
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (id: number) => void
  onCreate: () => void
  onDelete: (id: number) => void
  loading: boolean
}

function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete, loading }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">◈ ChatBot</span>
        <button className="new-btn" onClick={onCreate} disabled={loading} title="New chat">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="conv-list">
        {conversations.length === 0 && (
          <div className="conv-empty">チャットはまだありません</div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conv-item ${c.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="conv-title">{c.title}</span>
            <button
              className="conv-delete"
              onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

interface MessageItemProps {
  msg: Message
}

function MessageItem({ msg }: MessageItemProps) {
  const isUser = msg.role === 'user'
  return (
    <div className={`msg-row ${isUser ? 'user' : 'ai'}`}>
      <div className="msg-avatar">{isUser ? 'You' : '◈'}</div>
      <div className="msg-bubble">
        <pre className="msg-content">{msg.content}</pre>
        <span className="msg-time">
          {formatJstTime(msg.created_at)}
        </span>
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="msg-avatar">◈</div>
      <div className="msg-bubble typing">
        <span /><span /><span />
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  // Enter を 1回目で「確定」状態にして、2回目で送信するためのフラグ
  const [enterArmed, setEnterArmed] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [loadingConvs, setLoadingConvs] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!enterArmed) return
    // Enter 1回目の後、しばらく経つと「確定」が解除されるようにする
    const t = window.setTimeout(() => setEnterArmed(false), 3000)
    return () => window.clearTimeout(t)
  }, [enterArmed])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, sending])

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.listConversations()
      setConversations(data)
    } catch {
      setError('会話の読み込みに失敗しました')
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => { void loadConversations() }, [loadConversations])

  const selectConversation = useCallback(async (id: number) => {
    setActiveId(id)
    setMessages([])
    setEnterArmed(false)
    setError(null)
    try {
      const msgs = await api.getMessages(id)
      setMessages(msgs)
    } catch {
      setError('メッセージの読み込みに失敗しました')
    }
  }, [])

  const createConversation = useCallback(async () => {
    try {
      const conv = await api.createConversation()
      setConversations((prev) => [conv, ...prev])
      setActiveId(conv.id)
      setMessages([])
      setEnterArmed(false)
      setError(null)
      textareaRef.current?.focus()
    } catch {
      setError('チャットの作成に失敗しました')
    }
  }, [])

  const deleteConversation = useCallback(async (id: number) => {
    try {
      await api.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) {
        setActiveId(null)
        setMessages([])
      }
    } catch {
      setError('削除に失敗しました')
    }
  }, [activeId])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || activeId === null || sending) return
    setEnterArmed(false)
    const content = input.trim()
    setInput('')
    setSending(true)
    setError(null)

    // Optimistic user bubble
    const tempMsg: Message = {
      id: Date.now(),
      conversation_id: activeId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      await api.sendMessage(activeId, content)
      const msgs = await api.getMessages(activeId)
      setMessages(msgs)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, title: content.slice(0, 40) + (content.length > 40 ? '...' : '') }
            : c,
        ),
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : '送信に失敗しました'
      setError(msg)
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
    } finally {
      setSending(false)
    }
  }, [input, activeId, sending])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return

    // Enter (1回目=確定/送信しない, 2回目=送信)
    if (!e.shiftKey) {
      e.preventDefault()
      if (enterArmed) {
        void sendMessage()
      } else {
        setEnterArmed(true)
      }
      return
    }

    // Shift+Enter は改行（確定状態を解除）
    setEnterArmed(false)
  }

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => void selectConversation(id)}
        onCreate={() => void createConversation()}
        onDelete={(id) => void deleteConversation(id)}
        loading={loadingConvs}
      />

      <main className="chat-area">
        {activeId === null ? (
          <div className="welcome">
            <div className="welcome-icon">◈</div>
            <h1>ChatBot</h1>
            <p>新しいチャットを始めましょう</p>
            <button className="welcome-btn" onClick={() => void createConversation()}>
              新しいチャット
            </button>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.length === 0 && !sending && (
                <div className="msg-hint">メッセージを入力してください</div>
              )}
              {messages.map((m) => (
                <MessageItem key={m.id} msg={m} />
              ))}
              {sending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {error !== null && (
              <div className="error-bar">⚠ {error}</div>
            )}

            <div className="input-area">
              <textarea
                ref={textareaRef}
                className={`input-box ${enterArmed ? 'enter-armed' : ''}`}
                value={input}
                onChange={(e) => {
                  setEnterArmed(false)
                  setInput(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力… (Enter 1回目で確定 / 2回目で送信 / Shift+Enter で改行)"
                rows={1}
                disabled={sending}
              />
              <button
                className="send-btn"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || sending}
              >
                {sending ? (
                  <span className="spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M2 9h14M10 3l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
