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
`backend/`（FastAPI）と `frontend/`（React）で構成されています。詳細なファイル一覧は割愛しています。

## セットアップ

### 1. APIキーを設定

```bash
cp backend/.env.example backend/.env
# backend/.env を開いて OPENAI_API_KEY を設定
```

### 2. 起動

```bash
# 初回（イメージのビルドあり）
docker compose up --build -d

# 2回目以降
docker compose up -d
```

> **`--build` が再度必要なケース**
> - `requirements.txt` を変更した（Pythonパッケージの追加・変更）
> - `package.json` を変更した（npmパッケージの追加・変更）
> - `Dockerfile` を変更した
>
> ソースコード（`.py` / `.tsx` など）の変更はバインドマウントで即反映されるため `--build` 不要です。

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

## データ永続化

SQLite のデータは Docker Volume (`sqlite-data`) に保存されるため、コンテナを再起動してもデータは保持されます。

```bash
# データを完全リセットする場合
docker compose down -v
```