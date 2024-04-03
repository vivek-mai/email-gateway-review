import { Response } from "express";
import { Errors, RefStrings } from "../constants";

export async function successResponse(
  message: string,
  result: any,
  res: Response,
  req: any
) {
  res.status(200).json({
    status: RefStrings.responseStatus.success,
    message: message,
    ...result,
  });
}

export async function failureResponse(
  message: string,
  result: any,
  res: Response,
  req: any
) {
  res.status(400).json({
    status: RefStrings.responseStatus.failure,
    ...result
  });
}

export async function validationError(validationError: any, res: any) {
  // Get Validation Errors
  let meta: any = {};
  let message: any;
  let result: any;
  meta["errorFields"] = [];
  for (let i in validationError) {
    meta["errorFields"].push(validationError[i]["path"].join(','));
  }
  // Create Exception
  message = Errors.systemError.invalidRequestFormat;
  result = meta;
  res.status(400).json({
    status: RefStrings.responseStatus.failure,
    message: message.message,
    customErrorNumber: message.customErrorNumber,
    ...result,
  });
}
