import { Schema, model, Model } from "mongoose";
import bcrypt from 'bcryptjs'

interface ICreditHistory {
    amount: number,
    date: Date,
    note: string,
}

const creditHistorySchema = new Schema({
    amount: { type: Schema.Types.Number, required: true },
    date: { type: Schema.Types.Date, required: true, default: Date.now },
    note: { type: Schema.Types.String },
})

creditHistorySchema.methods.toJSON = function () {
    return {
        amount: this.amount,
        date: this.date,
        note: this.note
    }
}

const CreditHistoryModel = model<ICreditHistory>("CreditHistory", creditHistorySchema)

interface IBUser {
    identifier: string,
    description: string,
    password: string,
    credits: number,
    currency: number,
    enableIpCheck: boolean,
    iPWhiteList: string[],
    creditHistory: ICreditHistory[],
}

interface IBUserMethods {
    addCredits(amount: number, note: string): void,
    deductCredits(amount: number): void,
    comparePassword(pwd: string, callback: any): void,
    checkIp(ip: string): boolean,
    addIp(ip: string): void,
    createBUser(user: any): void,
    toAdminJSON(): any,
    changeCurrency(currency: number): void,
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
    },
    creditHistory: {
        type: [creditHistorySchema],
        default: [],
        required: true,
    },
    currency: {
        type: Schema.Types.Number,
        default: 10.,
        required: true,
    }
})

bUserSchema.methods.toJSON = function () {
    return {
        identifier: this.identifier,
        description: this.description,
        credits: this.credits,
        enableIpCheck: this.enableIpCheck,
        iPWhiteList: this.iPWhiteList
    }
}

bUserSchema.method("toAdminJSON", function toAdminJSON() {
    return {
        identifier: this.identifier,
        description: this.description,
        credits: this.credits,
        enableIpCheck: this.enableIpCheck,
        iPWhiteList: this.iPWhiteList,
        currency: this.currency,
        latestCreditHistory: this.creditHistory[this.creditHistory.length - 1],
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

bUserSchema.method("addCredits", async function addCredits(amount: number, note: string = "Added credits.") {
    if (amount === 0) return
    this.$inc("credits", amount)
    this.creditHistory.push(new CreditHistoryModel({ amount, note }))
    await this.save()
})

bUserSchema.method("deductCredits", async function deductCredits(amount: number) {
    this.$inc("credits", -amount)
    await this.save()
})

bUserSchema.method("changeCurrency", async function changeCurrency(currency: number) {
    if (currency <= 0.1) {
        console.log("Currency must be no less than 0.1.")
        return
    }
    this.currency = currency
    await this.save()
})

bUserSchema.method("checkIp", function checkIp(ip: string) {
    if (!this.enableIpCheck) {
        return true
    }
    return this.iPWhiteList.includes(ip)
})

bUserSchema.method("addIp", async function addIp(ip: string) {
    if(this.iPWhiteList.includes(ip)) return
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