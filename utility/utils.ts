import { promises as fs } from 'fs';
import path from 'path';
import { RefStrings, Errors } from "../constants";
import redisConnection from "../config/redis";
import EmailProvider from "../model/email_provider";
const dirname = path.resolve();
import moment from 'moment';
import EmailLogs from "../model/email_logs";
import { axiosClient } from "../common/axios";

export class Utils {
  static async externalRequest(
    provider: string,
    type: string,
    apiKey: any,
    url: string,
    body: any,
    createdMailResp:any,
    throwException: any = false
  ) {
    // Reference
    let response: any = {};
    try {
      // Request Parameters
      const headers = {
        "Content-Type": "application/json",
        "api-key": apiKey,
      };

      // Request
      if (type == RefStrings.meta.requestType.post) {
        response = await axiosClient(url, {}, headers).post('/',body); 
      } else {
        throw Errors.systemError.invalidRequest;
      }

      response = response.data;
      return response;
    } catch (error: any) {
      // Log Error
      console.log(provider + " | Error : ");
      console.log(error.code);
      console.log(error.response);
      const errResp = error.response?.data?.message ?  error.response?.data?.message : error.message;
      this.updateVendorPriority(provider);
      await EmailLogs.findByIdAndUpdate(createdMailResp._id,{errorMessage:errResp});
      //Add LogDetails
      if (throwException) {
        throw Errors.systemError.externalProviderIssue;
      } else {
        // Return error
        return error;
      }
    }
  }


  static async updateVendorPriority(data: any) {
    try {


      const emailCount = (await redisConnection.get(process.env.REDIS_MAIL_FAIL_COUNT)) || 0;
      const countIncre = Number(emailCount) + 1;
      if (countIncre >= Number(process.env.REDIS_MAIL_FAIL_COUNT)) {

        await redisConnection.set(process.env.REDIS_MAIL_FAIL_COUNT, 0);
        await redisConnection.del(process.env.REDIS_MAIL_VENDORS);

        const getVendorsData: any[] = await EmailProvider.find({ isActive: true });

        for (const vendorData of getVendorsData) {
          const currentPriority = vendorData.priority;
          const newPriority = currentPriority === getVendorsData.length ? 1 : currentPriority + 1;
          await EmailProvider.findByIdAndUpdate(vendorData._id, { priority: newPriority });
        }

      } else {

        await redisConnection.set(process.env.REDIS_MAIL_FAIL_COUNT, countIncre);

      }



    } catch (error) {
      console.log({ error });
    }
  }




  static async deleteFile(filePath) {

    try {
      const filePathUrl = path.join(dirname, filePath);
      await fs.unlink(filePathUrl);
      console.log('Deleted file')
      return true;

    } catch (err) {
      console.log('File is not present or already deleted',err)

    }

  }

  static async fileExists(filePath) {

    try {
      await fs.access(filePath)
      return true;
    } catch {
      return false;
    }
  }

  static async readFileAttachment(filePathUrl) {
    const data = await fs.readFile(filePathUrl);
    return data;
  }

  static getDateZone(time:any,typeDate:string) {


    let utcDate = null;


    switch (typeDate){

      case 'sec':
        utcDate = moment.utc(time * 1000);
        break;
      
      case 'ms':
        utcDate = moment.utc(time);
        break;
    }
    return utcDate;
  }

   static fileFilter(req, file, callback) {
    if (file?.mimetype && !RefStrings.fileFormats.includes(file.mimetype)) {
      // return callback(new Error('Only images are allowed'))
      return callback(Errors.systemError.fileFormat)
    }
    callback(null, true)
  }

  static requestFiles(req:any){
    req?.files?.forEach((file)=>{
      Utils.deleteFile(`${RefStrings.filePaths.uploadFiles}/${file.filename}`)
  });
  }


}
