# お笑い劇場エントリーシステム

お笑い劇場のライブエントリー業務をデジタル化するWebアプリケーション

## 🎯 概要

毎月1日・10日の22:00-22:30に行われるライブエントリーを自動化し、公平性の確保と業務効率化を実現します。

## 📋 主要機能

### 🎤 エントリー機能（演者向け）
- 時間制限付きエントリー受付（毎月1日・10日 22:00-22:30）
- 最大2つの名義でエントリー可能
- 第3希望まで日程選択
- リアルタイム受付状況表示

### 📊 交番表システム
- 自動振り分けアルゴリズム
- 先着順 + 制約条件（同一名義月1回、同一個人月2回）
- 口火ライブ（9-11組）、二足のわらじライブ（16-17組）

### ⚙️ 管理機能（スタッフ向け）
- エントリー状況監視
- 自動振り分け実行
- 手動調整機能
- 交番表確定・公開

## 🚀 クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. データベースの初期化
npx prisma generate
npx prisma migrate dev --name init

# 3. 開発サーバーの起動
npm run dev
```

詳細なセットアップ手順は [docs/SETUP.md](docs/SETUP.md) を参照してください。

## 🌐 アクセス先

- **エントリーフォーム**: http://localhost:3000
- **交番表**: http://localhost:3000/schedule
- **管理画面**: http://localhost:3000/admin

## 🛠 技術スタック

- **Framework**: Next.js 14 + TypeScript
- **Database**: SQLite (開発) / PostgreSQL (本番)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📁 プロジェクト構成

```
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── admin/          # 管理画面
│   ├── schedule/       # 交番表
│   └── complete/       # 完了画面
├── lib/                # ユーティリティ
│   ├── db.ts          # Prismaクライアント
│   ├── assignment.ts  # 振り分けロジック
│   └── utils/         # 共通関数
├── prisma/             # データベース
│   ├── schema.prisma  # スキーマ定義
│   └── seed.ts        # テストデータ
└── docs/               # ドキュメント
```

## 📖 ドキュメント

- [セットアップ手順](docs/SETUP.md)
- [デプロイ手順](docs/DEPLOYMENT.md)

## 💰 運用コスト

- 平常時: 無料（Vercel + Vercel Postgres 無料枠）
- ピーク時: $20/月（Vercel Pro）