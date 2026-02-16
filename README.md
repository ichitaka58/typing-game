# Typing Game

Next.js と Cloudflare Workers を使用した、シンプルなタイピングゲームです。
Upstash Redis を使用したランキング機能を搭載。

## Features

- **リアルタイムタイピング判定**: 入力されたキーを即座に判定し、エフェクトを表示します。
- **スコア計算システム**: タイピング速度と正確性に基づいたスコア計算。
- **ランキング機能**: 上位5名と下位5名のスコアを表示。
- **サウンドエフェクト**: BGMとタイピング音/正解音による没入感のあるプレイ体験。

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (Recommended)

### Backend
- **Platform**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- bun (v1.0 or later)
- Cloudflare Account
- Upstash Account

### Installation

1. クローンしたリポジトリのディレクトリに移動します。

```bash
git clone <repository-url>
cd typing-game
```

2. 依存関係をインストールします。

```bash
# Frontend dependencies
bun install

# Backend dependencies
cd workers
bun install
```

### Environment Variables

#### Frontend (Next.js)

ルートディレクトリに `.env.local` を作成し、BackendのURLを設定してください。

```bash
# .env.local
WORKER_API_BASE="http://localhost:8787"
```

#### Backend (Cloudflare Workers)

`workers` ディレクトリに `.env` を作成し、Upstash Redis の認証情報を設定してください。
**注意**: `.env` ファイルにはAPIキーなどの機密情報が含まれるため、Gitリポジトリにはコミットしないでください（`.gitignore` に追加済みであることを確認してください）。

```bash
# workers/.env
UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token"
```

本番環境へのデプロイ時は、`wrangler secret put` コマンドを使用するか、Cloudflare Dashboard から環境変数を設定してください。

### Running Locally

1. Backend (Cloudflare Workers) を起動します。

```bash
cd workers
bun run dev
# または直接 wrangler dev を実行しても構いません
# wrangler dev
# Server will be running at http://localhost:8787
```

2. Frontend (Next.js) を起動します。
   別のターミナルを開いて実行してください。

```bash
# Root directory
bun run dev
# Server will be running at http://localhost:3000
```

3. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

## Project Structure

```
.
├── app/                  # Next.js App Router source code
│   ├── page.tsx          # Main game logic and UI
│   └── layout.tsx        # Root layout
├── public/               # Static assets (images, sounds)
├── workers/              # Cloudflare Workers source code
│   ├── src/
│   │   └── index.ts      # API endpoints (Hono)
│   └── wrangler.jsonc    # Wrangler configuration
└── shared/               # Shared types between frontend and backend
```

## api endpoints

- `GET /api/result`: ランキングデータの取得 (Top 5 & Bottom 5)
- `POST /api/result`: スコアの送信
