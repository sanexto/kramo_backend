import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';

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
    .custom(async (currentPassword: string, meta: Meta): Promise<any> => {

      let user: User | null = null;

      try {

        user = await User.findOne(
          {
            where: {
              id: {
                [Op.eq]: req.userId,
              },
            },
          },
        );

      } catch(e) {}

      if (user != null) {

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
    .isLength({ min: 8 })
    .withMessage('La contraseña nueva debe tener al menos 8 caracteres')
    .bail()
    .isLength({ max: 64 })
    .withMessage('La contraseña nueva debe tener hasta 64 caracteres')
    .bail()
    .run(req);

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
    .if(body('newPassword').exists().isString().notEmpty().isLength({ min: 8 }).isLength({ max: 64 }))
    .custom((repeatNewPassword: string, meta: Meta): any => {

      if (repeatNewPassword != req.body.newPassword) {

        throw new Error('No coincide con la contraseña nueva ingresada');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const repeatNewPassword: string = String(req.body.repeatNewPassword);

      const hash = await bcrypt.hash(repeatNewPassword, await bcrypt.genSalt());

      let updatedPassword: boolean = false;
      const transaction: Transaction = await sequelize.transaction();

      try {

        await User.update(
          {
            password: hash,
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

      } catch (e) {

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
}
