import { Router } from "express"
import IndexHandler from "../controllers/index.handler";
import Route from "../interfaces/Route.interface";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class IndexRoute implements Route {
    public path = `${process.env.API_PREFIX || ''}/index`;
    public router = Router();
    public indexHandler = new IndexHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.indexHandler.index)
        this.router.get(`${process.env.API_PREFIX || ''}/`, this.indexHandler.index)
    }
}

export default IndexRoute;
