import './WelcomeScreen.css'

interface Props {
  onCreate: () => void
}

export function WelcomeScreen({ onCreate }: Props) {
  return (
    <div className="welcome">
      <div className="welcome-icon">◈</div>
      <h1>ChatBot</h1>
      <p>新しいチャットを始めましょう</p>
      <button className="welcome-btn" onClick={onCreate}>
        新しいチャット
      </button>
    </div>
  )
}
