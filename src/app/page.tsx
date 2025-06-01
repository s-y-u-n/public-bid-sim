// src/app/page.tsx

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">入札シミュレーションゲーム</h1>
      <div className="space-x-4">
        <Link
          href="/signup"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          サインアップ
        </Link>
        <Link
          href="/signin"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          サインイン
        </Link>
        <Link
          href="/lobby"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ロビーへ
        </Link>
      </div>
    </main>
  );
}