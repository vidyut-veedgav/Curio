import { LLMProvider } from "./LLMProvider";
import { OpenAIProvider } from "./providers/openai";

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json_object';
}

export const providers: Record<string, () => LLMProvider> = {
    "GPT-4o": () => new OpenAIProvider("gpt-4o"),
    "GPT-4o Mini": () => new OpenAIProvider("gpt-4o-mini"),
    "GPT-4 Turbo": () => new OpenAIProvider("gpt-4-turbo"),
};