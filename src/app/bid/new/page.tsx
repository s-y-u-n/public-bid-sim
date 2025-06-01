// src/app/bid/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function NewBidPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 未ログインならサインインへリダイレクト
  useEffect(() => {
    if (session === null) {
      router.push("/signin?redirectTo=/bid/new");
    }
  }, [session, router]);

  // session がまだ読み込み中、またはリダイレクト直後は何も表示しない
  if (session === undefined) return null;
  if (session === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          open_date: new Date(openDate).toISOString(),
          close_date: new Date(closeDate).toISOString(),
          created_by: session.user.id,
        }),
      });

      // レスポンスが JSON かどうかをチェックしてからパース
      let json: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          json = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      } else {
        // JSON でない場合はレスポンス全体をログに出す
        const text = await res.text();
        console.error("Non-JSON response:", text);
      }
      console.log("Client-side fetch response:", { status: res.status, body: json });

      if (!res.ok) {
        setErrorMsg(json?.error || "登録に失敗しました");
        setSubmitting(false);
        return;
      }

      // 作成成功したら一覧ページへ遷移
      router.push("/bid");
    } catch (e) {
      console.error("Unexpected error on client fetch:", e);
      setErrorMsg("ネットワークエラーが発生しました");
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">新規入札案件を作成</h1>
      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bid-title" className="block mb-1">
            タイトル<span className="text-red-500">*</span>
          </label>
          <input
            id="bid-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="案件のタイトルを入力"
          />
        </div>

        <div>
          <label htmlFor="bid-description" className="block mb-1">
            概要
          </label>
          <textarea
            id="bid-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="案件の説明を入力（任意）"
          />
        </div>

        <div>
          <label htmlFor="bid-open-date" className="block mb-1">
            入札開始日時<span className="text-red-500">*</span>
          </label>
          <input
            id="bid-open-date"
            type="datetime-local"
            required
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="bid-close-date" className="block mb-1">
            入札締切日時<span className="text-red-500">*</span>
          </label>
          <input
            id="bid-close-date"
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
            submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "作成中..." : "作成する"}
        </button>
      </form>
    </main>
  );
}