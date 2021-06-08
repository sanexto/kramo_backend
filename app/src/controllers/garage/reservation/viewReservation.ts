import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Reservation, User, } from '../../../models';

class ViewReservation {

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
          title: 'Datos de la reserva',
          reservationInfo: {
            reservationId: {
              label: 'ID',
              value: reservation.id ?? 0,
            },
            vehiclePlate: {
              label: 'Matrícula del vehículo',
              value: reservation.vehiclePlate ?? '',
            },
            vehicleEntry: {
              label: 'Entrada del vehículo',
              value: moment(reservation.vehicleEntry).isValid() ? moment(reservation.vehicleEntry).format('YYYY/M/D H:m') : '',
            },
            vehicleExit: {
              label: 'Salida del vehículo',
              value: moment(reservation.vehicleExit).isValid() ? moment(reservation.vehicleExit).format('YYYY/M/D H:m') : '',
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
  ViewReservation,
}
