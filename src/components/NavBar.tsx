// src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function NavBar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* 左側：ロゴ／ホームへのリンク */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          PublicBidSim
        </Link>

        {/* 中央：ページリンク */}
        <div className="flex space-x-4">
          <Link
            href="/"
            className={`px-3 py-1 rounded ${
              pathname === "/" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            ホーム
          </Link>
          <Link
            href="/bid"
            className={`px-3 py-1 rounded ${
              pathname.startsWith("/bid") && pathname === "/bid"
                ? "bg-gray-200"
                : "hover:bg-gray-100"
            }`}
          >
            案件一覧
          </Link>
          <Link
            href="/bid/new"
            className={`px-3 py-1 rounded ${
              pathname === "/bid/new" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            新規作成
          </Link>
        </div>

        {/* 右側：認証リンク／サインアウト */}
        <div>
          {session ? (
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ログアウト
            </button>
          ) : (
            <Link
              href="/signin"
              className={`px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                pathname === "/signin" ? "opacity-80" : ""
              }`}
            >
              サインイン
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}