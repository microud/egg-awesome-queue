import * as Queue from 'bull';
import * as path from 'path';
import { BaseQueue } from './base';
import { Application } from 'egg';

export = (app) => {
  app.Bull = Queue;
  // Queue.prototype.add
  loadQueues(app);
};

function loadQueues(app: Application) {
  const { coreLogger, config } = app;
  const { baseDir, redis } = config.queue;

  const queueDirectory = path.join(app.config.baseDir, 'app', baseDir || 'queue');

  // 将定义挂载到 app 上
  app.loader.loadToApp(queueDirectory, 'queue', {
    initializer(Queue: any, options: { path: string; pathName: string }): any {
      // console.log(options.path, options.pathName);
      return new Queue(app, options.pathName, {
        redis,
      });
    },
  });

  // @ts-ignore
  for (const [_, queue] of Object.entries(app.queue as { [key: string]: BaseQueue })) {
    const autoClean = Reflect.getMetadata('auto_clean', queue.constructor);
    console.log(autoClean);
    const methods = Object.getOwnPropertyNames(queue.constructor.prototype);
    for (const method of methods) {
      if (method === 'constructor') {
        continue;
      }
      const type = Reflect.getMetadata('type', queue[method]);
      switch (type) {
        case 'processor':
          const name = Reflect.getMetadata('name', queue[method]) || method;
          const concurrency = Reflect.getMetadata('concurrency', queue[method]) || 1;
          queue.process(name, concurrency, queue[method]);
          break;
        case 'failed':
          queue.on('failed', queue[method]);
          break;
        case 'completed':
          queue.on('completed', queue[method]);
          break;
        case 'global_completed':
          queue.on('global:completed', queue[method]);
          break;
        case 'progress':
          queue.on('progress', queue[method]);
          break;
        case 'global_progress':
          queue.on('global:progress', queue[method]);
          break;
        case 'method':
        default:
        // Object.assign(queue, app.createAnonymousContext());
      }

    }

    // console.log(name, Reflect.getPrototypeOf(queue)); // Object.keys(queue));
  }
  // console.log('names', names);

  // console.log(typeof app.queue);

  // console.log(app.queue);
}
