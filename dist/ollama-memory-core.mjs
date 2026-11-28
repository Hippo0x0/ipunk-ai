export const GiB = 2 ** 30;

export const modelPresets = Object.freeze({
  'qwen-05b': Object.freeze({ weightBytes: 491400032, layers: 24, kvHeads: 2, headSize: 64, maxContext: 32768 }),
  'qwen-7b': Object.freeze({ weightBytes: 4683073632, layers: 28, kvHeads: 4, headSize: 128, maxContext: 32768 }),
  'qwen-14b': Object.freeze({ weightBytes: 8988110496, layers: 48, kvHeads: 8, headSize: 128, maxContext: 32768 })
});

export function estimateMemory({ model, context, installed, systemReserve, runtimeReserve }) {
  const { weightBytes, layers, kvHeads, headSize, maxContext } = model;
  if (![weightBytes, layers, kvHeads, headSize, maxContext, context].every(Number.isSafeInteger) ||
      weightBytes <= 0 || layers <= 0 || kvHeads <= 0 || headSize <= 0 || maxContext <= 0 ||
      context <= 0 || context > maxContext) {
    throw new RangeError('model');
  }
  if (![installed, systemReserve, runtimeReserve].every(Number.isFinite) ||
      installed <= 0 || systemReserve < 0 || systemReserve >= installed || runtimeReserve < 0) {
    throw new RangeError('budget');
  }

  // One independent sequence, full attention, two tensors (K and V), FP16.
  const kvBytes = context * layers * kvHeads * headSize * 2 * 2;
  if (!Number.isSafeInteger(kvBytes)) throw new RangeError('model');

  const weights = weightBytes / GiB;
  const cache = kvBytes / GiB;
  const available = installed - systemReserve;
  const subtotal = weights + cache + runtimeReserve;
  return { weights, cache, available, subtotal, remaining: available - subtotal, kvBytes };
}
