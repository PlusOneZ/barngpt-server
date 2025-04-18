import { BUserModel } from "../models/businessUser.model";
import { ObjectId } from "bson"

class BusinessUserService {

    public getBusinessUserByObjId = async (_id: string) => {
        const oid = new ObjectId(_id);
        return await BUserModel.findOne({_id: oid}).exec();
    }

    public getBusinessUserByIdentifier = async (identifier: string) => {
        return await BUserModel.findOne({identifier}).exec();
    }

    public getAllBusinessUsers = async () => {
        return await BUserModel.find({}).limit(99).exec();
    }

    public addCreditsToUser = async (identifier: string, amount: number, note: string) => {
        const user = await this.getBusinessUserByIdentifier(identifier);
        if (!user) {
            throw new Error("User not found.");
        }
        user.addCredits(amount, note);
        return user;
    }

    public changeUserCurrency = async (identifier: string, currency: number) => {
        const user = await this.getBusinessUserByIdentifier(identifier);
        if (!user) {
            throw new Error("User not found.");
        }
        user.changeCurrency(currency);
        return user;
    }

    public getCreditAmount = async (_id: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user.credits
    }

    public getUserCurrency = async (_id: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user.currency
    }

    public toggleCheckIp = async (_id: string, setTo: boolean) => {
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
    }

    public checkIpAnyway = async (_id: string, _ip: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user.iPWhiteList.includes(_ip);
    }

    public addIpToWhiteList = async (_id: string, ip: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        user.addIp(ip);
        return user;
    }

    public checkIpValidity = async (_id: string, ip: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user.checkIp(ip);
    }
}

export default BusinessUserService