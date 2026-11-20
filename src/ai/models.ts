/** Catalog of downloadable on-device models (spec §6.9 tiers). The model is NEVER bundled with the app: the user opts in and picks one.
 *  Repo ids/sizes are best-effort and could NOT be verified from the build environment: availability is checked when the download starts. */
export type Tier = 'tiny' | 'lite' | 'standard' | 'pro';
export interface ModelInfo { id: string; repo: string; label: string; tier: Tier; approxMB: number; minRamGB: number; dtype: 'q4' | 'q4f16'; gatedHint?: boolean; qwen3?: boolean }
export const MODELS: ModelInfo[] = [
  { id: 'smollm2-360m', repo: 'HuggingFaceTB/SmolLM2-360M-Instruct', label: 'SmolLM2 360M', tier: 'tiny', approxMB: 380, minRamGB: 2, dtype: 'q4' },
  { id: 'qwen3-0.6b', repo: 'onnx-community/Qwen3-0.6B-ONNX', label: 'Qwen3 0.6B', tier: 'lite', approxMB: 450, minRamGB: 4, dtype: 'q4', qwen3: true },
  { id: 'gemma3-1b', repo: 'onnx-community/gemma-3-1b-it-ONNX', label: 'Gemma 3 1B', tier: 'lite', approxMB: 760, minRamGB: 4, dtype: 'q4', gatedHint: true },
  { id: 'qwen3-1.7b', repo: 'onnx-community/Qwen3-1.7B-ONNX', label: 'Qwen3 1.7B', tier: 'standard', approxMB: 1200, minRamGB: 6, dtype: 'q4', qwen3: true },
  { id: 'qwen3-4b', repo: 'onnx-community/Qwen3-4B-ONNX', label: 'Qwen3 4B', tier: 'pro', approxMB: 2600, minRamGB: 8, dtype: 'q4', qwen3: true },
];
/** Pinned runtime, loaded only after the user agrees to download a model. */
export const RUNTIME_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
/** Same pinned file on a second CDN, tried when the first one cannot be reached or imported. */
export const RUNTIME_URLS = [RUNTIME_URL, 'https://unpkg.com/@huggingface/transformers@3.8.1/dist/transformers.min.js'];
export const HF_API = 'https://huggingface.co/api/models/';

/** Largest tier the device RAM suggests (navigator.deviceMemory is capped at 8 and may be missing). */
export function recommendedTier(ramGB: number | undefined): Tier {
  if (!ramGB) return 'lite';
  return ramGB >= 8 ? 'pro' : ramGB >= 6 ? 'standard' : ramGB >= 4 ? 'lite' : 'tiny';
}
export const customModel = (repo: string): ModelInfo => ({ id: `custom:${repo}`, repo, label: repo, tier: 'lite', approxMB: 0, minRamGB: 0, dtype: 'q4' });
export const isValidRepo = (r: string) => /^[\w.-]+\/[\w.-]+$/.test(r.trim());
