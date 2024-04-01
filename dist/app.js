"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
class App {
    constructor(routes) {
        dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
        this.app = (0, express_1.default)();
        this.port = process.env.PORT ? "3000" : process.env.PORT;
        this.env = process.env.NODE_ENV ? "development" : process.env.NODE_ENV;
        this.initDatabaseConnection();
        this.initMiddlewares();
        this.initSwaggerDocs();
        this.initRoutes(routes);
        // this.initErrorHandling(); // TODO: check this
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
    getServer() {
        return this.app;
    }
    initSwaggerDocs() {
        // TODO
    }
    initMiddlewares() {
        // TODO: add more
        if (this.env === "development") {
        }
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.json());
    }
    initRoutes(routes) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }
    initDatabaseConnection() {
        const connectString = process.env.MONGO_URI;
        if (!connectString) {
            console.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.");
            process.exit(1);
        }
        mongoose_1.default.connect(connectString);
        const db = mongoose_1.default.connection;
        db.on('error', err => {
            console.error("MongoDB (Mongoose) Error: " + err.message);
            process.exit(1);
        });
        db.once('open', () => { console.log("Mongoose Connection Established"); });
    }
    initErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
