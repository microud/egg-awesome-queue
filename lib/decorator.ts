import 'reflect-metadata';

export function AutoClean(options?: { on: string, }) {
  return function(constructor) {
    Reflect.defineMetadata('auto_clean', options, constructor);
    return constructor;
  };
}

export function BeforeClean() {

}

export function GlobalCompleted() {
  return function(target, propertyKey) {
    Reflect.defineMetadata('type', 'global_completed', target[propertyKey]);
  };
}

export function GlobalProgress() {
  return function(target, propertyKey) {
    Reflect.defineMetadata('type', 'global_progress', target[propertyKey]);
  };
}

export function Progress() {
  return function(target, propertyKey) {
    Reflect.defineMetadata('type', 'progress', target[propertyKey]);
  };
}

export function Process(options?: { name?: string; concurrency?: number }) {
  return function(target, propertyKey) {
    Reflect.defineMetadata('type', 'processor', target[propertyKey]);
    Reflect.defineMetadata('name', options?.name, target[propertyKey]);
    Reflect.defineMetadata('concurrency', options?.concurrency, target[propertyKey]);
  };
}

export function Completed() {
  return function(target, propertyKey) {
    Reflect.defineMetadata('type', 'completed', target[propertyKey]);
  };
}

export function Method() {
  return function(target, propertyKey, descriptor) {
    // descriptor.value = function(...args) {
    //   console.log(this);
    //   // const ctx = this.app.createContext(this.req);
    //   // console.log(ctx);
    // };
    Reflect.defineMetadata('type', 'method', target[propertyKey]);
  };
}
