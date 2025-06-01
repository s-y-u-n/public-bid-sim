// src/app/bid/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface BidDetail {
  id: string;
  title: string;
  description: string | null;
  open_date: string;
  close_date: string;
  created_by: string;
}

interface Entry {
  id: string;
  price: number;
  user_id: string;
  created_at: string;
}

export default function BidDetailPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const { id } = useParams(); // e.g. "abb258e6-f1d4-4a81-9920-e7fddfd4e96b"

  const [bid, setBid] = useState<BidDetail | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);

  // データ取得
  useEffect(() => {
    const fetchDetail = async () => {
      // 1. 案件詳細取得
      const res1 = await fetch(`/api/bid/${id}`);
      if (!res1.ok) {
        setErrorMsg("案件情報の取得に失敗しました");
        setLoading(false);
        return;
      }
      const bidData: BidDetail = await res1.json();
      setBid(bidData);

      // 2. 入札履歴取得
      const { data: entryData, error: entryError } = await supabase
        .from("bids_entries")
        .select("id, price, user_id, created_at")
        .eq("bid_id", id)
        .order("price", { ascending: true });

      if (entryError) {
        setErrorMsg("入札履歴の取得に失敗しました");
        setLoading(false);
        return;
      }
      setEntries(entryData);
      setLoading(false);
    };

    fetchDetail();
  }, [id, supabase]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/signin?redirectTo=/bid/${id}`);
      return;
    }
    setErrorMsg(null);
    // （省略：入札処理はすでに動いているものとする）
  };

  if (loading) return <p className="p-6">読み込み中…</p>;
  if (errorMsg) return <p className="p-6 text-red-500">エラー: {errorMsg}</p>;
  if (!bid) return <p className="p-6">案件情報が見つかりません</p>;

  const now = new Date();
  const closeTime = new Date(bid.close_date);
  const isClosed = now > closeTime;
  const lowestPrice = entries.length > 0 ? entries[0].price : null;

  // 「作成者かどうか」を判定
  const isOwner = bid.created_by === session?.user.id;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{bid.title}</h1>
      {bid.description && <p className="text-gray-700">{bid.description}</p>}
      <p className="text-sm text-gray-600">
        開始日時: {new Date(bid.open_date).toLocaleString()}  
        / 締切日時: {closeTime.toLocaleString()}
      </p>

      {/* ────── ここから削除ボタンの追加 ────── */}
      {isOwner && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={async () => {
              if (!confirm("本当にこの案件を削除しますか？")) return;
              // DELETE API を呼び出し
              const res = await fetch(`/api/bid/${id}?user_id=${session.user.id}`, {
                method: "DELETE",
              });
              if (res.ok) {
                router.push("/bid");
              } else {
                const json = await res.json();
                alert(json.error || "削除に失敗しました");
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            削除
          </button>
        </div>
      )}
      {/* ─────────────────────────────────────── */}

      <div>
        <h2 className="text-xl font-semibold">現在の最低入札金額</h2>
        <p className="text-2xl text-green-600 mb-2">
          {lowestPrice !== null
            ? `${lowestPrice.toLocaleString()} 円`
            : "まだ入札がありません"}
        </p>
      </div>

      {!isClosed ? (
        <form onSubmit={handleBidSubmit} className="space-y-4 mb-8">
          {/* 入札フォームは省略 */}
        </form>
      ) : (
        <p className="text-red-500">締切日時を過ぎたため、入札できません。</p>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">入札履歴</h2>
        {/* 履歴リストも省略 */}
      </div>
    </main>
  );
}