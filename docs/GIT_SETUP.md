# Git リポジトリのセットアップ手順

権限の問題でローカルでgit initが失敗する場合の対処法です。

## 方法1: GitHubで新しいリポジトリを作成

### 1. GitHub上でリポジトリを作成
1. https://github.com にアクセス
2. 「New repository」をクリック
3. リポジトリ名: `owarai-entry-system`
4. 「Create repository」をクリック

### 2. ローカルファイルをアップロード
GitHubの画面で「uploading an existing file」を選択し、以下のファイルをドラッグ&ドロップでアップロード:

#### 必須ファイル
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.ts`
- `postcss.config.js`
- `.eslintrc.json`
- `.gitignore`
- `README.md`

#### アプリケーションファイル
- `app/` フォルダ全体
- `lib/` フォルダ全体
- `prisma/` フォルダ全体
- `docs/` フォルダ全体

#### 環境設定ファイル
- `.env.example`

**注意**: `.env`ファイルは機密情報が含まれるためアップロードしないでください。

### 3. コミットメッセージ
```
Initial commit: お笑い劇場エントリーシステム

- Next.js 14 + TypeScript + Tailwind CSS
- Prisma + SQLite/PostgreSQL対応
- エントリーフォーム、交番表、管理画面を実装
- 自動振り分けアルゴリズム搭載
- Vercelデプロイ対応
```

## 方法2: 別のディレクトリで git init

WSL上の別の場所でリポジトリを作成:

```bash
# ホームディレクトリに移動
cd ~

# 新しいディレクトリを作成
mkdir owarai-entry-system
cd owarai-entry-system

# git初期化
git init
git branch -M main

# ファイルをコピー
cp -r "/mnt/c/Users/j_mar/OneDrive/ドキュメント/owarai_entry"/* .

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/owarai-entry-system.git

# コミット&プッシュ
git add .
git commit -m "Initial commit: お笑い劇場エントリーシステム"
git push -u origin main
```

## 推奨: 方法1 (GitHub UI使用)
権限の問題を回避でき、確実にアップロードできます。