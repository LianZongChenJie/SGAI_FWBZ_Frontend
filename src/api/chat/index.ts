/**
 * 对话 API：SSE 流式（fetch + ReadableStream），健康检查（axios）。
 */

import axios from 'axios';

/**
 * 后端 AI 服务基础地址
 * - 开发环境：直连后端，避免 Vite proxy 缓冲整段 SSE
 * - 生产环境：也直连后端绝对地址，跳过 Nginx 代理
 */
function aiBaseUrl(): string {
  // 生产环境直连后端 AI 服务
  if (import.meta.env.PROD) {
    return 'http://10.168.56.105:8000/xzqdd/api/ai-report';
  }
  // 开发环境直连后端 AI 服务地址，避免 Vite proxy 缓冲整段 SSE
  return 'http://192.168.204.169:8000/xzqdd/api/ai-report';
}

/** 流式接口地址 */
function streamChatUrl(): string {
  return `${aiBaseUrl()}/chat-stream`;
}

/** 普通接口前缀 */
function apiPrefix(): string {
  return aiBaseUrl();
}

export interface StreamChatParams {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  num_ctx?: number;
  signal?: AbortSignal;
  onToken?: (chunk: string) => void;
  onTable?: (payload: { columns: any[]; rows: any[] }) => void;
  onChart?: (payload: { chartType: string; chartId: string; option: Record<string, any> }) => void;
  onSummary?: (content: string) => void;
  onSql?: (sql: string) => void;
  onMode?: (payload: { value?: string; message?: string }) => void;
  onDone?: () => void;
  onError?: (msg: string) => void;
}

/**
 * SSE 流式对话
 */
export async function streamChat({
  messages,
  temperature,
  num_ctx,
  signal,
  onToken,
  onTable,
  onChart,
  onSummary,
  onSql,
  onMode,
  onDone,
  onError,
}: StreamChatParams): Promise<void> {
  let response: Response;
  try {
    response = await fetch(streamChatUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature, num_ctx }),
      signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onDone?.();
      return;
    }
    onError?.('网络请求失败，请检查后端是否已启动');
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    onError?.(text || `请求失败 (${response.status})`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError?.('浏览器不支持流式读取');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  const handleEvent = (payload: any): 'ok' | 'error' | 'done' => {
    // 兼容旧格式 { error, done, content }
    if (payload.error && !payload.type) {
      onError?.(typeof payload.error === 'string' ? payload.error : '请求失败');
      return 'error';
    }
    if (payload.done) {
      onDone?.();
      return 'done';
    }

    const type = payload.type;
    if (type === 'error') {
      onError?.(payload.message || '查询失败');
      return 'error';
    }
    if (type === 'table') {
      onTable?.({
        columns: payload.columns || [],
        rows: payload.rows || [],
      });
      return 'ok';
    }
    if (type === 'chart') {
      onChart?.({
        chartType: payload.chartType,
        chartId: payload.chartId,
        option: payload.option || {},
      });
      return 'ok';
    }
    if (type === 'summary') {
      if (payload.content) onSummary?.(payload.content);
      return 'ok';
    }
    if (type === 'sql') {
      if (payload.sql) onSql?.(payload.sql);
      return 'ok';
    }
    if (type === 'mode') {
      onMode?.({ value: payload.value, message: payload.message });
      return 'ok';
    }
    if (type === 'message') {
      if (payload.content) onToken?.(payload.content);
      return 'ok';
    }

    // 无 type 的纯文本流（兼容）
    if (payload.content) {
      onToken?.(payload.content);
    }
    return 'ok';
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;
        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          continue;
        }
        const status = handleEvent(payload);
        if (status === 'error' || status === 'done') return;
      }
    }
    onDone?.();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onDone?.();
      return;
    }
    onError?.(err.message || '流式读取中断');
  } finally {
    reader.releaseLock();
  }
}

/**
 * 健康检查
 */
export async function fetchHealth(): Promise<any> {
  const { data } = await axios.get(`${apiPrefix()}/health`, { timeout: 8000 });
  return data;
}
