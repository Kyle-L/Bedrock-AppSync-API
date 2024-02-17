export class PromiseQueue<T> {
  private queue: Promise<T>[] = [];
  private callbackQueue: ((result: any) => Promise<any>)[] = [];
  private isProcessing: boolean = false;

  enqueue(task: Promise<T>, callback?: (result: any) => Promise<any>): void {
    this.queue.push(task);
    this.callbackQueue.push(callback || (async () => {}));

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async awaitAll(): Promise<void> {
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    const task = this.queue.shift();
    const callback = this.callbackQueue.shift();

    try {
      const result = await task;

      if (callback) {
        await callback(result);
      }
    } catch (error) {
      console.error('Error processing task:', error);
    }
    await this.processQueue(); // Await the recursive call
  }
}
