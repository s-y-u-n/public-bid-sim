// src/components/SignOutButton.tsx
"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const session = useSession();

  // ログインしていなければ何も表示しない
  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    >
      ログアウト
    </button>
  );
}