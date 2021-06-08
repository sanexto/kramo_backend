namespace JsonResponse {

  export enum Status {

    BadRequest = 1,
    Unauthorized,
    Forbidden,
    Ok,
    
  }

  export interface Output {

    status: Status;
    body: any;
  
  }

}

export {
  JsonResponse,
}
