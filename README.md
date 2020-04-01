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

## Install

```bash
$ npm i egg-awesome-queue --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.queue = {
  enable: true,
  package: 'egg-awesome-queue',
};
```

## 配置

```js
// {app_root}/config/config.default.js
exports.queue = {
  baseDir: 'queue', // optional, declare the directory to load queue definitions.
  redis: { // optional, redis setting for bull to connect to redis
    host: '127.0.0.1',
    port: 6379
  }
};
```

## 使用

### 队列定义

每一个队列定义文件中，需要导出一个继承自 `Base` 的类。

类定义中，`this` 对象为 Bull 队列的实例，并且在类构造的时候已经注入了 Egg Application 的实例 `app`，使得在类方法里可以访问 Egg 的资源。

如果需要访问 Egg Context，则需要通过 `app.createAnonymousContext()` 创建一个匿名的上下文对象，从而访问 `service` 等资源。

类定义中，可以定义任意方法（原型上不存在的 key），通过注解来标识各种类型的回调函数，在插件启动的时候，会自动在队列中进行注册或监听。

#### Process(options?: { name?: string; concurrency?: number })

标识方法为一个 Process，会在插件加载的时候通过 Queue.process(name, concurrency, processor) 进行注册，
  - name: Queue.process() 方法接受的 name 参数，默认为方法名，通过设置 name 可以自定义名称
  - concurrency: Queue.process() 方法接受的 concurrency 参数，作用是设置并发数，默认为 1
  
#### Completed()

标识一个方法为处理 `Queue.on('completed', () => {})` 的回调函数，在整个队列中唯一。



#### 其他方法

在队列的定义中可以任意定义原型中的 key 以外的方法，可以作为一些可供调用方法的封装，替代部分 service 的方法定义，并在一个队列文件中集中管理。


```ts
import { Base, Process, Completed } from "egg-awesome-queue";

export default class FirstQueue extends Base {

  /**
   * 定义一个设置了 name 和 concurrency 的处理器，在插件启动的时候自动注册
   */
  @Process({ name: 'normal-job', concurrency: 2 })
  async normalJob(job) {
    console.log(job.data);
  }
  
  /**
   * 定义一个默认处理器，在插件启动的时候自动注册，注册名为方法名
   */
  @Process()
  async secondJob(job) {
    console.log(job.data);
  }
  
  /**
   * 定义队列中任务完成的回调函数，在插件启动的时候自动注册，方法可接受两个参数，第一个为 Job 对象，第二个为 Process 返回的结果
   */
  @Completed()
  async completed(job, result) {
    console.log(job, result);
  }
  
  /**
   * 封装添加任务的方法，甚至可以在里面结合业务。
   */
  async addNormoJob(data) {
    // 添加任务
    this.add('normal-job', {
      data,    
    });
  }

}
```


### API

默认会将所有的队列挂载到 `app.queue` 上，可以通过队列声明的文件名访问到相应的队列，以下以队列 `test` 为例：

#### 添加任务

```ts
export default class HomeController extend Controller {
  index() {
    const { app, ctx } = this;
    // add() 的使用方法与 Bull 文档中定义的完全一致，但是提供了自动分配未知的 name 到默认 process 的能力
    app.queue.test.addNormalJob(ctx.query);

    // 依旧可以使用 Queue 上的任何方法：
    app.queue.test.add(ctx.query);

    // 指定 process 进行任务的添加：
    app.queue.test.process('normal-job').receive(job);
  }
}
```

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
