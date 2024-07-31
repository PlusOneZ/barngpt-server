import { Request, Response, NextFunction } from "express";
import BusinessUserService from "../services/businessUser.service";
import Joi from "joi";

const setIpSchema = Joi.object().keys({
    enableIpCheck: Joi.boolean().required(),
})

const addIpSchema = Joi.object().keys({
    ip: Joi.string().required()
})

const addCreditsSchema = Joi.object().keys({
    identifier: Joi.string().required(),
    amount: Joi.number().min(1).max(9999).required(),
    note: Joi.string()
})

class BusinessUserHandler {
    businessUserService = new BusinessUserService();

    public getUserByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { identifier } = req.params;
            const user = await this.businessUserService.getBusinessUserByIdentifier(identifier);
            res.status(200).json({ data: user });
        } catch (e) {
            next(e);
        }
    }

    public getMe = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        try {
            const id = (req.user as any).id;
            const user = await this.businessUserService.getBusinessUserByObjId(id);
            res.status(200).json({ data: user });
        } catch (e) {
            next(e);
        }
    }

    public getMyCredits = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        try {
            const id = (req.user as any).id;
            const amount = await this.businessUserService.getCreditAmount(id);
            res.status(200).json({ data: amount });
        } catch (e) {
            next(e);
        }
    }

    public getMyCreditsHistory = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        try {
            const id = (req.user as any).id;
            const user = await this.businessUserService.getBusinessUserByObjId(id);
            if (!user) {
                return res.status(404).json({ message: "User not found. Contact Admin for more info" });
            }
            res.status(200).json({ data: {
                credits: user.credits,
                history: user.creditHistory
            } });
        } catch (e) {
            next(e);
        }
    }

    public addCredits = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = addCreditsSchema.validate(req.body)
        if (error) {
            return res.status(442).send({ message: error.details[0].message, error: "format" });
        }
        try {
            const { identifier, amount, note } = req.body;
            const user = await this.businessUserService.addCreditsToUser(identifier, amount, note);
            res.status(200).json({
                data: {user, transaction: user.creditHistory[user.creditHistory.length - 1]},
                message: "Credits added"
            });
        } catch (e) {
            next(e);
        }
    }

    public checkIpOption = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = setIpSchema.validate(req.body)
        if (error) {
            return res.status(442).send({ message: error.details[0].message, error: "format" });
        }
        try {
            const id = (req.user as any).id;
            const { enableIpCheck } = req.body;
            const user = await this.businessUserService.toggleCheckIp(id, enableIpCheck);
            res.status(200).json({ data: user, message: "Option toggled." });
        } catch (e) {
            next(e);
        }
    }

    public addIpToWhiteList = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = addIpSchema.validate(req.body)
        if (error) {
            return res.status(442).send({ message: error.details[0].message, error: "format" });
        }
        try {
            const id = (req.user as any).id;
            const { ip } = req.body;
            const user = await this.businessUserService.addIpToWhiteList(id, ip);
            res.status(200).json({ data: user, message: "IP added." });
        } catch (e) {
            next(e);
        }
    }

    public currentIpAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip;
            res.status(200).json({
                data: {ip, hip: req.headers['x-forwarded-for']},
                message: `Current IP address. Validation: ${await this.businessUserService.checkIpValidity((req.user as any).id, ip!)}`});
        } catch (e) {
            next(e);
        }
    }

    public requireBusinessUserIpCheck = async (req: any, res: Response, next: NextFunction) => {
        try {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const valid = await this.businessUserService.checkIpValidity(req.user.id, ip!);
            if (!valid) {
                return res.status(403).json({message: "IP not allowed"});
            } else {
                next();
            }
        } catch (e) {
            next(e);
        }
    }
}

export default BusinessUserHandler;