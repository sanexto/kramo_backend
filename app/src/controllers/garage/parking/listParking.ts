import { NextFunction, Request, Response, } from 'express';
import { Meta, query, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, } from '../../../models';

class ListParking {

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
      items: [],
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

      vehicleEntry[0] = `${vehicleEntry[0]} ${ListParking.lowerTime}`;
      vehicleEntry[1] = `${vehicleEntry[1]} ${ListParking.upperTime}`;

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

      vehicleExit[0] = `${vehicleExit[0]} ${ListParking.lowerTime}`;
      vehicleExit[1] = `${vehicleExit[1]} ${ListParking.upperTime}`;

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
    .isIn(Object.keys(ListParking.orderByMap))
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
    .isIn(Object.keys(ListParking.orderMap))
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
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Página" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
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
    .isInt({ min: config.types.id.min, max: 50, allow_leading_zeroes: false })
    .withMessage(`El campo "Tamaño de página" no es un número entre ${config.types.id.min} y 50`)
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
      
      let parkings: Parking[] = [];

      try {

        parkings = await Parking.findAll(
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
              [Op.or]: [
                {
                  '$Parking.vehiclePlate$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {
  
                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
              ],
              '$Parking.vehicleEntry$': _.isEmpty(vehicleEntry) ? { [Op.and]: [], } : {
                [Op.between]: [vehicleEntry[0], vehicleEntry[1]],
              },
              '$Parking.vehicleExit$': _.isEmpty(vehicleExit) ? { [Op.and]: [], } : {
                [Op.between]: [vehicleExit[0], vehicleExit[1]],
              },
            },
            order: [
              [...ListParking.orderByMap[orderBy], ListParking.orderMap[order]],
              ['id', ListParking.orderMap[order]],
            ],
            offset: pageSize * (page - 1),
            limit: pageSize,
          },
        );

      } catch(_) {}

      if (!_.isEmpty(parkings)) {

        output.body.items = parkings.map((parking: Parking): Record<string, any> => {

          const item: Record<string, any> = {
            info: {
              parkingId: parking.id ?? 0,
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
            menu: {
              item: [
                {
                  title: 'Modificar',
                  value: 'updateParking',
                },
                {
                  title: 'Eliminar',
                  value: 'deleteParking',
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
  ListParking,
};