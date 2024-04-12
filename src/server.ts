import App from "./app";
import IndexRoute from "./routes/index.route";
import TaskRoute from "./routes/task.route";
import ImageRoute from "./routes/image.route";

const app = new App([
    new IndexRoute(),
    new TaskRoute(),
    new ImageRoute()
])

app.listen();