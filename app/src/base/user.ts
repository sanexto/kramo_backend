import { Op, } from 'sequelize';

import { User as UserModel, } from '../models';

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

    let result: CheckResult = CheckResult.NotExist;
    let user: UserModel | null = null;

    try {

      user = await UserModel.findOne(
        {
          where: {
            id: {
              [Op.eq]: userId,
            },
            profile: {
              [Op.eq]: profile,
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
