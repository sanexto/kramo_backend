import { NextFunction, Request, Response, } from 'express';
import { body, Meta, param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';

import config from '../../../config';
import { JsonResponse, User as UserBase, Validator, } from '../../../base';
import { Admin, User, sequelize, } from '../../../models';

class UpdateAdmin {

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

    await param('userId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de usuario" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de usuario" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .custom((userId: number, meta: Meta): any => {

      if (userId == req.userId) {

        throw new Error('No puedes modificarte a ti mismo');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const userId: number = Number(req.params.userId);

      let admin: Admin | null = null;

      try {

        admin = await Admin.findOne(
          {
            include: [
              {
                model: User,
                required: true,
                where: {
                  id: {
                    [Op.eq]: userId,
                  },
                },
              },
            ],
          },
        );

      } catch(_) {}

      if (admin != null) {

        output.body = {
          state: 2,
          title: 'Modificar administrador',
          form: {
            updateAdmin: {
              field: {
                name: {
                  label: 'Nombre',
                  hint: '',
                  value: admin.name ?? '',
                },
                surname: {
                  label: 'Apellido',
                  hint: '',
                  value: admin.surname ?? '',
                },
                email: {
                  label: 'Correo',
                  hint: '',
                  value: admin.email ?? '',
                },
                username: {
                  label: 'Usuario',
                  hint: '',
                  value: admin.User.username ?? '',
                },
                password: {
                  label: 'Contraseña',
                  hint: '',
                  value: '',
                  reveal: false,
                },
                enabled: {
                  label: 'Habilitado',
                  value: admin.User.enabled ?? false,
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

        output.body.error.message = 'El administrador solicitado no existe';

      }

    } else {

      output.body.error.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

  public static async put(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 2,
      message: '',
      field: {},
    };

    await param('userId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de usuario" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de usuario" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de usuario" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .custom((userId: number, meta: Meta): any => {

      if (userId == req.userId) {

        throw new Error('No puedes modificarte a ti mismo');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const userId: number = Number(req.params.userId);

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
                  [Op.not]: userId,
                },
                username: {
                  [Op.eq]: username,
                },
                profile: {
                  [Op.eq]: UserBase.Profile.Admin,
                },
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

      await body('password')
      .exists({ checkNull: true })
      .withMessage('El campo "Contraseña" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Contraseña" no es una cadena de texto')
      .bail()
      .if(body('password').notEmpty())
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .bail()
      .isLength({ max: 64 })
      .withMessage('La contraseña debe tener hasta 64 caracteres')
      .bail()
      .run(req);

      await body('enabled')
      .exists({ checkNull: true })
      .withMessage('El campo "Habilitado" no existe')
      .bail()
      .isBoolean()
      .withMessage('El campo "Habilitado" no es un booleano')
      .bail()
      .run(req);

      const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (_.isEmpty(validationError)) {

        const name: string = String(req.body.name);
        const surname: string = String(req.body.surname);
        const email: string = String(req.body.email);
        const username: string = String(req.body.username);
        const password: string = String(req.body.password);
        const enabled: boolean = Boolean(req.body.enabled);

        const user: Record<string, any> = {
          username: username,
          enabled: enabled,
        };

        if (!_.isEmpty(password)) {

          const hash: string = await bcrypt.hash(password, await bcrypt.genSalt());

          user.password = hash;

        }

        let updatedAdmin: boolean = false;
        const transaction: Transaction = await sequelize.transaction();

        try {

          await User.update(
            user,
            {
              where: {
                id: userId,
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
                userId: userId,
              },
              transaction: transaction,
            },
          );

          await transaction.commit();
          updatedAdmin = true;

        } catch (_) {

          await transaction.rollback();

        }

        if (updatedAdmin) {

          output.body.state = 3;
          output.body.message = 'Administrador modificado con éxito';

        } else {

          output.body.state = 2;
          output.body.message = 'No se pudo modificar el administrador';

        }

      } else {

        output.body.field = validationError;

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  UpdateAdmin,
};
