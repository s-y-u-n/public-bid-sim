// src/app/bid/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter, usePathname } from "next/navigation";

interface Bid {
  id: string;
  title: string;
  description: string | null;
  open_date: string;
  close_date: string;
  created_by: string;
}

interface Entry {
  id: string;
  bid_id: string;
  user_id: string;
  price: number;
  created_at: string;
}

export default function BidDetailPage() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname(); // 例: "/bid/abba-1234-..."
  const bidId = pathname.split("/").at(-1) || ""; 

  const [bid, setBid] = useState<Bid | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [priceInput, setPriceInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1) 未ログインならサインインへ飛ばす（入札するにはログインが必要とする場合）
  useEffect(() => {
    if (session === null) {
      router.push(`/signin?redirectTo=/bid/${bidId}`);
    }
  }, [session, router, bidId]);

  // 2) 初回ロード or bidId が変わるたびに案件詳細＋入札一覧をフェッチ
  useEffect(() => {
    if (!bidId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bid/${bidId}`);
        if (!res.ok) {
          setErrorMsg("案件情報の取得に失敗しました");
          setLoading(false);
          return;
        }
        const json = await res.json();
        setBid(json.bid);
        setEntries(json.entries);
      } catch (e) {
        console.error("BidDetailPage: fetch error", e);
        setErrorMsg("ネットワークエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [bidId]);

  if (loading) return <p className="p-6">読み込み中…</p>;
  if (errorMsg) return <p className="p-6 text-red-500">エラー: {errorMsg}</p>;
  if (!bid) return <p className="p-6">案件が見つかりません。</p>;

  // 3) 入札フォーム送信ハンドラ
  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const price = parseInt(priceInput, 10);
    if (isNaN(price) || price <= 0) {
      setErrorMsg("有効な価格を入力してください");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/bid/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          bid_id: bid.id,
          user_id: session!.user.id,
          price,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let json: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from /api/bid/entry:", text);
      }

      if (!res.ok) {
        setErrorMsg(json?.error || "入札に失敗しました");
        setSubmitting(false);
        return;
      }

      // 成功時は、再フェッチして一覧を更新
      const { data: newEntry } = json;
      setEntries((prev) => [newEntry[0], ...prev]);
      setPriceInput("");
    } catch (e) {
      console.error("BidDetailPage: entry error", e);
      setErrorMsg("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      {/* ── 案件詳細セクション ── */}
      <section>
        <h1 className="text-2xl font-bold mb-2">{bid.title}</h1>
        {bid.description && (
          <p className="mb-4 text-gray-700">{bid.description}</p>
        )}
        <p className="text-sm text-gray-600">
          開始日時: {new Date(bid.open_date).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          締切日時: {new Date(bid.close_date).toLocaleString()}
        </p>
      </section>

      {/* ── 入札フォーム ── */}
      <section className="border-t pt-4 space-y-4">
        <h2 className="text-xl font-semibold">入札する</h2>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}

        <form onSubmit={handleEntry} className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="入札価格を入力"
            className="w-32 border rounded px-2 py-1"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${
              submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "送信中…" : "入札する"}
          </button>
        </form>
      </section>

      {/* ── 入札履歴一覧セクション ── */}
      <section className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">入札履歴</h2>
        {entries.length === 0 ? (
          <p>まだ入札はありません。</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between border px-4 py-2 rounded"
              >
                <span>
                  ユーザーID: {entry.user_id.slice(0, 8)}…  
                </span>
                <span className="font-medium">¥{entry.price.toLocaleString()}</span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}