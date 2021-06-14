import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Booking, Garage, User, sequelize, } from '../../../models';

class DeleteBooking {

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

    await param('bookingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const bookingId: number = Number(req.params.bookingId);

      let booking: Booking | null = null;

      try {

        booking = await Booking.findOne(
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
                [Op.eq]: bookingId,
              },
            },
          },
        );

      } catch(_) {}

      if (booking != null) {

        output.body = {
          state: 2,
          title: 'Eliminar reserva',
          content: `¿Está seguro que desea eliminar la reserva #${booking.id ?? 0}?`,
          form: {
            deleteBooking: {
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

    await param('bookingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const bookingId: number = Number(req.params.bookingId);

      let deletedBooking: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await Booking.destroy(
          {
            where: {
              id: bookingId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        deletedBooking = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (deletedBooking) {

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
  DeleteBooking,
}
