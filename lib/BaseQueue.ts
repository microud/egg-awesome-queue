import * as Bull from 'bull';
import { Application } from 'egg';

export class BaseQueue extends Bull {
  app: Application;

  constructor(app, name, options) {
    super(name, options);
    this.app = app;
  }

  // TODO extend some method;
}
