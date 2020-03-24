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
$ npm i egg-bull --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.bull = {
  enable: true,
  package: 'egg-bull',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.bull = {
  baseDir: 'queue', // optional, declare the directory to load queue definitions.
  redis: { // optional, redis setting for bull to connect to redis
    host: '127.0.0.1',
    port: 6379
  }
};
```

## Usage

### Queue Definition

通过创建多个队列的定义来维护队列
- name: 队列名称, 为空的话会使用文件名作为队列名
- process: 供 Bull queue 调用的回调函数，用来处理任务（Job），有两种定义方式
  - 单个回调定义: 定义名为 `process` 的函数即可，会注册为名称为 `default` 的任务的回调处理方法
  - 多个回调定义: 定义多个名称的回调处理方法，用于处理不同名称的任务
  
 在 process 函数内部，绑定了一个包含 Egg 相关对象的 `this`，其中包括：
 - app: Egg Application 对象，和其他地方的 app 对象完全一致
 - ctx: Egg Context 对象，是通过 `app.createAnonymousContext()` 创建的一个匿名 ctx 对象，没有 Request 相关的信息，主要通过它访问 `service`
 - queue: Bull 的队列信息，即调用这个处理程序的队列的对象
 
```js
// single process definition
module.exports = {
  name: 'queue name', // optional, default to file name
  async process(job) {
    const { app, ctx, queue } = this;
    await ctx.service.job.process(job);
  }
}

// or multiple process definition
module.exports = {
  name: 'queue name',
  process: {
    async default() {
     // ...
    },
    async cron() {
      // ...
    }
  }
}
```

```ts
import { BullDefinition } from "egg-bull";

// single process definition
export default {
  name: 'queue name', // optional, default to file name
  async process(job) {
    const { app, ctx, queue } = this;
    await ctx.service.job.process(job);
  }
} as BullDefinition;

// or multiple process definition
export default {
  name: 'queue name',
  process: {
    async default() {
     // ...
    },
    async cron() {
      // ...
    }
  }
} as BullDefinition;
```

see [config/config.default.js](config/config.default.js) for more detail.

### API

默认会将所有的队列挂载到 `app.queue` 上，可以通过队列声明的文件名访问到相应的队列，以下以队列 `test` 为例：

#### 添加任务

```ts
export default class HomeController extend Controller {
  index() {
    const { app } = this;
    // add() 的使用方法与 Bull 文档中定义的完全一致，但是提供了自动分配未知的 name 到默认 process 的能力
    app.queue.test.add({
      foo: 'bar',
    });

    // 未定义的任务名称，会自动分配为默认的 process，可以在设置中关闭该特性。
    app.queue.test.add('non-definition', {
      foo: 'bar',
    });

    // [扩展的方法] 直接指定 process 名称并创建任务。其中 process_name 为指定的处理函数，名称必须填写且不在定义表中，否则会影响初始行为。
    app.queue.test[process_name].add('task name or user defined id', data, options);
  }
}
```

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
