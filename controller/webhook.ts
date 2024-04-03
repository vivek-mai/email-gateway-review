import { Request, Response } from "express";
import { WebhookHelper } from "../helper/webhook";
import { successResponse, failureResponse } from "../common/service";
import { RefStrings } from "../constants";

export class WebhookController {
  public async sendBlueWebhook(req: Request, res: Response) {
    try {
      const result = await WebhookHelper.sendBlueWebhook(req.body);
      successResponse(RefStrings.responseStatus.success, result, res, req);
      
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  
  public async awsSesHook(req: Request, res: Response) {
    try {
      const result = await WebhookHelper.awsSesHook(req);
      successResponse(RefStrings.responseStatus.success, result, res, req);
      
    } catch (error: any) {
      console.log(error);
      successResponse(RefStrings.responseStatus.success, {}, res, req);
    }
  }
}
