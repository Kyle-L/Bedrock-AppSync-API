/**
 * A helper function to retrieve a complete sentence from a string.
 *
 * @example getCompleteSentence('This is a sentence. This is another sentence that is incomplete') -> { sentence: 'This is a sentence.', remainingText: 'This is another sentence that is incomplete', isComplete: true }
 * @example getCompleteSentence('This is a complete sentence.') -> { sentence: 'This is a complete sentence.', remainingText: '', isComplete: true }
 * @example getCompleteSentence('This is an incomplete sentence') -> { sentence: 'This is an incomplete sentence', remainingText: '', isComplete: false }
 *
 * @param text {string} The text to retrieve the sentence from.
 * @returns
 */
export function getCompleteSentence(
  text: string,
  delimiters: string[] = ['.', '?', '!', ':', '\n']
): {
  sentence: string;
  remainingText: string;
  containsComplete: boolean;
} {
  let sentenceEndIndex = -1;

  for (let i = text.length - 1; i >= 0; i--) {
    if (delimiters.includes(text[i])) {
      sentenceEndIndex = i;
      break;
    }
  }

  if (sentenceEndIndex === -1) {
    return { sentence: text, remainingText: '', containsComplete: false };
  }

  const sentence = text.slice(0, sentenceEndIndex + 1);
  const remainingText = text.slice(sentenceEndIndex + 1);

  return { sentence, remainingText, containsComplete: true };
}
