"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const connectString = process.env.MONGO_URI;
if (!connectString) {
    console.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.");
    process.exit(1);
}
mongoose_1.default.connect(connectString);
const db = mongoose_1.default.connection;
exports.db = db;
db.on('error', err => {
    console.error("MongoDB (Mongoose) Error: " + err.message);
    process.exit(1);
});
db.once('open', () => { console.log("Mongoose Connection Established"); });
