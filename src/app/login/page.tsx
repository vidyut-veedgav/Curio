"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-900">Curio</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Your AI-powered learning companion
        </p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          className="shadow-lg"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}