"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Paperclip } from "lucide-react";
import { useState } from "react";
import { DocumentPreview } from "./DocumentPreview";

interface CourseInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  isCreatingSession: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function CourseInput({ topic, setTopic, isCreatingSession, onKeyDown }: CourseInputProps) {
  const [documentsAttached, setDocumentsAttached] = useState(true);

  return (
    <InputGroup className="w-full max-w-2xl min-h-[120px] shadow-[0_0_4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
      <InputGroupTextarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Curio to teach you anything..."
        disabled={isCreatingSession}
        className="min-h-0 !text-base pl-4 pt-4"
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          variant="ghost"
          size="icon-sm"
          className="border border-border"
          onClick={() => {}}
          disabled={isCreatingSession}
        >
          <Paperclip />
          <span className="sr-only">Attach file</span>
        </InputGroupButton>
      </InputGroupAddon>
      {documentsAttached && (
        <InputGroupAddon align="block-end" className="border-t border-border bg-secondary py-3">
          <DocumentPreview fileName="BAFI 361 Module 3.pdf" fileType="PDF" />
          <DocumentPreview fileName="CSDS 393 Diagram.jpg" fileType="JPG" />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
