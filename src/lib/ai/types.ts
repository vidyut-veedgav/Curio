export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
  
export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
  
export interface LLMProvider {
    complete(messages: Message[], options?: CompletionOptions): Promise<string>;
    stream(messages: Message[], options?: CompletionOptions): AsyncGenerator<string>;
}