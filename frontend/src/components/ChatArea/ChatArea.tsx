import type { Message } from '../../types'
import { MessageItem } from '../MessageItem/MessageItem'
import { TypingIndicator } from '../TypingIndicator/TypingIndicator'
import './ChatArea.css'

interface Props {
  messages: Message[]
  input: string
  sending: boolean
  error: string | null
  enterArmed: boolean
  onInputChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  bottomRef: React.RefObject<HTMLDivElement>
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export function ChatArea({
  messages,
  input,
  sending,
  error,
  enterArmed,
  onInputChange,
  onKeyDown,
  onSend,
  bottomRef,
  textareaRef,
}: Props) {
  return (
    <div className="chat-area">
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
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="メッセージを入力… (Enter 1回目で確定 / 2回目で送信 / Shift+Enter で改行)"
          rows={1}
          disabled={sending}
        />
        <button
          className="send-btn"
          onClick={onSend}
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
    </div>
  )
}