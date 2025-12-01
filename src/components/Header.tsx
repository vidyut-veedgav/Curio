"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { data: session, status: sessionStatus } = useSession();
  const isLoading = sessionStatus === "loading";

  const identity = isLoading ? (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </>
  ) : (
    <>
      <span className="text-sm font-medium text-foreground">
        {session?.user?.name ?? session?.user?.email}
      </span>
      {session?.user?.image ? (
        <Image
          src={session.user.image}
          alt={session?.user?.name ?? "User avatar"}
          width={32}
          height={32}
          className="h-8 w-8 rounded-md object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </>
  );

  return (
    <header className="flex items-center justify-between px-6 py-1.5 border-b">
      <Link href="/home" className="hover:opacity-80 transition-opacity">
        <Image src="/CurioLogo.png" alt="Curio" width={600} height={200} priority className="h-6 w-auto" />
      </Link>
      <Link href="/profile" className="flex items-center gap-3 px-2 py-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {identity}
      </Link>
    </header>
  );
}
