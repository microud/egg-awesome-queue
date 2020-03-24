import * as path from 'path';
import * as Queue from 'bull';
import { Application } from 'egg';
import { BullDefinition, MultipleProcess, ProcessHandle } from "../index";
import * as Bull from "bull";
import { JobOptions } from "bull";

export = (app: Application) => {
  app.Bull = Queue;
  // Queue.prototype.add
  loadQueues(app);
};

function loadQueues(app: Application) {
  const { logger, config } = app;
  const { baseDir, redis } = config.bull;

  const queueDirectory = path.join(app.config.baseDir, 'app', baseDir || 'queue');

  logger.info('[egg-bull] scan directory ', queueDirectory);
  app.loader.loadToApp(queueDirectory, 'definition');

  if (!Object.keys(app.definition).length) {
    logger.info('[egg-bull] No queue definition founded.');
    return;
  }

  if (!app.queue) {
    app.queue = {};
  }
  for (const [key, definition] of Object.entries(app.definition)) {
    const handleMap: { [key: string]: ProcessHandle } = {};
    logger.info('loading %s to app.queue', key);
    const queue = new Queue(definition.name || key, {
      redis,
      ...definition.options,
    });

    queue.on('completed', job => {
      definition.completed && definition.completed(job);
    });

    if (typeof definition.process === 'function') {
      handleMap['default'] = definition.process;
    } else {
      for (const [processKey, subDefinition] of Object.entries(definition.process as MultipleProcess)) {
        handleMap[processKey] === subDefinition;
      }
    }

    for (const [name, handle] of Object.entries(handleMap)) {
      const newHandle = handle.bind({ app, queue, ctx: app.createAnonymousContext() });
      if (name === 'default') {
        // @ts-ignore
        queue.process(newHandle);
      } else  {
        queue.process(name, handle);
      }
    }

    // 使用 Proxy 修改默认行为：
    // - 使用 process_name.add，转为 queue.add('xxx', process_name);
    // - 使用 queue.add()，使用默认 process，或 add 的 name 能在 process 中找到对应的 process，找不到移交给默认 process
    app.queue[key] = queue;
    const queueProxy = new Proxy(queue, {
      get(target: Bull.Queue, p: string, receiver: any): any {
        console.log('proxy', p, receiver);
        if (Object.keys(handleMap).indexOf(p) === -1) {
          return {
            async add(data?: string, options?: JobOptions) {
              await queue.add(p, data, options);
            }
          }
        }
        return target[p];
      }
    });
    // app.queue[key] = queueProxy;
  }
}
