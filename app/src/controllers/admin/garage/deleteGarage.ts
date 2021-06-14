import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, User, sequelize, } from '../../../models';

class DeleteGarage {

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
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

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
                  id: {
                    [Op.eq]: userId,
                  },
                },
              },
            ],
          },
        );

      } catch(_) {}

      if (garage != null) {

        output.body = {
          state: 2,
          title: 'Eliminar cochera',
          content: `¿Está seguro que desea eliminar la cochera "${garage.User.username ?? ''}"?`,
          form: {
            deleteGarage: {
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

        output.body.error.message = 'La cochera solicitada no existe';

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
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const userId: number = Number(req.params.userId);

      let deletedGarage: boolean = false;
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
        deletedGarage = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (deletedGarage) {

        output.body.state = 3;
        output.body.message = 'Cochera eliminada con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo eliminar la cochera';

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  DeleteGarage,
}
