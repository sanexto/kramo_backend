import { NextFunction, Request, Response, } from 'express';
import { param, validationResult, } from 'express-validator';
import _ from 'lodash';
import Globalize from 'globalize';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, } from '../../../models';

class ViewParking {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    Globalize.load(require('cldr-data').entireSupplemental());
    Globalize.load(require('cldr-data').entireMainFor(config.locale));
    Globalize.locale(config.locale);

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
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

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

      if (!_.isNull(parking)) {

        output.body = {
          state: 2,
          title: 'Datos de aparcamiento',
          parkingInfo: {
            parkingId: {
              label: 'ID',
              value: _.isNull(parking.id) ? 0 : parking.id,
            },
            plate: {
              label: 'Matrícula',
              value: _.isNull(parking.plate) ? '' : parking.plate,
            },
            entry: {
              label: 'Entrada',
              value: _.isNull(parking.entry) ? '' : moment(parking.entry).format('YYYY/MM/DD HH:mm'),
            },
            exit: {
              label: 'Salida',
              value: _.isNull(parking.exit) ? '-' : moment(parking.exit).format('YYYY/MM/DD HH:mm'),
            },
            price: {
              label: 'Importe',
              value: _.isNull(parking.price) ? '-' : `$ ${Globalize.numberFormatter({
                minimumFractionDigits: Math.max(
                  Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                  Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                ),
                maximumFractionDigits: Math.max(
                  Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                  Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                ),
              })(parking.price)}`,
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
