import OpenAI from "openai";
import { LLMProvider, Message, CompletionOptions } from "./../types";

export class OpenAIProvider implements LLMProvider {
	private client: OpenAI;
	private model: string;

	constructor(model = "gpt-4-turbo-preview") {
		this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
		this.model = model;
	}

	async complete(
		messages: Message[],
		options?: CompletionOptions
	): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: options?.model || this.model,
			messages,
			temperature: options?.temperature,
			max_tokens: options?.maxTokens,
		});

		return response.choices[0]?.message?.content || "";
	}

	async *stream(
		messages: Message[],
		options?: CompletionOptions
	): AsyncGenerator<string> {
		const stream = await this.client.chat.completions.create({
			model: options?.model || this.model,
			messages,
			temperature: options?.temperature,
			max_tokens: options?.maxTokens,
			stream: true,
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content;
			if (content) yield content;
		}
	}
}