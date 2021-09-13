import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, sequelize, } from '../../../models';

class DeleteParking {

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

    await param('parkingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de aparcamiento" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de aparcamiento" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de aparcamiento" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const parkingId: number = Number(req.params.parkingId);

      let parking: Parking | null = null;

      try {

        parking = await Parking.findOne(
          {
            include: [
              {
                model: Garage,
                required: true,
                include: [
                  {
                    model: User,
                    required: true,
                    where: {
                      id: req.userId,
                    },
                  },
                ],
              },
            ],
            where: {
              id: parkingId,
            },
          },
        );

      } catch(_) {}

      if (parking != null) {

        output.body = {
          state: 2,
          title: 'Eliminar aparcamiento',
          content: `¿Está seguro que desea eliminar el aparcamiento #${parking.id ?? 0}?`,
          form: {
            deleteParking: {
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

        output.body.error.message = 'El aparcamiento solicitado no existe';

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

    await param('parkingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de aparcamiento" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de aparcamiento" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de aparcamiento" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const parkingId: number = Number(req.params.parkingId);

      let deletedParking: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await Parking.destroy(
          {
            where: {
              id: parkingId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        deletedParking = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (deletedParking) {

        output.body.state = 3;
        output.body.message = 'Aparcamiento eliminado con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo eliminar el aparcamiento';

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  DeleteParking,
};
