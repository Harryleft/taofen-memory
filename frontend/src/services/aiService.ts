// AI解读服务接口
export interface AIInterpretationRequest {
  title: string;
  content: string;
  notes: string;
  time: string;
}

export interface AIInterpretationResponse {
  success: boolean;
  interpretation?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// AI API服务
class AIService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://www.ai4dh.cn/api');

  async interpretHandwriting(request: AIInterpretationRequest): Promise<AIInterpretationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/interpret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();