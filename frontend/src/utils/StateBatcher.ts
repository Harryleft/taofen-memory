// frontend/src/utils/StateBatcher.ts
export class StateBatcher<T> {
  private queue = new Map<string, T>();
  private timeoutId: number | null = null;
  private updateFunction: (updater: (prev: T) => T) => void;

  constructor(
    updateFunction: (updater: (prev: T) => T) => void,
    delay: number = 16 // 约60fps
  ) {
    this.updateFunction = updateFunction;
  }

  add(key: string, value: T): void {
    this.queue.set(key, value);
    
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, delay) as unknown as number;
    }
  }

  private flush(): void {
    if (this.queue.size === 0) return;

    const updates = Object.fromEntries(this.queue);
    this.updateFunction((prev: T) => {
      // 类型安全检查：确保prev是对象类型
      if (typeof prev !== 'object' || prev === null) {
        return prev;
      }
      
      // 安全的合并操作
      return { ...prev, ...updates } as T;
    });

    this.queue.clear();
    this.timeoutId = null;
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.queue.clear();
  }
}