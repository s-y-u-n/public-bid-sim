// src/app/api/bid/[id]/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface Params {
  params: { id: string };
}

// GET /api/bid/[id]
//   → URL の <id> 部分を params.id として受け取る
export async function GET(request: Request, { params }: Params) {
  const { id } = await params; // 例: "abb258e6-f1d4-4a81-9920-e7fddfd4e96b"

  // ① 該当する bids テーブルのレコードを single() で取得
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .select("*")
    .eq("id", id)
    .single();

  if (bidError || !bid) {
    return NextResponse.json(
      { error: bidError?.message || "案件が見つかりません" },
      { status: 404 }
    );
  }

  // ② その案件に紐づく entries テーブルのレコードを取得（最新順などお好みでソート）
  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("*")
    .eq("bid_id", id)
    .order("created_at", { ascending: false });

  if (entriesError) {
    return NextResponse.json(
      { error: entriesError.message },
      { status: 500 }
    );
  }

  // ③ bid と entries をまとめて返却
  return NextResponse.json({ bid, entries }, { status: 200 });
}

// PUT /api/bid/[id]
//   → リクエストボディに JSON を含む。更新処理を行う
export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  const body = await request.json();
  const {
    title,
    description,
    open_date,
    close_date,
    updated_by,
  } = body as {
    title: string;
    description?: string;
    open_date: string;
    close_date: string;
    updated_by: string;
  };

  // まず、作成者(created_by)をチェックするために既存レコードを取得
  const { data: existing, error: fetchError } = await supabase
    .from("bids")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "対象の案件が見つかりません" },
      { status: 404 }
    );
  }
  // 作成者と updated_by を比較し、一致しない場合は権限なし
  if (existing.created_by !== updated_by) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // 更新を実行
  const { data, error } = await supabase
    .from("bids")
    .update({
      title,
      description,
      open_date,
      close_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// DELETE /api/bid/[id]?user_id=<ユーザーID>
//   → クエリパラメータ user_id を受け取り、作成者チェックのうえ削除を実行
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id"); // 例: "abb258e6-f1d4-4a81-9920-e7fddfd4e96b"

  // 作成者(created_by) をチェックするために既存レコードを取得
  const { data: existing, error: fetchError } = await supabase
    .from("bids")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "対象の案件が見つかりません" },
      { status: 404 }
    );
  }
  if (existing.created_by !== userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // 削除を実行
  const { error } = await supabase.from("bids").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "削除しました" }, { status: 200 });
}