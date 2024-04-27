import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import FileRoute from "./routes/file.route";
import AuthRoute from "./routes/auth.route";

const app = new App([
    new IndexRoute(),
    new TaskRoute(),
    new FileRoute(),
    new AuthRoute()
])

app.listen();