import * as Bull from 'bull';
import { Application, Context } from 'egg';
import { ProcessPromiseFunction } from 'bull';
import { JobOptions } from 'bull';

export { BaseQueue } from './index';

export { Process, Completed, Method, GlobalCompleted, Progress, GlobalProgress, AutoClean } from './index';

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

//
// interface ProcessHandleThis {
//   app: Application;
//   ctx: Context;
//   queue: Queue;
// }
//
// type ProcessHandle = (this: ProcessHandleThis, job: Job, done?: Function) => void | Promise<void>
//
// export interface ProcessDetail {
//   name?: string;
//   concurrency?: number;
//   processor: ProcessHandle;
// }
//
export interface BullConfig {
  baseDir?: string;
  redis?: RedisConfig;
}

//
// export interface MultipleProcess {
//   [key: string]: ProcessHandle | ProcessDetail;
// }
//
// type Process = ProcessHandle | ProcessDetail | MultipleProcess;
//
// type QueueMethod = (this: ProcessHandleThis & { process: { [key: string]: Required<ProcessDetail> } }, ...args) => any;
//
// export interface BullDefinition {
//   name?: string;
//   options?: QueueOptions;
//   process: Process;
//   methods?: {
//     [key: string]: QueueMethod;
//   };
//   completed?: (Job, any) => void | Promise<void>;
// }
//

declare module 'egg' {
  interface EggAppConfig {
    bull: BullConfig;
  }

  interface Application {
    // definition: {
    //   [key: string]: BullDefinition;
    // },
    queue: {
      [key: string]: BaseQueue;
    };
    Bull: Bull;
  }
}
