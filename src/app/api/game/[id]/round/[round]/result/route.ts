// src/app/api/game/[id]/round/[round]/result/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

interface Params {
  params: { id: string; round: string };
}

export async function GET(_: Request, { params }: Params) {
  const { id: sessionId, round } = params;

  const { data, error } = await supabaseAdmin
    .from("results")
    .select("*")
    .eq("game_session_id", sessionId)
    .eq("round", parseInt(round, 10))
    .order("project_number", { ascending: true });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "ラウンド結果の取得に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ results: data }, { status: 200 });
}