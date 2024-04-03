import { Application } from "express";
import { HealthCheckController } from "../controller/health-check";

export class HealthCheckRoute{

    private health_controller = new HealthCheckController();


    public route(app: Application) {
        app.get(
          "/v1/healthcheck",
          this.health_controller.healthCheck,
        );
    }
}