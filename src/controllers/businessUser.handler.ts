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
    amount: Joi.number().min(-9999).max(9999).required(),
    note: Joi.string()
})

const changeCurrencySchema = Joi.object().keys({
    identifier: Joi.string().required(),
    currency: Joi.number().min(0.1).max(100).required(),
})

class BusinessUserHandler {
    businessUserService = new BusinessUserService();

    public getUserByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { identifier } = req.params;
            const user = await this.businessUserService.getBusinessUserByIdentifier(identifier);
            res.status(200).json({ data: {
                  ...(user?.toJSON()),
                  creditsHistory: user?.creditHistory
                }});
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public getMe = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        try {
            const id = (req.user as any).id;
            const user = await this.businessUserService.getBusinessUserByObjId(id);
            res.status(200).json({ data: user });
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public getMyCredits = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        try {
            const id = (req.user as any).id;
            const amount = await this.businessUserService.getCreditAmount(id);
            res.status(200).json({ data: { credits: amount} });
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
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
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
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
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public changeCurrency = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = changeCurrencySchema.validate(req.body)
        if (error) {
            return res.status(442).send({ message: error.details[0].message, error: "format" });
        }
        try {
            const { identifier, currency } = req.body;
            const user = await this.businessUserService.changeUserCurrency(identifier, currency);
            res.status(200).json({ data: user, message: "Currency changed" });
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
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
            if (enableIpCheck) {
                // Check if current IP is in whitelist,
                // If not, this action will abort
                const ip = req.ip;
                if (!await this.businessUserService.checkIpAnyway(id, ip!)) {
                    return res.send(403).json({
                        message: "Current IP not in whitelist, add it before turning on IP check."
                    });
                }
            }
            const user = await this.businessUserService.toggleCheckIp(id, enableIpCheck);
            res.status(200).json({ data: user, message: "Option toggled." });
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
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
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public currentIpAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip;
            res.status(200).json({
                data: {ip, hip: req.headers['x-forwarded-for']},
                message: `Current IP address. Validation: ${await this.businessUserService.checkIpValidity((req.user as any).id, ip!)}`});
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public requireBusinessUserIpCheck = async (req: any, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip;
            // console.log(req.user, ip);
            const valid = await this.businessUserService.checkIpValidity(req.user.id, ip!);
            if (!valid) {
                return res.status(403).json({message: "IP not allowed"});
            } else {
                next();
            }
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }

    public getSomeUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.businessUserService.getAllBusinessUsers();
            return res.status(200).json({ data: users });
        } catch (e) {
            res.status(400).json({
                message: "Error when processing",
                system_err: (e as Error).message
            });
        }
    }
}

export default BusinessUserHandler;