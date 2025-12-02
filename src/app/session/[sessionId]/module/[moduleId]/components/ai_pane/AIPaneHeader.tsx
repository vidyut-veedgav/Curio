"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIPaneHeaderProps {
  onClose: () => void;
}

export function AIPaneHeader({ onClose }: AIPaneHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-1 border-b">
      <h2 className="text-sm font-semibold">AI Tutor</h2>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-sm opacity-70 hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
}
