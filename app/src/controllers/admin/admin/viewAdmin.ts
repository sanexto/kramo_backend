import { NextFunction, Request, Response, } from 'express';
import { Meta, param, validationResult, } from 'express-validator';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Admin, User, } from '../../../models';

class ViewAdmin {

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
    .custom((userId: string, meta: Meta): any => {

      if (_.toNumber(userId) != req.userId) {

        return true;

      } else {

        throw new Error('No puedes ver información de ti mismo');

      }

    })
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const userId: number = Number(req.params.userId);

      let admin: Admin | null = null;

      try {

        admin = await Admin.findOne(
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

      if (!_.isNull(admin)) {

        output.body = {
          state: 2,
          title: admin.User.username,
          adminInfo: {
            name: {
              label: 'Nombre',
              value: admin.name,
            },
            surname: {
              label: 'Apellido',
              value: admin.surname,
            },
            email: {
              label: 'Correo',
              value: admin.email,
            },
            username: {
              label: 'Usuario',
              value: admin.User.username,
            },
            enabled: {
              label: 'Habilitado',
              value: admin.User.enabled ? 'Sí' : 'No',
            },
            picture: `${admin.User.username.substr(0, 1).toUpperCase()}${admin.User.username.substr(-1, 1).toUpperCase()}`,
          },
        };

      } else {

        output.body.error.message = 'El administrador solicitado no existe';

      }

    } else {

      output.body.error.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  ViewAdmin,
};
