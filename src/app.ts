import express from "express";
import Route from "./interfaces/Route.interface";
import dotenv from "dotenv";
import mongoose from "mongoose";
import errorMiddleware from "./middlewares/error.middleware";
import bodyParser from "body-parser";

class App {
    public app: express.Application;
    public port: (string | number | undefined);
    private env: (string | undefined);

    constructor(routes: Route[]) {
        dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
        this.app = express();
        this.port = process.env.PORT ? "3000" : process.env.PORT;
        this.env = process.env.NODE_ENV ? "development" : process.env.NODE_ENV;

        this.initDatabaseConnection();
        this.initMiddlewares();
        this.initSwaggerDocs();
        this.initRoutes(routes);
        // this.initErrorHandling(); // TODO: check this
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
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

        }
        // this.app.use(express.urlencoded({ extended: true }));
        // this.app.use(express.json());
        this.app.use(bodyParser.json({limit: '5mb'}));
        this.app.use(bodyParser.urlencoded({
            extended: true,
            limit: '5mb',
            parameterLimit: 50000,
        }));
    }

    private initRoutes(routes: Route[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    private initDatabaseConnection() {
        const connectString = process.env.MONGO_URI

        if (!connectString) {
            console.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.")
            process.exit(1);
        }

        mongoose.connect(connectString)
        const db = mongoose.connection
        db.on('error', err => {
            console.error("MongoDB (Mongoose) Error: " + err.message)
            process.exit(1)
        })
        db.once('open', () => { console.log("Mongoose Connection Established") })
    }

    private initErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;