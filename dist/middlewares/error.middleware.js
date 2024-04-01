"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(error, req, res) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    console.log('[ERROR] ', status, message);
    res.json({ message });
}
exports.default = errorMiddleware;
