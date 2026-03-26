import type { Message } from '../../types'
import { formatJstTime } from '../../utils/datetime'
import './MessageItem.css'

interface Props {
  msg: Message
}

export function MessageItem({ msg }: Props) {
  const isUser = msg.role === 'user'
  return (
    <div className={`msg-row ${isUser ? 'user' : 'ai'}`}>
      <div className="msg-avatar">{isUser ? 'You' : '◈'}</div>
      <div className="msg-bubble">
        <pre className="msg-content">{msg.content}</pre>
        <span className="msg-time">{formatJstTime(msg.created_at)}</span>
      </div>
    </div>
  )
}
