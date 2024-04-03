import { Application } from "express";
import { VendorController } from "../controller/email-provider.controller";
import { Middleware } from "../middleware/index";

export class MailVendorRoutes {

    private vendorController = new VendorController();
    private middleWare = new Middleware();

    public route(app: Application) {

        app.post(
            "/v1/addemailprovider",
            this.vendorController.addEmailProvider
        );

        app.put("/v1/update-priorities",
            this.vendorController.updatePriorities);


    }

}