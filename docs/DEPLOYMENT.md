# デプロイ手順

## Vercelへのデプロイ

### 1. Vercelアカウントの準備
- https://vercel.com でアカウント作成
- GitHubアカウントと連携

### 2. プロジェクトのデプロイ
1. Vercelダッシュボードで「New Project」を選択
2. GitHubリポジトリを選択
3. 環境変数を設定:
   - `DATABASE_URL`: PostgreSQLの接続文字列

### 3. 環境変数の設定例
```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 4. 本番環境の設定
デプロイ前に以下を確認:
- `app/page-prod.tsx`を`app/page.tsx`にリネーム（時間制限を有効化）
- Prismaスキーマを PostgreSQL に変更
- 必要なライブデータを事前に投入

## 運用コスト
- Vercel: 無料枠（ピーク時のみPro $20/月）
- PostgreSQL: Vercel Postgres 無料枠使用
- 合計: 平常時無料、ピーク時$20/月