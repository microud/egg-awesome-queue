import { Application } from 'egg';

export = (app: Application) => {
  require('./lib/loader')(app);
}
