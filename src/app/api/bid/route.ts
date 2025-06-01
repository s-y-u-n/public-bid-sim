// src/app/api/bid/route.ts

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Service Role Key:", process.env.SUPABASE_SERVICE_ROLE_KEY);

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// サーバー専用クライアント（Service Role Key を使って RLS をバイパス可能）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * GET /api/bid
 *  → 「案件一覧」を取得して返す
 */
export async function GET() {
  try {
    // bids テーブルから全レコードを取得（必要に応じてソートなどを追加可）
    const { data, error } = await supabaseAdmin
      .from("bids")
      .select("*")
      .order("open_date", { ascending: true });

    if (error) {
      console.error("API Route (GET): supabase select error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("API Route (GET): unexpected error:", e);
    return NextResponse.json(
      { error: "サーバー側で予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bid
 *  → 「新規案件作成」を受け取り INSERT する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, open_date, close_date, created_by } = body as {
      title: string;
      description?: string;
      open_date: string;
      close_date: string;
      created_by: string;
    };

    if (
      !title ||
      !open_date ||
      !close_date ||
      !created_by ||
      typeof created_by !== "string"
    ) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.from("bids").insert([
      {
        title,
        description: description ?? null,
        open_date,
        close_date,
        created_by,
      },
    ]);

    console.log("API Route (POST): insert response:", { data, error });

    if (error) {
      console.error("API Route (POST): supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    console.error("API Route (POST): unexpected error:", e);
    return NextResponse.json(
      { error: "サーバー側で予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}