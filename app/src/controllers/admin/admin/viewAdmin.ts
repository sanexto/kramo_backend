import { NextFunction, Request, Response, } from 'express';
import { Meta, param, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
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

    await param('userId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de usuario" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de usuario" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .custom((userId: number, meta: Meta): any => {

      if (userId == req.userId) {

        throw new Error('No puedes ver información de ti mismo');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

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
                  id: {
                    [Op.eq]: userId,
                  },
                },
              },
            ],
          },
        );

      } catch(_) {}

      if (admin != null) {

        output.body = {
          state: 2,
          title: admin.User.username ?? '',
          adminInfo: {
            name: {
              label: 'Nombre',
              value: admin.name ?? '',
            },
            surname: {
              label: 'Apellido',
              value: admin.surname ?? '',
            },
            email: {
              label: 'Correo',
              value: admin.email ?? '',
            },
            username: {
              label: 'Usuario',
              value: admin.User.username ?? '',
            },
            enabled: {
              label: 'Habilitado',
              value: admin.User.enabled != null ? (admin.User.enabled ? 'Sí' : 'No') : '',
            },
            picture: `${(admin.User.username ?? '').substr(0, 1).toUpperCase()}${(admin.User.username ?? '').substr(-1, 1).toUpperCase()}`,
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
}
