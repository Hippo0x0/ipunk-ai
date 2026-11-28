import {AudioSampleSink, BlobSource, Input, MP4, QTFF, WEBM} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';

export const scanSeconds = 60;
const maxSamples = 24_000_000;

export async function measureSamples(samples, start, end, signal) {
  let peak = 0;
  let count = 0;
  for await (const sample of samples) {
    try {
      signal?.throwIfAborted();
      const {timestamp, sampleRate, numberOfFrames: frames, numberOfChannels: channels} = sample;
      const first = Math.max(0, Math.ceil((start - timestamp) * sampleRate));
      const last = Math.min(frames, Math.ceil((end - timestamp) * sampleRate));
      const frameCount = last - first;
      if (frameCount <= 0) continue;
      count += frameCount * channels;
      if (count > maxSamples) throw new Error('Too many samples in this section.');
      const plane = new Float32Array(frameCount);
      for (let channel = 0; channel < channels; channel++) {
        sample.copyTo(plane, {format: 'f32-planar', planeIndex: channel, frameOffset: first, frameCount});
        for (const value of plane) peak = Math.max(peak, Math.abs(value));
      }
      if (!Number.isFinite(peak)) throw new Error('Invalid decoded audio.');
    } finally {
      sample.close();
    }
  }
  return {peak, count};
}

export async function checkVideoAudio(file, start, signal) {
  signal.throwIfAborted();
  const container = new Input({formats: [MP4, QTFF, WEBM], source: new BlobSource(file)});
  const dispose = () => container.dispose();
  signal.addEventListener('abort', dispose, {once: true});
  try {
    if (!await container.getPrimaryVideoTrack()) return {status: 'not-video'};
    const tracks = await container.getAudioTracks();
    if (tracks.length !== 1) return {status: 'track-count', tracks: tracks.length};

    const [track] = tracks;
    const trackEnd = await track.computeDuration();
    if (!Number.isFinite(trackEnd) || trackEnd <= start) return {status: 'no-samples'};
    if (!await track.canDecode()) return {status: 'unsupported'};

    const end = Math.min(start + scanSeconds, trackEnd);
    const {peak, count} = await measureSamples(new AudioSampleSink(track).samples(start, end), start, end, signal);
    if (count === 0) return {status: 'no-samples'};
    return {status: 'checked', peak, start, end, partial: trackEnd > end || start > 0};
  } finally {
    signal.removeEventListener('abort', dispose);
    dispose();
  }
}
