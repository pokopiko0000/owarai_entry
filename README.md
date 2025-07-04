# お笑い劇場エントリーシステム

お笑い劇場のライブエントリー業務をデジタル化するシステムです。

## 📚 ドキュメント

- [プロジェクト概要](docs/README.md)
- [開発ガイド](docs/PROGRAMMING_GUIDE.md)
- [プロジェクト構造](docs/PROJECT_STRUCTURE.md)
- [要件定義](docs/requirements/要件定義書.md)
- [デプロイ・運用ガイド](docs/deployment/新劇場向け引き継ぎ書.md)
- [学習ガイド](docs/learning/プロジェクト学習ガイド.md)

## 🚀 クイックスタート

### 必要な環境

- Node.js 18+
- PostgreSQL（Vercel/Neon）
- Git

### セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd owarai_entry
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
# .env.localにデータベース接続情報を設定
```

4. データベースをセットアップ
```bash
npx prisma migrate dev
npx prisma db seed
```

5. 開発サーバーを起動
```bash
npm run dev
```

## 📖 詳細情報

詳しい情報は[docs](./docs)フォルダ内のドキュメントをご覧ください。