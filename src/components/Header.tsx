"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/useGetUser";

export function Header() {
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id || "";

  const getUserQuery = useGetUser(userId);
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith("/profile");
  const isLoading = sessionStatus === "loading" || getUserQuery.isLoading;

  const identity = isLoading ? (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </>
  ) : (
    <>
      <span className="text-sm font-medium text-foreground">
        {getUserQuery.data?.name ?? getUserQuery.data?.email}
      </span>
      <Avatar className="h-8 w-8 rounded-md">
        <AvatarImage src={getUserQuery.data?.image ?? undefined} alt={getUserQuery.data?.name ?? "Current user avatar"} />
        <AvatarFallback className="bg-muted">
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
        </AvatarFallback>
      </Avatar>
    </>
  );

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="flex items-center justify-between px-6 py-1.5 border-b">
      <Link href="/home" className="hover:opacity-80 transition-opacity">
        <Image src="/CurioLogo.png" alt="Curio" width={300} height={100} priority className="h-6 w-auto" />
      </Link>
      {isProfilePage ? (
        <div className="flex items-center gap-3">{identity}</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 px-2 py-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {identity}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
