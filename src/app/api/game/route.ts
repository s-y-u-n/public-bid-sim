// src/app/api/game/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";
// Service Role Key を利用したクライアントを作成
import { createClient } from "@supabase/supabase-js";

interface RequestBody {
  created_by: string;
}

// Service Role Key は .env.local から読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// サーバー側専用クライアント（RLSをバイパス）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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

    // ------- ここから supabaseAdmin を使って RLSをバイパス -------

    // ① game_sessions テーブルに挿入
    const { data: sessionData, error: sessionError } = await supabaseAdmin
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
        { error: sessionError?.message || "ゲームセッションの作成に失敗しました" },
        { status: 500 }
      );
    }

    // ② participants テーブルに「作成者」を登録
    const { data: participantData, error: participantError } = await supabaseAdmin
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
      return NextResponse.json(
        { error: participantError?.message || "参加者の登録に失敗しました" },
        { status: 500 }
      );
    }

    // ------- supabaseAdmin 終了 -------

    // ③ 成功したら作成したセッション情報と参加者情報を返却
    return NextResponse.json(
      {
        session: sessionData,
        participant: participantData,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("POST /api/game 例外:", e);
    return NextResponse.json(
      { error: e.message || "リクエスト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}