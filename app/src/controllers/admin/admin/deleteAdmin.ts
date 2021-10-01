import { NextFunction, Request, Response, } from 'express';
import { Meta, param, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Admin, User, sequelize, } from '../../../models';

class DeleteAdmin {

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
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
    .bail()
    .custom((userId: string, meta: Meta): any => {

      if (_.toNumber(userId) != req.userId) {

        return true;

      } else {

        throw new Error('No puedes eliminarte a ti mismo');

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
          title: 'Eliminar administrador',
          content: `¿Está seguro que desea eliminar el administrador "${_.isNull(admin.User.username) ? '' : admin.User.username}"?`,
          form: {
            deleteAdmin: {
              button: {
                cancel: {
                  label: 'Cancelar',
                },
                delete: {
                  label: 'Eliminar',
                },
              },
            },
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

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 2,
      message: '',
      field: {},
    };

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

        throw new Error('No puedes eliminarte a ti mismo');

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const userId: number = Number(req.params.userId);

      let deletedAdmin: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await User.destroy(
          {
            where: {
              id: userId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        deletedAdmin = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (deletedAdmin) {

        output.body.state = 3;
        output.body.message = 'Administrador eliminado con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo eliminar el administrador';

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  DeleteAdmin,
};
