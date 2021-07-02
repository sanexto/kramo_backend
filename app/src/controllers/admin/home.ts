import { NextFunction, Request, Response, } from 'express';
import { Op, } from 'sequelize';

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
                id: {
                  [Op.eq]: req.userId,
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
        title: '',
        adminAccount: {
          fullName: `${admin.name ?? ''} ${admin.surname ?? ''}`,
          username: admin.User.username ?? '',
          picture: `${(admin.User.username ?? '').substr(0, 1).toUpperCase()}${(admin.User.username ?? '').substr(-1, 1).toUpperCase()}`,
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
