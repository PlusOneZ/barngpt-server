import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";

const app = new App([
    new IndexRoute(),
    new TaskRoute()
])

app.listen();