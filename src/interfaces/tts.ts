/** Read-aloud of "Do this now" steps using the device's own voices; works offline when the voice is installed. Premium/dev only. */
export interface VoiceReader { supported(locale: string): Promise<boolean>; readSteps(steps: string[], locale: string): Promise<void>; stop(): void }

const synth = () => (typeof speechSynthesis !== 'undefined' ? speechSynthesis : null);
async function voices(): Promise<SpeechSynthesisVoice[]> {
  const s = synth(); if (!s) return [];
  const v = s.getVoices(); if (v.length) return v;
  return new Promise((r) => { s.onvoiceschanged = () => r(s.getVoices()); setTimeout(() => r(s.getVoices()), 800); });
}
export const voiceReader: VoiceReader = {
  supported: async (locale) => (await voices()).some((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase())),
  async readSteps(steps, locale) {
    const s = synth(); if (!s) return;
    const voice = (await voices()).find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase()) && v.localService) ?? (await voices()).find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase()));
    s.cancel();
    steps.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(`${i + 1}. ${text}`); u.lang = voice?.lang ?? locale; if (voice) u.voice = voice; u.rate = 0.95; s.speak(u);
    });
  },
  stop: () => synth()?.cancel(),
};
