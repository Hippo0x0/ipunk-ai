const isCount = value => Number.isSafeInteger(value) && value >= 0;

export function summarizeOpenCodeUsage(raw) {
  const totals = {input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0};
  const seen = new Set();
  const sessions = new Set();
  let steps = 0;
  let incomplete = 0;
  let unrecognized = 0;
  let duplicates = 0;

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      unrecognized++;
      continue;
    }
    if (row?.type !== 'step_finish') continue;

    const part = row.part;
    const tokens = part?.tokens;
    const values = {
      input: tokens?.input,
      output: tokens?.output,
      reasoning: tokens?.reasoning,
      cacheRead: tokens?.cache?.read,
      cacheWrite: tokens?.cache?.write,
    };
    const complete = Object.entries(values).every(([name, value]) =>
      isCount(value) && Number.isSafeInteger(totals[name] + value));
    if (!complete) {
      incomplete++;
      continue;
    }

    const session = row.sessionID ?? part.sessionID;
    if (typeof part.id === 'string' && part.id) {
      const key = JSON.stringify([session, part.id]);
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
    }
    for (const [name, value] of Object.entries(values)) totals[name] += value;
    if (typeof session === 'string' && session) sessions.add(session);
    steps++;
  }

  return {steps, sessions: sessions.size, incomplete, unrecognized, duplicates, totals};
}
