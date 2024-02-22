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
