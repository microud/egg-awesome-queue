import { Application } from 'egg';
import * as Queue from 'bull';
import * as path from 'path';
import { BaseQueue } from './BaseQueue';

export = (app: Application) => {
  app.Bull = Queue;
  // Queue.prototype.add
  loadQueues(app);
};

function loadQueues(app: Application) {
  const { logger, config } = app;
  const { baseDir, redis } = config.bull;

  const queueDirectory = path.join(app.config.baseDir, 'app', baseDir || 'queue');

  // 将定义挂载到 app 上
  app.loader.loadToApp(queueDirectory, 'queue', {
    initializer(Queue: any, options: { path: string; pathName: string }): any {
      // console.log(options.path, options.pathName);
      return new Queue(app, options.pathName, {
        redis: config.bull.redis,
      });
    },
  });

  // const names = Object.getOwnPropertyNames(app.queue);
  for (const [_, queue] of Object.entries(app.queue)) {
    // @ts-ignore
    // for (const property in queue) {
    //   if (queue.hasOwnProperty(property)) {
    //     console.log(property);
    //   }
    // }
    const methods = Object.getOwnPropertyNames(queue.constructor.prototype);
    for (const method of methods) {
      if (method === 'constructor') {
        continue;
      }
      const name = Reflect.getMetadata('name', queue[method]) || method;
      const concurrency = Reflect.getMetadata('concurrency', queue[method]) || 1;
      queue.process(name, concurrency, queue[method]);
    }

    // console.log(name, Reflect.getPrototypeOf(queue)); // Object.keys(queue));
  }
  // console.log('names', names);

  // console.log(typeof app.queue);

  // console.log(app.queue);
}
