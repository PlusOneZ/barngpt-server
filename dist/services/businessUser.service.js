"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const businessUser_model_1 = require("../models/businessUser.model");
const bson_1 = require("bson");
class BusinessUserService {
    constructor() {
        this.getBusinessUserByObjId = async (_id) => {
            const oid = new bson_1.ObjectId(_id);
            return await businessUser_model_1.BUserModel.findOne({ _id: oid }).exec();
        };
        this.getBusinessUserByIdentifier = async (identifier) => {
            return await businessUser_model_1.BUserModel.findOne({ identifier }).exec();
        };
        this.getAllBusinessUsers = async () => {
            return await businessUser_model_1.BUserModel.find({}).limit(99).exec();
        };
        this.addCreditsToUser = async (identifier, amount, note) => {
            const user = await this.getBusinessUserByIdentifier(identifier);
            if (!user) {
                throw new Error("User not found.");
            }
            user.addCredits(amount, note);
            return user;
        };
        this.changeUserCurrency = async (identifier, currency) => {
            const user = await this.getBusinessUserByIdentifier(identifier);
            if (!user) {
                throw new Error("User not found.");
            }
            user.changeCurrency(currency);
            return user;
        };
        this.getCreditAmount = async (_id) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            return user.credits;
        };
        this.getUserCurrency = async (_id) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            return user.currency;
        };
        this.toggleCheckIp = async (_id, setTo) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            user.enableIpCheck = setTo;
            if (!setTo) {
                user.iPWhiteList = ["::1", "::ffff:127.0.0.1"];
            }
            await user.save();
            return user;
        };
        this.checkIpAnyway = async (_id, _ip) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            return user.iPWhiteList.includes(_ip);
        };
        this.addIpToWhiteList = async (_id, ip) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            user.addIp(ip);
            return user;
        };
        this.checkIpValidity = async (_id, ip) => {
            const user = await this.getBusinessUserByObjId(_id);
            if (!user) {
                throw new Error("User not found.");
            }
            return user.checkIp(ip);
        };
    }
}
exports.default = BusinessUserService;
//# sourceMappingURL=businessUser.service.js.map