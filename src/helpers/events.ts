type Handler = (...args: any[]) => void;

class Emitter {
  private handlers: Record<string, Handler[]> = {};

  on(event: string, h: Handler) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(h);
    return () => { this.off(event, h); };
  }

  off(event: string, h: Handler) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter((x) => x !== h);
  }

  emit(event: string, ...args: any[]) {
    (this.handlers[event] || []).slice().forEach((h) => { try { h(...args); } catch (e) { /* ignore */ } });
  }
}

export const emitter = new Emitter();

export default emitter;
