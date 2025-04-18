import { NextFunction, Response, Request } from "express";

class IndexHandler {

    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).send("hello!");
        } catch (e) {
            next(e)
        }
    }
}

export default IndexHandler