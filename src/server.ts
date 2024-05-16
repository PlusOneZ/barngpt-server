import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import FileRoute from "./routes/file.route";
import AuthRoute from "./routes/auth.route";

import * as https from "https";
import * as http from "http";
import fs from "fs";

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const app = new App([
    new IndexRoute(),
    new TaskRoute(),
    new FileRoute(),
    new AuthRoute()
])

if (process.env.HTTPS_ENABLED === 'true') {
    const port = 443;
    const cert_key = fs.readFileSync(process.env.HTTPS_KEY!);
    const cert = fs.readFileSync(process.env.HTTPS_CERT!);

    const httpsServer = https.createServer({
        key: cert_key,
        cert: cert
    }, app.getServer());

    httpsServer.listen(port, () => {
        console.log(`App listening on the port ${port}`);
    });
}

const httpServer = http.createServer(app.getServer());

httpServer.listen(process.env.PORT, () => {
    console.log(`App listening on the port ${process.env.PORT}`);
});
