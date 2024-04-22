import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import FileRoute from "./routes/file.route";

const app = new App([
    new IndexRoute(),
    new TaskRoute(),
    new FileRoute()
])

app.listen();