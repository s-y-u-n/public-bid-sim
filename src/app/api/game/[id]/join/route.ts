// src/app/api/game/[id]/join/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";
import { supabase } from "@/lib/supabaseClient";

interface RequestBody {
  user_id: string;
}

/**
 * POST /api/game/[id]/join
 * リクエストボディ：{ user_id: string }
 * → 指定のゲームセッションに参加登録
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body: RequestBody = await request.json();
    const { user_id } = body;

    // 1) user_id が UUID 形式であるか
    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json(
        { error: "user_id（ユーザーID）が正しくありません" },
        { status: 400 }
      );
    }

    // 2) game_sessions に該当 sessionId が存在するか確認
    const { data: existingSession, error: sessionError } = await supabase
      .from("game_sessions")
      .select("id")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("ゲームセッション検索エラー:", sessionError);
      return NextResponse.json(
        { error: "ゲームセッション情報の取得に失敗しました" },
        { status: 500 }
      );
    }
    if (!existingSession) {
      return NextResponse.json(
        { error: "指定されたゲームセッションが存在しません" },
        { status: 404 }
      );
    }

    // 3) すでに同じユーザーが参加済みかチェック
    const { data: existingParticipant, error: participantQueryError } = await supabase
      .from("participants")
      .select("id")
      .eq("game_session_id", sessionId)
      .eq("user_id", user_id)
      .single();

    if (participantQueryError) {
      console.error("参加者クエリエラー:", participantQueryError);
      return NextResponse.json(
        { error: "参加情報の取得に失敗しました" },
        { status: 500 }
      );
    }
    if (existingParticipant) {
      return NextResponse.json(
        { error: "すでにこのセッションに参加済みです" },
        { status: 409 }
      );
    }

    // 4) participants テーブルに新規行を挿入
    const { data: newParticipant, error: insertError } = await supabase
      .from("participants")
      .insert([
        {
          user_id,
          game_session_id: sessionId,
        },
      ])
      .select("*")
      .single();

    if (insertError || !newParticipant) {
      console.error("参加者登録エラー:", insertError);
      return NextResponse.json(
        { error: "参加者の登録に失敗しました" },
        { status: 500 }
      );
    }

    // 5) 正常時は参加者情報を返却
    return NextResponse.json(newParticipant, { status: 201 });
  } catch (e) {
    console.error("POST /api/game/[id]/join 例外:", e);
    return NextResponse.json(
      { error: "リクエスト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}