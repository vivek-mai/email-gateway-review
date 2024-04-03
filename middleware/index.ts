import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { upload } from "../config/attachment";
import { Errors, RefStrings } from "../constants";
import { failureResponse, successResponse, validationError } from "../common/service";
import { Utils } from "../utility/utils";
import { vendorResponse } from "../helper/email";
import redisConnection from "../config/redis";
import EmailProvider from "../model/email_provider";
import { sendEmail } from "../validator/email_validatort";
import DomainsSchema from "../model/domains";
import { axiosClient } from "../common/axios";


export class Middleware {


  public async fileAttachment(req: any,
    res: Response,
    next: NextFunction) {
    upload(req, res, function (err) {
      let isFileEmpty = false;
      try {
        if (req?.files?.length > process.env.NO_OF_MAX_FILES_ATTACHMENTS) {
          console.log("Total number of files tried to upload : ", req?.files?.length);
          throw Errors.systemError.noOfFilesLimit;
        }
        if (err instanceof multer.MulterError) {
          console.log("uploadFile instance multer error : ");
          if (RefStrings.multerErrors.fileSize == err.code) {
            throw Errors.systemError.fileSizeLimit;
          } else if (RefStrings.multerErrors.fileField == err.code) {
            console.log("uploadFile instance multer error code : ", err, RefStrings.multerErrors.fileField);
            throw Errors.systemError.fileField;
          }
        } else if (err) {
          console.log("uploadFile multer error : ", err);
          throw err;
        }

        if ('file' in req.body && !req.files.length) {
          throw Errors.systemError.fileMissing;
        }


        //size limit
        req?.files?.forEach((file) => {
          if (file?.size == 0) {
            isFileEmpty = true;
            Utils.deleteFile(`${RefStrings.filePaths.uploadFiles}/${file.filename}`)
          }
        });

        if (isFileEmpty) {
          throw Errors.systemError.fileContentEmpty;
        }

        next();

      } catch (error) {
        console.log("fileAttachment Error:", error);
        Utils.requestFiles(req);
        return failureResponse(error.message, error, res, req);
      }

    });
  }

  public async setMailProvider(req: Request, res: Response, next: NextFunction) {

    try {


      const response = await vendorResponse();
      req['mail-provider'] = response;
      next();

    } catch (error) {
      return failureResponse(error.message, error, res, req);

    }
  }

