"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header without profile info */}
      <header className="flex items-center justify-between px-6 py-2 border-b">
        <Link href="/" className="text-4xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity">
          curio
        </Link>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-primary">
            Let <span className="text-accent">curio</span>sity guide your learning.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create personalized courses on anything — powered by AI. Don't confine yourself to a one-size-fits-all curriculum.  
          </p>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            size="lg"
            className="text-lg px-8 py-6"
          >
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  );
}