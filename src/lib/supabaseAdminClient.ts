// src/lib/supabaseAdminClient.ts

import { createClient } from "@supabase/supabase-js";

// 環境変数から Supabase の URL とサービスロールキーを読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Supabase クライアントをサービスロールキーで生成（RLS をバイパス）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);