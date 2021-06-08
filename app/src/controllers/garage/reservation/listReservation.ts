import { NextFunction, Request, Response, } from 'express';
import { Meta, query, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Reservation, User, } from '../../../models';

class ListReservation {

  private static lowerTime = '00:00:00';
  private static upperTime = '23:59:59';

  private static orderByMap: Record<string, [string] | [string, string]> = {
    id: ['id'],
    vehiclePlate: ['vehiclePlate'],
    vehicleEntry: ['vehicleEntry'],
    vehicleExit: ['vehicleExit'],
  };

  private static orderMap: Record<string, string> = {
    asc: 'asc',
    desc: 'desc',
  };

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      message: '',
      item: [],
    };

    await query('term')
    .exists({ checkNull: true })
    .withMessage('El campo "Término" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Término" no es una cadena de texto')
    .bail()
    .trim()
    .customSanitizer((term: string, meta: Meta): string => {
  
      return _.replace(term, /\s{2,}/g, ' ');
      
    })
    .isLength({ max: 255 })
    .withMessage('El término de búsqueda debe tener hasta 255 caracteres')
    .bail()
    .run(req);

    await query('vehicleEntry')
    .exists({ checkNull: true })
    .withMessage('El campo "Entrada del vehículo" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Entrada del vehículo" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Entrada del vehículo" está vacío')
    .bail()
    .customSanitizer((vehicleEntry: string, meta: Meta): string[] => {
  
      return vehicleEntry == '-' ? [] : _.split(vehicleEntry, '-', 2).map((date: string): string => _.trim(date));
      
    })
    .if(query('vehicleEntry').isArray({ min: 1 }))
    .custom((vehicleEntry: string[], meta: Meta): any => {

      if (vehicleEntry.length == 2) {

        const startVehicleEntry: moment.Moment = moment(vehicleEntry[0], 'YYYY/M/D', true);
        const endVehicleEntry: moment.Moment = moment(vehicleEntry[1], 'YYYY/M/D', true);

        if (startVehicleEntry.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endVehicleEntry.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endVehicleEntry.isSameOrAfter(startVehicleEntry)) {

          return true;

        } else {

          throw new Error('El campo "Entrada del vehículo" no tiene un valor válido');

        }

      } else {

        throw new Error('El campo "Entrada del vehículo" no tiene un valor válido');

      }

    })
    .bail()
    .customSanitizer((vehicleEntry: string[], meta: Meta): string[] => {

      vehicleEntry[0] = `${vehicleEntry[0]} ${ListReservation.lowerTime}`;
      vehicleEntry[1] = `${vehicleEntry[1]} ${ListReservation.upperTime}`;

      return vehicleEntry;

    })
    .run(req);

    await query('vehicleExit')
    .exists({ checkNull: true })
    .withMessage('El campo "Salida del vehículo" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Salida del vehículo" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Salida del vehículo" está vacío')
    .bail()
    .customSanitizer((vehicleExit: string, meta: Meta): string[] => {
  
      return vehicleExit == '-' ? [] : _.split(vehicleExit, '-', 2).map((date: string): string => _.trim(date));
      
    })
    .if(query('vehicleExit').isArray({ min: 1 }))
    .custom((vehicleExit: string[], meta: Meta): any => {

      if (vehicleExit.length == 2) {

        const startVehicleExit: moment.Moment = moment(vehicleExit[0], 'YYYY/M/D', true);
        const endVehicleExit: moment.Moment = moment(vehicleExit[1], 'YYYY/M/D', true);

        if (startVehicleExit.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endVehicleExit.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endVehicleExit.isSameOrAfter(startVehicleExit)) {

          return true;

        } else {

          throw new Error('El campo "Salida del vehículo" no tiene un valor válido');

        }

      } else {

        throw new Error('El campo "Salida del vehículo" no tiene un valor válido');

      }

    })
    .bail()
    .customSanitizer((vehicleExit: string[], meta: Meta): string[] => {

      vehicleExit[0] = `${vehicleExit[0]} ${ListReservation.lowerTime}`;
      vehicleExit[1] = `${vehicleExit[1]} ${ListReservation.upperTime}`;

      return vehicleExit;

    })
    .run(req);

    await query('orderBy')
    .exists({ checkNull: true })
    .withMessage('El campo "Ordenar por" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Ordenar por" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Ordenar por" está vacío')
    .bail()
    .isIn(Object.keys(ListReservation.orderByMap))
    .withMessage('El campo "Ordenar por" no tiene un valor permitido')
    .bail()
    .run(req);

    await query('order')
    .exists({ checkNull: true })
    .withMessage('El campo "Orden" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Orden" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Orden" está vacío')
    .bail()
    .isIn(Object.keys(ListReservation.orderMap))
    .withMessage('El campo "Orden" no tiene un valor permitido')
    .bail()
    .run(req);

    await query('page')
    .exists({ checkNull: true })
    .withMessage('El campo "Página" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Página" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Página" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    await query('pageSize')
    .exists({ checkNull: true })
    .withMessage('El campo "Tamaño de página" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Tamaño de página" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: 50, allow_leading_zeroes: false })
    .withMessage(`El campo "Tamaño de página" no es un número entre ${config.types.number.min} y 50`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 2;

      const term: string[] = String(req.query.term).split(' ');
      const vehicleEntry: Date[] = (req.query.vehicleEntry as string[]).map((date: string): Date => new Date(date));
      const vehicleExit: Date[] = (req.query.vehicleExit as string[]).map((date: string): Date => new Date(date));
      const orderBy: string = String(req.query.orderBy);
      const order: string = String(req.query.order);
      const page: number = Number(req.query.page);
      const pageSize: number = Number(req.query.pageSize);
      
      let reservations: Reservation[] = [];

      try {

        reservations = await Reservation.findAll(
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
              [Op.or]: [
                {
                  '$Reservation.vehiclePlate$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {
  
                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
              ],
              '$Reservation.vehicleEntry$': _.isEmpty(vehicleEntry) ? { [Op.and]: [], } : {
                [Op.between]: [vehicleEntry[0], vehicleEntry[1]],
              },
              '$Reservation.vehicleExit$': _.isEmpty(vehicleExit) ? { [Op.and]: [], } : {
                [Op.between]: [vehicleExit[0], vehicleExit[1]],
              },
            },
            order: [
              [...ListReservation.orderByMap[orderBy], ListReservation.orderMap[order]],
              ['id', ListReservation.orderMap[order]],
            ],
            offset: pageSize * (page - 1),
            limit: pageSize,
          },
        );

      } catch(e) {}

      if (!_.isEmpty(reservations)) {

        output.body.item = reservations.map((reservation: Reservation): Record<string, any> => {

          const item: Record<string, any> = {
            info: {
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
            menu: {
              item: [
                {
                  title: 'Modificar',
                  value: 'updateReservation',
                },
                {
                  title: 'Eliminar',
                  value: 'deleteReservation',
                },
              ],
            },
          };

          return item;

        });

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  ListReservation,
}
