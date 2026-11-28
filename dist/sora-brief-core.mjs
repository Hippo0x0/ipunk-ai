const inputModes = {
  text: 'Text-to-video. Keep the same scene and motion brief.',
  image: 'Image-to-video. Keep the same starting image and crop.',
};
const ratios = new Set(['16:9', '9:16', '1:1']);

export function buildSoraMigrationBrief({ mode, ratio, scene, motion, seconds }) {
  if (!Object.hasOwn(inputModes, mode) || !ratios.has(ratio)) {
    throw new RangeError('Choose one input type and aspect ratio.');
  }
  if (!Number.isInteger(seconds) || seconds < 2 || seconds > 30) {
    throw new RangeError('Enter a target duration between 2 and 30 whole seconds.');
  }
  const sceneText = typeof scene === 'string' ? scene.trim() : '';
  const motionText = typeof motion === 'string' ? motion.trim() : '';
  if (!sceneText || !motionText || sceneText.length > 600 || motionText.length > 400) {
    throw new RangeError('Enter a scene or reference (up to 600 characters) and motion (up to 400).');
  }
  return [
    'AI video replacement trial',
    `Input: ${inputModes[mode]}`,
    `Target: ${ratio}, ${seconds} seconds`,
    '',
    'Scene or reference to keep:',
    sceneText,
    '',
    'Motion to test:',
    motionText,
    '',
    'Record per attempt: service/model, duration offered and cost shown.',
    'After download, check: framing, subject consistency, motion, actual duration, watermark and audio.',
    'Note any change from the target and any retry before comparing results.',
    '',
  ].join('\n');
}
