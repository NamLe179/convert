import { useEffect, useCallback, useRef } from "react";

type EventHandler<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }

  off<T>(event: string, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    this.listeners.set(
      event,
      handlers.filter((h) => h !== handler),
    );
  }

  emit<T>(event: string, payload: T) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    handlers.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
export const MSDL_EDITOR_EVENT = "msdl-editor-event";

// React hook for using EventBus
export function useEventBus<T = any>(
  event: string,
  handler: EventHandler<T>,
  deps: any[] = []
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (payload: T) => handlerRef.current(payload);
    eventBus.on(event, eventHandler);
    return () => eventBus.off(event, eventHandler);
  }, [event]);
}

// Hook to emit events
export function useEventEmitter() {
  return useCallback(<T>(event: string, payload: T) => {
    eventBus.emit(event, payload);
  }, []);
}