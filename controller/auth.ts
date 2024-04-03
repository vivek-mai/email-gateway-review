import { Errors, RefStrings } from "../constants";
import { NextFunction, Request, Response } from "express";
import {
  failureResponse,
  validationError,
} from "../common/service";
import { authValidator } from "../validator/auth_validator";

export class AuthController {
  public async authenticateService(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Access header values
      let serviceCredentials = {
        servicename: req.headers.servicename,
        emailauthkey: req.headers.emailauthkey,
      };
      // Validate header values
      const isValidated = authValidator(serviceCredentials);
      if (!isValidated.valid) return validationError(isValidated.errors, res);

      // Check if serivce valid
      if (
        serviceCredentials.emailauthkey !==
        RefStrings.serviceAuthKey[serviceCredentials.servicename.toString()]
      ) {
        throw Errors.systemError.unAuthorized;
      } else {
        next();
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }
}
