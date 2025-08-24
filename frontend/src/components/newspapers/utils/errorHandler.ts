/**
 * IIIF错误处理器 - 统一的错误处理机制
 * 
 * 设计原则：
 * - 分类处理：根据错误类型提供不同的处理策略
 * - 可恢复：提供错误恢复机制
 * - 用户友好：提供清晰的错误信息
 */

export interface IIIFError {
  type: 'network' | 'validation' | 'manifest' | 'viewer' | 'unknown';
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  retry?: {
    count: number;
    max: number;
    delay: number;
  };
}

export class IIIFErrorHandler {
  private static readonly ERROR_MESSAGES = {
    network: {
      'NETWORK_ERROR': '网络连接失败，请检查网络设置',
      'TIMEOUT_ERROR': '请求超时，请稍后重试',
      'CORS_ERROR': '跨域请求被阻止，正在使用代理服务器'
    },
    validation: {
      'INVALID_URL': '无效的IIIF URL格式',
      'MISSING_PARAMS': '缺少必要的参数',
      'INVALID_MANIFEST': 'Manifest格式无效'
    },
    manifest: {
      'MANIFEST_NOT_FOUND': '未找到指定的Manifest',
      'MANIFEST_PARSE_ERROR': 'Manifest解析失败',
      'INVALID_IMAGE_URL': '图像URL格式无效'
    },
    viewer: {
      'VIEWER_INIT_ERROR': '查看器初始化失败',
      'VIEWER_LOAD_ERROR': '查看器加载失败',
      'IFRAME_ERROR': 'iframe加载失败'
    }
  };

  /**
   * 处理错误并返回标准化的错误信息
   */
  static handleError(error: any): IIIFError {
    console.error('IIIF错误:', error);

    // 网络错误
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        type: 'network',
        code: 'NETWORK_ERROR',
        message: this.ERROR_MESSAGES.network.NETWORK_ERROR,
        details: error,
        recoverable: true,
        retry: { count: 0, max: 3, delay: 1000 }
      };
    }

    // 超时错误
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT_ERROR') {
      return {
        type: 'network',
        code: 'TIMEOUT_ERROR',
        message: this.ERROR_MESSAGES.network.TIMEOUT_ERROR,
        details: error,
        recoverable: true,
        retry: { count: 0, max: 3, delay: 2000 }
      };
    }

    // CORS错误
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        type: 'network',
        code: 'CORS_ERROR',
        message: this.ERROR_MESSAGES.network.CORS_ERROR,
        details: error,
        recoverable: true,
        retry: { count: 0, max: 1, delay: 500 }
      };
    }

    // HTTP状态错误
    if (error.status) {
      switch (error.status) {
        case 404:
          return {
            type: 'manifest',
            code: 'MANIFEST_NOT_FOUND',
            message: this.ERROR_MESSAGES.manifest.MANIFEST_NOT_FOUND,
            details: error,
            recoverable: false
          };
        case 400:
          return {
            type: 'validation',
            code: 'INVALID_URL',
            message: this.ERROR_MESSAGES.validation.INVALID_URL,
            details: error,
            recoverable: false
          };
        default:
          return {
            type: 'network',
            code: 'NETWORK_ERROR',
            message: `HTTP错误: ${error.status}`,
            details: error,
            recoverable: error.status < 500,
            retry: error.status < 500 ? { count: 0, max: 2, delay: 1000 } : undefined
          };
      }
    }

    // JSON解析错误
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return {
        type: 'manifest',
        code: 'MANIFEST_PARSE_ERROR',
        message: this.ERROR_MESSAGES.manifest.MANIFEST_PARSE_ERROR,
        details: error,
        recoverable: false
      };
    }

    // 默认未知错误
    return {
      type: 'unknown',
      code: 'UNKNOWN_ERROR',
      message: error.message || '发生未知错误',
      details: error,
      recoverable: false
    };
  }

  /**
   * 获取用户友好的错误信息
   */
  static getUserFriendlyMessage(error: IIIFError): string {
    return error.message;
  }

  /**
   * 获取错误处理建议
   */
  static getRecoverySuggestion(error: IIIFError): string {
    switch (error.type) {
      case 'network':
        return '请检查网络连接，稍后重试';
      case 'validation':
        return '请检查URL格式是否正确';
      case 'manifest':
        return '请确认资源是否存在';
      case 'viewer':
        return '请尝试刷新页面';
      default:
        return '请联系技术支持';
    }
  }

  /**
   * 判断错误是否可重试
   */
  static shouldRetry(error: IIIFError): boolean {
    if (!error.recoverable || !error.retry) {
      return false;
    }
    return error.retry.count < error.retry.max;
  }

  /**
   * 获取重试延迟时间
   */
  static getRetryDelay(error: IIIFError): number {
    if (!error.retry) {
      return 0;
    }
    return error.retry.delay * Math.pow(2, error.retry.count);
  }

  /**
   * 创建错误恢复函数
   */
  static createRecoveryHandler(
    error: IIIFError,
    retryCallback: () => void,
    fallbackCallback?: () => void
  ): () => void {
    return () => {
      if (this.shouldRetry(error)) {
        const delay = this.getRetryDelay(error);
        console.log(`将在${delay}ms后重试...`);
        setTimeout(retryCallback, delay);
      } else if (fallbackCallback) {
        fallbackCallback();
      }
    };
  }

  /**
   * 记录错误到控制台
   */
  static logError(error: IIIFError): void {
    const logData = {
      type: error.type,
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      recoverable: error.recoverable
    };

    if (error.type === 'network' || error.type === 'unknown') {
      console.error('❌ IIIF错误:', logData);
    } else {
      console.warn('⚠️ IIIF警告:', logData);
    }
  }
}