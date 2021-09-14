import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, } from '../../../models';

class ViewParking {

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
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de aparcamiento" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
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
          title: 'Datos del aparcamiento',
          parkingInfo: {
            parkingId: {
              label: 'ID',
              value: parking.id ?? 0,
            },
            vehiclePlate: {
              label: 'Matrícula del vehículo',
              value: parking.vehiclePlate ?? '',
            },
            vehicleEntry: {
              label: 'Entrada del vehículo',
              value: moment(parking.vehicleEntry, 'YYYY-M-D H:m:s', true).isValid() ? moment(parking.vehicleEntry).format('YYYY/M/D H:m') : '',
            },
            vehicleExit: {
              label: 'Salida del vehículo',
              value: moment(parking.vehicleExit, 'YYYY-M-D H:m:s', true).isValid() ? moment(parking.vehicleExit).format('YYYY/M/D H:m') : '-',
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

}

export {
  ViewParking,
};
