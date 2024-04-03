import { Document, model, Schema } from "mongoose";

export interface IEmailLogs extends Document {
  serviceName: string;
  providerId: string;
  emailType: string;
  category: string;
  emailFrom: string;
  emailTo: string;
  subject: string;
  message: string;
  messageId: string;
  senderIPAddress: string;
  deliveryStatus: string;
  webhookId: string;
  metaData:Object;
  fileAttachmentUrl:[];
  userId:string;
  eventHistory:[];
  errorMessage:string;
  isTermsConditions:boolean
}

const eventHistorySchema  = new Schema({type : { type: String }, date:{type:Date, default:Date.now()}})

const emailLogsScheema: Schema = new Schema({
  serviceName: {
    type: String,
    enum: ["NFTM", "KALPATANTRA", "CONSOLE" , "AUTH_ENGINE","PAYMENT_ENGINE"],
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'emailproviders',
    requied: true,
  },
  emailType: {
    type: String,
  },
  category: {
    type: String,
  },
  emailFrom: {
    type: String,
  },
  emailTo: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  messageId: {
    type: String,
  },
  senderIPAddress: {
    type: String,
  },
  deliveryStatus: {
    type: String,
    default: "request",
  },
  eventStatus: {
    type: String,
    default: "request",
  },
  webhookId: {
    type: String,
  },
  metaData: {
    type: Object
  },
  fileAttachmentsUrl:{
    type:Array,
    // default:null,
    // default: undefined
  },
  eventHistory:[eventHistorySchema],
  userId:String,
  errorMessage:{type:String},
  isTermsConditions:{type:Boolean}
},{
  timestamps:true
});

const EmailLogs = model<IEmailLogs>("EmailLogs", emailLogsScheema);

export default EmailLogs;
