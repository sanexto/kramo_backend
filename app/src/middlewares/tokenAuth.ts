import { NextFunction, Request, Response, } from 'express';
import { header, Meta, validationResult, } from 'express-validator';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import config from '../config';
import { JsonResponse, Payload, Profile, Validator, } from '../base';

function tokenAuth (profile: Profile.Type): (req: Request, res: Response, next: NextFunction) => Promise<void> {

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Unauthorized,
      body: {},
    };
  
    output.body = {
      message: '',
    };
  
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
  
    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();
  
    if (_.isEmpty(validationError)) {

      const authorization: string = String(req.headers.authorization);

      let payload: Payload | null = null;
  
      try {
  
        payload = <Payload> jwt.verify(authorization, config.secret, {
          ignoreExpiration: true,
        });
  
      } catch(e) {}
  
      if (payload != null && 'id' in payload && validator.isInt(payload.id.toString(), { min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })) {

        output.status = JsonResponse.Status.Forbidden;

        payload.id = parseInt(payload.id.toString());

        if (await Profile.check(payload.id, profile)) {

          req.userId = payload.id;

          next();
  
        } else {

          output.body.message = 'No tienes el perfil de usuario requerido';

          res.json(output);

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
}
