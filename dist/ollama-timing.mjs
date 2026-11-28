const nsPerSecond = 1e9;

function readRecords(text) {
  if (!text || text.length > 1_000_000) {
    throw new Error('Paste one Ollama response up to one million characters.');
  }
  const input = text.trim();
  try {
    return [JSON.parse(input)];
  } catch {
    try {
      return input.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
    } catch {
      throw new Error('Paste native Ollama JSON or NDJSON from /api/generate or /api/chat.');
    }
  }
}

function counter(record, field) {
  const value = record[field];
  if (value == null) return null;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Ollama counts and durations must be non-negative integers.');
  }
  return value;
}

function phase(record, countField, durationField) {
  const count = counter(record, countField);
  const duration = counter(record, durationField);
  return {
    count,
    seconds: duration === null ? null : duration / nsPerSecond,
    tokensPerSecond: count !== null && duration > 0 ? count / duration * nsPerSecond : null,
  };
}

export function readOllamaTiming(text) {
  const records = readRecords(text);
  const final = records.at(-1);
  if (records.some(record => !record || typeof record !== 'object' || Array.isArray(record))) {
    throw new Error('Expected native Ollama response objects.');
  }
  if (records.some(record => record.error)) {
    throw new Error('The request returned an Ollama error. Run it again after resolving the error.');
  }
  if (final?.done !== true || records.slice(0, -1).some(record => record.done === true)) {
    throw new Error('Paste one complete response ending in a record with "done": true.');
  }

  const prompt = phase(final, 'prompt_eval_count', 'prompt_eval_duration');
  const generation = phase(final, 'eval_count', 'eval_duration');
  if ([prompt.count, generation.count, prompt.seconds, generation.seconds].every(value => value === null)) {
    throw new Error('This response has no native timing counters. Generate some text with /api/generate or /api/chat.');
  }
  const seconds = field => {
    const value = counter(final, field);
    return value === null ? null : value / nsPerSecond;
  };
  return {prompt, generation, loadSeconds: seconds('load_duration'), totalSeconds: seconds('total_duration')};
}
