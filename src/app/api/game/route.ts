/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/game/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service Role Key を利用したクライアント（RLSバイパス）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface RequestBody {
  created_by: string;
}

// -----------------------------------
// GET /api/game
//   → 待機中（status = 'waiting'）のゲームセッション一覧を返す
export async function GET() {
  try {
    // ① game_sessions テーブルから status='waiting' のレコードをすべて取得
    const { data: sessions, error } = await supabaseAdmin
      .from("game_sessions")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("ゲームセッション一覧取得エラー:", error);
      return NextResponse.json(
        { error: "ゲームセッション一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    // ② 正常時は配列を返却（待機中セッションがなければ空配列）
    return NextResponse.json(sessions ?? [], { status: 200 });
  } catch (e: any) {
    console.error("GET /api/game 例外:", e);
    return NextResponse.json(
      { error: e.message || "リクエスト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// -----------------------------------
// POST /api/game
//   → ゲームセッション作成 + 自分を参加者登録
export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { created_by } = body;

    // バリデーション: created_by は必須かつUUID形式
    if (!created_by || !isValidUUID(created_by)) {
      return NextResponse.json(
        { error: "created_by（ユーザーID）が正しくありません" },
        { status: 400 }
      );
    }

    // ① game_sessions テーブルに挿入（supabaseAdmin で実行）
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

    // ② participants テーブルに「作成者」を登録（supabaseAdmin で実行）
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

    // ③ 成功時は作成したセッション情報と参加者情報を返却
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