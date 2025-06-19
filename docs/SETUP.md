# セットアップ手順

## 環境要件
- Node.js 18以上
- npm または yarn

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env`ファイルが作成済みです（SQLite使用）
```
DATABASE_URL="file:./dev.db"
```

### 3. データベースの初期化
```bash
# Prismaクライアントの生成
npx prisma generate

# データベースのマイグレーション
npx prisma migrate dev --name init

# テストデータの投入（オプション）
npx prisma db seed
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## アクセス先
- エントリーフォーム: http://localhost:3000
- 交番表: http://localhost:3000/schedule  
- 管理画面: http://localhost:3000/admin

## 開発モード
現在のページは開発モードになっており、時間制限なしでエントリーが可能です。

## 本番環境への切り替え
本番環境では`app/page-prod.tsx`を`app/page.tsx`に置き換えてください。