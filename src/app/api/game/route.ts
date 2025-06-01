// src/app/api/game/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";
import { supabase } from "@/lib/supabaseClient";

interface RequestBody {
  created_by: string;
}

// POST /api/game
// Supabase に実際のレコードを作成
export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { created_by } = body;

    // バリデーション: created_by（AuthユーザーID）はUUID形式必須
    if (!created_by || !isValidUUID(created_by)) {
      return NextResponse.json(
        { error: "created_by（ユーザーID）が正しくありません" },
        { status: 400 }
      );
    }

    // ① game_sessions テーブルに挿入
    const { data: sessionData, error: sessionError } = await supabase
      .from("game_sessions")
      .insert([
        {
          created_by,
          status: "waiting",
          round: 1,
        },
      ])
      .select("*")
      .single();

    if (sessionError || !sessionData) {
      console.error("ゲームセッション作成エラー:", sessionError);
      return NextResponse.json(
        { error: "ゲームセッションの作成に失敗しました" },
        { status: 500 }
      );
    }

    // ② participants テーブルに「作成者」を登録
    const { data: participantData, error: participantError } = await supabase
      .from("participants")
      .insert([
        {
          user_id: created_by,
          game_session_id: sessionData.id,
        },
      ])
      .select("*")
      .single();

    if (participantError || !participantData) {
      console.error("参加者登録エラー:", participantError);
      // もしセッションだけ作成されてしまった場合は削除するかも検討
      return NextResponse.json(
        { error: "参加者の登録に失敗しました" },
        { status: 500 }
      );
    }

    // ③ 成功したら作成したセッション情報と参加者情報を返却
    return NextResponse.json(
      {
        session: sessionData,
        participant: participantData,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/game 例外:", e);
    return NextResponse.json(
      { error: "リクエスト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}