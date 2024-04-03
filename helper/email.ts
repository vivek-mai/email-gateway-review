import EmailLogs from "../model/email_logs";
import redisConnection from "../config/redis";
import EmailProvider from "../model/email_provider";
import { Utils } from "../utility/utils";
import { Errors, RefStrings } from "../constants";
import { awsSesMethod } from "./email_vendor";
import BounceMails from "../model/email_bounce";
import { axiosClient } from "../common/axios";
let apiKey: any;

const getVendor = async () => {
  let vendors = JSON.parse(await redisConnection.get(process.env.REDIS_MAIL_VENDORS));
  if (!vendors || vendors?.length == 0) {
    vendors = await EmailProvider.find({ isActive: true });
    await redisConnection.set(process.env.REDIS_MAIL_VENDORS, JSON.stringify(vendors));
  }
  return vendors;
};


export const vendorResponse = () => getVendor().then((res) => {
  // get active vendors
  apiKey = process.env.SENDINBLUE_APIKEY;
  return res.find((item) => item.priority === 1);

});

export class EmailHelper {
  static async sendEmail(data: any) {
    let createdMailResp = null;
    try {

      const { emailTo, emailFrom, subject, message, catagory, emailType, mailProvider, serviceName, uploadedFiles = null, user,isTermsConditions=null} = data;
      const url = process.env.SEND_IN_BLUE_URL;

      let isAttachment = null;
      let emailBody = null;

      isAttachment = uploadedFiles?.length ? true : false;
      const fileAttachmentsData = uploadedFiles?.reduce((acc, curr) => [...acc, { url: curr.fileUrl, name: curr.fileName }], [])

      if (!isAttachment) {
        emailBody = {
          sender: {
            email: emailFrom,
          },
          to: [
            {
              email: emailTo,
            },
          ],
          subject: subject,
          htmlContent: message,
        };
      } else if (isAttachment) {
        emailBody = {
          sender: {
            email: emailFrom,
          },
          to: [
            {
              email: emailTo,
            },
          ],
          attachment: fileAttachmentsData,
          subject: subject,
          htmlContent: message,
        };
      }

        createdMailResp = await EmailLogs.create({
          serviceName,
          emailType,
          emailTo,
          emailFrom,
          message,
          subject,
          providerId: mailProvider?._id,
          fileAttachmentsUrl: uploadedFiles?.map((ele) => ele.fileUrl),
          userId: user?.id,
          isTermsConditions
        });

      const response = await Utils.externalRequest(
        RefStrings.provider.SEND_BLUE,
        RefStrings.meta.requestType.post,
        apiKey = process.env.SENDINBLUE_APIKEY,
        url,
        emailBody,
        createdMailResp
      );

      await EmailLogs.findByIdAndUpdate(createdMailResp._id, { messageId: response.messageId });
      console.log(`${RefStrings.provider.SEND_BLUE} mail sent ${new Date()}`);

    } catch (error) {
      console.log("sendInBlueErr", error);
      await EmailLogs.findByIdAndUpdate(createdMailResp._id, { errorMessage: error?.message });
      return error;
    }
  }


  static async awsSesMail(data: any) {
    let createdMailResp = null;
    try {
      const { emailTo, emailFrom, subject, message, category, emailType, serviceName, mailProvider, uploadedFiles = null, user,isTermsConditions=null } = data;

      createdMailResp = await EmailLogs.create({
        serviceName,
        emailType,
        category,
        emailTo,
        emailFrom,
        message,
        subject,
        providerId: mailProvider?._id,
        fileAttachmentsUrl: uploadedFiles?.map((ele) => ele.fileUrl),
        eventHistory: [{ type: 'request', date: Date.now() }],
        userId: user?.id,
        isTermsConditions
      });

      const response = await awsSesMethod(data);

      await EmailLogs.findByIdAndUpdate(createdMailResp._id, { messageId: response.response });
      console.log(`${RefStrings.provider.AWS_SES} mail sent ${new Date()}`);


    } catch (error) {
      console.log("awsSesMailErr", error.message);
      await EmailLogs.findByIdAndUpdate(createdMailResp._id, { errorMessage: error?.message });
      return error;
    }
  }



}


export const checkDebounceEmail = async (msgContent) => {
  let bouncedObj = { status: false, message: '' };
  try {

    const { emailTo } = msgContent;
    const emailToDomain = emailTo.split("@")[1];
    const resultMailId = await BounceMails.findOne({ email: emailTo });

    if (resultMailId?.isBounced) {
      throw Errors.systemError.debouncedMail;
    } else if (!resultMailId) {
      const response = await axiosClient(process.env.BOUNCIFY_IO_URL, { apikey: process.env.BOUNCIFY_IO_API_KEY, email: emailTo }, {}).get(RefStrings.endpoints.boucifyIo.verification);
      if (!response?.data?.success) {
        console.log("Bouncify.io api error", response.data)
        throw Errors.systemError.debouncedMailIo;
      } else {
        const responseData = response.data;

        //store in logs; if email is not bounced then continue else throw error
        let isBounced = false;

        isBounced = (responseData?.result !== RefStrings.bouncifyStatus.deliverable) ? true : isBounced;

        if (isBounced && process.env.ENVIRONMENT !== RefStrings.environments.PROD &&
          (responseData?.result == RefStrings.bouncifyStatus.undeliverable || responseData?.disposable == 1 || responseData?.accept_all == 1)) {
          isBounced = false;
        }

        await BounceMails.create({ email: emailTo, isBounced: isBounced, debounce: responseData });

        if (isBounced) {
          console.log(`Email debounce.io bounced ${emailTo}`);
          throw Errors.systemError.debouncedMail;
        }
      }
    }
    bouncedObj.status = true;
    bouncedObj.message = 'ok';
    return bouncedObj;

  } catch (err) {
    console.log("checkDebounceEmail", err);
    bouncedObj.status = false;
    bouncedObj.message = err?.message;
    return bouncedObj;
  }
}
