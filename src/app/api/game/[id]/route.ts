// src/app/api/game/[id]/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";
import { createClient } from "@supabase/supabase-js";

// 環境変数から Supabase 情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service Role Key を使って RLS をバイパスするクライアントを生成
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/game/[id]
// ゲームセッション情報および参加者一覧を返す
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;

    // 1) sessionId が UUID 形式であるかチェック
    if (!isValidUUID(sessionId)) {
      return NextResponse.json(
        { error: "sessionId が正しい UUID 形式ではありません" },
        { status: 400 }
      );
    }

    // 2) game_sessions テーブルから該当セッションを取得
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from("game_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("ゲームセッション取得エラー:", sessionError);
      return NextResponse.json(
        { error: "ゲームセッション情報の取得に失敗しました" },
        { status: 500 }
      );
    }
    if (!sessionData) {
      return NextResponse.json(
        { error: "指定されたゲームセッションが存在しません" },
        { status: 404 }
      );
    }

    // 3) participants テーブルから該当セッションの参加者一覧を取得
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from("participants")
      .select("*")
      .eq("game_session_id", sessionId)
      .order("joined_at", { ascending: true });

    if (participantsError) {
      console.error("参加者一覧取得エラー:", participantsError);
      return NextResponse.json(
        { error: "参加者一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 4) 成功時は { session, participants } を返す
    return NextResponse.json(
      { session: sessionData, participants: participantsData },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("GET /api/game/[id] 例外:", e);
    return NextResponse.json(
      { error: e.message || "リクエスト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}