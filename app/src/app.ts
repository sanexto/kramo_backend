import createError from 'http-errors';
import express, { Application, NextFunction, Request, Response, } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sleep from 'sleep';

import { JsonResponse, Profile, } from './base';
import { sequelize, } from './models';
import { tokenAuth, } from './middlewares';
import { Auth as AuthRouter, Admin as AdminRouter, Garage as GarageRouter, } from './routes';

const app: Application = express();

// db setup
(async (): Promise<void> => {

  let synchronized: boolean = false;
  
  do {

    sleep.sleep(1);

    try {

      await sequelize.sync();

      synchronized = true;
      
    } catch (e) {}
    
  } while (!synchronized);

})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', AuthRouter);
app.use('/admin', tokenAuth(Profile.Type.Admin), AdminRouter);
app.use('/garage', tokenAuth(Profile.Type.Garage), GarageRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction): void => {

  next(createError(404));

});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {

  const output: JsonResponse.Output = {
    status: JsonResponse.Status.BadRequest,
    body: {},
  };

  output.body = {
    message: '',
  };
  
  output.body.message = err.message;

  res.json(output);

});

export default app;
