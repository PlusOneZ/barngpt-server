"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const businessUser_service_1 = __importDefault(require("../services/businessUser.service"));
const joi_1 = __importDefault(require("joi"));
const setIpSchema = joi_1.default.object().keys({
    enableIpCheck: joi_1.default.boolean().required(),
});
const addIpSchema = joi_1.default.object().keys({
    ip: joi_1.default.string().required()
});
const addCreditsSchema = joi_1.default.object().keys({
    identifier: joi_1.default.string().required(),
    amount: joi_1.default.number().min(-9999).max(9999).required(),
    note: joi_1.default.string()
});
const changeCurrencySchema = joi_1.default.object().keys({
    identifier: joi_1.default.string().required(),
    currency: joi_1.default.number().min(0.1).max(100).required(),
});
class BusinessUserHandler {
    constructor() {
        this.businessUserService = new businessUser_service_1.default();
        this.getUserByIdentifier = async (req, res, next) => {
            try {
                const { identifier } = req.params;
                const user = await this.businessUserService.getBusinessUserByIdentifier(identifier);
                res.status(200).json({ data: {
                        ...(user === null || user === void 0 ? void 0 : user.toAdminJSON()),
                        creditsHistory: user === null || user === void 0 ? void 0 : user.creditHistory
                    } });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.getMe = async (req, res, next) => {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            try {
                const id = req.user.id;
                const user = await this.businessUserService.getBusinessUserByObjId(id);
                res.status(200).json({ data: user });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.getMyCredits = async (req, res, next) => {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            try {
                const id = req.user.id;
                const amount = await this.businessUserService.getCreditAmount(id);
                res.status(200).json({ data: { credits: amount } });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.getMyCreditsHistory = async (req, res, next) => {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            try {
                const id = req.user.id;
                const user = await this.businessUserService.getBusinessUserByObjId(id);
                if (!user) {
                    return res.status(404).json({ message: "User not found. Contact Admin for more info" });
                }
                res.status(200).json({ data: {
                        credits: user.credits,
                        history: user.creditHistory
                    } });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.addCredits = async (req, res, next) => {
            const { error } = addCreditsSchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message, error: "format" });
            }
            try {
                const { identifier, amount, note } = req.body;
                const user = await this.businessUserService.addCreditsToUser(identifier, amount, note);
                res.status(200).json({
                    data: { user: user.toAdminJSON(), transaction: user.creditHistory[user.creditHistory.length - 1] },
                    message: "Credits added"
                });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.changeCurrency = async (req, res, next) => {
            const { error } = changeCurrencySchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message, error: "format" });
            }
            try {
                const { identifier, currency } = req.body;
                const user = await this.businessUserService.changeUserCurrency(identifier, currency);
                res.status(200).json({ data: user.toAdminJSON(), message: "Currency changed" });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.checkIpOption = async (req, res, next) => {
            const { error } = setIpSchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message, error: "format" });
            }
            try {
                const id = req.user.id;
                const { enableIpCheck } = req.body;
                if (enableIpCheck) {
                    // Check if current IP is in whitelist,
                    // If not, this action will abort
                    const ip = req.ip;
                    if (!await this.businessUserService.checkIpAnyway(id, ip)) {
                        return res.send(403).json({
                            message: "Current IP not in whitelist, add it before turning on IP check."
                        });
                    }
                }
                const user = await this.businessUserService.toggleCheckIp(id, enableIpCheck);
                res.status(200).json({ data: user, message: "Option toggled." });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.addIpToWhiteList = async (req, res, next) => {
            const { error } = addIpSchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message, error: "format" });
            }
            try {
                const id = req.user.id;
                const { ip } = req.body;
                const user = await this.businessUserService.addIpToWhiteList(id, ip);
                res.status(200).json({ data: user, message: "IP added." });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.currentIpAddress = async (req, res, next) => {
            try {
                const ip = req.ip;
                res.status(200).json({
                    data: { ip, hip: req.headers['x-forwarded-for'] },
                    message: `Current IP address. Validation: ${await this.businessUserService.checkIpValidity(req.user.id, ip)}`
                });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.requireBusinessUserIpCheck = async (req, res, next) => {
            try {
                const ip = req.ip;
                // console.log(req.user, ip);
                const valid = await this.businessUserService.checkIpValidity(req.user.id, ip);
                if (!valid) {
                    return res.status(403).json({ message: "IP not allowed" });
                }
                else {
                    next();
                }
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
        this.getSomeUsers = async (req, res, next) => {
            try {
                const users = await this.businessUserService.getAllBusinessUsers();
                return res.status(200).json({ data: users.map((t) => {
                        return t.toAdminJSON();
                    }) });
            }
            catch (e) {
                res.status(400).json({
                    message: "Error when processing",
                    system_err: e.message
                });
            }
        };
    }
}
exports.default = BusinessUserHandler;
//# sourceMappingURL=businessUser.handler.js.map