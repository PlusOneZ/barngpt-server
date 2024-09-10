"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("../utils/logging");
function errorMiddleware(error, req, res) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    logging_1.log.error(status, message);
    res.json({ message });
}
exports.default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map