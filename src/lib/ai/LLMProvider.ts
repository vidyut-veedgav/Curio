import { Message, CompletionOptions } from "./types";

export abstract class LLMProvider {
    protected model: string;

    constructor(model: string) {
        this.model = model;
    }

    abstract complete(messages: Message[], options?: CompletionOptions): Promise<string>;
    abstract stream(messages: Message[], options?: CompletionOptions): AsyncGenerator<string>;

    /**
     * Cleans AI response by removing markdown code blocks and whitespace.
     * Handles cases where AI returns ```json ... ``` wrapped responses.
     *
     * @param content - Raw response content from LLM
     * @returns Cleaned content ready for JSON.parse()
     */
    protected cleanJsonResponse(content: string): string {
        let cleaned = content.trim();

        // Remove markdown code blocks (```json ... ``` or ``` ... ```)
        const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
        const match = cleaned.match(codeBlockRegex);

        if (match) {
            cleaned = match[1].trim();
        }

        return cleaned;
    }
}
