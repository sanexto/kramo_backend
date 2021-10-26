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
            id: userId,
            profile: profile,
          },
        },
      );

    } catch (_) {}

    if (user != null) {

      result = !user.enabled ? CheckResult.NotEnabled : CheckResult.Ok;

    }

    return result;

  }

}

export {
  User,
};
