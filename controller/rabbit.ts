import amqp from "amqplib/callback_api";
import { EmailHelper, checkDebounceEmail, vendorResponse } from "../helper/email";
import { Errors, RefStrings } from "../constants";
import { Utils } from "../utility/utils";
import EmailLogs from "../model/email_logs";

const CONN_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`;

let ch = null;
let queueName = process.env.RABBITMQ_QUEUE_NAME;

// amqp.connect(
//   CONN_URL,
//   function (
//     err: any,
//     conn: { createChannel: (arg0: (err: any, channel: any) => void) => void }
//   ) {

//     if(err){
//       console.log("Consumer rabbitmq callback error : ",err);
//     }
//     conn.createChannel(function (err: any, channel: any) {
//       ch = channel;

//       ch.assertQueue(queueName, {
//         durable: true,
//       });

//       ch.consume(
//         queueName,
//         async function (msg: { content: string }) {

//           try{
//             //get active mail provider

//             const msgContent = JSON.parse(msg.content);

//             //check debounce email
//             const emailResponse = await checkDebounceEmail(msgContent);
//             if(!emailResponse.status){
//               const { emailTo, emailFrom, subject, message, catagory, emailType,  serviceName, uploadedFiles = null, user } = msgContent;

//               await EmailLogs.create({
//                 serviceName,
//                 emailType,
//                 catagory,
//                 emailTo,
//                 emailFrom,
//                 message,
//                 subject,
//                 deliveryStatus:RefStrings.status.failed,
//                 eventHistory:[ { type: RefStrings.status.debounced, date: new Date() }],
//                 fileAttachmentsUrl:uploadedFiles?.map((ele)=>ele.fileUrl),
//                 userId: user?.id,
//                 errorMessage:emailResponse.message
//               });
//             }
//             else{
//             const response = await vendorResponse();
//             msgContent['mailProvider'] = response;

//             if (msgContent.mailProvider.name == RefStrings.provider.SEND_BLUE) {
//               await EmailHelper.sendEmail(msgContent);
//             }
//             else if (msgContent.mailProvider.name == RefStrings.provider.AWS_SES) {
//               await EmailHelper.awsSesMail(msgContent);
//             }
//         }
//             if(msgContent?.uploadedFiles?.length>0){
//               msgContent.uploadedFiles.forEach(async(ele) => {
//                Utils.deleteFile(`${RefStrings.filePaths.uploadFiles}/${ele.fileName}`);
//               });
//             }
//           }catch(error){
//             console.log("Consumer callback Error : ",error);
//           }

//         },
//         { noAck: true }
//       );

//       process.on("exit", (code) => {
//         ch.close();
//         console.log(`Closing rabbitmq channel`);
//       });
//     });
//   }
// );

export const publishToQueue = (data: any) => {
  try{
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));    
  }catch(err){
    console.log("Error publishToQueue",err);
    throw Errors.systemError.rabbitMqIssue; 
  }
};

const rabbitMqConnection = () => amqp.connect(
  CONN_URL,
  function (
    err: any,
    conn: { createChannel: (arg0: (err: any, channel: any) => void) => void }
  ) {

    if (err) {
      console.log(`Error rabbitMq connection callback`, err);
    }
    conn.createChannel(function (err: any, channel: any) {

      if (err) {
        console.log(`Error rabbitMq createChannel callback`, err);
        // process.exit(1);
      }

      ch = channel;

      console.log("RabbitMQ connected");

      ch.assertQueue(queueName, {
        durable: true,
      });

      ch.consume(
        queueName,
        async function (msg: { content: string }) {

          try {
            //get active mail provider

            const msgContent = JSON.parse(msg.content);
            if (!msgContent.queueTest) {
              //check debounce email
              const emailResponse = await checkDebounceEmail(msgContent);
              if (!emailResponse.status) {
                const { emailTo, emailFrom, subject, message, catagory, emailType, serviceName, uploadedFiles = null, user } = msgContent;

                await EmailLogs.create({
                  serviceName,
                  emailType,
                  catagory,
                  emailTo,
                  emailFrom,
                  message,
                  subject,
                  deliveryStatus: RefStrings.status.failed,
                  eventHistory: [{ type: RefStrings.status.debounced, date: new Date() }],
                  fileAttachmentsUrl: uploadedFiles?.map((ele) => ele.fileUrl),
                  userId: user?.id,
                  errorMessage: emailResponse.message
                });
              }
              else {
                const response = await vendorResponse();
                msgContent['mailProvider'] = response;

                if (msgContent.mailProvider.name == RefStrings.provider.SEND_BLUE) {
                  await EmailHelper.sendEmail(msgContent);
                }
                else if (msgContent.mailProvider.name == RefStrings.provider.AWS_SES) {
                  await EmailHelper.awsSesMail(msgContent);
                }
              }
              if (msgContent?.uploadedFiles?.length > 0) {
                msgContent.uploadedFiles.forEach(async (ele) => {
                  Utils.deleteFile(`${RefStrings.filePaths.uploadFiles}/${ele.fileName}`);
                });
              }
            }

          } catch (error) {
            console.log("Consumer callback Error : ", error);
          }

        },
        { noAck: true }
      );

      process.on("exit", (code) => {
        if (ch) {
          ch.close();
          console.log(`Closing rabbitmq channel`);
        }
      });
    });
  }
);


rabbitMqConnection();

export { ch, rabbitMqConnection };

