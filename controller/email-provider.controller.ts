import { Response } from "express";
import {
  successResponse,
  failureResponse,
} from "../common/service";
import EmailProvider from "../model/email_provider";
import { Errors, RefStrings } from "../constants";
import redisConnection from "../config/redis";

export class VendorController {


  public async addEmailProvider(req: any, res: Response) {
    try {

      const { auth_route } = req.headers;

      // get name 
      const { name } = req.body;
      if (!auth_route || auth_route != process.env.ADMIN_ROUTE || !name) {
        throw Errors.systemError.unAuthorized;
      }

      const checkIfProvider = await EmailProvider.findOne({ name });
      if (checkIfProvider) {
        throw Errors.systemError.invalidRequest;
      }
      const resp = await EmailProvider.create(req.body);
      return successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);
    } catch (error) {
      console.log(error);
      return failureResponse(error.message, error, res, req);
    }
  }

  public async updatePriorities(req: any, res: Response) {
    try {
      const { auth_route } = req.headers;

      if (!auth_route || auth_route != process.env.ADMIN_ROUTE) {
        throw Errors.systemError.unAuthorized;
      }
      const updates = req.body;

      const bulkOperations = updates.map(({ name, priority }) => ({
        updateOne: {
          filter: { name, isActive: true },
          update: { $set: { priority } }
        }
      }));

      // Execute bulk write operation
      const result = await EmailProvider.bulkWrite(bulkOperations);



      await redisConnection.del(process.env.REDIS_MAIL_VENDORS);
      await redisConnection.set(process.env.REDIS_MAIL_FAIL_COUNT, 0);

      const resp = await EmailProvider.find({ isActive: true }).lean();

      if (resp) {
        await redisConnection.set(process.env.REDIS_MAIL_VENDORS, JSON.stringify(resp));
      }

      return successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);
    } catch (error) {
      console.log("updatePriorities Error",error);
      return failureResponse(error.message, error, res, req);
    }
  };


}