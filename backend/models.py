"""ChatBot API の SQLAlchemy ORM モデル。"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Conversation(Base):
    """チャットセッションを表す Conversation エンティティ。"""

    __tablename__ = "conversations"

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(100), default="New Chat")
    created_at: datetime = Column(DateTime)

    # Note: `created_at` is set at runtime; SQLAlchemy may represent it as `datetime`.
    messages: list["Message"] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(Base):
    """ユーザー/アシスタントの発話を表す Message エンティティ。"""

    __tablename__ = "messages"

    id: int = Column(Integer, primary_key=True, index=True)
    conversation_id: int = Column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE")
    )
    role: str = Column(String(20))  # "user" | "assistant"
    content: str = Column(Text)
    created_at: datetime = Column(DateTime)

    conversation: "Conversation" = relationship(
        "Conversation", back_populates="messages"
    )
