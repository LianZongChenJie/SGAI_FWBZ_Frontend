/**
 * 打字机队列：网络 token 先入队，按节奏逐字显示；流结束后继续排空队列，不一次性 dump。
 */

const DEFAULT_CHARS_PER_TICK = 1;
const DEFAULT_TICK_MS = 24;
const CATCH_UP_THRESHOLDS = [
  { backlog: 200, take: 8 },
  { backlog: 80, take: 4 },
  { backlog: 30, take: 2 },
];

interface TypewriterOptions {
  onUpdate?: (displayed: string) => void;
  charsPerTick?: number;
  tickMs?: number;
}

interface TypewriterInstance {
  push: (chunk: string) => void;
  finish: (onComplete?: () => void) => void;
  cancel: (onComplete?: () => void) => void;
  reset: () => void;
}

export function createTypewriter({
  onUpdate,
  charsPerTick = DEFAULT_CHARS_PER_TICK,
  tickMs = DEFAULT_TICK_MS,
}: TypewriterOptions = {}): TypewriterInstance {
  let buffer = '';
  let displayed = '';
  let timer: ReturnType<typeof setTimeout> | null = null;
  let streamEnded = false;
  let drainCallback: (() => void) | null = null;

  function takeCount(): number {
    const backlog = buffer.length;
    for (const rule of CATCH_UP_THRESHOLDS) {
      if (backlog >= rule.backlog) return rule.take;
    }
    return charsPerTick;
  }

  function tryDrainComplete(): void {
    if (streamEnded && !buffer.length && drainCallback) {
      const cb = drainCallback;
      drainCallback = null;
      cb();
    }
  }

  function tick(): void {
    if (!buffer.length) {
      timer = null;
      tryDrainComplete();
      return;
    }
    const n = Math.min(takeCount(), buffer.length);
    displayed += buffer.slice(0, n);
    buffer = buffer.slice(n);
    onUpdate?.(displayed);
    timer = setTimeout(tick, tickMs);
  }

  function schedule(): void {
    if (timer === null) timer = setTimeout(tick, tickMs);
  }

  return {
    push(chunk: string) {
      if (!chunk) return;
      buffer += chunk;
      schedule();
    },
    /** 网络流结束：继续按节奏输出剩余字符，排空后回调 */
    finish(onComplete?: () => void) {
      streamEnded = true;
      if (onComplete) drainCallback = onComplete;
      schedule();
      tryDrainComplete();
    },
    /** 用户停止：立即展示已有内容 */
    cancel(onComplete?: () => void) {
      streamEnded = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (buffer.length) {
        displayed += buffer;
        buffer = '';
        onUpdate?.(displayed);
      }
      if (onComplete) onComplete();
      else tryDrainComplete();
    },
    reset() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      buffer = '';
      displayed = '';
      streamEnded = false;
      drainCallback = null;
    },
  };
}
