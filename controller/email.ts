import { Request, Response } from "express";
import {
  successResponse,
  failureResponse,
  validationError,
} from "../common/service";
import { EmailHelper } from "../helper/email";
import { EnquiryEmail } from "../helper/enquiry_email";
import { subscribeEmail, sendEmail, emailLogsPage, queryIprEmail,contactEmailValidate,carrerEmailValidate, subscribeEmailUser } from "../validator/email_validatort";
import { publishToQueue } from "./rabbit";
import path from 'path';
import { Utils } from "../utility/utils";
import { Errors, RefStrings } from "../constants";
import EmailLogs from "../model/email_logs";
const dirname = path.resolve();
import {PipelineStage } from 'mongoose';
import { getFileUploaded } from "../config/attachment";
import DomainsSchema from "../model/domains";

export class EmailController {
  public async email(req: Request, res: Response) {
    try {
      // Validate Request
      const isValidated = sendEmail(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        const result = await EmailHelper.sendEmail(req.body);
        successResponse(RefStrings.responseStatus.success, result, res, req);
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async emailQueue(req: Request, res: Response) {
    try {
      const user = req['emailauthkey'] ? req['emailauthkey'] : null;
      // const isValidated = sendEmail({ ...req.body});
      // if (!isValidated.valid) return validationError(isValidated.errors, res);
      // else {
        publishToQueue({ ...req.body, user: user });
        successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);
      // }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async emailQueueAttachment(req: any, res: Response) {
    try {
      const user = req['emailauthkey'] ? req['emailauthkey'] : null;
      let uploadedFiles = null;
      
      if(req?.files?.length>0) {
        uploadedFiles = await getFileUploaded(req);
      }

        publishToQueue({ ...req.body, uploadedFiles, serviceName: req.headers.servicename, user: user });
        return successResponse(RefStrings.responseStatus.success, { result: "ok" }, res, req);


    } catch (error: any) {
      req?.files?.forEach(async(ele) => {
        Utils.deleteFile(`${RefStrings.filePaths.uploadFiles}/${ele.filename}`);
       });
      console.log("email route Error : ",error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async sendenquiryemail(req: Request, res: Response) {
    try {
      // Validate Request
      const isValidated = queryIprEmail(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        // Business Logic
        // const result = await EnquiryEmail.sendenquiryemail(req.body);
        const result = await EnquiryEmail.sendiprenquiryemail({...req.body,servicName:req.headers.serviceName});
        if (result.success) {
          successResponse(RefStrings.responseStatus.success, result, res, req);
        } else {
          failureResponse(RefStrings.responseStatus.failure, result, res, req)
        }
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async addnewsubscriber(req: Request, res: Response) {
    try {
      // Validate Request
      const isValidated = subscribeEmail(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        // Business Logic
        const result = await EnquiryEmail.addnewsubscriber(req.body);
        if (result.success) {
          successResponse(RefStrings.responseStatus.success, result, res, req);
        } else {
          failureResponse(RefStrings.responseStatus.failure, result, res, req)
        }
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }
  
  public async contactMail(req: Request, res: Response) {
    try {
      // Validate Request
      const isValidated = contactEmailValidate(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        // Business Logic
        const user = req['emailauthkey'] ? req['emailauthkey'] : null;
        const result = await EnquiryEmail.contactMail({...req.body,user});
        if (result.success) {
          successResponse(RefStrings.responseStatus.success, result, res, req);
        } else {
          failureResponse(RefStrings.responseStatus.failure, result, res, req)
        }
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  } 
  public async subscribeEmailUser(req: Request, res: Response) {
    try {
      // Validate Request
      const isValidated = subscribeEmailUser(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        // Business Logic
        const user = req['emailauthkey'] ? req['emailauthkey'] : null;

        const result = await EnquiryEmail.subscribeEmailUser({...req.body,user});
        if (result.success) {
          successResponse(RefStrings.responseStatus.success, result, res, req);
        } else {
          failureResponse(RefStrings.responseStatus.failure, result, res, req)
        }
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async careerMail(req: any, res: Response) {
    try {
      let uploadedFiles = null;
      // Validate Request
      const isValidated = carrerEmailValidate(req.body);
      if (!isValidated.valid) return validationError(isValidated.errors, res);
      else {
        const user = req['emailauthkey'] ? req['emailauthkey'] : null;

        if(req?.files?.length>0) {
          uploadedFiles = await getFileUploaded(req);
        }
          // Business Logic
        const result = await EnquiryEmail.careerMail({...req.body, user, uploadedFiles});
        if (result.success) {
          successResponse(RefStrings.responseStatus.success, result, res, req);
        } else {
          failureResponse(RefStrings.responseStatus.failure, result, res, req)
        }
      }
    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async emailLogs(req: Request, res: Response) {
    try {
      const { pageNo, pageSize, sortBy = null } = req.query;

      // Validate Request
      const isValidated = emailLogsPage(req.query);
      if (!isValidated.valid) return validationError(isValidated.errors, res);

      const parsedPageNo = Number(pageNo);
      const parsedPageSize = Number(pageSize);
      const sortByQuery = (sortBy ? ((RefStrings.sortQuery.ASC == sortBy) ? RefStrings.sortQuery.asc : RefStrings.sortQuery.desc) : RefStrings.sortQuery.desc);
      // const user = req['user'];
      const user = req['emailauthkey'];
      const pipeline: PipelineStage[] = [
        {
          $match: {
            "userId": user.id
          }
        },
        {
          $facet: {
            totalDocuments: [
              { $count: "count" }
            ],
            data: [
              { $sort: { createdAt: sortByQuery } },
              { $skip: (parsedPageNo - 1) * parsedPageSize },
              { $limit: parsedPageSize }
            ]
          }
        },
        {
          $project: {
            totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalDocuments.count", 0] }, 0] },
            data: 1
          }
        }

      ];

      const result = await EmailLogs.aggregate(pipeline);

      const [totalRecords, data] = result;

      const transformedResult = {
        ...totalRecords,
        ...data,
        pageNo: parsedPageNo,
        pageSize: parsedPageSize
      };

      successResponse(RefStrings.responseStatus.success, {result:transformedResult}, res, req);

    } catch (error: any) {
      console.log(error);
      failureResponse(error.message, error, res, req);
    }
  }

  public async registerEmailDomain(req: Request, res: Response){
    try{
      const {domain} = req.body;

      if(!domain){
        throw Errors.systemError.domainMissing;
      }
      const response = await DomainsSchema.create({domain});

      successResponse(RefStrings.responseStatus.success, {result : response ? true : false}, res, req);

    }catch(error){
      failureResponse(error.message, error, res, req);

    }
  }

  public async emailDomain(req: Request, res: Response){
    try{


      const {domain} = req.query;

      if(!domain){
        throw Errors.systemError.domainMissing;
      }

      const response = await DomainsSchema.findOne({domain, isActive:true});

      successResponse("success", {result : response ? true : false}, res, req);

    }catch(error){
      failureResponse(error.message, error, res, req);
    }
  }
}