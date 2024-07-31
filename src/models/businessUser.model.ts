import { Schema, model, Model } from "mongoose";
import bcrypt from 'bcryptjs'

interface IBUser {
    identifier: string,
    description: string,
    password: string,
    credits: number,
    enableIpCheck: boolean,
    iPWhiteList: string[],
}

interface IBUserMethods {
    addCredits(amount: number): void,
    deductCredits(amount: number): void,
    comparePassword(pwd: string, callback: any): void,
    checkIp(ip: string): boolean,
    addIp(ip: string): void,
    createBUser(user: any): void,
}

type BUserModel = Model<IBUser, {}, IBUserMethods>;

const bUserSchema = new Schema<IBUser, BUserModel, IBUserMethods>({
    identifier: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
    description: {
        type: Schema.Types.String,
        required: true,
    },
    password: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 60,
    },
    credits: {
        type: Schema.Types.Number,
        required: true,
        default: 0.,
    },
    enableIpCheck: {
        type: Schema.Types.Boolean,
        required: true,
        default: false,
    },
    iPWhiteList: {
        type: [Schema.Types.String],
        default: [],
    }
})

bUserSchema.method("createBUser", async function createBUser(user: any) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, async (errHash, hash) => {
            if (err || errHash) {
                console.log(err, errHash)
            }
            user.password = hash;
            await user.save().then( () => {
                console.log(`User created: ${user.identifier}`)
            })
        })
    })
})

bUserSchema.method("addCredits", async function addCredits(amount: number) {
    this.$inc("credits", amount)
    await this.save()
})

bUserSchema.method("deductCredits", async function deductCredits(amount: number) {
    this.$inc("credits", -amount)
    await this.save()
})

bUserSchema.method("checkIp", function checkIp(ip: string) {
    if (!this.enableIpCheck) {
        return true
    }
    return this.iPWhiteList.includes(ip)
})

bUserSchema.method("addIp", async function addIp(ip: string) {
    this.iPWhiteList.push(ip)
    await this.save()
})

bUserSchema.method("comparePassword", function comparePassword(pwd: string, callback: any) {
    return bcrypt.compare(pwd, this.password, (err, isMatch) => {
        if (err) { return callback(err) }
        callback(null, isMatch)
    });
})

const BUserModel = model<IBUser, BUserModel>("BusinessUser", bUserSchema)

export {
    IBUser,
    BUserModel,
}