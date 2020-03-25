import { Queue, JobOptions, QueueOptions, Job } from 'bull';
import { Application, Context } from 'egg';

export interface RedisConfig {
  host?: string;
  port?: number;
  db?: number;
}

interface ProcessHandleThis {
  app: Application;
  ctx: Context;
  queue: Queue;
}

type ProcessHandle = (this: ProcessHandleThis, job: Job, done?: Function) => void | Promise<void>

export interface ProcessDetail {
  name?: string;
  concurrency?: number;
  processor: ProcessHandle;
}

export interface BullConfig {
  baseDir?: string;
  redis?: RedisConfig;
}

export interface MultipleProcess {
  [key: string]: ProcessHandle | ProcessDetail;
}

type Process = ProcessHandle | ProcessDetail | MultipleProcess;

type QueueMethod = (this: ProcessHandleThis & { process: { [key: string]: Required<ProcessDetail> } }, ...args) => any;

export interface BullDefinition {
  name?: string;
  options?: QueueOptions;
  process: Process;
  methods?: {
    [key: string]: QueueMethod;
  };
  completed?: (Job, any) => void | Promise<void>;
}

declare namespace Bull {
  interface Queue {
    [key: string]: {
      add: (name: string, data: any, options?: JobOptions) => Promise<void>;
    }
  }
}

declare module 'egg' {
  interface EggAppConfig {
    bull: BullConfig;
  }

  interface Application {
    definition: {
      [key: string]: BullDefinition;
    },
    queue: {
      [key: string]: Queue;
    };
    Bull: any;
  }
}
