import * as Bull from 'bull';
import { Application, Context } from 'egg';
import { ProcessPromiseFunction } from 'bull';
import { JobOptions } from 'bull';

export class BaseQueue extends Bull {
  app: Application;
  ctx: Context;
  handle<T>(handle: ProcessPromiseFunction<T>, name: string, data: any, options?: JobOptions): any;
}

export function Completed();

export function Method();

export function GlobalCompleted();

export function Progress();

export function GlobalProgress();

export function AutoClean();

export function Process(options?: { name?: string; concurrency?: number });

interface ICleanOption {
  type?: 'completed' | 'failed' | 'any',
  period?: number;
}

export interface RedisConfig {
  host?: string;
  port?: number;
  db?: number;
}

export interface BullConfig {
  baseDir?: string;
  redis?: RedisConfig;
}

declare module 'egg' {

  interface IQueue extends PlainObject {}

  interface EggAppConfig {
    bull: BullConfig;
  }

  interface Application {
    // definition: {
    //   [key: string]: BullDefinition;
    // },
    queue: IQueue;
    Bull: Bull;
  }
}
