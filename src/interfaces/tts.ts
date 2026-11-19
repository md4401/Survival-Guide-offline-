/** Read-aloud of "Do this now" steps using device voices (Premium, v1.0). NOT implemented in the MVP. */
export interface VoiceReader { supported(locale: string): Promise<boolean>; readSteps(steps: string[], locale: string): Promise<void>; stop(): void }
export const voiceReader: VoiceReader = { supported: async () => false, readSteps: async () => {}, stop: () => {} };
