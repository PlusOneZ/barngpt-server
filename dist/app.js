"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const body_parser_1 = __importDefault(require("body-parser"));
const passport_middleware_1 = __importDefault(require("./middlewares/passport.middleware"));
const https_1 = require("https");
const logging_1 = require("./utils/logging");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
class App {
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT ? process.env.PORT : "3000";
        this.env = process.env.NODE_ENV ? "development" : process.env.NODE_ENV;
        this.initDatabaseConnection();
        this.initMiddlewares();
        this.initSwaggerDocs();
        this.initRoutes(routes);
        // this.initErrorHandling(); // TODO: check this
        https_1.globalAgent.options.rejectUnauthorized = false;
    }
    listen() {
        this.app.listen(this.port, () => {
            logging_1.log.info(`App listening on the port ${this.port}`);
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
            this.app.use((0, cors_1.default)({
                origin: "*",
                methods: ["GET", "POST", "OPTIONS", "HEAD"],
                allowedHeaders: ["Content-Type", "Authorization"],
            }));
        }
        // this.app.use(express.urlencoded({ extended: true }));
        // this.app.use(express.json());
        this.app.use(body_parser_1.default.json({ limit: '10mb' }));
        this.app.use(body_parser_1.default.urlencoded({
            extended: true,
            limit: '10mb',
            parameterLimit: 50000,
        }));
        this.app.use(passport_middleware_1.default.initialize());
    }
    initRoutes(routes) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }
    initDatabaseConnection() {
        const connectString = process.env.MONGO_URI;
        if (!connectString) {
            logging_1.dbLog.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.");
            process.exit(1);
        }
        mongoose_1.default.connect(connectString);
        const db = mongoose_1.default.connection;
        db.on('error', err => {
            logging_1.dbLog.error("MongoDB (Mongoose) Error: " + err.message);
            process.exit(1);
        });
        db.once('open', () => { logging_1.dbLog.info("Mongoose Connection Established"); });
    }
    initErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map