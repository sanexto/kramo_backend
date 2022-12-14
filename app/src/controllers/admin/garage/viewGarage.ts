import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, User, } from '../../../models';

class ViewGarage {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      error: {
        message: '',
      },
    };

    let validationError: Record<string, Validator.ValidationError> = {};

    await param('userId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de usuario" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de usuario" no es un número entero')
    .bail()
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const userId: number = Number(req.params.userId);

      let garage: Garage | null = null;

      try {

        garage = await Garage.findOne(
          {
            include: [
              {
                model: User,
                required: true,
                where: {
                  id: userId,
                },
              },
            ],
          },
        );

      } catch(_) {}

      if (!_.isNull(garage)) {

        output.body = {
          state: 2,
          title: garage.User.username,
          garageInfo: {
            name: {
              label: 'Nombre',
              value: garage.name,
            },
            email: {
              label: 'Correo',
              value: garage.email,
            },
            username: {
              label: 'Usuario',
              value: garage.User.username,
            },
            enabled: {
              label: 'Habilitado',
              value: garage.User.enabled ? 'Sí' : 'No',
            },
            picture: `${garage.User.username.substr(0, 1).toUpperCase()}${garage.User.username.substr(-1, 1).toUpperCase()}`,
          },
        };

      } else {

        output.body.error.message = 'La cochera solicitada no existe';

      }

    } else {

      output.body.error.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  ViewGarage,
};
