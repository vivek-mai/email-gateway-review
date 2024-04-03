import { Request, Response } from "express";
import { axiosClient } from "../common/axios";
import DomainsSchema from "../model/domains";
import { failureResponse, successResponse } from "../common/service";
import { Errors, RefStrings } from "../constants";
import { ch, publishToQueue, rabbitMqConnection } from "./rabbit";
import { ExternalService } from "../external/index";


export class HealthCheckController {
  public async healthCheck(req: Request, res: Response) {
    try {

      const dbStatus = await DomainsSchema.findOne();

      const payload = {
        queueTest: true
      }

      //testing rabbitmq is up
      publishToQueue({ ...payload });

      const mailParams = {
        emailTo : 'mrityunjaya.p@p2epl.com,bhaskar.behl@p2epl.com,ruchit.saxena@p2epl.com,davinder.kumar@p2epl.com',
        emailFrom: 'alert@p2eppl.com',
        category: 'alerts',
        subject: `Bouncify credentials exhausted in ${process.env.ENVIRONMENT} Environment`,
        message: "Please recharge you bouncify.io account, new email addresses cant't be verified to send emails."
      }

      setTimeout(async () => {
        try {
          const creds = await ExternalService.checkCredentials();
          console.log("creds response",creds,new Date());
          if (creds?.credits_info.credits_remaining === 0) {
            publishToQueue({ ...mailParams });
          }
        } catch (err) {
          console.log("healthCheck credentials Error", err);
        }
      }, 600000)

      successResponse(RefStrings.responseStatus.success, { status: 200 }, res, req);

    } catch (error: any) {
      console.log("Error healthCheck", error);
      if (error.customErrorNumber == -17) {
        rabbitMqConnection();
      }
      failureResponse(error.message, error, res, req);
    }
  }


}