import "express-async-errors";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { inventoryRouter } from "./modules/inventory/inventory.routes.js";
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes.js";
import { secretsRouter } from "./modules/secrets/secrets.routes.js";
import { attachmentsRouter } from "./modules/attachments/attachments.routes.js";
import { alertsRouter } from "./modules/alerts/alerts.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { HttpError } from "./core/http/errors.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", auditRouter);
app.use("/api", inventoryRouter);
app.use("/api", subscriptionsRouter);
app.use("/api", secretsRouter);
app.use("/api", attachmentsRouter);
app.use("/api", alertsRouter);
app.use("/api", usersRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno"
    }
  });
});

app.listen(env.port, () => {
  console.log(`[${env.appName}] listening on http://localhost:${env.port}`);
});
