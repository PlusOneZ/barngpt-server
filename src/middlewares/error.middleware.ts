import { Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { log } from '../utils/logging';

function errorMiddleware(error: HttpException, req: Request, res: Response) {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    log.error(status, message);

    res.json({ message });
}

export default errorMiddleware;