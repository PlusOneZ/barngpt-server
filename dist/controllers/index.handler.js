"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndexHandler {
    constructor() {
        this.index = (req, res, next) => {
            try {
                res.status(200).send("hello!");
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.default = IndexHandler;
//# sourceMappingURL=index.handler.js.map