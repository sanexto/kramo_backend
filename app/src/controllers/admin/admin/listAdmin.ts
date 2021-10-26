import { NextFunction, Request, Response, } from 'express';
import { Meta, query, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Admin, User, } from '../../../models';

class ListAdmin {

  private static orderByMap: Record<string, [string] | [string, string]> = {
    name: ['name'],
    surname: ['surname'],
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
    .isLength({ max: 255 })
    .withMessage('El término de búsqueda debe tener hasta 255 caracteres')
    .bail()
    .customSanitizer((term: string, meta: Meta): string => {
  
      return _.replace(term, /\s{2,}/g, ' ');
      
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
    .isLength({ max: Math.max(...Object.keys(ListAdmin.orderByMap).map((orderBy: string): number => orderBy.length)) })
    .withMessage('El campo "Ordenar por" no tiene una longitud válida')
    .bail()
    .isIn(Object.keys(ListAdmin.orderByMap))
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
    .isLength({ max: Math.max(...Object.keys(ListAdmin.orderMap).map((order: string): number => order.length)) })
    .withMessage('El campo "Orden" no tiene una longitud válida')
    .bail()
    .isIn(Object.keys(ListAdmin.orderMap))
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
      
      let admins: Admin[] = [];

      try {

        admins = await Admin.findAll(
          {
            include: [
              {
                model: User,
                required: true,
                where: {
                  id: {
                    [Op.not]: req.userId,
                  },
                },
              },
            ],
            where: {
              [Op.or]: [
                {
                  '$Admin.name$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
                {
                  '$Admin.surname$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
                {
                  '$Admin.email$': {
                    [Op.or]: term.map((token: string): { [Op.substring]: string } => {

                      return {
                        [Op.substring]: token,
                      };
      
                    }),
                  },
                },
                {
                  '$User.username$': {
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
              [...ListAdmin.orderByMap[orderBy], ListAdmin.orderMap[order]],
              ['id', ListAdmin.orderMap[order]],
            ],
            offset: pageSize * (page - 1),
            limit: pageSize,
          },
        );

      } catch(_) {}

      if (!_.isEmpty(admins)) {

        output.body.items = admins.map((admin: Admin): Record<string, any> => {

          const item: Record<string, any> = {
            info: {
              userId: admin.User.id,
              username: admin.User.username,
              fullName: `${admin.name} ${admin.surname}`,
            },
            menu: {
              item: [
                {
                  title: 'Modificar',
                  value: 'updateAdmin',
                },
                {
                  title: 'Eliminar',
                  value: 'deleteAdmin',
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
  ListAdmin,
};
