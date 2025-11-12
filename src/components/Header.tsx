import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 border-b">
      <Link href="/home">
        <h1 className="text-4xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
          curio
        </h1>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-base font-medium text-foreground">Krishin Parikh</span>
        <Avatar className="h-12 w-12">
          <AvatarImage src="" alt="Krishin Parikh" />
          <AvatarFallback className="bg-muted">
            <svg
              className="h-6 w-6 text-muted-foreground"
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
      </div>
    </header>
  );
}
