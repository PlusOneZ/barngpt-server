import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import FileRoute from "./routes/file.route";
import AuthRoute from "./routes/auth.route";
import * as https from "https";

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
    https.createServer({
        key: process.env.HTTPS_KEY!,
        cert: process.env.HTTPS_CERT!
    }, app.getServer()).listen(port, () => {
        console.log(`App listening on the port ${port}`);
    });
} else {
    app.listen();
}