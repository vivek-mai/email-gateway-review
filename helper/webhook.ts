import { Utils } from "../utility/utils";
import { RefStrings } from "../constants";
import EmailLogs from "../model/email_logs";

export class WebhookHelper {
  static async sendBlueWebhook(reqBody: any) {
    try {
      const {
        event,
        email,
        "message-id": messageId,
        sending_ip: senderIPAddress,
        ts_epoch
      } = reqBody;
      const dateTimeVal = Utils.getDateZone(ts_epoch, 'ms');

      const filter = { messageId: messageId };
      const update: { [k: string]: any } = {
        eventStatus: event,
        email,
        senderIPAddress,
        $push: { eventHistory: event == RefStrings.status.delivered ? { type: RefStrings.status.delivered, date: dateTimeVal } : { type: event, date: dateTimeVal } }
      };
      if (event === RefStrings.status.delivered) {
        update.deliveryStatus = RefStrings.status.delivered;
      }
      if (event === RefStrings.status.error) await Utils.updateVendorPriority(RefStrings.provider.SEND_BLUE);

      await EmailLogs.findOneAndUpdate(filter, update);

      return { status: true };
    } catch (error) {
      await Utils.updateVendorPriority(RefStrings.provider.SEND_BLUE);
      console.log(error);
    }
  }

  static async awsSesHook(reqBody: any) {
    try {

      if (reqBody?.body?.['Type'] == 'SubscriptionConfirmation') {
        console.log("Confirming SNS Subscription", reqBody.body);
        return { status: true };

      }

      else if (reqBody?.body?.mail?.messageId) {
        const { notificationType, mail } = reqBody.body;

        const filter = { messageId: mail.messageId };
        const event = notificationType.toLowerCase();

        const update: { [k: string]: any } = {
          eventStatus: RefStrings.Aws_Notifcation_Type.DELIVERY == notificationType ? RefStrings.status.delivered : event,
          emailFrom: mail.source,
          emailTo: mail.destination.join(','),
          metaData: reqBody.body,
          $push: { eventHistory: RefStrings.Aws_Notifcation_Type.DELIVERY == notificationType ? { type: RefStrings.status.delivered, date: reqBody.body[event].timestamp } : { type: event, date: reqBody.body[event].timestamp } }
        };

        if (notificationType == RefStrings.Aws_Notifcation_Type.DELIVERY) {
          update.deliveryStatus = RefStrings.status.delivered;
        } else if (event) {
          await Utils.updateVendorPriority(RefStrings.provider.AWS_SES);
        }
        await EmailLogs.findOneAndUpdate(filter, update);
      }

      return { status: true };
    } catch (error) {
      console.log(error);
      return { status: true };
    }
  }
}
