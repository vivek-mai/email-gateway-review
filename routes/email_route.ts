import { EmailController } from "../controller/email";
import { Application, Request, Response } from "express";
import { AuthController } from "../controller/auth";
import { WebhookController } from "../controller/webhook";
import { Middleware } from "../middleware";

export class EmailRoutes {
  private email_controller = new EmailController();
  private auth_controller = new AuthController();
  private webhook_controller = new WebhookController();
  private middleware = new Middleware();

  public route(app: Application) {
    app.post(
      "/v1/sendenquiryemail",
      this.auth_controller.authenticateService,
      this.email_controller.sendenquiryemail
    );
    app.post(
      "/v1/addnewsubscriber",
      this.auth_controller.authenticateService,
      this.email_controller.addnewsubscriber
    );
    app.post(
      "/v1/addsubscriber",
      this.middleware.validateApi,
      // this.middleware.captchaGoogle,
      this.email_controller.subscribeEmailUser
    );
    app.post(
      "/v1/contact",
      this.middleware.validateApi,
      // this.middleware.captchaGoogle,
      this.email_controller.contactMail
    );

    app.post(
      "/v1/send/email",
      // this.auth_controller.authenticateService,
      this.middleware.validateApi,
      this.middleware.validateMail,
      this.middleware.validateDebounceEmail,
      this.email_controller.emailQueue
    );
    
    // app.post(
    //   "/v1/send/attachemail",
    //   this.auth_controller.authenticateService,
    //   this.middleware.fileAttachment,
    //   this.middleware.validateMail,
    //   this.email_controller.emailQueueAttachment
    // );

       app.post(
      "/v1/send/attachemail",
      this.middleware.validateApi,
      this.middleware.fileAttachment,
      this.middleware.validateMail,
      this.middleware.validateDebounceEmail,
      this.email_controller.emailQueueAttachment
    );
    
    app.post(
      "/v1/career",
      this.middleware.validateApi,
      // this.middleware.captchaGoogle,
      this.middleware.fileAttachment,
      this.email_controller.careerMail
    );
    // app.post(
    //   "/v2/send/email",
    //   this.middleware.validateApi,
    //   this.middleware.fileAttachment,
    //   this.middleware.validateMail,
    //   this.middleware.validateDebounceEmail,
    //   this.email_controller.emailQueueAttachment
    // );

    app.post('/v1/reset/redis',this.middleware.resetRedis);

    
    app.post("/v1/webhook", this.webhook_controller.sendBlueWebhook);

    app.post("/v1/webhook/awsSes", this.webhook_controller.awsSesHook);
    app.post('/v1/webhook/updatePriority',this.middleware.testUpdatePriority);


    app.get("/v1/logs",this.middleware.validateApi,this.email_controller.emailLogs);

    app.get(
      "/v1/domain",
      this.middleware.adminRoute,
      this.email_controller.emailDomain
    );
    
    app.post(
      "/v1/domain",
      this.middleware.adminRoute,
      this.email_controller.registerEmailDomain
    );

    // Mismatch URL
    app.all("*", function (req: Request, res: Response) {
      res.status(404).send({ error: true, message: "Check your URL please" });
    });
  }
}
