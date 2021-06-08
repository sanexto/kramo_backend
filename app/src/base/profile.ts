import { ModelType, Op, } from 'sequelize';

import { Admin, Garage, User, } from '../models';

namespace Profile {

  export enum Type {

    Admin = 'admin',
    Garage = 'garage',
    
  }

  export async function check(userId: number, type: Type): Promise<boolean> {

    let usersAmount: number = 0;
    let model: ModelType | null = null;

    switch (type) {

      case Type.Admin: {

        model = Admin;

        break;

      }
      case Type.Garage: {

        model = Garage;

        break;

      }

    }

    if (model != null) {

      try {

        usersAmount = await User.count(
          {
            include: [
              {
                model: model,
                required: true,
              },
            ],
            where: {
              id: {
                [Op.eq]: userId,
              },
            },
          },
        );

      } catch (e) {}

    }

    return usersAmount > 0 ? true : false;

  }

}

export {
  Profile,
}
