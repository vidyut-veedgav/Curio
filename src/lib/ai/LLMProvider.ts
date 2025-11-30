import { Message, CompletionOptions } from "./types";

export abstract class LLMProvider {
    protected model: string;

    constructor(model: string) {
        this.model = model;
    }

    abstract complete(messages: Message[], options?: CompletionOptions): Promise<string>;
    abstract stream(messages: Message[], options?: CompletionOptions): AsyncGenerator<string>;
}
