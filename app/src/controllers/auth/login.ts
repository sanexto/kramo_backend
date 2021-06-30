import { NextFunction, Request, Response, } from 'express';
import { body, validationResult, } from 'express-validator';
import { Op, } from 'sequelize';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config';
import { JsonResponse, Payload, User as UserBase, Validator, } from '../../base';
import { User, } from '../../models';

class Login {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Hola!',
      form: {
        login: {
          field: {
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
          },
          button: {
            login: {
              label: 'Ingresar',
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
      state: 2,
      message: '',
      field: {},
    };

    await body('profile')
    .exists({ checkNull: true })
    .withMessage('El campo "Perfil" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Perfil" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El campo "Perfil" está vacío')
    .bail()
    .isIn(Object.values(UserBase.Profile))
    .withMessage('El campo "Perfil" no tiene un valor permitido')
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const profile: string = String(req.body.profile);

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
      .run(req);

      const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (_.isEmpty(validationError)) {

        const username: string = String(req.body.username);
        const password: string = String(req.body.password);

        let user: User | null = null;

        try {

          user = await User.findOne(
            {
              where: {
                username: {
                  [Op.eq]: username,
                },
                profile: {
                  [Op.eq]: profile,
                },
              },
            },
          );

        } catch(_) {}

        if (user != null) {

          const match: boolean = await bcrypt.compare(password, user.password);

          if (match) {

            const payload: Payload = {
              id: user.id,
            };

            let token: string | null = null;

            try {

              token = jwt.sign(payload, config.secret);
              
            } catch(_) {}

            if (token != null) {

              output.body.state = 3;
              output.body.message = 'Sesión iniciada con éxito';
              output.body.session = {
                token: token,
              };

            } else {

              output.body.state = 2;
              output.body.message = 'No se pudo iniciar sesión';

            }

          } else {

            output.body.state = 2;
            output.body.message = 'Usuario y/o contraseña incorrectos';

          }

        } else {

          output.body.state = 2;
          output.body.message = 'Usuario y/o contraseña incorrectos';

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
  Login,
}
