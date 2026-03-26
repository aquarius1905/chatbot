"""ChatBot API の Pydantic リクエスト/レスポンススキーマ。"""

from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime

from models import Role


class MessageIn(BaseModel):
    """受信するメッセージのペイロード。"""

    content: str


class MessageOut(BaseModel):
    """送信するメッセージの表現。"""

    id: int
    role: Role
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    """送信する会話の表現。"""

    id: int
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}