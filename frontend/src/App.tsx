import { useState, useCallback, useRef } from 'react'
import { Sidebar } from './components/Sidebar/Sidebar.tsx'
import { ChatArea } from './components/ChatArea/ChatArea.tsx'
import { WelcomeScreen } from './components/WelcomeScreen/WelcomeScreen.tsx'
import { useConversations } from './hooks/useConversations'
import { useMessages } from './hooks/useMessages'
import './App.css'

export default function App() {
  const [activeId, setActiveId] = useState<number | null>(null)

  const {
    conversations,
    loading: loadingConvs,
    createConversation,
    deleteConversation,
    updateTitle,
  } = useConversations()

  const {
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
    handleKeyDown: baseHandleKeyDown,
    handleSend,
  } = useMessages()

  const enterArmedRef = useRef(enterArmed)
  enterArmedRef.current = enterArmed

  const selectConversation = useCallback(async (id: number) => {
    setActiveId(id)
    await loadMessages(id)
  }, [loadMessages])

  const handleCreate = useCallback(async () => {
    const conv = await createConversation()
    if (conv) {
      setActiveId(conv.id)
      clearMessages()
      textareaRef.current?.focus()
    }
  }, [createConversation, clearMessages, textareaRef])

  const handleDelete = useCallback(async (id: number) => {
    await deleteConversation(id)
    if (activeId === id) {
      setActiveId(null)
      clearMessages()
    }
  }, [deleteConversation, activeId, clearMessages])

  const handleSendWithId = useCallback(() => {
    if (activeId === null) return
    void handleSend(activeId, (title) => updateTitle(activeId, title))
  }, [activeId, handleSend, updateTitle])

  // Enter 2回目での送信を App 側でハンドル
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && enterArmedRef.current) {
        e.preventDefault()
        handleSendWithId()
        return
      }
      baseHandleKeyDown(e)
    },
    [baseHandleKeyDown, handleSendWithId],
  )

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => void selectConversation(id)}
        onCreate={() => void handleCreate()}
        onDelete={(id) => void handleDelete(id)}
        loading={loadingConvs}
      />

      <main className="chat-area-wrapper">
        {activeId === null ? (
          <WelcomeScreen onCreate={() => void handleCreate()} />
        ) : (
          <ChatArea
            messages={messages}
            input={input}
            sending={sending}
            error={error}
            enterArmed={enterArmed}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSend={handleSendWithId}
            bottomRef={bottomRef}
            textareaRef={textareaRef}
          />
        )}
      </main>
    </div>
  )
}