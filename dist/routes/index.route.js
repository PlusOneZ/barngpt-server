"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_handler_1 = __importDefault(require("../controllers/index.handler"));
class IndexRoute {
    constructor() {
        this.path = '/index';
        this.router = (0, express_1.Router)();
        this.indexHandler = new index_handler_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.indexHandler.index);
    }
}
exports.default = IndexRoute;
