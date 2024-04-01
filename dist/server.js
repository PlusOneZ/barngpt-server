"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const task_route_1 = __importDefault(require("./routes/task.route"));
const app = new app_1.default([
    new index_route_1.default(),
    new task_route_1.default()
]);
app.listen();
