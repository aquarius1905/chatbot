import type { Message } from '../../types'
import './MessageItem.css'

const jstTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})

export function formatJstTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return jstTimeFormatter.format(d)
}

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
