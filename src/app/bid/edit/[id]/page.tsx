// src/app/bid/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@supabase/auth-helpers-react";

interface BidDetail {
  id: string;
  title: string;
  description: string | null;
  open_date: string;
  close_date: string;
  created_by: string;
}

export default function EditBidPage() {
  const session = useSession();
  const router = useRouter();
  const { id } = useParams(); // URL の [id]

  // ──── ① Hooks はすべてここで先に呼び出す ────
  const [bid, setBid] = useState<BidDetail | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ──── ② 「未ログインならサインイン画面へ」用の useEffect ────
  useEffect(() => {
    // session === undefined のあいだはまだ何もしない
    if (session === null) {
      router.push(`/signin?redirectTo=/bid/edit/${id}`);
    }
  }, [session, router, id]);

  // ──── ③ 「案件情報を取得してフォームにプリフィル」用の useEffect ────
  useEffect(() => {
    // session がまだ取得されていない（undefined）のあいだは何もしない
    if (session === undefined || session === null) {
      return;
    }

    const fetchBid = async () => {
      // GET /api/bid/[id] で既存データを取得
      const res = await fetch(`/api/bid/${id}`);
      if (!res.ok) {
        setErrorMsg("案件情報の取得に失敗しました");
        return;
      }
      const data: BidDetail = await res.json();
      setBid(data);

      // 作成者チェック：自分でなければ一覧へ戻す
      if (data.created_by !== session.user.id) {
        alert("編集権限がありません");
        router.push("/bid");
        return;
      }

      // 取得した値をフォームにプリフィル
      setTitle(data.title);
      setDescription(data.description || "");
      // datetime-local の value は「YYYY-MM-DDThh:mm」の形式
      setOpenDate(data.open_date.slice(0, 16));
      setCloseDate(data.close_date.slice(0, 16));
    };

    fetchBid();
  }, [id, session, router]);

  // ──── ④ ここから先に早期リターン ────
  if (session === undefined) {
    // 認証情報をまだ読み込んでいるあいだは何も表示しない
    return null;
  }
  if (session === null) {
    // 未ログインが確定したらリダイレクト済みなので何も表示しない
    return null;
  }
  if (!bid) {
    // session はあるが、bid がまだ取得中（または作成者チェックでリダイレクトされた）場合
    return <p className="p-6">読み込み中…</p>;
  }

  // ──── ここから JSX を返す ────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    // バリデーション
    if (!title.trim()) {
      setErrorMsg("タイトルを入力してください");
      setSubmitting(false);
      return;
    }
    if (!openDate || !closeDate) {
      setErrorMsg("開始日時と締切日時を入力してください");
      setSubmitting(false);
      return;
    }
    if (new Date(openDate) >= new Date(closeDate)) {
      setErrorMsg("開始日時は締切日時より前にしてください");
      setSubmitting(false);
      return;
    }

    // PUT /api/bid/[id] で更新
    const res = await fetch(`/api/bid/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        open_date: new Date(openDate).toISOString(),
        close_date: new Date(closeDate).toISOString(),
        updated_by: session.user.id,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErrorMsg(json.error || "更新に失敗しました");
      setSubmitting(false);
      return;
    }

    router.push(`/bid/${id}`);
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">入札案件を編集</h1>
      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="edit-bid-title" className="block mb-1">
            タイトル<span className="text-red-500">*</span>
          </label>
          <input
            id="edit-bid-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="案件のタイトルを入力"
          />
        </div>

        <div>
          <label htmlFor="edit-bid-description" className="block mb-1">
            概要
          </label>
          <textarea
            id="edit-bid-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="案件の説明を入力（任意）"
          />
        </div>

        <div>
          <label htmlFor="edit-bid-open-date" className="block mb-1">
            入札開始日時<span className="text-red-500">*</span>
          </label>
          <input
            id="edit-bid-open-date"
            type="datetime-local"
            required
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="edit-bid-close-date" className="block mb-1">
            入札締切日時<span className="text-red-500">*</span>
          </label>
          <input
            id="edit-bid-close-date"
            type="datetime-local"
            required
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 rounded text-white ${
            submitting ? "bg-gray-400" : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          {submitting ? "更新中..." : "更新する"}
        </button>
      </form>
    </main>
  );
}