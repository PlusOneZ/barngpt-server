import { Router } from "express"
import IndexHandler from "../controllers/index.handler";
import Route from "../interfaces/Route.interface";

class IndexRoute implements Route {
    public path = '/';
    public router = Router();
    public indexHandler = new IndexHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.indexHandler.index)
    }
}

export default IndexRoute;