import { ModelType, Op, } from 'sequelize';

import { Admin, Garage, User as UserModel, } from '../models';

namespace User {

  export enum Profile {

    Admin = 'admin',
    Garage = 'garage',
    
  }

  export enum CheckResult {

    NotExist = 1,
    NotEnabled,
    Ok,
    
  }

  export async function check(userId: number, profile: Profile): Promise<CheckResult> {

    let model: ModelType | null = null;

    switch (profile) {

      case Profile.Admin: {

        model = Admin;

        break;

      }
      case Profile.Garage: {

        model = Garage;

        break;

      }

    }

    if (model == null) throw new Error('Invalid user profile');

    let result: CheckResult = CheckResult.NotExist;
    let user: UserModel | null = null;

    try {

      user = await UserModel.findOne(
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

    } catch (_) {}

    if (user != null) {

      if (user.enabled != null && user.enabled == true) {

        result = CheckResult.Ok;

      } else {

        result = CheckResult.NotEnabled;

      }

    }

    return result;

  }

}

export {
  User,
}
