import { NextFunction, Request, Response, } from 'express';
import { header, Meta, validationResult, } from 'express-validator';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import config from '../config';
import { JsonResponse, Payload, User as UserBase, Validator, } from '../base';

function tokenAuth(profile: UserBase.Profile): (req: Request, res: Response, next: NextFunction) => Promise<void> {

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Unauthorized,
      body: {},
    };
  
    output.body = {
      message: '',
    };

    let validationError: Record<string, Validator.ValidationError> = {};
  
    await header('authorization')
    .exists({ checkNull: true })
    .withMessage('El campo "Autorización" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Autorización" no es una cadena de texto')
    .bail()
    .customSanitizer((authorization: string, meta: Meta): string => {
  
      return _.replace(authorization, /Bearer /gi, '');
      
    })
    .trim()
    .notEmpty()
    .withMessage('El campo "Autorización" está vacío')
    .bail()
    .run(req);
  
    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();
  
    if (_.isEmpty(validationError)) {

      const authorization: string = String(req.headers.authorization);

      let payload: Payload | null = null;
  
      try {
  
        payload = <Payload> jwt.verify(authorization, config.secret, {
          ignoreExpiration: true,
        });
  
      } catch(_) {}
  
      if (!_.isNull(payload) && _.has(payload, 'id') && validator.isInt(payload.id.toString(), { min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })) {

        payload.id = parseInt(payload.id.toString());

        const checkResult: UserBase.CheckResult = await UserBase.check(payload.id, profile);

        if (checkResult == UserBase.CheckResult.NotExist) {

          output.body.message = 'Tu usuario no existe';

          res.json(output);

        } else if (checkResult == UserBase.CheckResult.NotEnabled) {

          output.status = JsonResponse.Status.Forbidden;

          output.body.message = 'Tu usuario no está habilitado';

          res.json(output);

        } else {

          req.userId = payload.id;

          next();

        }
  
      } else {

        output.body.message = 'Token de acceso inválido';

        res.json(output);
  
      }
  
    } else {
  
      output.body.message = validationError[Object.keys(validationError)[0]].message;
  
      res.json(output);
  
    }
  
  }

}

export {
  tokenAuth,
};
