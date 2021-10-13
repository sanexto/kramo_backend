import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { User, sequelize, } from '../../../models';

class UpdatePassword {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Modificar contraseña',
      form: {
        updatePassword: {
          field: {
            currentPassword: {
              label: 'Contraseña actual',
              hint: '',
              value: '',
              reveal: false,
            },
            newPassword: {
              label: 'Contraseña nueva',
              hint: '',
              value: '',
              reveal: false,
            },
            repeatNewPassword: {
              label: 'Repetir contraseña nueva',
              hint: '',
              value: '',
              reveal: false,
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

    await body('currentPassword')
    .exists({ checkNull: true })
    .withMessage('El campo "Contraseña actual" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Contraseña actual" no es una cadena de texto')
    .bail()
    .notEmpty()
    .withMessage('Debes ingresar la contraseña actual')
    .bail()
    .isLength({ max: config.password.maxLength })
    .withMessage(`La contraseña actual debe tener hasta ${config.password.maxLength} caracteres`)
    .bail()
    .custom(async (currentPassword: string, meta: Meta): Promise<any> => {

      let user: User | null = null;

      try {

        user = await User.findOne(
          {
            where: {
              id: req.userId,
            },
          },
        );

      } catch(_) {}

      if (!_.isNull(user)) {

        const match: boolean = await bcrypt.compare(currentPassword, user.password);

        if (!match) {

          return Promise.reject('No coincide con la contraseña actual');

        }

      } else {

        return Promise.reject('No coincide con la contraseña actual');

      }

    })
    .bail()
    .run(req);

    await body('newPassword')
    .exists({ checkNull: true })
    .withMessage('El campo "Contraseña nueva" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Contraseña nueva" no es una cadena de texto')
    .bail()
    .notEmpty()
    .withMessage('Debes ingresar la contraseña nueva')
    .bail()
    .isLength({ min: config.password.minLength })
    .withMessage(`La contraseña nueva debe tener al menos ${config.password.minLength} caracteres`)
    .bail()
    .isLength({ max: config.password.maxLength })
    .withMessage(`La contraseña nueva debe tener hasta ${config.password.maxLength} caracteres`)
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    await body('repeatNewPassword')
    .exists({ checkNull: true })
    .withMessage('El campo "Repetir contraseña nueva" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Repetir contraseña nueva" no es una cadena de texto')
    .bail()
    .notEmpty()
    .withMessage('Debes ingresar nuevamente la contraseña nueva')
    .bail()
    .if((repeatNewPassword: string, meta: Meta): boolean => 
      !_.has(validationError, 'newPassword')
    )
    .custom((repeatNewPassword: string, meta: Meta): any => {

      if (repeatNewPassword == req.body.newPassword) {

        return true;

      } else {

        throw new Error('No coincide con la contraseña nueva ingresada');

      }

    })
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const repeatNewPassword: string = String(req.body.repeatNewPassword);
      
      const passwordHash = await bcrypt.hash(repeatNewPassword, await bcrypt.genSalt());

      let updatedPassword: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await User.update(
          {
            password: passwordHash,
          },
          {
            where: {
              id: req.userId,
            },
            transaction: transaction,
          },
        );

        await transaction.commit();
        updatedPassword = true;

      } catch (_) {

        await transaction.rollback();

      }

      if (updatedPassword) {

        output.body.state = 3;
        output.body.message = 'Contraseña modificada con éxito';

      } else {

        output.body.state = 2;
        output.body.message = 'No se pudo modificar la contraseña';

      }

    } else {

      output.body.field = validationError;

    }

    res.json(output);

  }

}

export {
  UpdatePassword,
};
