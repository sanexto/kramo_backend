import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../../config';
import { JsonResponse, Payload, User as UserBase, Validator, } from '../../../base';
import { Garage, User, sequelize, } from '../../../models';

class Signup {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Crear cuenta',
      form: {
        signup: {
          field: {
            garage: {
              label: 'Cochera',
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
            repeatPassword: {
              label: 'Repetir contraseña',
              hint: '',
              value: '',
              reveal: false,
            },
          },
          button: {
            signup: {
              label: 'Registrarme',
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

    await body('garage')
    .exists({ checkNull: true })
    .withMessage('El campo "Cochera" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Cochera" no es una cadena de texto')
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

    await body('repeatPassword')
    .exists({ checkNull: true })
    .withMessage('El campo "Repetir contraseña" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Repetir contraseña" no es una cadena de texto')
    .bail()
    .notEmpty()
    .withMessage('Debes ingresar nuevamente la contraseña')
    .bail()
    .if(body('password').exists().isString().notEmpty().isLength({ min: 8 }).isLength({ max: 64 }))
    .custom((repeatPassword: string, meta: Meta): any => {

      if (repeatPassword != req.body.password) {

        throw new Error('No coincide con la contraseña ingresada');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const garage: string = String(req.body.garage);
      const email: string = String(req.body.email);
      const username: string = String(req.body.username);
      const repeatPassword: string = String(req.body.repeatPassword);
      const passwordHash: string = await bcrypt.hash(repeatPassword, await bcrypt.genSalt());

      let token: string | null = null;
      const transaction: Transaction = await sequelize.transaction();

      try {

        const user: User = await User.create(
          {
            username: username,
            password: passwordHash,
            enabled: true,
            profile: UserBase.Profile.Garage,
          },
          {
            transaction: transaction,
          },
        );

        await Garage.create(
          {
            name: garage,
            email: email,
            userId: user.id,
          },
          {
            transaction: transaction,
          },
        );

        const payload: Payload = {
          id: user.id,
        };

        try {

          token = jwt.sign(payload, config.secret);
          
        } catch(_) {}

        if (token != null) {

          await transaction.commit();

        } else {

          await transaction.rollback();

        }

      } catch(_) {

        await transaction.rollback();

      }

      if (token != null) {

        output.body.state = 3;
        output.body.message = 'Cuenta creada con éxito';
        output.body.session = {
          token: token,
        };

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo crear la cuenta';

      }

    } else {

      output.body.field = validationError;

    }

    res.json(output);

  }

}

export {
  Signup,
};
