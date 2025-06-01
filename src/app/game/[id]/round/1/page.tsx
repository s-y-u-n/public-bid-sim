// src/app/game/[id]/round/1/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface GameItem {
  id: string;
  project_number: number;
  title: string;
  cost: number;
  min_price: number;
  max_price: number;
}

interface Participant {
  id: string;
  user_id: string;
  game_session_id: string;
  joined_at: string;
}

export default function Round1Page() {
  const router = useRouter();
  const { id: sessionId } = useParams() as { id: string };

  // 固定ユーザーID（テスト用）
  const USER_ID = "5b5c8b37-81a7-44d8-bfc4-52a6d1935ddf";

  // ──── ラウンド1案件一覧 ────
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // ──── 自分の participant_id を保持 ────
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [fetchingParticipant, setFetchingParticipant] = useState<boolean>(true);
  const [participantError, setParticipantError] = useState<string | null>(null);

  // ──── 各行の入力価格を保持 ────
  const [priceInputs, setPriceInputs] = useState<Record<string, number>>({});
  // 入札済み案件の ID を Set で保持
  const [enteredItems, setEnteredItems] = useState<Set<string>>(new Set());
  // 各行のエラーメッセージ（キー = item.id）
  const [entryErrors, setEntryErrors] = useState<Record<string, string>>({});

  // ──── 1) 参加者一覧取得 → 自分の participant_id を特定 ────
  useEffect(() => {
    async function fetchParticipant() {
      try {
        const res = await fetch(`/api/game/${sessionId}`);
        if (!res.ok) {
          let errMsg = "参加者情報の取得に失敗しました";
          // レスポンスが JSON かどうか確認
          const text = await res.text();
          try {
            const body = JSON.parse(text);
            errMsg = body.error || errMsg;
          } catch {
            // JSON でなければそのまま errMsg を使う
          }
          setParticipantError(errMsg);
          setFetchingParticipant(false);
          return;
        }
        const data = await res.json();
        const participants: Participant[] = data.participants;
        const me = participants.find((p) => p.user_id === USER_ID);
        if (!me) {
          setParticipantError("このセッションにはまだ参加していません");
          setFetchingParticipant(false);
          return;
        }
        setParticipantId(me.id);
      } catch (e) {
        console.error("Round1Page: 参加者取得エラー", e);
        setParticipantError("ネットワークエラーが発生しました");
      } finally {
        setFetchingParticipant(false);
      }
    }

    fetchParticipant();
  }, [sessionId]);

  // ──── 2) ラウンド1の案件一覧を取得 ────
  useEffect(() => {
    async function fetchItems() {
      setItemsLoading(true);
      setItemsError(null);

      try {
        const res = await fetch(`/api/game/${sessionId}/round/1/items`);
        if (!res.ok) {
          let errMsg = "案件一覧の取得に失敗しました";
          const text = await res.text();
          try {
            const body = JSON.parse(text);
            errMsg = body.error || errMsg;
          } catch {
            // JSON parse に失敗⇒テキストそのまま使う（ただし空文字ならデフォルト）
            if (text.trim()) {
              errMsg = text;
            }
          }
          setItemsError(errMsg);
          setItemsLoading(false);
          return;
        }

        // 正常時は JSON をパース
        const data = await res.json();
        setGameItems(data.items);
      } catch (e) {
        console.error("Round1Page: 案件取得エラー", e);
        setItemsError("ネットワークエラーが発生しました");
      } finally {
        setItemsLoading(false);
      }
    }

    fetchItems();
  }, [sessionId]);

  // ──── 3) 入札処理 ────
  const handleBid = async (item: GameItem) => {
    if (!participantId) return;
    const price = priceInputs[item.id];
    // バリデーション：未入力または範囲外
    if (!price || price < item.min_price || price > item.max_price) {
      setEntryErrors((prev) => ({
        ...prev,
        [item.id]: `価格は ${item.min_price} ～ ${item.max_price} の範囲で入力してください`,
      }));
      return;
    }

    // エラーメッセージをクリア
    setEntryErrors((prev) => ({ ...prev, [item.id]: "" }));

    try {
      const res = await fetch(`/api/game/${sessionId}/round/1/entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          item_id: item.id,
          price: price,
        }),
      });
      if (!res.ok) {
        let errMsg = "入札に失敗しました";
        const text = await res.text();
        try {
          const body = JSON.parse(text);
          errMsg = body.error || errMsg;
        } catch {
          if (text.trim()) {
            errMsg = text;
          }
        }
        setEntryErrors((prev) => ({
          ...prev,
          [item.id]: errMsg,
        }));
        return;
      }
      // 成功時：enteredItems に ID を追加
      setEnteredItems((prev) => new Set(prev).add(item.id));
    } catch (e) {
      console.error("Round1Page: 入札エラー", e);
      setEntryErrors((prev) => ({
        ...prev,
        [item.id]: "ネットワークエラーが発生しました",
      }));
    }
  };

  // ──── 4) 全アイテム入札完了 → 自動遷移 ────
  useEffect(() => {
    if (
      !itemsLoading &&
      !fetchingParticipant &&
      participantId &&
      gameItems.length > 0 &&
      enteredItems.size === gameItems.length
    ) {
      const timer = setTimeout(() => {
        router.push(`/game/${sessionId}/round/1/result`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [enteredItems, gameItems, itemsLoading, fetchingParticipant, participantId, router, sessionId]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/game/${sessionId}`)}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; セッション詳細に戻る
      </button>

      <h1 className="text-2xl font-bold mb-4">ラウンド1：入札画面</h1>

      {(itemsLoading || fetchingParticipant) && <p>読み込み中…</p>}

      {participantError && !fetchingParticipant && (
        <p className="text-red-500 mb-4">{participantError}</p>
      )}

      {itemsError && !itemsLoading && (
        <p className="text-red-500 mb-4">{itemsError}</p>
      )}

      {!itemsLoading && !fetchingParticipant && participantId && gameItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="border px-2 py-1">No.</th>
                <th className="border px-2 py-1">案件タイトル</th>
                <th className="border px-2 py-1">原価</th>
                <th className="border px-2 py-1">最低価格</th>
                <th className="border px-2 py-1">最高価格</th>
                <th className="border px-2 py-1">入札価格</th>
                <th className="border px-2 py-1">アクション</th>
                <th className="border px-2 py-1">エラー</th>
              </tr>
            </thead>
            <tbody>
              {gameItems.map((item, idx) => {
                const isEntered = enteredItems.has(item.id);
                return (
                  <tr key={item.id} className={`text-center ${isEntered ? "bg-gray-100" : ""}`}>
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{item.title}</td>
                    <td className="border px-2 py-1">{item.cost}</td>
                    <td className="border px-2 py-1">{item.min_price}</td>
                    <td className="border px-2 py-1">{item.max_price}</td>
                    <td className="border px-2 py-1">
                      {isEntered ? (
                        <span>登録済み</span>
                      ) : (
                        <input
                          type="number"
                          value={priceInputs[item.id] ?? ""}
                          onChange={(e) =>
                            setPriceInputs((prev) => ({
                              ...prev,
                              [item.id]: parseInt(e.target.value, 10),
                            }))
                          }
                          min={item.min_price}
                          max={item.max_price}
                          className="w-24 border rounded px-1 py-0.5"
                        />
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      {isEntered ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <button
                          onClick={() => handleBid(item)}
                          disabled={isEntered || priceInputs[item.id] === undefined}
                          className={`px-2 py-1 rounded text-white ${
                            isEntered
                              ? "bg-gray-400"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          入札
                        </button>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-red-500">
                      {entryErrors[item.id]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {enteredItems.size === gameItems.length && (
            <p className="text-green-600 font-semibold">
              全アイテムに入札しました。結果ページへ移動します…
            </p>
          )}
        </div>
      )}
    </main>
  );
}