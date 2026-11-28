const nsPerSecond = 1e9;

class TimingInputError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function readRecords(text) {
  if (!text || text.length > 1_000_000) {
    throw new TimingInputError('input-size', 'Paste one Ollama response up to one million characters.');
  }
  const input = text.trim();
  try {
    return [JSON.parse(input)];
  } catch {
    try {
      return input.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
    } catch {
      throw new TimingInputError('input-format', 'Paste native Ollama JSON or NDJSON from /api/generate or /api/chat.');
    }
  }
}

function counter(record, field) {
  const value = record[field];
  if (value == null) return null;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TimingInputError('invalid-counter', 'Ollama counts and durations must be non-negative integers.');
  }
  return value;
}

function phase(record, countField, durationField, cached = 0) {
  const count = counter(record, countField);
  const duration = counter(record, durationField);
  return {
    count,
    seconds: duration === null ? null : duration / nsPerSecond,
    tokensPerSecond: count !== null && duration > 0 ? Math.max(0, count - cached) / duration * nsPerSecond : null,
  };
}

export function readOllamaTiming(text) {
  const records = readRecords(text);
  const final = records.at(-1);
  if (records.some(record => !record || typeof record !== 'object' || Array.isArray(record))) {
    throw new TimingInputError('expected-objects', 'Expected native Ollama response objects.');
  }
  if (records.some(record => record.error)) {
    throw new TimingInputError('api-error', 'The request returned an Ollama error. Run it again after resolving the error.');
  }
  if (final?.done !== true || records.slice(0, -1).some(record => record.done === true)) {
    throw new TimingInputError('incomplete', 'Paste one complete response ending in a record with "done": true.');
  }

  const cachedCount = counter(final, 'prompt_eval_cached_count');
  const prompt = {...phase(final, 'prompt_eval_count', 'prompt_eval_duration', cachedCount ?? 0), cachedCount};
  const generation = phase(final, 'eval_count', 'eval_duration');
  if ([prompt.count, generation.count, prompt.seconds, generation.seconds].every(value => value === null)) {
    throw new TimingInputError('no-counters', 'This response has no native timing counters. Generate some text with /api/generate or /api/chat.');
  }
  const seconds = field => {
    const value = counter(final, field);
    return value === null ? null : value / nsPerSecond;
  };
  return {prompt, generation, loadSeconds: seconds('load_duration'), totalSeconds: seconds('total_duration')};
}
