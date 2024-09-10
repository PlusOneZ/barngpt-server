"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const task_route_1 = __importDefault(require("./routes/task.route"));
const file_route_1 = __importDefault(require("./routes/file.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const tslog_1 = require("tslog");
const log = new tslog_1.Logger({ name: "Server" });
process.on('uncaughtException', function (e) {
    log.error(new Date().toString(), e.stack || e);
    process.exit(1);
});
process.on('error', function (e) {
    log.error(new Date().toString(), e.stack || e);
    process.exit(1);
});
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const app = new app_1.default([
    new index_route_1.default(),
    new task_route_1.default(),
    new file_route_1.default(),
    new auth_route_1.default(),
    new user_route_1.default()
]);
// Set up HTTPS server
// Some auth provider requires the server to have a domain name,
// and https for security reasons.
if (process.env.HTTPS_ENABLED === 'true') {
    const port = 443;
    const cert_key = fs_1.default.readFileSync(process.env.SSL_KEY);
    const cert = fs_1.default.readFileSync(process.env.SSL_CERT);
    const httpsServer = https.createServer({
        key: cert_key,
        cert: cert
    }, app.getServer());
    httpsServer.listen(port, () => {
        log.info(`App listening on the port ${port}`);
    });
}
const httpServer = http.createServer(app.getServer());
httpServer.listen(process.env.PORT, () => {
    log.info(`App listening on the port ${process.env.PORT}`);
});
//# sourceMappingURL=server.js.map