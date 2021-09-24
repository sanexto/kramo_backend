import { NextFunction, Request, Response, } from 'express';
import _ from 'lodash';

import { JsonResponse, } from '../../base';
import { Admin, User, } from '../../models';

class Home {

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
        title: '',
        adminAccount: {
          fullName: `${_.isNull(admin.name) ? '' : admin.name} ${_.isNull(admin.surname) ? '' : admin.surname}`,
          username: _.isNull(admin.User.username) ? '' : admin.User.username,
          picture: `${(_.isNull(admin.User.username) ? '' : admin.User.username).substr(0, 1).toUpperCase()}${(_.isNull(admin.User.username) ? '' : admin.User.username).substr(-1, 1).toUpperCase()}`,
        },
        navMenu: {
          item: {
            garages: {
              title: 'Cocheras',
            },
            admins: {
              title: 'Administradores',
            },
            updateAccount: {
              title: 'Mi cuenta',
            },
            updatePassword: {
              title: 'Modificar contraseña',
            },
            logout: {
              title: 'Salir',
            },
          },
        },
      };

    } else {

      output.body.error.message = 'Tu usuario no existe';

    }

    res.json(output);

  }

}

export {
  Home,
};
