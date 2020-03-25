import 'reflect-metadata';

export function Process(options?: { name?: string; concurrency?: number }) {
  return function(target, propertyKey, receiver) {
    Reflect.defineMetadata('name', options?.name, target[propertyKey]);
    Reflect.defineMetadata('concurrency', options?.concurrency, target[propertyKey]);
  };
}
