// src/app/api/game/[id]/round/[round]/items/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Params {
  params: {
    id: string;
    round: string;
  };
}

// 環境変数から Supabase の URL と Service Role Key を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// サーバー専用クライアント（Service Role Key を使って RLS をバイパス）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(request: Request, { params }: Params) {
  const sessionId = params.id;
  const roundNumber = Number(params.round);

  try {
    // ① Supabase から game_items テーブルを取得
    const { data: items, error } = await supabaseAdmin
      .from("game_items")
      .select("*")
      .eq("game_session_id", sessionId)
      .eq("round", roundNumber)
      .order("project_number", { ascending: true });

    if (error) {
      console.error("API GET /round/[round]/items error:", error.message);
      return NextResponse.json(
        { error: `案件一覧の取得に失敗しました（${error.message}）` },
        { status: 500 }
      );
    }

    // 空配列でも 200 を返す
    return NextResponse.json({ items: items ?? [] }, { status: 200 });
  } catch (e) {
    console.error("API GET /round/[round]/items unexpected error:", e);
    return NextResponse.json(
      { error: "案件一覧の取得中に予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}