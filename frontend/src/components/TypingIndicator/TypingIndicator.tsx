import './TypingIndicator.css'

export function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="typing-avatar">◈</div>
      <div className="typing-bubble">
        <span /><span /><span />
      </div>
    </div>
  )
}
