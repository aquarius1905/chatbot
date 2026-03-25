# ChatGPT API を使ったチャットボット

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite |
| バックエンド | FastAPI + Uvicorn |
| DB | SQLite (SQLAlchemy ORM) |
| インフラ | Docker Compose |
| LLM | OpenAI GPT-4o-mini |

## ディレクトリ構成

```
chatbot/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py        # FastAPI ルーター
│   ├── models.py      # SQLAlchemy モデル
│   ├── schemas.py     # Pydantic スキーマ
│   └── database.py    # DB セッション管理
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── index.css
        └── api.ts     # バックエンドとの通信
```

## セットアップ

### 1. APIキーを設定

```bash
cp .env.example .env
# .env を開いて OPENAI_API_KEY を設定
```

### 2. 起動

```bash
docker compose up --build
```

### 3. アクセス

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンド (API docs) | http://localhost:8000/docs |

## API エンドポイント

| Method | Path | 説明 |
|---|---|---|
| `GET` | `/health` | ヘルスチェック |
| `POST` | `/conversations` | 新規会話作成 |
| `GET` | `/conversations` | 会話一覧取得 |
| `GET` | `/conversations/{id}/messages` | メッセージ一覧取得 |
| `POST` | `/conversations/{id}/messages` | メッセージ送信 |
| `DELETE` | `/conversations/{id}` | 会話削除 |

## ローカル開発（Docker なし）

**バックエンド:**
```bash
cd backend
pip install -r requirements.txt
OPENAI_API_KEY=sk-xxx uvicorn main:app --reload
```

**フロントエンド:**
```bash
cd frontend
npm install
npm run dev
```

## データ永続化

SQLite のデータは Docker Volume (`sqlite-data`) に保存されるため、コンテナを再起動してもデータは保持されます。

```bash
# データを完全リセットする場合
docker compose down -v
```
# chatbot
