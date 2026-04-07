"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavAuthButtons({ mobile }: { mobile?: boolean }) {
  const { data: session } = useSession();

  const cls = mobile
    ? "block text-sm font-medium py-2"
    : "text-sm font-medium";

  const C = {
    terra: "#C4532A",
    mist:  "#6A5F4A",
    white: "#1A1208",
    ink:   "#F5EDD6",
  };

  if (session) {
    return (
      <Link
        href="/dashboard"
        className={cls}
        style={{ color: C.mist }}
      >
        Mon espace →
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className={cls} style={{ color: C.mist }}>
        Se connecter
      </Link>
      <Link
        href="/login"
        className={`${mobile ? "block text-center" : ""} text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90`}
        style={{ backgroundColor: C.terra, color: "#fff" }}
      >
        Commencer
      </Link>
    </>
  );
}
