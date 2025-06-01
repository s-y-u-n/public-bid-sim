// src/app/api/bid/entry/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// ① 環境変数からサービスロールキーを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ② サービスロールキーで初期化したクライアントを作成
//    → これにより、このクライアントを使った操作はすべて RLS をバイパスできる
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bid_id, user_id, price } = body as {
      bid_id: string;
      user_id: string;
      price: number;
    };

    if (!bid_id || !user_id || typeof price !== "number") {
      return NextResponse.json(
        { error: "必要なフィールドが不足しています" },
        { status: 400 }
      );
    }

    // ③ service role クライアントを使って INSERT を実行
    const { data, error } = await supabaseAdmin.from("entries").insert([
      {
        bid_id,
        user_id,
        price,
      }
    ]).select("*");

    console.log("API Route [POST /api/bid/entry]: insert response:", { data, error });

    if (error) {
      console.error("API Route [POST /api/bid/entry]: insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    console.error("API Route [POST /api/bid/entry]: unexpected error:", e);
    return NextResponse.json(
      { error: "サーバー側で予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}