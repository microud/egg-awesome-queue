import * as Bull from 'bull';
import { Application, Context } from 'egg';
import { JobOptions, ProcessPromiseFunction } from 'bull';

export class BaseQueue extends Bull {
  public app: Application;
  public ctx: Context;

  constructor(app, name, options) {
    super(name, options);
    this.app = app;
  }

  public async handle<T>(handle: ProcessPromiseFunction<T>, name: string, data: any, options?: JobOptions) {
    this.process(name, handle);
    await this.add(name, data, options);
  }

  // TODO extend some method;
}
