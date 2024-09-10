"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.dbLog = void 0;
const tslog_1 = require("tslog");
exports.dbLog = new tslog_1.Logger({ name: "Database" });
exports.log = new tslog_1.Logger({ name: "Server" });
//# sourceMappingURL=logging.js.map