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
    plate: ['plate'],
    entry: ['entry'],
    exit: ['exit'],
    price: ['price'],
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

    await query('entry')
    .exists({ checkNull: true })
    .withMessage('El campo "Entrada" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Entrada" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Entrada" está vacío')
    .bail()
    .customSanitizer((entry: string, meta: Meta): string[] => {
  
      return entry == '-' ? [] : _.split(entry, '-', 2).map((date: string): string => _.trim(date));
      
    })
    .if(query('entry').isArray({ min: 1 }))
    .custom((entry: string[], meta: Meta): any => {

      if (entry.length == 2) {

        const startEntry: moment.Moment = moment(entry[0], 'YYYY/M/D', true);
        const endEntry: moment.Moment = moment(entry[1], 'YYYY/M/D', true);

        if (startEntry.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endEntry.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endEntry.isSameOrAfter(startEntry)) {

          return true;

        } else {

          throw new Error('El campo "Entrada" no tiene un valor válido');

        }

      } else {

        throw new Error('El campo "Entrada" no tiene un valor válido');

      }

    })
    .bail()
    .customSanitizer((entry: string[], meta: Meta): string[] => {

      entry[0] = `${entry[0]} ${ListParking.lowerTime}`;
      entry[1] = `${entry[1]} ${ListParking.upperTime}`;

      return entry;

    })
    .run(req);

    await query('exit')
    .exists({ checkNull: true })
    .withMessage('El campo "Salida" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Salida" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Salida" está vacío')
    .bail()
    .customSanitizer((exit: string, meta: Meta): string[] => {
  
      return exit == '-' ? [] : _.split(exit, '-', 2).map((date: string): string => _.trim(date));
      
    })
    .if(query('exit').isArray({ min: 1 }))
    .custom((exit: string[], meta: Meta): any => {

      if (exit.length == 2) {

        const startExit: moment.Moment = moment(exit[0], 'YYYY/M/D', true);
        const endExit: moment.Moment = moment(exit[1], 'YYYY/M/D', true);

        if (startExit.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endExit.isBetween(config.types.date.min, config.types.date.max, undefined, '[]') && endExit.isSameOrAfter(startExit)) {

          return true;

        } else {

          throw new Error('El campo "Salida" no tiene un valor válido');

        }

      } else {

        throw new Error('El campo "Salida" no tiene un valor válido');

      }

    })
    .bail()
    .customSanitizer((exit: string[], meta: Meta): string[] => {

      exit[0] = `${exit[0]} ${ListParking.lowerTime}`;
      exit[1] = `${exit[1]} ${ListParking.upperTime}`;

      return exit;

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
      const entry: Date[] = (req.query.entry as string[]).map((date: string): Date => new Date(date));
      const exit: Date[] = (req.query.exit as string[]).map((date: string): Date => new Date(date));
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
                  '$Parking.plate$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {
  
                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
              ],
              '$Parking.entry$': _.isEmpty(entry) ? { [Op.and]: [], } : {
                [Op.between]: [entry[0], entry[1]],
              },
              '$Parking.exit$': _.isEmpty(exit) ? { [Op.and]: [], } : {
                [Op.between]: [exit[0], exit[1]],
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
              plate: {
                label: 'Matrícula',
                value: parking.plate ?? '',
              },
              entry: {
                label: 'Entrada',
                value: moment(parking.entry, 'YYYY-M-D H:m:s', true).isValid() ? moment(parking.entry).format('YYYY/M/D H:m') : '',
              },
              exit: {
                label: 'Salida',
                value: moment(parking.exit, 'YYYY-M-D H:m:s', true).isValid() ? moment(parking.exit).format('YYYY/M/D H:m') : '-',
              },
              price: {
                label: 'Importe',
                value: parking.price ? `$ ${parking.price.toLocaleString(config.locale)}` : '-',
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
