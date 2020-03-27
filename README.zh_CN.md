# egg-bull

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bull.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bull
[travis-image]: https://img.shields.io/travis/eggjs/egg-bull.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bull
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-bull.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-bull?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bull.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bull
[snyk-image]: https://snyk.io/test/npm/egg-bull/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bull
[download-image]: https://img.shields.io/npm/dm/egg-bull.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bull

<!--
Description here.
-->

## 安装

```shell script
# 使用 npm
npm i egg-awesome-queue
```

## 开启插件

```js
// config/plugin.js
exports.queue = {
  enable: true,
  package: 'egg-awesome-queue',
};
```

## 使用场景

### 为什么会有这个插件？

在开发插件之前，在业务中需要用到消息队列，以及定时任务的功能。起初是想对 Bull 进行一个简单的封装，但是慢慢提炼，做成了这个可以轻松维护的消息队列插件。

### 设计初衷

基于 Bull 实现一个 Egg.js 的消息队列插件，可以轻松处理和管理项目中的各个队列。

同时内置图形界面，可以在浏览器查看和管理队列信息

## 插件配置

```typescript
// 单个 Redis 配置
config.queue = {
  baseDir: 'queue', // 插件加载时挂载的目录
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 1
  }
};

// 队列和 Redis 绑定的配置
config.queue = {
  baseDir: 'queue', // 插件加载时挂载的目录
  redis: {
    // 通用的 Redis 配置，对所有找不到对应关系的队列配置会使用这个配置
    '*': {
      host: '127.0.0.1',
      port: '6379',
      db: 1
    },
    foo: {
      host: '127.0.0.1',
      port: 6379,
      db: 2
    },
  }
}
```

## 使用

### 队列定义

每一个队列定义文件中，需要导出一个继承自 `BaseQueue` 的类。

类定义中，`this` 对象为 Bull 队列的实例，并且在类构造的时候已经注入了 Egg Application 的实例 `app`，使得在类方法里可以访问 Egg 的资源。

如果需要访问 Egg Context，则需要通过 `app.createAnonymousContext()` 创建一个匿名的上下文对象，从而访问 `service` 等资源。

类定义中，可以定义任意方法（原型上不存在的 key），通过注解来标识各种类型的回调函数，在插件启动的时候，会自动在队列中进行注册或监听。

#### Queue(options?: { autoClean: true })

#### Process(options?: { name?: string; concurrency?: number })

标识方法为一个 Process，会在插件加载的时候通过 Queue.process(name, concurrency, processor) 进行注册，
  - name: Queue.process() 方法接受的 name 参数，默认为方法名，通过设置 name 可以自定义名称
  - concurrency: Queue.process() 方法接受的 concurrency 参数，作用是设置并发数，默认为 1

#### Progress()

进度变更回调，通过 Queue.on('progress', () => {}) 进行注册

#### GlobalProgress()

进度变更回调，通过 Queue.on('global:progress', () => {}) 进行注册

#### Completed()

标识一个方法为处理 `Queue.on('completed', () => {})` 的回调函数，无法跨 Worker，该方法接收一个 Job、Result 两个参数，示例如下：
```typescript
export default class TestQueue extends BaseQueue {
  @Completed()
  async onCompleted(job, result) {
    console.log(job, result);
  }
}
```

#### GlobalCompleted()

标识一个方法为全局（跨进程，跨服务）监听 Job 完成的回调方法，通过 `Queue.on('global:completed', () => {})` 注册，该方法接收一个 JobID 的参数，示例如下：
```typescript
export default class TestQueue extends BaseQueue {
  @GlobalCompleted()
  async onGlobalCompleted(jobId) {
    const job = await this.getJob(jobId);
    console.log(job);
  }
}
```



## 单元测试

<!-- 描述如何在单元测试中使用此插件，例如 schedule 如何触发。无则省略。-->

## 提问交流

请到 [egg issues](https://github.com/eggjs/egg/issues) 异步交流。

## License

[MIT](LICENSE)
