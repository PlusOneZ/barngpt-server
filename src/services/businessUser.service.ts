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

    // public deductUserCredits = async (_id: string, amount: number) => {
    //     const user = await this.getBusinessUserByObjId(_id);
    //     if (!user) {
    //         throw new Error("User not found.");
    //     }
    //     user.deductCredits(amount);
    // }

    public getCreditAmount = async (_id: string) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user.credits
    }

    public toggleCheckIp = async (_id: string, setTo: boolean) => {
        const user = await this.getBusinessUserByObjId(_id);
        if (!user) {
            throw new Error("User not found.");
        }
        user.enableIpCheck = setTo;
        if (setTo === false) {
            user.iPWhiteList = [];
        }
        await user.save();
        return user;
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