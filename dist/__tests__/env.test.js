"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
test('ENV variables load', () => {
    expect(process.env.CURRENT_MODE).toBe('DEV');
});
test('Mongo URI ENV exists', () => {
    expect(process.env.MONGO_URI).toBeDefined();
});
