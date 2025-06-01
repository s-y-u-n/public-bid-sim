This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 入札シミュレーションゲーム (public-bid-sim)

このリポジトリでは「公共工事入札シミュレーションゲーム」のソースコードおよび設計書を管理しています。

---

## 目次

1. [基本設計書](./docs/基本設計書.md)  
2. [詳細設計書](./docs/詳細設計書.md)  
3. [環境構築方法](#環境構築方法)  
4. [ディレクトリ構成](#ディレクトリ構成)  
5. [起動方法](#起動方法)  
6. [デプロイ](#デプロイ)  

---

## 環境構築方法

1. Node.js v18 以上をインストール  
2. このリポジトリをクローン  
   ```bash
   git clone https://github.com/（あなたのアカウント）/public-bid-sim.git
   cd public-bid-sim
   ```  
3. 依存パッケージをインストール  
   ```bash
   npm install
   ```  
4. Supabase プロジェクトを作成し、以下の環境変数を `.env.local` に設定  
   ```text
   NEXT_PUBLIC_SUPABASE_URL=（あなたの Supabase URL）
   NEXT_PUBLIC_SUPABASE_ANON_KEY=（あなたの Supabase anon key）
   SUPABASE_SERVICE_ROLE_KEY=（あなたの Supabase service role key）
   ```  
5. データベースマイグレーション（必要なら）を実行  
   ```bash
   # ローカルで Supabase CLI を使う場合
   supabase db push
   # または、Supabase ダッシュボードの SQL エディタから DDL を実行
   ```  

---

## ディレクトリ構成

```
public-bid-sim/
├── docs/
│   ├── 基本設計書.md
│   └── 詳細設計書.md
├── src/
│   ├── app/
│   ├── lib/
│   └── …
├── .env.local
├── next.config.js
├── README.md
└── package.json
```

- `docs/`：各種設計書を Markdown 形式で配置（基本設計書・詳細設計書）  
- `src/app/`：フロントエンド (App Router + React + TypeScript + TailwindCSS) ＋ API Route の実装  
- `src/lib/`：Supabase クライアント設定などの汎用ライブラリ  
- `.env.local`：環境変数（Supabase URL／キーなど）  
- `README.md`：リポジトリ概要・セットアップ手順  
- `package.json`：プロジェクト情報・依存パッケージ  

---

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。  

---

## デプロイ

GitHub にプッシュすると Vercel が自動的にビルド・デプロイを行います。

1. Vercel のプロジェクト設定画面で、以下の環境変数を追加してください。  
   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `SUPABASE_SERVICE_ROLE_KEY`

2. GitHub の main ブランチにマージすると、Vercel が自動的に再ビルド・再デプロイします。  

---

## 参考ドキュメント

- [docs/基本設計書.md](./docs/基本設計書.md)  
- [docs/詳細設計書.md](./docs/詳細設計書.md)  