  public async resetRedis(req: Request, res: Response) {
    try {


      const { auth_route } = req.headers;

      if (!auth_route || auth_route != process.env.ADMIN_ROUTE) {
        throw Errors.systemError.unAuthorized;
      }


      await redisConnection.del(process.env.REDIS_MAIL_VENDORS);
      await redisConnection.set(process.env.REDIS_MAIL_FAIL_COUNT, 0);

      const resp = await EmailProvider.find({ isActive: true }).lean();

      if (resp) {
        await redisConnection.set(process.env.REDIS_MAIL_VENDORS, JSON.stringify(resp));
      }
      successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);


    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async validateApi(req: Request, res: Response, next: NextFunction) {
    try {
      const apiHeaderKey = req.headers['emailauthkey'];
      if (!apiHeaderKey) {
        throw Errors.smsGatewayError.unAuthorized;
      };

      const headers = {
        'Content-Type': 'application/json',
        'apikey': apiHeaderKey
      };
      const result = await axiosClient(process.env.NOTIFICATION_GATEWAY, '', headers).post(RefStrings.endpoints.smsGateway.apiVerification);
      if (result.data.result.httpStatus != 200) {
        throw result.data;
      }
      else {
        req['emailauthkey'] = result.data.result;
        next();
      }

    } catch (error) {
      failureResponse(error.message, error, res, req);
    }
  }

  public async validateUser(req: Request, res: Response, next: NextFunction) {
    try {


      const token = req.headers['authorization']?.split(' ')?.[1];

      if (!token) {
        throw Errors.smsGatewayError.unAuthorized;
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const result = await axiosClient(process.env.NOTIFICATION_GATEWAY, '', headers).get(RefStrings.endpoints.smsGateway.profile);

      if (result.data.status != 200 || !result?.data?.result) {
        throw result.data;
      }
      else {
        req['user'] = result.data.result;
        next();
      }

    } catch (error) {
      failureResponse(error.message, error, res, req);
    }
  }

  public async adminRoute(req: Request, res: Response, next: NextFunction) {
    try {

      const { auth_route } = req.headers;

      if (!auth_route || auth_route != process.env.ADMIN_ROUTE) {
        throw Errors.systemError.unAuthorized;
      }
      next();
    } catch (error) {
      failureResponse(error.message, error, res, req);
    }
  }



  public async testUpdatePriority(req: Request, res: Response) {
    try {

      const { auth_route } = req.headers;

      if (!auth_route || auth_route != process.env.ADMIN_ROUTE) {
        throw Errors.systemError.unAuthorized;
      }

      await Utils.updateVendorPriority({});
      successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);

    } catch (error) {
      failureResponse(error.message, error, res, req);

    }
  }

  public async validateMail(req: any, res: Response, next: NextFunction) {
    try {
      const isValidated = sendEmail({ ...req.body });
      if (!isValidated.valid) {
        Utils.requestFiles(req);
        return validationError(isValidated.errors, res);
      }

      req.body['emailTo'] = req.body.emailTo.trim().toLowerCase();
      req.body['emailFrom'] = req.body.emailFrom.trim().toLowerCase();
      req.body['subject'] = req.body.subject.trim();
      req.body['message'] = req.body.message.trim();
      req.body['category'] = req.body.category.trim();
      req.body['emailType'] = req.body.emailType.trim();


      const emailFrom = req.body.emailFrom.split("@")[1];

      if(RefStrings.environments.PROD!==process.env.ENVIRONMENT && !RefStrings.domainsFrom.PREPROD.includes(emailFrom)){
          throw Errors.systemError.domainNotAllowed;
      }

      //check in redis else pull from db
      const getDomain = await redisConnection.get(`DOMAIN_${emailFrom}`);

      if (!getDomain) {
        const response = await DomainsSchema.findOne({ domain: emailFrom });
        if (!response) {
          throw Errors.systemError.domainNotFound;
        }
        await redisConnection.set(`DOMAIN_${emailFrom}`, 1);
      }

      next();

    } catch (error) {
      Utils.requestFiles(req);
      return failureResponse(error.message, error, res, req);

    }
  }

  public async validateDebounceEmail(req: any, res: Response, next: NextFunction) {
    try {
      const { emailTo } = req.body;
      const emailTo_Tls = `${emailTo}_TTL`;
      const emailToTtl = Number.parseInt(process.env.REDIS_MAIL_TO_TTL);
      const emailToCount = Number.parseInt(process.env.REDIS_MAIL_TO_COUNT);

      let emailTo_Count = await redisConnection.get(emailTo_Tls) || 0;
      if (emailTo_Count >= emailToCount) {
        console.log(`Redis Error sending email ${emailTo} Ttl ${emailTo_Count}`);
        throw Errors.systemError.mailToLimit;
      } else {
        await redisConnection.set(emailTo_Tls, ++emailTo_Count, { EX: emailToTtl });
      }
      next();
    } catch (error) {
      Utils.requestFiles(req);
      console.log("Debounce Error ", error);
      failureResponse(error.message, error, res, req);

    }
  }

  public async captchaGoogle(req:any, res:Response, next:NextFunction){
    try{

      const {capchaToken} = req.body;

      if(!capchaToken){
        throw Errors.systemError.captchaVerificationFailed;
      }
      const url = `${process.env.SEND_QUERY_CAPTCHA}${process.env.GOOGLE_CAPTCHA_SECRET}&response=${capchaToken}`;
      let response = await axiosClient(url, '', {}).post('/');
      if (response.data?.success) {
        return next();
      }
      throw Errors.systemError.captchaVerificationFailed;
    }catch(error){
      failureResponse(error.message, error, res, req);
    }
  }


}