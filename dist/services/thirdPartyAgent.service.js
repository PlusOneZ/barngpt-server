"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_model_1 = require("../models/task.model");
const request_1 = require("request");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
class ThirdPartyAgentService {
    constructor() {
        this.tasks = task_model_1.TaskModel;
        if (!process.env.THIRD_PARTY_AGENT_API) {
            console.log(process.env.THIRD_PARTY_AGENT_API);
            console.error("API URL is missing.");
            process.exit(1);
        }
        this.API_URL = process.env.THIRD_PARTY_AGENT_API;
        this.HOST = process.env.HOST;
        this.PORT = process.env.PORT;
    }
    sendReq(hook, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // send request to third party agent
            (0, request_1.post)(this.API_URL, { json: { data: data, hook: hook } }, (err, res, body) => {
                if (err) {
                    console.error(`Error while sending request to ${hook}: ${err}`);
                    // todo: add to records
                }
                console.log(`Response from API: ${res}`);
            });
        });
    }
    createHook(taskId) {
        const hook = `http://${this.HOST}:${this.PORT}/task/${taskId}/hook`;
        // console.log(`Hook created: ${hook}`);
        return hook;
    }
    taskUpdate(taskId, taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!taskId) {
                console.error(`Task ID is missing: ${taskId}`);
                return;
            }
            // option 1: only update the task status
            const { results } = taskData;
            if (results) {
                // update task status
                this.tasks.updateOne({ _id: taskId }, {
                    status: "done",
                    $push: { results: { $each: results } }
                }).then(() => {
                    console.log(`Task ${taskId} updated.`);
                }).catch((e) => {
                    console.error(`Error while updating Task ${taskId}: ${e}`);
                    // todo record this error
                });
            }
            // option 2: push notification to the user
            // TODO：support from client side.
        });
    }
}
exports.default = ThirdPartyAgentService;
