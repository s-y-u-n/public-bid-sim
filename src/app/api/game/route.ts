// src/app/api/game/route.ts

import { NextResponse } from "next/server";
import { isValidUUID } from "@/lib/validation";

// POST /api/game
// 新規ゲームセッション作成（現状はDB操作ダミー）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { created_by } = body;

    // バリデーション: created_by（AuthユーザーID）はUUID形式必須
    if (!created_by || !isValidUUID(created_by)) {
      return NextResponse.json(
        { error: "created_by（ユーザーID）が正しくありません" },
        { status: 400 }
      );
    }

    // ここで本来はDB操作する（今回はダミー返却）
    const dummySession = {
      id: "00000000-0000-0000-0000-000000000000",
      status: "waiting",
      round: 1,
      created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(dummySession, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "JSON解析に失敗しました" }, { status: 400 });
  }
}