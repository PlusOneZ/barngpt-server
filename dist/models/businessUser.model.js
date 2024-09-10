"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUserModel = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logging_1 = require("../utils/logging");
const creditHistorySchema = new mongoose_1.Schema({
    amount: { type: mongoose_1.Schema.Types.Number, required: true },
    date: { type: mongoose_1.Schema.Types.Date, required: true, default: Date.now },
    note: { type: mongoose_1.Schema.Types.String },
});
creditHistorySchema.methods.toJSON = function () {
    return {
        amount: this.amount,
        date: this.date,
        note: this.note
    };
};
const CreditHistoryModel = (0, mongoose_1.model)("CreditHistory", creditHistorySchema);
const bUserSchema = new mongoose_1.Schema({
    identifier: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        unique: true,
    },
    description: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 60,
    },
    credits: {
        type: mongoose_1.Schema.Types.Number,
        required: true,
        default: 0.,
    },
    enableIpCheck: {
        type: mongoose_1.Schema.Types.Boolean,
        required: true,
        default: false,
    },
    iPWhiteList: {
        type: [mongoose_1.Schema.Types.String],
        default: [],
    },
    creditHistory: {
        type: [creditHistorySchema],
        default: [],
        required: true,
    },
    currency: {
        type: mongoose_1.Schema.Types.Number,
        default: 10.,
        required: true,
    }
});
bUserSchema.methods.toJSON = function () {
    return {
        identifier: this.identifier,
        description: this.description,
        credits: this.credits,
        enableIpCheck: this.enableIpCheck,
        iPWhiteList: this.iPWhiteList
    };
};
bUserSchema.method("toAdminJSON", function toAdminJSON() {
    return {
        identifier: this.identifier,
        description: this.description,
        credits: this.credits,
        enableIpCheck: this.enableIpCheck,
        iPWhiteList: this.iPWhiteList,
        currency: this.currency,
        latestCreditHistory: this.creditHistory[this.creditHistory.length - 1],
    };
});
bUserSchema.method("createBUser", async function createBUser(user) {
    bcryptjs_1.default.genSalt(10, (err, salt) => {
        bcryptjs_1.default.hash(user.password, salt, async (errHash, hash) => {
            if (err || errHash) {
                logging_1.dbLog.error(err, errHash);
            }
            user.password = hash;
            await user.save().then(() => {
                logging_1.dbLog.info(`User created: ${user.identifier}`);
            });
        });
    });
});
bUserSchema.method("addCredits", async function addCredits(amount, note = "Added credits.") {
    if (amount === 0)
        return;
    this.$inc("credits", amount);
    this.creditHistory.push(new CreditHistoryModel({ amount, note }));
    await this.save();
});
bUserSchema.method("deductCredits", async function deductCredits(amount) {
    this.$inc("credits", -amount);
    await this.save();
});
bUserSchema.method("changeCurrency", async function changeCurrency(currency) {
    if (currency <= 0.1) {
        logging_1.dbLog.warn("Currency must be no less than 0.1.");
        return;
    }
    this.currency = currency;
    await this.save();
});
bUserSchema.method("checkIp", function checkIp(ip) {
    if (!this.enableIpCheck) {
        return true;
    }
    return this.iPWhiteList.includes(ip);
});
bUserSchema.method("addIp", async function addIp(ip) {
    if (this.iPWhiteList.includes(ip))
        return;
    this.iPWhiteList.push(ip);
    await this.save();
});
bUserSchema.method("comparePassword", function comparePassword(pwd, callback) {
    return bcryptjs_1.default.compare(pwd, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
});
const BUserModel = (0, mongoose_1.model)("BusinessUser", bUserSchema);
exports.BUserModel = BUserModel;
//# sourceMappingURL=businessUser.model.js.map