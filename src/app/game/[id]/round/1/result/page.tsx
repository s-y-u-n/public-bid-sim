// src/app/game/[id]/round/1/result/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface RoundResult {
  project_number: number;
  winner_participant_id: string;
  winning_price: number;
  profit_winner: number;
  profit_losers: Record<string, number>;
}

export default function Round1ResultPage() {
  const router = useRouter();
  const { id: sessionId } = useParams() as { id: string };

  const [results, setResults] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`/api/game/${sessionId}/round/1/result`);
        if (!res.ok) {
          let err = "結果の取得に失敗しました";
          const text = await res.text();
          try {
            const body = JSON.parse(text);
            err = body.error || err;
          } catch {
            if (text.trim()) err = text;
          }
          setErrorMsg(err);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setResults(data.results);
      } catch (e) {
        console.error("Round1ResultPage: 結果取得エラー", e);
        setErrorMsg("ネットワークエラーが発生しました");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [sessionId]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/game/${sessionId}/round/1`)}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; ラウンド1 入札に戻る
      </button>

      <h1 className="text-2xl font-bold mb-4">ラウンド1 結果</h1>

      {loading && <p>結果読み込み中…</p>}

      {errorMsg && !loading && (
        <p className="text-red-500 mb-4">{errorMsg}</p>
      )}

      {!loading && !errorMsg && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="border px-2 py-1">No.</th>
                <th className="border px-2 py-1">落札者 ID</th>
                <th className="border px-2 py-1">落札価格</th>
                <th className="border px-2 py-1">落札者利益</th>
                <th className="border px-2 py-1">その他利益（JSON）</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.project_number} className="text-center">
                  <td className="border px-2 py-1">{r.project_number}</td>
                  <td className="border px-2 py-1">{r.winner_participant_id}</td>
                  <td className="border px-2 py-1">{r.winning_price}</td>
                  <td className="border px-2 py-1">{r.profit_winner}</td>
                  <td className="border px-2 py-1">
                    {JSON.stringify(r.profit_losers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => router.push(`/game/${sessionId}/round/2`)}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            ラウンド2へ進む
          </button>
        </div>
      )}
    </main>
  );
}