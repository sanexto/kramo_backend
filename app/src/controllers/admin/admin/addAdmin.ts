import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';

import { JsonResponse, User as UserBase, Validator, } from '../../../base';
import { Admin, User, sequelize, } from '../../../models';

class AddAdmin {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Nuevo administrador',
      form: {
        addAdmin: {
          field: {
            name: {
              label: 'Nombre',
              hint: '',
              value: '',
            },
            surname: {
              label: 'Apellido',
              hint: '',
              value: '',
            },
            email: {
              label: 'Correo',
              hint: '',
              value: '',
            },
            username: {
              label: 'Usuario',
              hint: '',
              value: '',
            },
            password: {
              label: 'Contraseña',
              hint: '',
              value: '',
              reveal: false,
            },
            enabled: {
              label: 'Habilitado',
              value: false,
            },
          },
          button: {
            add: {
              label: 'Agregar',
            },
          },
        },
      },
    };

    res.json(output);

  }

  public static async post(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      message: '',
      field: {},
    };

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
    .notEmpty()
    .withMessage('Debes ingresar una contraseña')
    .bail()
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

      const hash: string = await bcrypt.hash(password, await bcrypt.genSalt());

      let addedAdmin: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        const user: User = await User.create(
          {
            username: username,
            password: hash,
            enabled: enabled,
            profile: UserBase.Profile.Admin,
          },
          {
            transaction: transaction,
          },
        );

        await Admin.create(
          {
            name: name,
            surname: surname,
            email: email,
            userId: user.id,
          },
          {
            transaction: transaction,
          },
        );

        await transaction.commit();
        addedAdmin = true;

      } catch(_) {

        await transaction.rollback();

      }

      if (addedAdmin) {

        output.body.state = 3;
        output.body.message = 'Administrador agregado con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo agregar el administrador';

      }

    } else {

      output.body.field = validationError;

    }

    res.json(output);

  }

}

export {
  AddAdmin,
};
