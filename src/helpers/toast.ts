type ToastHandler = (msg: { title?: string; message?: string; id: string }) => void;

class ToastBus {
  private handlers: ToastHandler[] = [];

  subscribe(h: ToastHandler) {
    this.handlers.push(h);
    return () => { this.handlers = this.handlers.filter(x => x !== h); };
  }

  publish(payload: { title?: string; message?: string }) {
    const p = { ...payload, id: String(Date.now()) };
    this.handlers.slice().forEach(h => { try { h(p); } catch (e) {} });
  }
}

export const toastBus = new ToastBus();

export function toastShow(title?: string, message?: string) {
  toastBus.publish({ title, message });
}

export default toastBus;
