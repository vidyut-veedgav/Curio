"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-900">Curio</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Your AI-powered learning companion
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors duration-200"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}