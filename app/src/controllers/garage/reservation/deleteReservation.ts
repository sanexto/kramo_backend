import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Reservation, User, sequelize, } from '../../../models';

class DeleteReservation {

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

    await param('reservationId')
    .exists({ checkNull: true })
    .withMessage('El campo "Id de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Id de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Id de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const reservationId: number = Number(req.params.reservationId);

      let reservation: Reservation | null = null;

      try {

        reservation = await Reservation.findOne(
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
                      id: {
                        [Op.eq]: req.userId,
                      },
                    },
                  },
                ],
              },
            ],
            where: {
              id: {
                [Op.eq]: reservationId,
              },
            },
          },
        );

      } catch(e) {}

      if (reservation != null) {

        output.body = {
          state: 2,
          title: 'Eliminar reserva',
          content: `¿Está seguro que desea eliminar la reserva #${reservation.id ?? ''}?`,
          form: {
            deleteReservation: {
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

        output.body.error.message = 'La reserva solicitada no existe';

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

    await param('reservationId')
    .exists({ checkNull: true })
    .withMessage('El campo "Id de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Id de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Id de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const reservationId: number = Number(req.params.reservationId);

      let deletedReservation: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await Reservation.destroy(
          {
            where: {
              id: reservationId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        deletedReservation = true;

      } catch (e) {

        await transaction.rollback();

      }

      if (deletedReservation) {

        output.body.state = 3;
        output.body.message = 'Reserva eliminada con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo eliminar la reserva';

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  DeleteReservation,
}
