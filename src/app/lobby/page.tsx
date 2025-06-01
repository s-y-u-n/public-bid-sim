// src/app/lobby/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  status: string;
  round: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function LobbyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/game");
        if (!res.ok) {
          const errorBody = await res.json();
          setErrorMsg(errorBody.error || "ゲームセッション一覧の取得に失敗しました");
          setLoading(false);
          return;
        }
        const data: Session[] = await res.json();
        setSessions(data);
      } catch (e) {
        console.error("LobbyPage: セッション一覧取得エラー", e);
        setErrorMsg("ネットワークエラーが発生しました");
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ロビー：待機中のゲームセッション一覧</h1>

      {loading && <p>読み込み中…</p>}

      {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

      {!loading && !errorMsg && (
        <>
          {sessions.length === 0 ? (
            <p>現在、待機中のセッションはありません。</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">セッションID</th>
                  <th className="border px-2 py-1">作成者</th>
                  <th className="border px-2 py-1">作成日時</th>
                  <th className="border px-2 py-1">アクション</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess, idx) => (
                  <tr key={sess.id} className="text-center">
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1 break-all">
                      {sess.id}
                    </td>
                    <td className="border px-2 py-1">{sess.created_by}</td>
                    <td className="border px-2 py-1">
                      {new Date(sess.created_at).toLocaleString("ja-JP")}
                    </td>
                    <td className="border px-2 py-1">
                      <Link
                        href={`/game/${sess.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        参加
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}