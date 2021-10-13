import { NextFunction, Request, Response, } from 'express';
import { Meta, query, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, User, } from '../../../models';

class ListGarage {

  private static orderByMap: Record<string, [string] | [string, string]> = {
    name: ['name'],
    email: ['email'],
    username: ['User', 'username'],
    date: ['User', 'createdAt'],
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

    let validationError: Record<string, Validator.ValidationError> = {};

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
    .isLength({ max: Math.max(...Object.keys(ListGarage.orderByMap).map((orderBy: string): number => orderBy.length)) })
    .withMessage('El campo "Ordenar por" no tiene una longitud válida')
    .bail()
    .isIn(Object.keys(ListGarage.orderByMap))
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
    .isLength({ max: Math.max(...Object.keys(ListGarage.orderMap).map((order: string): number => order.length)) })
    .withMessage('El campo "Orden" no tiene una longitud válida')
    .bail()
    .isIn(Object.keys(ListGarage.orderMap))
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
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 2;

      const term: string[] = String(req.query.term).split(' ');
      const orderBy: string = String(req.query.orderBy);
      const order: string = String(req.query.order);
      const page: number = Number(req.query.page);
      const pageSize: number = Number(req.query.pageSize);
      
      let garages: Garage[] = [];

      try {

        garages = await Garage.findAll(
          {
            include: [
              {
                model: User,
                required: true,
              },
            ],
            where: {
              [Op.or]: [
                {
                  '$User.username$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
                {
                  '$Garage.name$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
                {
                  '$Garage.email$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
              ],
            },
            order: [
              [...ListGarage.orderByMap[orderBy], ListGarage.orderMap[order]],
              ['id', ListGarage.orderMap[order]],
            ],
            offset: pageSize * (page - 1),
            limit: pageSize,
          },
        );

      } catch(_) {}

      if (!_.isEmpty(garages)) {

        output.body.items = garages.map((garage: Garage): Record<string, any> => {

          const item: Record<string, any> = {
            info: {
              userId: _.isNull(garage.User.id) ? 0 : garage.User.id,
              username: _.isNull(garage.User.username) ? '' : garage.User.username,
              fullName: _.isNull(garage.name) ? '' : garage.name,
            },
            menu: {
              item: [
                {
                  title: 'Modificar',
                  value: 'updateGarage',
                },
                {
                  title: 'Eliminar',
                  value: 'deleteGarage',
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
  ListGarage,
};
