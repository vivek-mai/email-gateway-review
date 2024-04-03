import express, { json, urlencoded } from "express";
import { EmailRoutes } from "../routes/email_route";
import { MailVendorRoutes } from "../routes/vendor_route";
import { HealthCheckRoute } from "../routes/health_check_route";
import cors from "cors";
import path from 'path';
import { RefStrings } from "../constants";
const dirname = path.resolve();

class App {
  public app: express.Application;
  public route = new EmailRoutes();
  public mailVendorRoutes = new MailVendorRoutes();
  public healthCheckRoutes = new HealthCheckRoute();

  constructor() {
    this.app = express();

    // const allowedOrigins = ["*"];

    // Then pass these options to cors:
    // const options: cors.CorsOptions = {
    //   origin: allowedOrigins,
    // };

    this.app.use('/files',express.static(path.join(dirname, RefStrings.filePaths.uploadFiles)));

    this.app.set('trust proxy', true);

    this.app.use(urlencoded({ extended: false }));
    this.app.use(json());
    this.app.use(cors());
    this.healthCheckRoutes.route(this.app);
    this.mailVendorRoutes.route(this.app);
    this.route.route(this.app);
    
  }
}
export default new App().app;
