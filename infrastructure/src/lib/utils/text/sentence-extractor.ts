/**
 * A helper function to extract complete and remaining sentence information from a given string.
 *
 * @example extractSentenceInfo('This is a sentence. This is another sentence that is incomplete') -> { sentence: 'This is a sentence.', remaining: 'This is another sentence that is incomplete', hasComplete: true, endsComplete: false }
 * @example extractSentenceInfo('This is a complete sentence.') -> { sentence: 'This is a complete sentence.', remaining: '', hasComplete: true, endsComplete: true }
 * @example extractSentenceInfo('This is an incomplete sentence') -> { sentence: 'This is an incomplete sentence', remaining: '', hasComplete: false, endsComplete: false }
 *
 * @param text {string} The text to retrieve the sentence from.
 * @returns
 */
export function extractSentenceInfo(
  text: string,
  delimiters: string[] = ['.', '?', '!', ':', '\n']
): {
  sentence: string;
  remaining: string;
  hasComplete: boolean;
  endsComplete: boolean;
} {
  let lastIndex = -1;

  for (let i = text.length - 1; i >= 0; i--) {
    if (delimiters.includes(text[i])) {
      lastIndex = i;
      break;
    }
  }

  if (lastIndex === -1) {
    return {
      sentence: text,
      remaining: '',
      hasComplete: false,
      endsComplete: false
    };
  }

  const sentence = text.slice(0, lastIndex + 1);
  const remaining = text.slice(lastIndex + 1);
  const endsComplete = remaining.trim() === '';

  return {
    sentence,
    remaining,
    hasComplete: true,
    endsComplete
  };
}
