import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';

import config from '../../../config';
import { JsonResponse, User as UserBase, Validator, } from '../../../base';
import { Garage, User, sequelize, } from '../../../models';

class UpdateAccount {

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

    let garage: Garage | null = null;

    try {

      garage = await Garage.findOne(
        {
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
      );

    } catch(_) {}

    if (!_.isNull(garage)) {

      output.body = {
        state: 2,
        title: 'Mi cuenta',
        form: {
          updateAccount: {
            field: {
              name: {
                label: 'Nombre',
                hint: '',
                value: garage.name,
              },
              email: {
                label: 'Correo',
                hint: '',
                value: garage.email,
              },
              username: {
                label: 'Usuario',
                hint: '',
                value: garage.User.username,
              },
            },
            button: {
              update: {
                label: 'Modificar',
              },
            },
          },
        },
      };

    } else {

      output.body.error.message = 'Tu usuario no existe';

    }

    res.json(output);

  }

  public static async put(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      message: '',
      field: {},
    };

    let validationError: Record<string, Validator.ValidationError> = {};

    await body('name')
    .exists({ checkNull: true })
    .withMessage('El campo "Nombre" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Nombre" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar un nombre')
    .bail()
    .isLength({ max: 255 })
    .withMessage('El nombre debe tener hasta 255 caracteres')
    .bail()
    .run(req);

    await body('email')
    .exists({ checkNull: true })
    .withMessage('El campo "Correo" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Correo" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar un correo')
    .bail()
    .isLength({ max: 255 })
    .withMessage('El correo debe tener hasta 255 caracteres')
    .bail()
    .isEmail()
    .withMessage('Correo inválido')
    .bail()
    .toLowerCase()
    .run(req);

    await body('username')
    .exists({ checkNull: true })
    .withMessage('El campo "Usuario" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Usuario" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar un usuario')
    .bail()
    .isLength({ min: config.username.minLength })
    .withMessage(`El usuario debe tener al menos ${config.username.minLength} caracteres`)
    .bail()
    .isLength({ max: config.username.maxLength })
    .withMessage(`El usuario debe tener hasta ${config.username.maxLength} caracteres`)
    .bail()
    .matches(config.username.allowedPattern)
    .withMessage('Usuario inválido, sólo se admiten letras, números y/o _')
    .bail()
    .custom(async (username: string, meta: Meta): Promise<any> => {

      let usersAmount: number = 1;

      try {

        usersAmount = await User.count(
          {
            where: {
              id: {
                [Op.not]: req.userId,
              },
              username: username,
              profile: UserBase.Profile.Garage,
            },
          },
        );

      } catch(_) {}

      if (usersAmount > 0) {

        return Promise.reject(`El usuario "${username}" ya existe`);

      }

    })
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const name: string = String(req.body.name);
      const email: string = String(req.body.email);
      const username: string = String(req.body.username);

      let updatedAccount: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await User.update(
          {
            username: username,
          },
          {
            where: {
              id: req.userId,
            },
            transaction: transaction,
          },
        );

        await Garage.update(
          {
            name: name,
            email: email,
          },
          {
            where: {
              userId: req.userId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        updatedAccount = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (updatedAccount) {

        output.body.state = 3;
        output.body.message = 'Cuenta modificada con éxito';
        output.body.garageAccount = {
          fullName: name,
          username: username,
          picture: `${username.substr(0, 1).toUpperCase()}${username.substr(-1, 1).toUpperCase()}`,
        };

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo modificar la cuenta';

      }

    } else {

      output.body.field = validationError;

    }

    res.json(output);

  }

}

export {
  UpdateAccount,
};
