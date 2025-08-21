// frontend/src/utils/IntersectionObserverManager.ts
export class IntersectionObserverManager {
  private observer: IntersectionObserver | null = null;
  private observedElements = new WeakMap<HTMLImageElement, string>();
  private callbacks = new Map<string, () => void>();

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: null,
        rootMargin: '50px',
        threshold: [0, 0.1, 0.5]
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLImageElement;
        const src = this.observedElements.get(element);
        
        if (src) {
          this.loadImage(element, src);
          this.observer?.unobserve(element);
          this.observedElements.delete(element);
        }
      }
    });
  }

  private loadImage(element: HTMLImageElement, src: string): void {
    const img = new Image();
    
    img.onload = () => {
      element.src = src;
      this.callbacks.get(src)?.();
      this.callbacks.delete(src);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      this.callbacks.delete(src);
    };
    
    img.src = src;
  }

  observe(element: HTMLImageElement, src: string, callback?: () => void): void {
    if (!this.observer) {
      // 降级处理
      element.src = src;
      return;
    }

    this.observedElements.set(element, src);
    if (callback) {
      this.callbacks.set(src, callback);
    }
    
    this.observer.observe(element);
  }

  disconnect(): void {
    this.observer?.disconnect();
    // WeakMap 没有 clear() 方法，需要重新创建
    this.observedElements = new WeakMap<HTMLImageElement, string>();
    this.callbacks.clear();
  }
}