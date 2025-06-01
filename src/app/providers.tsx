// src/app/providers.tsx
"use client";

import { ReactNode, useState } from "react";
// ← createBrowserSupabaseClient は auth-helpers-nextjs から
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
// ← SessionContextProvider は auth-helpers-react から
import { SessionContextProvider } from "@supabase/auth-helpers-react";


interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // ブラウザ用の Supabase クライアントを useState で一度だけ生成
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}