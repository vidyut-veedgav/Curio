"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { providers } from "@/lib/ai/types";

interface AIPaneInputProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
}

export function AIPaneInput({ onSendMessage, isStreaming }: AIPaneInputProps) {
  const [inputValue, setInputValue] = useState("");
  const providerKeys = Object.keys(providers);
  const [selectedProvider, setSelectedProvider] = useState(providerKeys[0]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return;

    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex justify-center pb-6">
      <div className="w-full max-w-2xl px-6">
        <InputGroup className="min-h-[60px]">
          <InputGroupTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Curio a question..."
            disabled={isStreaming}
            className="min-h-0 !text-base pl-4 pt-4"
          />
          <InputGroupAddon align="block-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost" className="h-8">
                  {selectedProvider}
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="[--radius:0.5rem]"
              >
                {providerKeys.map((providerKey) => (
                  <DropdownMenuItem
                    key={providerKey}
                    className="h-8"
                    onClick={() => setSelectedProvider(providerKey)}
                  >
                    {providerKey}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupButton
              variant="default"
              className="rounded-full ml-auto"
              size="icon-xs"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
            >
              <ArrowUp />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
