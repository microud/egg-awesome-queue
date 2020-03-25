import { Application } from 'egg';

export = (app: Application) => {
  require('./lib/class_loader')(app);
}
