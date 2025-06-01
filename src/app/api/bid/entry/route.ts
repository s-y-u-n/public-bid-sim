// src/app/api/bid/entry/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  // リクエストボディをパース
  const body = await request.json();
  const { bid_id, user_id, price } = body as {
    bid_id: string;
    user_id: string;
    price: number;
  };

  // bids_entries テーブルにレコードを挿入
  const { data, error } = await supabase
    .from("bids_entries")
    .insert([{ bid_id, user_id, price }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // 挿入したレコードを返す
  return NextResponse.json(data, { status: 201 });
}