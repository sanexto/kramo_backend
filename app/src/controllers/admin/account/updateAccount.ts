import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';

import { JsonResponse, User as UserBase, Validator, } from '../../../base';
import { Admin, User, sequelize, } from '../../../models';

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

    let admin: Admin | null = null;

    try {

      admin = await Admin.findOne(
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

    if (!_.isNull(admin)) {

      output.body = {
        state: 2,
        title: 'Mi cuenta',
        form: {
          updateAccount: {
            field: {
              name: {
                label: 'Nombre',
                hint: '',
                value: _.isNull(admin.name) ? '' : admin.name,
              },
              surname: {
                label: 'Apellido',
                hint: '',
                value: _.isNull(admin.surname) ? '' : admin.surname,
              },
              email: {
                label: 'Correo',
                hint: '',
                value: _.isNull(admin.email) ? '' : admin.email,
              },
              username: {
                label: 'Usuario',
                hint: '',
                value: _.isNull(admin.User.username) ? '' : admin.User.username,
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

    await body('surname')
    .exists({ checkNull: true })
    .withMessage('El campo "Apellido" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Apellido" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar un apellido')
    .bail()
    .isLength({ max: 255 })
    .withMessage('El apellido debe tener hasta 255 caracteres')
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
    .isLength({ min: 3 })
    .withMessage('El usuario debe tener al menos 3 caracteres')
    .bail()
    .isLength({ max: 25 })
    .withMessage('El usuario debe tener hasta 25 caracteres')
    .bail()
    .matches(/^[a-zA-Z0-9_]+$/)
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
              profile: UserBase.Profile.Admin,
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
      const surname: string = String(req.body.surname);
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

        await Admin.update(
          {
            name: name,
            surname: surname,
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
        output.body.adminAccount = {
          fullName: `${name} ${surname}`,
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
