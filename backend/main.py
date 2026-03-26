"""ChatBot API の FastAPI アプリケーション。"""

from __future__ import annotations

from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timezone

from openai import OpenAI
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db, engine
import models
import schemas

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ChatBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.get("/health")
def health_check() -> dict[str, str]:
    """デプロイ/オーケストレーションツール向けのヘルスチェック。"""
    return {"status": "ok"}


@app.post("/conversations", response_model=schemas.ConversationOut)
def create_conversation(db: Session = Depends(get_db)) -> schemas.ConversationOut:
    """新しい会話を作成します。"""
    conv = models.Conversation(title="New Chat", created_at=datetime.now(timezone.utc))
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@app.get("/conversations", response_model=list[schemas.ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
) -> list[schemas.ConversationOut]:
    """会話を新しい順に一覧表示します。"""
    return db.query(models.Conversation).order_by(models.Conversation.created_at.desc()).all()


@app.get("/conversations/{conv_id}/messages", response_model=list[schemas.MessageOut])
def get_messages(
    conv_id: int, db: Session = Depends(get_db)
) -> list[schemas.MessageOut]:
    """指定した会話のメッセージ一覧を取得します。"""
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv.messages


@app.post("/conversations/{conv_id}/messages", response_model=schemas.MessageOut)
def send_message(
    conv_id: int, body: schemas.MessageIn, db: Session = Depends(get_db)
) -> schemas.MessageOut:
    """ユーザーメッセージを保存し、OpenAI を呼び出して回答を保存・返却します。"""
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # ユーザーメッセージを保存
    user_msg = models.Message(
        conversation_id=conv_id,
        role=models.Role.USER,
        content=body.content,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user_msg)
    db.commit()

    # 最初のメッセージからタイトルを更新
    if len(conv.messages) == 1:
        conv.title = body.content[:40] + ("..." if len(body.content) > 40 else "")
        db.commit()

    # OpenAI に渡す会話履歴を構築
    history: list[dict[str, str]] = [
        {"role": m.role.value, "content": m.content}
        for m in conv.messages
    ]

    try:
        response: Any = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a helpful assistant."}] + history,
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        # openai-python の例外（例: APIStatusError）は status_code を持つことがある
        status_code = getattr(e, "status_code", None)
        if status_code is None:
            status_code = getattr(getattr(e, "response", None), "status_code", None)

        if not isinstance(status_code, int):
            status_code = 502

        raise HTTPException(status_code=status_code, detail=f"OpenAI error: {str(e)}")

    # AI のメッセージを保存
    ai_msg = models.Message(
        conversation_id=conv_id,
        role=models.Role.ASSISTANT,
        content=ai_content,
        created_at=datetime.now(timezone.utc),
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg


@app.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int, db: Session = Depends(get_db)
) -> dict[str, bool]:
    """会話とそのメッセージを削除します。"""
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"ok": True}