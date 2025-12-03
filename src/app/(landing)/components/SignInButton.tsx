"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignInButton() {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/home" })}
      variant="outline"
      size="lg"
      className="bg-white text-gray-700 border border-gray-300 px-8 py-4 text-lg font-medium rounded-lg flex items-center gap-3 hover:bg-white hover:text-gray-700 hover:border-gray-300"
    >
      <Image
        src="/GoogleIcon.png"
        alt="Google"
        width={24}
        height={24}
      />
      Start Learning
    </Button>
  );
}
