export type NullableString = string | undefined;
export type AditionalKey = Array<NullableString> | string;
export type MapKey<T> = [T, ...Array<NullableString>];
export type EventListener<T extends Record<string, (...args: any[]) => any>, K extends keyof T> = (
  value?: Parameters<T[K]>[0]
) => ReturnType<T[K]>;
export type RouterEvent<T> = (input: T) => Promise<boolean> | boolean;

export class EventBus<T extends Record<string, (...args: any[]) => any>> {
  private events = new Map<string, Array<EventListener<T, keyof T>>>();

  private mapKey<K extends keyof T>(event: K, key?: AditionalKey) {
    return JSON.stringify(key ? [event, ...key] : [event]);
  }
  get<K extends keyof T>(event: K, key?: AditionalKey) {
    return this.events.get(this.mapKey(event, key));
  }

  on<K extends keyof T>(event: K, listener: EventListener<T, K>, key?: AditionalKey): void {
    const mapKey = this.mapKey(event, key);
    if (!this.events.has(mapKey)) {
      this.events.set(mapKey, []);
    }
    this.events.get(mapKey)!.push(listener);
  }

  off<K extends keyof T>(event: K, extraEventKeys?: AditionalKey): void {
    this.events.delete(this.mapKey(event, extraEventKeys));
  }

  emit<K extends keyof T>(
    event: K,
    args?: {
      extraEventKeys?: AditionalKey;
      payload?: Parameters<T[K]>[0];
    }
  ): void {
    const { extraEventKeys, payload } = args ?? {};
    const listeners = this.events.get(this.mapKey(event, extraEventKeys));
    if (listeners) {
      listeners.forEach((listener) => void listener(payload));
    }
  }

  async emitWithCheck<K extends keyof T>(
    event: K,
    value: Parameters<T[K]>[0],
    key?: AditionalKey
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const listeners = this.events.get(this.mapKey(event, key));
      let result = true;
      if (listeners) {
        for (let index = 0; index < listeners.length; index++) {
          const event = listeners[index];
          if (event) {
            try {
              const eventResult = await event(value);
              if (!eventResult) {
                result = false;
                break;
              }
            } catch (error) {
              result = false;
              break;
            }
          }
        }
      }
      resolve(result);
    });
  }
}

export function useEventRouter<MiddlewareInput, PostEventInput>() {
  const bus = new EventBus<{
    after: (input: PostEventInput) => Promise<boolean> | boolean;
    before: (input: MiddlewareInput) => Promise<boolean> | boolean;
  }>();

  return {
    getMiddlewares: (process: string, extraKeys?: AditionalKey) =>
      bus.get('before', extraKeys ? [process, ...extraKeys] : process) || [],
    getPostEvents: (process: string, extraKeys?: AditionalKey) =>
      bus.get('after', extraKeys ? [process, ...extraKeys] : process) || [],
    setMiddleware: (
      process: string,
      event: RouterEvent<MiddlewareInput>,
      extraKeys?: AditionalKey
      //@ts-expect-error TODO:
    ) => bus.on('before', event, extraKeys ? [process, ...extraKeys] : process),
    setAfter: (
      process: string,
      event: RouterEvent<PostEventInput>,
      extraKeys?: AditionalKey
      //@ts-expect-error TODO:
    ) => bus.on('after', event, extraKeys ? [process, ...extraKeys] : process),
    runMiddlewares: async (
      process: string,
      payload: MiddlewareInput,
      extraKeys?: AditionalKey
    ): Promise<boolean> =>
      bus.emitWithCheck('before', payload, extraKeys ? [process, ...extraKeys] : process),
    checkPostEvents: async (
      process: string,
      payload: PostEventInput,
      extraKeys?: AditionalKey
    ): Promise<boolean> =>
      bus.emitWithCheck('after', payload, extraKeys ? [process, ...extraKeys] : process)
  };
}
