import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import FileRoute from "./routes/file.route";
import AuthRoute from "./routes/auth.route";
import BusinessUserRoute from "./routes/user.route";

import * as https from "https";
import * as http from "http";
import fs from "fs";

import dotenv from "dotenv";
import { Logger } from "tslog";

const log: Logger = new Logger({ name: "Server" });

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const app = new App([
    new IndexRoute(),
    new TaskRoute(),
    new FileRoute(),
    new AuthRoute(),
    new BusinessUserRoute()
])

// Set up HTTPS server
// Some auth provider requires the server to have a domain name,
// and https for security reasons.
if (process.env.HTTPS_ENABLED === 'true') {
    const port = 443;
    const cert_key = fs.readFileSync(process.env.SSL_KEY!);
    const cert = fs.readFileSync(process.env.SSL_CERT!);

    const httpsServer = https.createServer({
        key: cert_key,
        cert: cert
    }, app.getServer());

    httpsServer.listen(port, () => {
        log.info(`App listening on the port ${port}`);
    });
}

const httpServer = http.createServer(app.getServer());

httpServer.listen(process.env.PORT, () => {
    log.info(`App listening on the port ${process.env.PORT}`);
});
