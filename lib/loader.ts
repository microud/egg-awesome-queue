import * as path from 'path';
import * as Queue from 'bull';
import * as Bull from 'bull';
import { JobOptions } from 'bull';
import { Application } from 'egg';
import { MultipleProcess, ProcessDetail, ProcessHandle } from "../index";

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
  app.loader.loadToApp(queueDirectory, 'definition');

  console.log(typeof app.queue);

  if (!Object.keys(app.definition).length) {
    logger.info('[egg-bull] No queue definition founded.');
    return;
  }

  if (!app.queue) {
    app.queue = {};
  }
  const ctx = app.createAnonymousContext();
  // 便利队列定义，开始创建队列
  for (const [key, definition] of Object.entries(app.definition)) {
    const handleMap: { [key: string]: { name: string; concurrency: number; processor: ProcessHandle } } = {};
    const queue = new Queue(definition.name || key, {
      redis,
      ...definition.options,
    });

    // 绑定 completed hook
    queue.on('completed', (job, result) => {
      definition.completed && definition.completed(job, result);
    });

    // 整理 process handle
    if (typeof definition.process === 'function') {
      handleMap['default'] = {
        name: 'default',
        concurrency: 1,
        processor: definition.process
      };
    } else {

      if ('processor' in definition && typeof definition['processor'] === 'function') {
        handleMap['default'] = {
          name: 'default',
          concurrency: Number((definition as ProcessDetail).concurrency) || 1,
          processor: (definition as ProcessDetail).processor,
        }
      } else {
        for (const [processKey, subDefinition] of Object.entries(definition.process as MultipleProcess)) {
          if (typeof subDefinition === 'function') {
            handleMap[processKey] = {
              name: processKey,
              concurrency: 1,
              processor: subDefinition,
            };
          } else {
            handleMap[processKey] = {
              name: subDefinition.name || processKey,
              concurrency: Number(subDefinition.concurrency) || 1,
              processor: subDefinition.processor,
            };
          }
        }
      }
    }

    // 绑定名称和消费者
    for (const [name, handleDetail] of Object.entries(handleMap)) {
      const handle = handleDetail.processor.bind({ app, queue, ctx });
      if (name === 'default') {
        queue.process(handleDetail.concurrency, handle);
      } else  {
        queue.process(name, handleDetail.concurrency, handle);
      }

    }

    // 使用 Proxy 修改默认行为：
    // - 使用 process_name.add，转为 queue.add('xxx', process_name);
    // - 使用 queue.add()，使用默认 process，或 add 的 name 能在 process 中找到对应的 process，找不到移交给默认 process
    app.queue[key] = new Proxy(queue, {
      get(target: Bull.Queue, handleKey: string): any {
        // 判断 队列中是否有这个 key，有的话直接返回，避免影响了原 Queue 对象的使用
        if (handleKey in target) {
          return target[handleKey];
        }

        if (definition.methods && handleKey in definition.methods) {
          const method = definition.methods[handleKey];
          if (method && typeof method === 'function') {
            return method.bind({ app, queue, ctx, process: handleMap })
          }
        }

        // 找不到的时候就托管给 Proxy，在 handleMap 中存在的 process 进行关联
        const handle = handleMap[handleKey];
        if (handle) {
          // handle 存在，则返回一个包含 add 方法的对象，该方法是 queue.add 的一个 Wrapper，它会：
          // - 根据名字注册一个消费者；
          // - 将队列添加到队列中；
          return {
            async add(name?, data?: any, options?: JobOptions) {
              queue.process(name, handleMap[handleKey].concurrency, handleMap[handleKey].processor);
              await queue.add(handleKey, data, options);
            }
          }
        }
        return target[handleKey];
      }
    });
  }
}
