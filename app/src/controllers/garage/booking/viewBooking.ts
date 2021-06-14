import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Booking, Garage, User, } from '../../../models';

class ViewBooking {

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
          title: 'Datos de la reserva',
          bookingInfo: {
            bookingId: {
              label: 'ID',
              value: booking.id ?? 0,
            },
            vehiclePlate: {
              label: 'Matrícula del vehículo',
              value: booking.vehiclePlate ?? '',
            },
            vehicleEntry: {
              label: 'Entrada del vehículo',
              value: moment(booking.vehicleEntry).isValid() ? moment(booking.vehicleEntry).format('YYYY/M/D H:m') : '',
            },
            vehicleExit: {
              label: 'Salida del vehículo',
              value: moment(booking.vehicleExit).isValid() ? moment(booking.vehicleExit).format('YYYY/M/D H:m') : '',
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

}

export {
  ViewBooking,
}
