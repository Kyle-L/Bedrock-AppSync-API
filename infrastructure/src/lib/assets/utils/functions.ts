/**
 * A timeout task that resolves after a specified timeout.
 * @param timeout The timeout in milliseconds.
 * @returns The result of the timeout task.
 */
export function createTimeoutTask(
  timeout: number
): Promise<{ statusCode: number; message: string }> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ statusCode: 504, message: 'Task timed out!' }),
      timeout
    );
  });
}

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
export function getCompleteSentence(text: string): {
  sentence: string;
  remainingText: string;
  containsComplete: boolean;
} {
  const sentenceEndIndex = text.search(/[\.\?\!]/);
  if (sentenceEndIndex === -1) {
    return { sentence: text, remainingText: '', containsComplete: false };
  }
  const [sentence, remainingText] = [
    text.slice(0, sentenceEndIndex + 1),
    text.slice(sentenceEndIndex + 2)
  ];
  return { sentence, remainingText, containsComplete: true };
}
