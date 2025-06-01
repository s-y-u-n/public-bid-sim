// src/app/bid/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Bid {
  id: string;
  title: string;
  open_date: string;
  close_date: string;
}

export default function BidListPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch("/api/bid");
        const data: Bid[] = await res.json();
        if (!res.ok) {
          setErrorMsg((data as unknown as { error?: string }).error || "案件取得に失敗しました");
        } else {
          setBids(data);
        }
      } catch {
        setErrorMsg("ネットワークエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  if (loading) return <p className="p-6">読み込み中…</p>;
  if (errorMsg) return <p className="p-6 text-red-500">エラー: {errorMsg}</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">入札案件一覧</h1>
      {bids.length === 0 ? (
        <p>まだ案件がありません。</p>
      ) : (
        <ul className="space-y-4">
          {bids.map((bid) => (
            <li key={bid.id} className="border rounded p-4 hover:shadow">
              <Link href={`/bid/${bid.id}`}>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                  {bid.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-600">
                開始: {new Date(bid.open_date).toLocaleString()}  
                / 締切: {new Date(bid.close_date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}