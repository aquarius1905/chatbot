import { useState } from 'react'
import type { Conversation } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import './Sidebar.css'

interface Props {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (id: number) => void
  onCreate: () => void
  onDelete: (id: number) => void
  loading: boolean
}

export function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete, loading }: Props) {
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation()
    setPendingDelete(conv)
  }

  const handleConfirm = () => {
    if (pendingDelete) onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  const handleCancel = () => setPendingDelete(null)

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">◈ ChatBot</span>
          <button className="new-btn" onClick={onCreate} disabled={loading} title="新しいチャット">
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
                onClick={(e) => handleDeleteClick(e, c)}
                title="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      {pendingDelete && (
        <ConfirmDialog
          title="チャットを削除しますか？"
          message={
            <>
            チャットのメッセージが完全に削除されます。この操作は元に戻せません。
            </>
          }
          confirmLabel="削除する"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}