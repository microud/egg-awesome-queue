import { Queue, JobOptions, QueueOptions, Job } from 'bull';
import { Application, Context } from 'egg';

export interface RedisConfig {
  host?: string;
  port?: number;
  db?: number;
}

type ProcessHandle = (this: { app: Application, ctx: Context, queue: Queue}, job: Job) => void | Promise<void>

export interface BullConfig {
  baseDir?: string;
  redis?: RedisConfig;
}

export interface MultipleProcess {
  [key: string]: ProcessHandle;
}

type Process = ProcessHandle | MultipleProcess;

export interface BullDefinition {
  name?: string;
  options?: QueueOptions;
  process: Process;
  completed: (Job) => void | Promise<void>;
}

declare namespace Bull {
  interface Queue {
    [key: string]: {
      add: (name: string, options?: JobOptions) => Promise<void>;
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
