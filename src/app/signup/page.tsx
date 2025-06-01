// src/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function SignUpPage() {
  // ──── Hooks は必ずトップレベルでまとめて定義 ────
  const supabase = useSupabaseClient();
  const router = useRouter();
  const session = useSession();              // 「session」をチェックするフック

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ──── session があればリダイレクトする処理を useEffect で行う ────
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  // session がある間は何も表示しない（リダイレクト待ち）
  if (session) {
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/signin");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-4">サインアップ</h1>
      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
      <form onSubmit={handleSignUp} className="w-full max-w-sm">
        <label className="block mb-2">
          <span>メールアドレス</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block mb-4">
          <span>パスワード（6 文字以上）</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          アカウント作成
        </button>
      </form>
      <p className="mt-4 text-sm">
        すでにアカウントをお持ちの方は{" "}
        <a href="/signin" className="text-blue-600 hover:underline">
          ログイン
        </a>
      </p>
    </main>
  );
}