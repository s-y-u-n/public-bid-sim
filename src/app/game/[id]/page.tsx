// src/app/game/[id]/page.tsx

"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  status: string;
  round: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  game_session_id: string;
  joined_at: string;
}

export default function GameDetailPage() {
  const router = useRouter();
  const { id: sessionId } = useParams() as { id: string };

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // 1) セッション情報と参加者一覧をフェッチ
  const fetchSessionDetail = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/game/${sessionId}`);
      if (!res.ok) {
        const body = await res.json();
        if (res.status === 404) {
          setErrorMsg("指定されたゲームセッションは存在しません。");
        } else {
          setErrorMsg(body.error || "セッション情報の取得に失敗しました。");
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSession(data.session);
      setParticipants(data.participants);
    } catch (e) {
      console.error("GameDetailPage: セッション詳細取得エラー", e);
      setErrorMsg("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // 2) 参加処理
  const handleJoin = async () => {
    setJoinLoading(true);
    setJoinError(null);

    try {
      const res = await fetch(`/api/game/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "5b5c8b37-81a7-44d8-bfc4-52a6d1935ddf" }),
      });
      if (!res.ok) {
        const body = await res.json();
        setJoinError(body.error || "参加に失敗しました。");
        setJoinLoading(false);
        return;
      }
      // 参加成功したら再フェッチして最新の参加者一覧に更新
      await fetchSessionDetail();
    } catch (e) {
      console.error("GameDetailPage: 参加エラー", e);
      setJoinError("ネットワークエラーが発生しました。");
    } finally {
      setJoinLoading(false);
    }
  };

  // 3) 自分（固定ユーザーID）がすでに参加者一覧に含まれるか判定
  const isUserJoined = participants.some(
    (p) => p.user_id === "5b5c8b37-81a7-44d8-bfc4-52a6d1935ddf"
  );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/lobby")}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; ロビーに戻る
      </button>

      {loading && <p>読み込み中…</p>}

      {(errorMsg && !loading) && <p className="text-red-500 mb-4">{errorMsg}</p>}

      {session && !loading && (
        <div className="space-y-6">
          {/* セッション情報 */}
          <section className="border rounded p-4">
            <h2 className="text-xl font-bold mb-2">セッション情報</h2>
            <p>
              <span className="font-semibold">セッションID：</span>
              {session.id}
            </p>
            <p>
              <span className="font-semibold">作成者：</span>
              {session.created_by}
            </p>
            <p>
              <span className="font-semibold">作成日時：</span>
              {new Date(session.created_at).toLocaleString("ja-JP")}
            </p>
            <p>
              <span className="font-semibold">ステータス：</span>
              {session.status}
            </p>
            <p>
              <span className="font-semibold">ラウンド：</span>
              {session.round}
            </p>
          </section>

          {/* 参加ボタン or 参加済みメッセージ */}
          <section>
            {isUserJoined ? (
              <p className="text-green-600 font-semibold">すでに参加済みです。</p>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joinLoading}
                className={`px-4 py-2 rounded text-white ${
                  joinLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {joinLoading ? "参加中…" : "参加する"}
              </button>
            )}
            {joinError && <p className="text-red-500 mt-2">{joinError}</p>}
          </section>

          {/* 参加者一覧 */}
          <section>
            <h2 className="text-xl font-bold mb-2">参加者一覧</h2>
            {participants.length === 0 ? (
              <p>まだ参加者がいません。</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">ユーザーID</th>
                    <th className="border px-2 py-1">参加日時</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr key={p.id} className="text-center">
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1">{p.user_id}</td>
                      <td className="border px-2 py-1">
                        {new Date(p.joined_at).toLocaleString("ja-JP")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </main>
  );
}