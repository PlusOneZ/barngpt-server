import express, {Request} from "express";
import Route from "./interfaces/Route.interface";
import dotenv from "dotenv";
import mongoose from "mongoose";
import errorMiddleware from "./middlewares/error.middleware";
import bodyParser from "body-parser";
import passportMiddleware from "./middlewares/passport.middleware";
import { globalAgent } from 'https';

import { dbLog, log } from "./utils/logging";

import cors from "cors";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class App {
    public app: express.Application;
    public port: (string | number | undefined);
    private env: (string | undefined);

    constructor(routes: Route[]) {
        this.app = express();
        this.port = process.env.PORT ? process.env.PORT : "3000";
        this.env = process.env.NODE_ENV ? "development" : process.env.NODE_ENV;

        this.initDatabaseConnection();
        this.initMiddlewares();
        this.initSwaggerDocs();
        this.initRoutes(routes);
        // this.initErrorHandling(); // TODO: check this
        globalAgent.options.rejectUnauthorized = false;
    }

    public listen() {
        this.app.listen(this.port, () => {
            log.info(`App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    public initSwaggerDocs() {
        // TODO
    }

    private initMiddlewares() {
        // TODO: add more
        if (this.env === "development") {
            this.app.use(cors<Request>({
                origin: "*",
                methods: ["GET", "POST", "OPTIONS", "HEAD"],
                allowedHeaders: ["Content-Type", "Authorization"],
            }))
        }
        // this.app.use(express.urlencoded({ extended: true }));
        // this.app.use(express.json());
        this.app.use(bodyParser.json({limit: '10mb'}));
        this.app.use(bodyParser.urlencoded({
            extended: true,
            limit: '10mb',
            parameterLimit: 50000,
        }));
        this.app.use(passportMiddleware.initialize())
    }

    private initRoutes(routes: Route[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    private initDatabaseConnection() {
        const connectString = process.env.MONGO_URI

        if (!connectString) {
            dbLog.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.")
            process.exit(1);
        }

        mongoose.connect(connectString)
        const db = mongoose.connection
        db.on('error', err => {
            dbLog.error("MongoDB (Mongoose) Error: " + err.message)
            process.exit(1)
        })
        db.once('open', () => { dbLog.info("Mongoose Connection Established");})
    }

    private initErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;