"""ChatBot API のデータベース設定。

このモジュールは SQLAlchemy のエンジン/セッションファクトリを定義し、
FastAPI の依存性（`get_db`）としてリクエストごとに DB セッションを提供します。
"""

from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
import os

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/chat.db")

engine: Engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """SQLAlchemy のセッションを生成し、最後に確実にクローズします。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
