"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const Queue = require("bull");
function loadQueues(app) {
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
        const handleMap = {};
        logger.info('loading %s to app.queue', key);
        const queue = new Queue(definition.name || key, Object.assign({ redis }, definition.options));
        queue.on('completed', job => {
            definition.completed && definition.completed(job);
        });
        if (typeof definition.process === 'function') {
            handleMap['default'] = definition.process;
        }
        else {
            for (const [processKey, subDefinition] of Object.entries(definition.process)) {
                handleMap[processKey] === subDefinition;
            }
        }
        for (const [name, handle] of Object.entries(handleMap)) {
            const newHandle = handle.bind({ app, queue, ctx: app.createAnonymousContext() });
            if (name === 'default') {
                // @ts-ignore
                queue.process(newHandle);
            }
            else {
                queue.process(name, handle);
            }
        }
        // 使用 Proxy 修改默认行为：
        // - 使用 process_name.add，转为 queue.add('xxx', process_name);
        // - 使用 queue.add()，使用默认 process，或 add 的 name 能在 process 中找到对应的 process，找不到移交给默认 process
        app.queue[key] = queue;
        const queueProxy = new Proxy(queue, {
            get(target, p, receiver) {
                console.log('proxy', p, receiver);
                if (Object.keys(handleMap).indexOf(p) === -1) {
                    return {
                        add(data, options) {
                            return __awaiter(this, void 0, void 0, function* () {
                                yield queue.add(p, data, options);
                            });
                        }
                    };
                }
                return target[p];
            }
        });
        // app.queue[key] = queueProxy;
    }
}
module.exports = (app) => {
    app.Bull = Queue;
    // Queue.prototype.add
    loadQueues(app);
};
//# sourceMappingURL=loader.js.map