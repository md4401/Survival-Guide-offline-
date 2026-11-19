/** Offline RAG assistant (spec §6.9). NOT implemented in the MVP: vital content never goes through it. */
export interface AssistantAnswer { text: string; guideIds: string[]; generated: true }
export interface Assistant {
  available(): Promise<boolean>;
  ask(question: string, locale: string): Promise<AssistantAnswer | null>;
}
export const assistant: Assistant = { available: async () => false, ask: async () => null };
