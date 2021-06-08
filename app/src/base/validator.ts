import { ValidationError as VE, } from 'express-validator';

namespace Validator {

  export interface ValidationError {

    message: string;
  
  }

  export function errorFormatter(error: VE): ValidationError {

    return {
      message: error.msg,
    };
  
  }

}

export {
  Validator,
}
